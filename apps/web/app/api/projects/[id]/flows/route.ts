import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import { Project, Flow } from "@/lib/db/models";
import { ensureUser, hasPermission } from "@/lib/auth";

// GET /api/projects/[id]/flows - List flows for a project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id: projectId } = await params;
    const privyId = request.headers.get("x-privy-id");
    const walletAddress = request.headers.get("x-wallet-address");

    if (!privyId || !walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user: _, organization } = await ensureUser(privyId, walletAddress);

    // Verify project belongs to organization
    const project = await Project.findOne({
      _id: projectId,
      organizationId: organization._id,
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    void _; // Silence unused variable warning
    const flows = await Flow.find({
      projectId: project._id,
      status: { $ne: "archived" },
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      flows: flows.map((flow) => ({
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
      })),
    });
  } catch (error) {
    console.error("Error fetching flows:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/flows - Create a new flow
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id: projectId } = await params;
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

    // Check flow limits
    const flowCount = await Flow.countDocuments({
      projectId: project._id,
      status: { $ne: "archived" },
    });

    if (flowCount >= organization.limits.maxFlows) {
      return NextResponse.json(
        { error: `Flow limit reached (${organization.limits.maxFlows})` },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, displayName, description, modules, settings } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Flow name is required" },
        { status: 400 }
      );
    }

    // Check for unique name within project
    const existingFlow = await Flow.findOne({
      projectId: project._id,
      name,
      status: { $ne: "archived" },
    });

    if (existingFlow) {
      return NextResponse.json(
        { error: "A flow with this name already exists in this project" },
        { status: 409 }
      );
    }

    // Process modules - ensure they have order
    const processedModules = (modules || []).map(
      (m: Record<string, unknown>, index: number) => ({
        moduleId: m.moduleId || m.id,
        instanceId: m.instanceId || `${m.moduleId || m.id}-${Date.now()}-${index}`,
        order: m.order ?? index,
        required: m.required ?? true,
        config: m.config || m.configValue || {},
      })
    );

    const flow = await Flow.create({
      projectId: project._id,
      name,
      displayName: displayName || name,
      description,
      modules: processedModules,
      settings: {
        attestationValidityDays: settings?.attestationValidityDays || 30,
        chainId: settings?.chainId || project.settings.defaultChainId,
        registryAddress: settings?.registryAddress,
        requireAllModules: settings?.requireAllModules ?? true,
        customMessages: settings?.customMessages,
      },
      createdBy: user._id,
    });

    return NextResponse.json(
      {
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
          createdAt: flow.createdAt,
          updatedAt: flow.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating flow:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
