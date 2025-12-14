import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/db/mongodb";
import { Project, ApiKey } from "@/lib/db/models";
import { ensureUser, hasPermission } from "@/lib/auth";

function generateApiKey(type: "publishable" | "secret"): {
  key: string;
  hash: string;
  prefix: string;
  lastFour: string;
} {
  const prefix = type === "publishable" ? "uk_live_" : "sk_live_";
  const randomPart = crypto.randomBytes(24).toString("hex");
  const key = `${prefix}${randomPart}`;
  const hash = crypto.createHash("sha256").update(key).digest("hex");
  const lastFour = randomPart.slice(-4);

  return { key, hash, prefix, lastFour };
}

// GET /api/projects/[id]/keys - List API keys for a project
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

    const { organization } = await ensureUser(privyId, walletAddress);

    // Verify project belongs to organization
    const project = await Project.findOne({
      _id: projectId,
      organizationId: organization._id,
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const keys = await ApiKey.find({
      projectId: project._id,
      isActive: true,
    }).select("-keyHash").sort({ createdAt: -1 });

    return NextResponse.json({
      keys: keys.map((key) => ({
        id: key._id.toString(),
        name: key.name,
        type: key.type,
        keyPrefix: key.keyPrefix,
        lastFour: key.lastFour,
        permissions: key.permissions,
        rateLimit: key.rateLimit,
        lastUsedAt: key.lastUsedAt,
        expiresAt: key.expiresAt,
        createdAt: key.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching API keys:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/keys - Create a new API key
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

    // Check permission - only owner and admin can create keys
    if (
      !hasPermission(organization, user._id.toString(), ["owner", "admin"])
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

    const body = await request.json();
    const { name, type = "publishable", permissions, expiresAt } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Key name is required" },
        { status: 400 }
      );
    }

    if (!["publishable", "secret"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid key type" },
        { status: 400 }
      );
    }

    // Generate the key
    const { key, hash, prefix, lastFour } = generateApiKey(type);

    const apiKey = await ApiKey.create({
      projectId: project._id,
      name,
      type,
      keyPrefix: prefix,
      keyHash: hash,
      lastFour,
      permissions: permissions || ["verify", "read"],
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      createdBy: user._id,
    });

    // Return the full key ONLY on creation (won't be retrievable again)
    return NextResponse.json(
      {
        key: {
          id: apiKey._id.toString(),
          name: apiKey.name,
          type: apiKey.type,
          key, // Full key - only shown once!
          keyPrefix: apiKey.keyPrefix,
          lastFour: apiKey.lastFour,
          permissions: apiKey.permissions,
          rateLimit: apiKey.rateLimit,
          expiresAt: apiKey.expiresAt,
          createdAt: apiKey.createdAt,
        },
        warning: "Save this key now. It won't be shown again!",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating API key:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
