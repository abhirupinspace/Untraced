import { cookies } from "next/headers";
import dbConnect from "./db/mongodb";
import { User, Organization, type IUser, type IOrganization } from "./db/models";

export interface AuthUser {
  user: IUser;
  organization: IOrganization | null;
}

/**
 * Get the current authenticated user from Privy token
 * This is a simplified version - in production, you'd verify the Privy JWT
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const privyToken = cookieStore.get("privy-token")?.value;

    if (!privyToken) {
      return null;
    }

    // In production, you'd verify the JWT and extract the user ID
    // For now, we'll decode the basic payload (NOT SECURE - use proper JWT verification)
    // This is a placeholder - integrate with Privy's server-side auth
    const payload = JSON.parse(
      Buffer.from(privyToken.split(".")[1], "base64").toString()
    );

    const privyId = payload.sub;
    if (!privyId) {
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
