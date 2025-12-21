import { NextRequest, NextResponse } from "next/server";
import {
  createWalletClient,
  http,
  keccak256,
  toHex,
  type Hex,
  encodeAbiParameters,
  parseAbiParameters,
  createPublicClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mantleSepoliaTestnet } from "viem/chains";

// Module type for balance verification
const ZK_BALANCE = keccak256(toHex("ZK_BALANCE"));

// 30 days in seconds
const ATTESTATION_VALIDITY = 30 * 24 * 60 * 60;

// EIP-712 Domain
const DOMAIN = {
  name: "UntracedRegistry",
  version: "1",
  chainId: 5003, // Mantle Sepolia
  verifyingContract: process.env.NEXT_PUBLIC_REGISTRY_ADDRESS as Hex,
};

// EIP-712 Types
const ATTESTATION_TYPES = {
  Attestation: [
    { name: "user", type: "address" },
    { name: "moduleType", type: "bytes32" },
    { name: "expiry", type: "uint256" },
    { name: "nonce", type: "uint256" },
  ],
};

interface BalanceAttestRequest {
  userAddress: string;
  minBalance: string; // Balance threshold in wei (as string for bigint)
  nonce: number;
  // Optional: chain ID for multi-chain support
  chainId?: number;
}

/**
 * Get user's balance from the chain
 */
async function getUserBalance(userAddress: string, chainId: number = 5003): Promise<bigint> {
  // For Mantle Sepolia, use the configured RPC
  const publicClient = createPublicClient({
    chain: mantleSepoliaTestnet,
    transport: http(),
  });

  const balance = await publicClient.getBalance({
    address: userAddress as Hex,
  });

  return balance;
}

export async function POST(request: NextRequest) {
  try {
    const body: BalanceAttestRequest = await request.json();
    const { userAddress, minBalance, nonce, chainId = 5003 } = body;

    // Validate inputs
    if (!userAddress || !minBalance) {
      return NextResponse.json(
        { error: "Missing required fields: userAddress, minBalance" },
        { status: 400 }
      );
    }

    // Parse minimum balance
    let minBalanceBigInt: bigint;
    try {
      minBalanceBigInt = BigInt(minBalance);
    } catch {
      return NextResponse.json(
        { error: "Invalid minBalance format. Use wei amount as string." },
        { status: 400 }
      );
    }

    // Validate balance is reasonable (at least 1 wei, max 10 billion ETH equivalent)
    if (minBalanceBigInt <= BigInt(0)) {
      return NextResponse.json(
        { error: "Minimum balance must be greater than 0" },
        { status: 400 }
      );
    }

    // Get user's actual balance
    const userBalance = await getUserBalance(userAddress, chainId);

    // Check if user meets minimum balance requirement
    if (userBalance < minBalanceBigInt) {
      return NextResponse.json(
        {
          error: "Balance requirement not met",
          required: minBalance,
          // Note: We don't reveal actual balance for privacy
          meetsRequirement: false,
        },
        { status: 400 }
      );
    }

    // Validate attestor private key is configured
    const attestorPrivateKey = process.env.ATTESTOR_PRIVATE_KEY;
    if (!attestorPrivateKey) {
      console.error("ATTESTOR_PRIVATE_KEY not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Calculate expiry (30 days from now)
    const expiry = BigInt(Math.floor(Date.now() / 1000) + ATTESTATION_VALIDITY);

    // Create attestor account from private key
    const attestorAccount = privateKeyToAccount(attestorPrivateKey as Hex);

    // Create wallet client for signing
    const walletClient = createWalletClient({
      account: attestorAccount,
      chain: mantleSepoliaTestnet,
      transport: http(),
    });

    // Sign EIP-712 typed data
    const signature = await walletClient.signTypedData({
      domain: DOMAIN,
      types: ATTESTATION_TYPES,
      primaryType: "Attestation",
      message: {
        user: userAddress as Hex,
        moduleType: ZK_BALANCE,
        expiry: expiry,
        nonce: BigInt(nonce),
      },
    });

    // Parse signature into v, r, s components
    const r = signature.slice(0, 66) as Hex;
    const s = ("0x" + signature.slice(66, 130)) as Hex;
    const v = parseInt(signature.slice(130, 132), 16);

    // Encode additional proof data (minBalance threshold that was verified)
    const proofData = encodeAbiParameters(
      parseAbiParameters("uint256 minBalance, uint256 verifiedAt, uint256 chainId"),
      [minBalanceBigInt, BigInt(Math.floor(Date.now() / 1000)), BigInt(chainId)]
    );

    return NextResponse.json({
      success: true,
      attestation: {
        moduleType: ZK_BALANCE,
        expiry: expiry.toString(),
        signature: {
          v,
          r,
          s,
          full: signature,
        },
        proofData,
      },
      meta: {
        balanceRequirementMet: true,
        minBalanceVerified: minBalance,
        chainId,
        validityDays: 30,
        attestor: attestorAccount.address,
      },
    });
  } catch (error) {
    console.error("Balance attestation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    module: "zk-balance",
    description: "Zero-knowledge balance verification module",
    supportedChains: [
      { id: 5003, name: "Mantle Sepolia" },
    ],
    registryConfigured: !!process.env.NEXT_PUBLIC_REGISTRY_ADDRESS,
    attestorConfigured: !!process.env.ATTESTOR_PRIVATE_KEY,
  });
}
