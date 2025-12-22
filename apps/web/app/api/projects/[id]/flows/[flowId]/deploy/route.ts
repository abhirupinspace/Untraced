import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import { Project, Flow } from "@/lib/db/models";
import { ensureUser, hasPermission } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string; flowId: string }>;
}

// POST /api/projects/[id]/flows/[flowId]/deploy - Deploy a flow
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();

    const { id: projectId, flowId } = await params;
    const privyId = request.headers.get("x-privy-id");
    const walletAddress = request.headers.get("x-wallet-address");

    if (!privyId || !walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user, organization } = await ensureUser(privyId, walletAddress);

    // Check permission - only owner and admin can deploy
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

    // Validate flow has modules
    if (!flow.modules || flow.modules.length === 0) {
      return NextResponse.json(
        { error: "Cannot deploy a flow without modules" },
        { status: 400 }
      );
    }

    // Check if flow is in a deployable state
    if (flow.status === "archived") {
      return NextResponse.json(
        { error: "Cannot deploy an archived flow" },
        { status: 400 }
      );
    }

    // Get registry address from environment or request body
    const body = await request.json().catch(() => ({}));
    const registryAddress =
      body.registryAddress ||
      flow.settings.registryAddress ||
      process.env.NEXT_PUBLIC_REGISTRY_ADDRESS;

    if (!registryAddress) {
      return NextResponse.json(
        { error: "Registry address not configured" },
        { status: 400 }
      );
    }

    // Update flow deployment status
    flow.status = "active";
    flow.deployedAt = new Date();
    flow.deployedBy = user._id;
    flow.settings.registryAddress = registryAddress;

    await flow.save();

    // Generate deployment info
    const deploymentInfo = {
      flowId: flow._id.toString(),
      projectId: project._id.toString(),
      version: flow.version,
      registryAddress,
      chainId: flow.settings.chainId || 5003,
      modules: flow.modules.map((m) => ({
        moduleId: m.moduleId,
        required: m.required,
        config: m.config,
      })),
      deployedAt: flow.deployedAt.toISOString(),
      deployedBy: user._id.toString(),
    };

    return NextResponse.json({
      success: true,
      message: "Flow deployed successfully",
      deployment: deploymentInfo,
      flow: {
        id: flow._id.toString(),
        name: flow.name,
        displayName: flow.displayName,
        status: flow.status,
        version: flow.version,
        deployedAt: flow.deployedAt,
      },
    });
  } catch (error) {
    console.error("Error deploying flow:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id]/flows/[flowId]/deploy - Undeploy (pause) a flow
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

    // Check permission
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

    if (flow.status !== "active") {
      return NextResponse.json(
        { error: "Flow is not currently deployed" },
        { status: 400 }
      );
    }

    // Pause the flow
    flow.status = "paused";
    await flow.save();

    return NextResponse.json({
      success: true,
      message: "Flow undeployed (paused) successfully",
      flow: {
        id: flow._id.toString(),
        name: flow.name,
        status: flow.status,
      },
    });
  } catch (error) {
    console.error("Error undeploying flow:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
