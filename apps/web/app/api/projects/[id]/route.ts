import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import { Project, Flow, Organization } from "@/lib/db/models";
import { ensureUser, hasPermission } from "@/lib/auth";

// GET /api/projects/[id] - Get a single project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;
    const privyId = request.headers.get("x-privy-id");
    const walletAddress = request.headers.get("x-wallet-address");

    if (!privyId || !walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user, organization } = await ensureUser(privyId, walletAddress);

    const project = await Project.findOne({
      _id: id,
      organizationId: organization._id,
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const flows = await Flow.find({
      projectId: project._id,
      status: { $ne: "archived" },
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      project: {
        id: project._id.toString(),
        name: project.name,
        slug: project.slug,
        description: project.description,
        status: project.status,
        stats: project.stats,
        settings: project.settings,
        flows: flows.map((flow) => ({
          id: flow._id.toString(),
          name: flow.name,
          displayName: flow.displayName,
          status: flow.status,
          version: flow.version,
          moduleCount: flow.modules.length,
          modules: flow.modules,
          stats: flow.stats,
          settings: flow.settings,
          createdAt: flow.createdAt,
          updatedAt: flow.updatedAt,
        })),
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[id] - Update a project
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;
    const privyId = request.headers.get("x-privy-id");
    const walletAddress = request.headers.get("x-wallet-address");

    if (!privyId || !walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user, organization } = await ensureUser(privyId, walletAddress);

    // Check permission
    if (!hasPermission(organization, user._id.toString(), ["owner", "admin"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, status, settings } = body;

    const updateFields: Record<string, unknown> = {};
    if (name) updateFields.name = name;
    if (description !== undefined) updateFields.description = description;
    if (status) updateFields.status = status;
    if (settings) updateFields.settings = settings;

    const project = await Project.findOneAndUpdate(
      { _id: id, organizationId: organization._id },
      { $set: updateFields },
      { new: true }
    );

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({
      project: {
        id: project._id.toString(),
        name: project.name,
        slug: project.slug,
        description: project.description,
        status: project.status,
        stats: project.stats,
        settings: project.settings,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Archive a project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;
    const privyId = request.headers.get("x-privy-id");
    const walletAddress = request.headers.get("x-wallet-address");

    if (!privyId || !walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user, organization } = await ensureUser(privyId, walletAddress);

    // Check permission - only owner can delete
    if (!hasPermission(organization, user._id.toString(), ["owner"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const project = await Project.findOneAndUpdate(
      { _id: id, organizationId: organization._id },
      { $set: { status: "archived" } },
      { new: true }
    );

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Also archive all flows in the project
    await Flow.updateMany(
      { projectId: project._id },
      { $set: { status: "archived" } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error archiving project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
