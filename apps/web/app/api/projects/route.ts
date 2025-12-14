import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import { Project, Flow, Organization, User } from "@/lib/db/models";
import { ensureUser } from "@/lib/auth";

// GET /api/projects - List all projects for the user
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get user info from headers (set by middleware or Privy)
    const privyId = request.headers.get("x-privy-id");
    const walletAddress = request.headers.get("x-wallet-address");

    if (!privyId || !walletAddress) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { user, organization } = await ensureUser(privyId, walletAddress);

    // Get all projects for user's organization
    const projects = await Project.find({
      organizationId: organization._id,
      status: { $ne: "archived" },
    }).sort({ createdAt: -1 });

    // Get flows for each project
    const projectsWithFlows = await Promise.all(
      projects.map(async (project) => {
        const flows = await Flow.find({
          projectId: project._id,
          status: { $ne: "archived" },
        }).select("_id name displayName status stats modules createdAt");

        return {
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
            moduleCount: flow.modules.length,
            stats: flow.stats,
            createdAt: flow.createdAt,
          })),
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        };
      })
    );

    return NextResponse.json({ projects: projectsWithFlows });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const privyId = request.headers.get("x-privy-id");
    const walletAddress = request.headers.get("x-wallet-address");

    if (!privyId || !walletAddress) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { user, organization } = await ensureUser(privyId, walletAddress);

    // Check project limits
    const projectCount = await Project.countDocuments({
      organizationId: organization._id,
      status: { $ne: "archived" },
    });

    if (projectCount >= organization.limits.maxProjects) {
      return NextResponse.json(
        { error: `Project limit reached (${organization.limits.maxProjects})` },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    // Generate slug from name
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check for existing slug and add suffix if needed
    let slug = baseSlug;
    let counter = 1;
    while (
      await Project.findOne({ organizationId: organization._id, slug })
    ) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const project = await Project.create({
      organizationId: organization._id,
      name,
      slug,
      description,
      createdBy: user._id,
    });

    return NextResponse.json({
      project: {
        id: project._id.toString(),
        name: project.name,
        slug: project.slug,
        description: project.description,
        status: project.status,
        stats: project.stats,
        settings: project.settings,
        flows: [],
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
