import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import { Project, Flow } from "@/lib/db/models";
import { ensureUser, hasPermission } from "@/lib/auth";

// GET /api/flows/[id] - Get a single flow
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

    const { organization } = await ensureUser(privyId, walletAddress);

    const flow = await Flow.findById(id);
    if (!flow) {
      return NextResponse.json({ error: "Flow not found" }, { status: 404 });
    }

    // Verify project belongs to organization
    const project = await Project.findOne({
      _id: flow.projectId,
      organizationId: organization._id,
    });

    if (!project) {
      return NextResponse.json({ error: "Flow not found" }, { status: 404 });
    }

    return NextResponse.json({
      flow: {
        id: flow._id.toString(),
        projectId: flow.projectId.toString(),
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
    console.error("Error fetching flow:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/flows/[id] - Update a flow
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
    if (
      !hasPermission(organization, user._id.toString(), [
        "owner",
        "admin",
        "developer",
      ])
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const flow = await Flow.findById(id);
    if (!flow) {
      return NextResponse.json({ error: "Flow not found" }, { status: 404 });
    }

    // Verify project belongs to organization
    const project = await Project.findOne({
      _id: flow.projectId,
      organizationId: organization._id,
    });

    if (!project) {
      return NextResponse.json({ error: "Flow not found" }, { status: 404 });
    }

    const body = await request.json();
    const { displayName, description, modules, settings, status } = body;

    const updateFields: Record<string, unknown> = {};
    if (displayName) updateFields.displayName = displayName;
    if (description !== undefined) updateFields.description = description;
    if (status) updateFields.status = status;

    // Process modules if provided
    if (modules) {
      updateFields.modules = modules.map(
        (m: Record<string, unknown>, index: number) => ({
          moduleId: m.moduleId || m.id,
          instanceId:
            m.instanceId || `${m.moduleId || m.id}-${Date.now()}-${index}`,
          order: m.order ?? index,
          required: m.required ?? true,
          config: m.config || m.configValue || {},
        })
      );
    }

    // Merge settings if provided
    if (settings) {
      updateFields.settings = {
        ...flow.settings,
        ...settings,
      };
    }

    const updatedFlow = await Flow.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    return NextResponse.json({
      flow: {
        id: updatedFlow!._id.toString(),
        projectId: updatedFlow!.projectId.toString(),
        name: updatedFlow!.name,
        displayName: updatedFlow!.displayName,
        description: updatedFlow!.description,
        status: updatedFlow!.status,
        version: updatedFlow!.version,
        modules: updatedFlow!.modules,
        settings: updatedFlow!.settings,
        stats: updatedFlow!.stats,
        deployedAt: updatedFlow!.deployedAt,
        createdAt: updatedFlow!.createdAt,
        updatedAt: updatedFlow!.updatedAt,
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

// DELETE /api/flows/[id] - Archive a flow
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

    // Check permission
    if (
      !hasPermission(organization, user._id.toString(), ["owner", "admin"])
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const flow = await Flow.findById(id);
    if (!flow) {
      return NextResponse.json({ error: "Flow not found" }, { status: 404 });
    }

    // Verify project belongs to organization
    const project = await Project.findOne({
      _id: flow.projectId,
      organizationId: organization._id,
    });

    if (!project) {
      return NextResponse.json({ error: "Flow not found" }, { status: 404 });
    }

    await Flow.findByIdAndUpdate(id, { $set: { status: "archived" } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error archiving flow:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
