import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import { Module } from "@/lib/db/models";

// GET /api/modules - List all available modules
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // "active", "beta", "coming_soon"
    const category = searchParams.get("category"); // "identity", "financial", "social", "government"

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const modules = await Module.find(filter).sort({ status: 1, name: 1 });

    return NextResponse.json({
      modules: modules.map((mod) => ({
        id: mod.moduleId,
        name: mod.name,
        description: mod.description,
        icon: mod.icon,
        category: mod.category,
        status: mod.status,
        version: mod.version,
        config: mod.config,
        pricing: mod.pricing,
      })),
    });
  } catch (error) {
    console.error("Error fetching modules:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
