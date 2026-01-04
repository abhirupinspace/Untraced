import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import { User, Organization, Project, Flow, Verification } from "@/lib/db/models";
import { ensureUser } from "@/lib/auth";

// GET /api/user - Get current user with organization and usage stats
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const privyId = request.headers.get("x-privy-id");
    const walletAddress = request.headers.get("x-wallet-address");

    if (!privyId || !walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user, organization } = await ensureUser(privyId, walletAddress);

    // Get usage stats
    const projectCount = await Project.countDocuments({
      organizationId: organization._id,
    });

    const flowCount = await Flow.countDocuments({
      projectId: {
        $in: await Project.find({ organizationId: organization._id }).distinct(
          "_id"
        ),
      },
    });

    // Get this month's verifications
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const projectIds = await Project.find({
      organizationId: organization._id,
    }).distinct("_id");

    const verificationsThisMonth = await Verification.countDocuments({
      projectId: { $in: projectIds },
      startedAt: { $gte: startOfMonth },
    });

    // Get member role
    const member = organization.members.find(
      (m) => m.userId.toString() === user._id.toString()
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
        role: member?.role || "viewer",
        limits: organization.limits,
        memberCount: organization.members.length,
      },
      usage: {
        projects: projectCount,
        flows: flowCount,
        verificationsThisMonth,
        limits: organization.limits,
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

// PATCH /api/user - Update current user settings
export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();

    const privyId = request.headers.get("x-privy-id");
    const walletAddress = request.headers.get("x-wallet-address");

    if (!privyId || !walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = await ensureUser(privyId, walletAddress);

    const body = await request.json();
    const { name, email, avatar, settings } = body;

    // Update allowed fields
    if (name !== undefined) {
      user.name = name;
    }
    if (email !== undefined) {
      user.email = email;
    }
    if (avatar !== undefined) {
      user.avatar = avatar;
    }
    if (settings !== undefined) {
      if (settings.notifications !== undefined) {
        user.settings.notifications = settings.notifications;
      }
      if (settings.timezone !== undefined) {
        user.settings.timezone = settings.timezone;
      }
      if (settings.defaultChainId !== undefined) {
        user.settings.defaultChainId = settings.defaultChainId;
      }
    }

    await user.save();

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
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
