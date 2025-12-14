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

// Module type for Twitter verification
const ZK_TWITTER = keccak256(toHex("ZK_TWITTER"));

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

interface TwitterUser {
  id: string;
  name: string;
  username: string;
  created_at: string;
  public_metrics: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
    listed_count: number;
  };
  verified: boolean;
  verified_type?: string;
}

interface TwitterAttestRequest {
  userAddress: string;
  twitterAccessToken: string;
  verificationType: "account" | "followers" | "verified";
  minFollowers?: number;
  nonce: number;
}

/**
 * Fetch Twitter user profile and stats
 */
async function fetchTwitterProfile(
  accessToken: string
): Promise<TwitterUser | null> {
  const response = await fetch(
    "https://api.twitter.com/2/users/me?user.fields=created_at,public_metrics,verified,verified_type",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("Twitter API error:", error);
    return null;
  }

  const data = await response.json();
  return data.data as TwitterUser;
}

/**
 * Calculate account age in days
 */
function getAccountAgeDays(createdAt: string): number {
  const created = new Date(createdAt);
  return Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24));
}

export async function POST(request: NextRequest) {
  try {
    const body: TwitterAttestRequest = await request.json();
    const {
      userAddress,
      twitterAccessToken,
      verificationType,
      minFollowers = 0,
      nonce,
    } = body;

    // Validate inputs
    if (!userAddress || !twitterAccessToken) {
      return NextResponse.json(
        { error: "Missing required fields: userAddress, twitterAccessToken" },
        { status: 400 }
      );
    }

    // Validate verification type
    const validTypes = ["account", "followers", "verified"];
    if (!validTypes.includes(verificationType)) {
      return NextResponse.json(
        { error: `Invalid verificationType. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Fetch Twitter profile
    const profile = await fetchTwitterProfile(twitterAccessToken);
    if (!profile) {
      return NextResponse.json(
        { error: "Failed to verify Twitter account" },
        { status: 401 }
      );
    }

    // Perform verification based on type
    let verificationPassed = false;
    let verificationDetails: Record<string, unknown> = {};

    switch (verificationType) {
      case "account":
        // Basic account verification - just needs valid account
        verificationPassed = true;
        verificationDetails = {
          type: "account",
          accountExists: true,
          username: profile.username,
        };
        break;

      case "followers":
        // Verify minimum follower count
        verificationPassed = profile.public_metrics.followers_count >= minFollowers;
        verificationDetails = {
          type: "followers",
          required: minFollowers,
          actual: profile.public_metrics.followers_count,
          met: verificationPassed,
        };
        break;

      case "verified":
        // Verify the account has Twitter verification badge
        verificationPassed = profile.verified === true;
        verificationDetails = {
          type: "verified",
          isVerified: profile.verified,
          verifiedType: profile.verified_type || "none",
        };
        break;
    }

    if (!verificationPassed) {
      return NextResponse.json(
        {
          error: "Twitter verification requirement not met",
          details: verificationDetails,
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
        moduleType: ZK_TWITTER,
        expiry: expiry,
        nonce: BigInt(nonce),
      },
    });

    // Parse signature into v, r, s components
    const r = signature.slice(0, 66) as Hex;
    const s = ("0x" + signature.slice(66, 130)) as Hex;
    const v = parseInt(signature.slice(130, 132), 16);

    // Encode verification type as number for on-chain data
    const verificationTypeNum =
      verificationType === "account"
        ? 0
        : verificationType === "followers"
        ? 1
        : 2;

    // Encode additional proof data
    const proofData = encodeAbiParameters(
      parseAbiParameters(
        "uint8 verificationType, uint256 followers, uint256 tweets, uint256 accountAgeDays, uint256 verifiedAt"
      ),
      [
        verificationTypeNum,
        BigInt(profile.public_metrics.followers_count),
        BigInt(profile.public_metrics.tweet_count),
        BigInt(getAccountAgeDays(profile.created_at)),
        BigInt(Math.floor(Date.now() / 1000)),
      ]
    );

    return NextResponse.json({
      success: true,
      attestation: {
        moduleType: ZK_TWITTER,
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
        verificationPassed: true,
        verificationType,
        twitterUsername: profile.username,
        followers: profile.public_metrics.followers_count,
        tweets: profile.public_metrics.tweet_count,
        accountAgeDays: getAccountAgeDays(profile.created_at),
        isVerified: profile.verified,
        validityDays: 30,
        attestor: attestorAccount.address,
      },
    });
  } catch (error) {
    console.error("Twitter attestation error:", error);
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
    module: "zk-twitter",
    description: "Zero-knowledge Twitter/X account verification module",
    verificationTypes: ["account", "followers", "verified"],
    metrics: ["followers", "tweets", "account_age", "verified_status"],
    registryConfigured: !!process.env.NEXT_PUBLIC_REGISTRY_ADDRESS,
    attestorConfigured: !!process.env.ATTESTOR_PRIVATE_KEY,
  });
}
