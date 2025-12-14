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

// Module type for GitHub verification
const ZK_GITHUB = keccak256(toHex("ZK_GITHUB"));

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

interface GitHubUser {
  login: string;
  id: number;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

interface GitHubCommitStats {
  total: number;
  weeks: Array<{
    w: number;
    a: number;
    d: number;
    c: number;
  }>;
}

interface GitHubAttestRequest {
  userAddress: string;
  githubAccessToken: string;
  minCommits: number;
  nonce: number;
}

/**
 * Fetch user's total commit count across all repos
 */
async function fetchCommitCount(accessToken: string): Promise<{
  totalCommits: number;
  repos: number;
  username: string;
  accountAge: number;
}> {
  // First, get user profile
  const userResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "UNTRACED",
    },
  });

  if (!userResponse.ok) {
    throw new Error("Failed to fetch GitHub user");
  }

  const user: GitHubUser = await userResponse.json();

  // Calculate account age in days
  const accountCreated = new Date(user.created_at);
  const accountAge = Math.floor(
    (Date.now() - accountCreated.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Fetch user's repos to count commits
  const reposResponse = await fetch(
    `https://api.github.com/users/${user.login}/repos?per_page=100&type=owner`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "UNTRACED",
      },
    }
  );

  if (!reposResponse.ok) {
    throw new Error("Failed to fetch repositories");
  }

  const repos = await reposResponse.json();

  // Fetch contribution stats using the contributions API
  // Note: This is an approximation. Full accuracy would require GraphQL API
  let totalCommits = 0;

  // Use events API for a quick approximation
  const eventsResponse = await fetch(
    `https://api.github.com/users/${user.login}/events?per_page=100`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "UNTRACED",
      },
    }
  );

  if (eventsResponse.ok) {
    const events = await eventsResponse.json();
    // Count push events
    const pushEvents = events.filter(
      (e: { type: string }) => e.type === "PushEvent"
    );
    // Each push can have multiple commits
    totalCommits = pushEvents.reduce(
      (sum: number, event: { payload?: { commits?: unknown[] } }) => {
        return sum + (event.payload?.commits?.length || 0);
      },
      0
    );
  }

  // If we have few commits from events, estimate from repo stats
  if (totalCommits < 10 && repos.length > 0) {
    // Sample a few repos for commit counts
    const sampleRepos = repos.slice(0, 5);
    for (const repo of sampleRepos) {
      try {
        const statsResponse = await fetch(
          `https://api.github.com/repos/${repo.full_name}/stats/contributors`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/vnd.github.v3+json",
              "User-Agent": "UNTRACED",
            },
          }
        );

        if (statsResponse.ok) {
          const stats: GitHubCommitStats[] = await statsResponse.json();
          const userStats = stats.find(
            (s: GitHubCommitStats & { author?: { login?: string } }) =>
              s.author?.login === user.login
          );
          if (userStats) {
            totalCommits += userStats.total;
          }
        }
      } catch {
        // Continue with next repo
      }
    }

    // Extrapolate for remaining repos
    if (sampleRepos.length > 0 && repos.length > sampleRepos.length) {
      const avgPerRepo = totalCommits / sampleRepos.length;
      totalCommits = Math.floor(avgPerRepo * repos.length);
    }
  }

  return {
    totalCommits,
    repos: repos.length,
    username: user.login,
    accountAge,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: GitHubAttestRequest = await request.json();
    const { userAddress, githubAccessToken, minCommits, nonce } = body;

    // Validate inputs
    if (!userAddress || !githubAccessToken) {
      return NextResponse.json(
        { error: "Missing required fields: userAddress, githubAccessToken" },
        { status: 400 }
      );
    }

    // Validate minimum commits range
    if (typeof minCommits !== "number" || minCommits < 0 || minCommits > 10000) {
      return NextResponse.json(
        { error: "Minimum commits must be between 0 and 10000" },
        { status: 400 }
      );
    }

    // Fetch GitHub stats
    let githubStats;
    try {
      githubStats = await fetchCommitCount(githubAccessToken);
    } catch (error) {
      console.error("GitHub API error:", error);
      return NextResponse.json(
        { error: "Failed to verify GitHub account" },
        { status: 401 }
      );
    }

    // Check if user meets minimum commits requirement
    if (githubStats.totalCommits < minCommits) {
      return NextResponse.json(
        {
          error: "Commit requirement not met",
          required: minCommits,
          actual: githubStats.totalCommits,
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
        moduleType: ZK_GITHUB,
        expiry: expiry,
        nonce: BigInt(nonce),
      },
    });

    // Parse signature into v, r, s components
    const r = signature.slice(0, 66) as Hex;
    const s = ("0x" + signature.slice(66, 130)) as Hex;
    const v = parseInt(signature.slice(130, 132), 16);

    // Encode additional proof data
    const proofData = encodeAbiParameters(
      parseAbiParameters("uint256 minCommits, uint256 actualCommits, uint256 repos, uint256 verifiedAt"),
      [
        BigInt(minCommits),
        BigInt(githubStats.totalCommits),
        BigInt(githubStats.repos),
        BigInt(Math.floor(Date.now() / 1000)),
      ]
    );

    return NextResponse.json({
      success: true,
      attestation: {
        moduleType: ZK_GITHUB,
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
        commitRequirementMet: true,
        minCommitsVerified: minCommits,
        actualCommits: githubStats.totalCommits,
        totalRepos: githubStats.repos,
        githubUsername: githubStats.username,
        accountAgeDays: githubStats.accountAge,
        validityDays: 30,
        attestor: attestorAccount.address,
      },
    });
  } catch (error) {
    console.error("GitHub attestation error:", error);
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
    module: "zk-github",
    description: "Zero-knowledge GitHub activity verification module",
    metrics: ["commits", "repos", "account_age"],
    commitRange: { min: 0, max: 10000 },
    registryConfigured: !!process.env.NEXT_PUBLIC_REGISTRY_ADDRESS,
    attestorConfigured: !!process.env.ATTESTOR_PRIVATE_KEY,
  });
}
