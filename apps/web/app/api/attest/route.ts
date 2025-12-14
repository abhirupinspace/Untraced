import { NextResponse } from "next/server";
import { MODULE_TYPES, getAttestorAddress } from "@/lib/attestation";

/**
 * GET /api/attest
 * Returns available attestation modules and their status
 */
export async function GET() {
  const attestorAddress = getAttestorAddress();

  const modules = [
    {
      id: "zk-email",
      name: "Email Verification",
      description: "Verify email ownership via GitHub OAuth",
      endpoint: "/api/attest/email",
      moduleType: MODULE_TYPES.ZK_EMAIL,
      status: "active",
      config: {
        type: "selection",
        options: ["Gmail", "Outlook", "Any"],
      },
      requiredFields: ["userAddress", "githubAccessToken", "nonce"],
    },
    {
      id: "zk-age",
      name: "Age Verification",
      description: "Verify age meets minimum threshold",
      endpoint: "/api/attest/age",
      moduleType: MODULE_TYPES.ZK_AGE,
      status: "active",
      config: {
        type: "threshold",
        min: 13,
        max: 100,
        default: 18,
      },
      requiredFields: ["userAddress", "birthDate", "minAge", "nonce"],
    },
    {
      id: "zk-github",
      name: "GitHub Verification",
      description: "Verify GitHub developer activity",
      endpoint: "/api/attest/github",
      moduleType: MODULE_TYPES.ZK_GITHUB,
      status: "active",
      config: {
        type: "threshold",
        min: 0,
        max: 10000,
        default: 10,
      },
      requiredFields: ["userAddress", "githubAccessToken", "minCommits", "nonce"],
    },
    {
      id: "zk-twitter",
      name: "Twitter Verification",
      description: "Verify Twitter/X account",
      endpoint: "/api/attest/twitter",
      moduleType: MODULE_TYPES.ZK_TWITTER,
      status: "active",
      config: {
        type: "selection",
        options: ["account", "followers", "verified"],
      },
      requiredFields: ["userAddress", "twitterAccessToken", "verificationType", "nonce"],
    },
  ];

  return NextResponse.json({
    status: "ok",
    attestor: attestorAddress,
    registryAddress: process.env.NEXT_PUBLIC_REGISTRY_ADDRESS,
    chainId: 5003,
    chain: "Mantle Sepolia",
    modules,
  });
}
