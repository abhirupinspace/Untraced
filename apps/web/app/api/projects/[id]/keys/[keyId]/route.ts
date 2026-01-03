import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import { Project, ApiKey } from "@/lib/db/models";
import { ensureUser, hasPermission } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string; keyId: string }>;
}

// DELETE /api/projects/[id]/keys/[keyId] - Revoke an API key
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();

    const { id: projectId, keyId } = await params;
    const privyId = request.headers.get("x-privy-id");
    const walletAddress = request.headers.get("x-wallet-address");

    if (!privyId || !walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user, organization } = await ensureUser(privyId, walletAddress);

    // Check permission - only owner and admin can revoke keys
    if (!hasPermission(organization, user._id.toString(), ["owner", "admin"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify project belongs to organization
    const project = await Project.findOne({
      _id: projectId,
      organizationId: organization._id,
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const apiKey = await ApiKey.findOne({
      _id: keyId,
      projectId: project._id,
    });

    if (!apiKey) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    // Soft delete by setting isActive to false
    apiKey.isActive = false;
    apiKey.revokedAt = new Date();
    apiKey.revokedBy = user._id;
    await apiKey.save();

    return NextResponse.json({
      success: true,
      message: "API key revoked successfully",
    });
  } catch (error) {
    console.error("Error revoking API key:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
