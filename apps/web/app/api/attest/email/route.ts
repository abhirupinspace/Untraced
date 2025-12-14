import { NextRequest, NextResponse } from "next/server";
import {
  createWalletClient,
  http,
  keccak256,
  toHex,
  type Hex,
  encodeAbiParameters,
  parseAbiParameters,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mantleSepoliaTestnet } from "viem/chains";

// Module type for email verification
const ZK_EMAIL = keccak256(toHex("ZK_EMAIL"));

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

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
}

interface EmailAttestRequest {
  userAddress: string;
  githubAccessToken: string;
  provider?: "Gmail" | "Outlook" | "Any";
  nonce: number;
}

/**
 * Check if email matches the provider filter
 */
function matchesProvider(email: string, provider: string): boolean {
  if (provider === "Any") return true;
  if (provider === "Gmail") return email.toLowerCase().endsWith("@gmail.com");
  if (provider === "Outlook") {
    return (
      email.toLowerCase().endsWith("@outlook.com") ||
      email.toLowerCase().endsWith("@hotmail.com") ||
      email.toLowerCase().endsWith("@live.com")
    );
  }
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body: EmailAttestRequest = await request.json();
    const { userAddress, githubAccessToken, provider = "Any", nonce } = body;

    // Validate inputs
    if (!userAddress || !githubAccessToken) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    // Fetch user emails from GitHub
    const emailsResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${githubAccessToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "UNTRACED",
      },
    });

    if (!emailsResponse.ok) {
      const error = await emailsResponse.text();
      console.error("GitHub API error:", error);
      return NextResponse.json(
        { error: "Failed to fetch GitHub emails" },
        { status: 401 }
      );
    }

    const emails: GitHubEmail[] = await emailsResponse.json();

    // Check if at least one verified email matches the provider filter
    const matchingEmail = emails.find(
      (email) => email.verified && matchesProvider(email.email, provider)
    );

    if (!matchingEmail) {
      return NextResponse.json(
        {
          error: `No verified ${provider === "Any" ? "" : provider + " "}email found`,
          provider,
        },
        { status: 400 }
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
        moduleType: ZK_EMAIL,
        expiry: expiry,
        nonce: BigInt(nonce),
      },
    });

    // Parse signature into v, r, s components
    const r = signature.slice(0, 66) as Hex;
    const s = ("0x" + signature.slice(66, 130)) as Hex;
    const v = parseInt(signature.slice(130, 132), 16);

    // Encode provider type for on-chain data
    const providerNum =
      provider === "Gmail" ? 1 : provider === "Outlook" ? 2 : 0;

    // Encode additional proof data
    const proofData = encodeAbiParameters(
      parseAbiParameters("uint8 provider, uint256 verifiedAt"),
      [providerNum, BigInt(Math.floor(Date.now() / 1000))]
    );

    return NextResponse.json({
      success: true,
      attestation: {
        moduleType: ZK_EMAIL,
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
        emailVerified: true,
        provider: provider,
        // Note: We don't reveal the actual email for privacy
        emailDomain: matchingEmail.email.split("@")[1],
        validityDays: 30,
        attestor: attestorAccount.address,
      },
    });
  } catch (error) {
    console.error("Email attestation error:", error);
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
    module: "zk-email",
    description: "Zero-knowledge email verification module",
    supportedProviders: ["Gmail", "Outlook", "Any"],
    verificationMethod: "GitHub OAuth",
    registryConfigured: !!process.env.NEXT_PUBLIC_REGISTRY_ADDRESS,
    attestorConfigured: !!process.env.ATTESTOR_PRIVATE_KEY,
  });
}
