import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import { Project, Flow } from "@/lib/db/models";
import { ensureUser, hasPermission } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string; flowId: string }>;
}

// GET /api/projects/[id]/flows/[flowId] - Get a specific flow
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();

    const { id: projectId, flowId } = await params;
    const privyId = request.headers.get("x-privy-id");
    const walletAddress = request.headers.get("x-wallet-address");

    if (!privyId || !walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { organization } = await ensureUser(privyId, walletAddress);

    // Verify project belongs to organization
    const project = await Project.findOne({
      _id: projectId,
      organizationId: organization._id,
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const flow = await Flow.findOne({
      _id: flowId,
      projectId: project._id,
    });

    if (!flow) {
      return NextResponse.json({ error: "Flow not found" }, { status: 404 });
    }

    return NextResponse.json({
      flow: {
        id: flow._id.toString(),
        name: flow.name,
        displayName: flow.displayName,
        description: flow.description,
        status: flow.status,
        version: flow.version,
        modules: flow.modules,
        settings: flow.settings,
        stats: flow.stats,
        deployedAt: flow.deployedAt,
        deployedBy: flow.deployedBy,
        createdAt: flow.createdAt,
        updatedAt: flow.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching flow:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[id]/flows/[flowId] - Update a flow
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();

    const { id: projectId, flowId } = await params;
    const privyId = request.headers.get("x-privy-id");
    const walletAddress = request.headers.get("x-wallet-address");

    if (!privyId || !walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user, organization } = await ensureUser(privyId, walletAddress);

    // Check permission
    if (
      !hasPermission(organization, user._id.toString(), [
        "owner",
        "admin",
        "developer",
      ])
    ) {
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

    const flow = await Flow.findOne({
      _id: flowId,
      projectId: project._id,
    });

    if (!flow) {
      return NextResponse.json({ error: "Flow not found" }, { status: 404 });
    }

    const body = await request.json();
    const { displayName, description, modules, settings, status } = body;

    // Update allowed fields
    if (displayName !== undefined) flow.displayName = displayName;
    if (description !== undefined) flow.description = description;
    if (modules !== undefined) {
      flow.modules = modules.map(
        (m: Record<string, unknown>, index: number) => ({
          moduleId: m.moduleId || m.id,
          instanceId: m.instanceId || `${m.moduleId || m.id}-${Date.now()}-${index}`,
          order: m.order ?? index,
          required: m.required ?? true,
          config: m.config || {},
        })
      );
      flow.version += 1;
    }
    if (settings !== undefined) {
      flow.settings = {
        ...flow.settings,
        ...settings,
      };
    }
    if (status !== undefined && ["draft", "active", "paused", "archived"].includes(status)) {
      flow.status = status;
    }

    await flow.save();

    return NextResponse.json({
      flow: {
        id: flow._id.toString(),
        name: flow.name,
        displayName: flow.displayName,
        description: flow.description,
        status: flow.status,
        version: flow.version,
        modules: flow.modules,
        settings: flow.settings,
        stats: flow.stats,
        deployedAt: flow.deployedAt,
        createdAt: flow.createdAt,
        updatedAt: flow.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating flow:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id]/flows/[flowId] - Archive a flow
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();

    const { id: projectId, flowId } = await params;
    const privyId = request.headers.get("x-privy-id");
    const walletAddress = request.headers.get("x-wallet-address");

    if (!privyId || !walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user, organization } = await ensureUser(privyId, walletAddress);

    // Check permission - only owner and admin can delete
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

    const flow = await Flow.findOne({
      _id: flowId,
      projectId: project._id,
    });

    if (!flow) {
      return NextResponse.json({ error: "Flow not found" }, { status: 404 });
    }

    // Soft delete by setting status to archived
    flow.status = "archived";
    await flow.save();

    return NextResponse.json({
      success: true,
      message: "Flow archived successfully",
    });
  } catch (error) {
    console.error("Error deleting flow:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
