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

// Module type for age verification
const ZK_AGE = keccak256(toHex("ZK_AGE"));

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

interface AgeAttestRequest {
  userAddress: string;
  birthDate: string; // ISO date string (YYYY-MM-DD)
  minAge: number;
  nonce: number;
  // Optional: signature from identity provider
  identityProof?: {
    provider: string;
    signature: string;
    timestamp: number;
  };
}

/**
 * Calculate age from birth date
 */
function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Verify identity proof from trusted provider (simulated)
 * In production, this would verify signatures from providers like:
 * - Government ID verification (Jumio, Onfido)
 * - Decentralized identity (Polygon ID, Worldcoin)
 * - Social login with verified DOB
 */
function verifyIdentityProof(
  birthDate: string,
  proof?: AgeAttestRequest["identityProof"]
): { valid: boolean; source: string } {
  // In development/testing mode, accept self-attestation
  if (process.env.NODE_ENV === "development" || !proof) {
    return { valid: true, source: "self-attestation" };
  }

  // In production, verify the identity provider's signature
  // This is a placeholder for real identity verification integration
  const { provider, signature, timestamp } = proof;

  // Check timestamp is recent (within 5 minutes)
  const now = Date.now();
  if (now - timestamp > 5 * 60 * 1000) {
    return { valid: false, source: provider };
  }

  // TODO: Implement actual signature verification for each provider
  // - Polygon ID: Verify ZK proof of age credential
  // - Worldcoin: Verify proof of personhood + age
  // - Government ID: Verify Jumio/Onfido webhook signature

  return { valid: true, source: provider };
}

export async function POST(request: NextRequest) {
  try {
    const body: AgeAttestRequest = await request.json();
    const { userAddress, birthDate, minAge, nonce, identityProof } = body;

    // Validate inputs
    if (!userAddress || !birthDate || typeof minAge !== "number") {
      return NextResponse.json(
        { error: "Missing required fields: userAddress, birthDate, minAge" },
        { status: 400 }
      );
    }

    // Validate birth date format
    const birthDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!birthDateRegex.test(birthDate)) {
      return NextResponse.json(
        { error: "Invalid birth date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    // Validate minimum age range
    if (minAge < 13 || minAge > 100) {
      return NextResponse.json(
        { error: "Minimum age must be between 13 and 100" },
        { status: 400 }
      );
    }

    // Verify identity proof
    const { valid: proofValid, source } = verifyIdentityProof(birthDate, identityProof);
    if (!proofValid) {
      return NextResponse.json(
        { error: "Identity verification failed" },
        { status: 401 }
      );
    }

    // Calculate user's age
    const userAge = calculateAge(birthDate);

    // Check if user meets minimum age requirement
    if (userAge < minAge) {
      return NextResponse.json(
        {
          error: "Age requirement not met",
          required: minAge,
          // Note: We don't reveal actual age for privacy
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
        moduleType: ZK_AGE,
        expiry: expiry,
        nonce: BigInt(nonce),
      },
    });

    // Parse signature into v, r, s components
    const r = signature.slice(0, 66) as Hex;
    const s = ("0x" + signature.slice(66, 130)) as Hex;
    const v = parseInt(signature.slice(130, 132), 16);

    // Encode additional proof data (minAge threshold that was verified)
    const proofData = encodeAbiParameters(
      parseAbiParameters("uint256 minAge, uint256 verifiedAt"),
      [BigInt(minAge), BigInt(Math.floor(Date.now() / 1000))]
    );

    return NextResponse.json({
      success: true,
      attestation: {
        moduleType: ZK_AGE,
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
        ageRequirementMet: true,
        minAgeVerified: minAge,
        verificationSource: source,
        validityDays: 30,
        attestor: attestorAccount.address,
      },
    });
  } catch (error) {
    console.error("Age attestation error:", error);
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
    module: "zk-age",
    description: "Zero-knowledge age verification module",
    supportedProviders: ["self-attestation", "polygon-id", "worldcoin", "jumio"],
    ageRange: { min: 13, max: 100 },
    registryConfigured: !!process.env.NEXT_PUBLIC_REGISTRY_ADDRESS,
    attestorConfigured: !!process.env.ATTESTOR_PRIVATE_KEY,
  });
}
