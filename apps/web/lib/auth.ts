import { cookies } from "next/headers";
import { PrivyClient } from "@privy-io/server-auth";
import dbConnect from "./db/mongodb";
import { User, Organization, type IUser, type IOrganization } from "./db/models";

// Initialize Privy client
const privyClient = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID || "",
  process.env.PRIVY_APP_SECRET || ""
);

export interface AuthUser {
  user: IUser;
  organization: IOrganization | null;
}

export interface VerifiedAuth {
  privyId: string;
  walletAddress?: string;
  email?: string;
}

/**
 * Verify Privy authorization token from request headers
 */
export async function verifyAuthToken(authHeader: string | null): Promise<VerifiedAuth | null> {
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7);

  try {
    const verifiedClaims = await privyClient.verifyAuthToken(token);
    return {
      privyId: verifiedClaims.userId,
    };
  } catch (error) {
    console.error("Privy token verification failed:", error);
    return null;
  }
}

/**
 * Get the current authenticated user from Privy token
 * Uses proper JWT verification with Privy server SDK
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const privyToken = cookieStore.get("privy-token")?.value;

    if (!privyToken) {
      return null;
    }

    // Verify the token with Privy
    let privyId: string;
    try {
      const verifiedClaims = await privyClient.verifyAuthToken(privyToken);
      privyId = verifiedClaims.userId;
    } catch (error) {
      console.error("Privy token verification failed:", error);
      return null;
    }

    await dbConnect();

    const user = await User.findOne({ privyId });
    if (!user) {
      return null;
    }

    // Get user's organization (first one they're a member of)
    const organization = await Organization.findOne({
      "members.userId": user._id,
    });

    return { user, organization };
  } catch {
    return null;
  }
}

/**
 * Ensure user exists in database, create if not
 */
export async function ensureUser(
  privyId: string,
  walletAddress: string,
  email?: string
): Promise<{ user: IUser; organization: IOrganization }> {
  await dbConnect();

  let user = await User.findOne({ privyId });

  if (!user) {
    // Create new user
    user = await User.create({
      privyId,
      walletAddress: walletAddress.toLowerCase(),
      email,
    });

    // Create default organization for the user
    const orgSlug = `org-${user._id.toString().slice(-8)}`;
    const organization = await Organization.create({
      name: "My Organization",
      slug: orgSlug,
      ownerId: user._id,
      members: [
        {
          userId: user._id,
          role: "owner",
          joinedAt: new Date(),
        },
      ],
    });

    return { user, organization };
  }

  // Get or create organization
  let organization = await Organization.findOne({
    "members.userId": user._id,
  });

  if (!organization) {
    const orgSlug = `org-${user._id.toString().slice(-8)}`;
    organization = await Organization.create({
      name: "My Organization",
      slug: orgSlug,
      ownerId: user._id,
      members: [
        {
          userId: user._id,
          role: "owner",
          joinedAt: new Date(),
        },
      ],
    });
  }

  return { user, organization };
}

/**
 * Check if user has permission in organization
 */
export function hasPermission(
  organization: IOrganization,
  userId: string,
  requiredRoles: ("owner" | "admin" | "developer" | "viewer")[]
): boolean {
  const member = organization.members.find(
    (m) => m.userId.toString() === userId
  );
  if (!member) return false;
  return requiredRoles.includes(member.role);
}

/**
 * Get authenticated user from API request headers
 * This function extracts auth headers and optionally verifies the Bearer token
 */
export async function getAuthFromRequest(
  headers: Headers
): Promise<{ user: IUser; organization: IOrganization } | null> {
  const privyId = headers.get("x-privy-id");
  const walletAddress = headers.get("x-wallet-address");
  const email = headers.get("x-user-email") || undefined;
  const authHeader = headers.get("authorization");

  if (!privyId || !walletAddress) {
    return null;
  }

  // If we have a Bearer token and Privy secret is configured, verify it
  if (authHeader && process.env.PRIVY_APP_SECRET) {
    const verified = await verifyAuthToken(authHeader);
    if (!verified) {
      return null;
    }
    // Ensure the verified user matches the header
    if (verified.privyId !== privyId) {
      console.error("Token user ID doesn't match header");
      return null;
    }
  }

  // Ensure user exists and return
  return ensureUser(privyId, walletAddress, email);
}
