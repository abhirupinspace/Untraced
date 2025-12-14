import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import { ensureUser } from "@/lib/auth";

// GET /api/auth/me - Get or create current user
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const privyId = request.headers.get("x-privy-id");
    const walletAddress = request.headers.get("x-wallet-address");
    const email = request.headers.get("x-user-email");

    if (!privyId || !walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user, organization } = await ensureUser(
      privyId,
      walletAddress,
      email || undefined
    );

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        privyId: user.privyId,
        walletAddress: user.walletAddress,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        plan: user.plan,
        settings: user.settings,
        createdAt: user.createdAt,
      },
      organization: {
        id: organization._id.toString(),
        name: organization.name,
        slug: organization.slug,
        plan: organization.plan,
        limits: organization.limits,
        role: organization.members.find(
          (m) => m.userId.toString() === user._id.toString()
        )?.role,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/auth/me - Update current user
export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();

    const privyId = request.headers.get("x-privy-id");
    const walletAddress = request.headers.get("x-wallet-address");

    if (!privyId || !walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user, organization } = await ensureUser(privyId, walletAddress);

    const body = await request.json();
    const { name, settings } = body;

    const updateFields: Record<string, unknown> = {};
    if (name) updateFields.name = name;
    if (settings) {
      updateFields.settings = {
        ...user.settings,
        ...settings,
      };
    }

    if (Object.keys(updateFields).length > 0) {
      Object.assign(user, updateFields);
      await user.save();
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        privyId: user.privyId,
        walletAddress: user.walletAddress,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        plan: user.plan,
        settings: user.settings,
        createdAt: user.createdAt,
      },
      organization: {
        id: organization._id.toString(),
        name: organization.name,
        slug: organization.slug,
        plan: organization.plan,
        limits: organization.limits,
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
