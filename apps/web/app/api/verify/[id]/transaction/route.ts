import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import { Verification } from "@/lib/db/models";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/verify/[id]/transaction - Update verification with on-chain transaction details
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
    if (verification.attestation) {
      verification.attestation.transactionHash = transactionHash;
      if (blockNumber) {
        verification.attestation.blockNumber = blockNumber;
      }
    } else {
      verification.attestation = {
        moduleType: "",
        expiry: new Date(),
        signature: { v: 0, r: "", s: "" },
        transactionHash,
        blockNumber: blockNumber || undefined,
      };
    }

    await verification.save();

    return NextResponse.json({
      success: true,
      verificationId: verification._id.toString(),
      transactionHash,
      blockNumber,
    });
  } catch (error) {
    console.error("Update verification transaction error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
