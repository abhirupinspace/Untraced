import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import { Verification } from "@/lib/db/models";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/verify/[id] - Get a specific verification by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();

    const { id } = await params;

    const verification = await Verification.findById(id);
    if (!verification) {
      return NextResponse.json(
        { error: "Verification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      verification: {
        id: verification._id.toString(),
        userWallet: verification.userWallet,
        status: verification.status,
        modules: verification.modules,
        attestation: verification.attestation,
        flowId: verification.flowId?.toString(),
        projectId: verification.projectId?.toString(),
        startedAt: verification.startedAt,
        completedAt: verification.completedAt,
        expiresAt: verification.expiresAt,
        createdAt: verification.createdAt,
      },
    });
  } catch (error) {
    console.error("Get verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/verify/[id] - Update verification with transaction details
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();

    const { id } = await params;
    const body = await request.json();
    const { transactionHash, blockNumber } = body;

    if (!transactionHash) {
      return NextResponse.json(
        { error: "Missing required field: transactionHash" },
        { status: 400 }
      );
    }

    // Validate transaction hash format
    if (!/^0x[a-fA-F0-9]{64}$/.test(transactionHash)) {
      return NextResponse.json(
        { error: "Invalid transaction hash format" },
        { status: 400 }
      );
    }

    const verification = await Verification.findById(id);
    if (!verification) {
      return NextResponse.json(
        { error: "Verification not found" },
        { status: 404 }
      );
    }

    // Update with transaction details
    verification.attestation = {
      ...verification.attestation,
      transactionHash,
      blockNumber: blockNumber || undefined,
    };

    await verification.save();

    return NextResponse.json({
      success: true,
      verification: {
        id: verification._id.toString(),
        transactionHash,
        blockNumber,
        status: verification.status,
      },
    });
  } catch (error) {
    console.error("Update verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
