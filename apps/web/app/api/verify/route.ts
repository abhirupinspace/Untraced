import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import { Verification, Flow, Project } from "@/lib/db/models";
import { hasValidVerification, getVerificationHistory } from "@/lib/verification";

/**
 * GET /api/verify - Check verification status for a wallet address
 * Query params:
 *   - address: wallet address to check
 *   - moduleType: (optional) specific module type to check
 *   - flowId: (optional) specific flow to check
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");
    const moduleType = searchParams.get("moduleType");
    const flowId = searchParams.get("flowId");
    const includeHistory = searchParams.get("history") === "true";

    if (!address) {
      return NextResponse.json(
        { error: "Missing required parameter: address" },
        { status: 400 }
      );
    }

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: "Invalid Ethereum address format" },
        { status: 400 }
      );
    }

    await dbConnect();

    // If checking specific module type
    if (moduleType) {
      const isVerified = await hasValidVerification(address, moduleType);
      return NextResponse.json({
        address: address.toLowerCase(),
        moduleType,
        verified: isVerified,
      });
    }

    // If checking specific flow
    if (flowId) {
      const flow = await Flow.findById(flowId);
      if (!flow) {
        return NextResponse.json(
          { error: "Flow not found" },
          { status: 404 }
        );
      }

      // Check each module in the flow
      const moduleResults = await Promise.all(
        flow.modules.map(async (m) => {
          const verification = await Verification.findOne({
            userWallet: address.toLowerCase(),
            flowId: flow._id,
            "modules.moduleId": m.moduleId,
            status: "success",
            expiresAt: { $gt: new Date() },
          });

          return {
            moduleId: m.moduleId,
            required: m.required,
            verified: !!verification,
            expiresAt: verification?.expiresAt,
          };
        })
      );

      const allRequiredPassed = moduleResults
        .filter((m) => m.required)
        .every((m) => m.verified);

      return NextResponse.json({
        address: address.toLowerCase(),
        flowId,
        flowName: flow.name,
        verified: allRequiredPassed,
        modules: moduleResults,
      });
    }

    // Get all verification history if requested
    if (includeHistory) {
      const history = await getVerificationHistory(address, { limit: 50 });
      return NextResponse.json({
        address: address.toLowerCase(),
        verifications: history.map((v) => ({
          id: v._id.toString(),
          moduleType: v.attestation?.moduleType,
          status: v.status,
          expiresAt: v.expiresAt,
          transactionHash: v.attestation?.transactionHash,
          createdAt: v.createdAt,
        })),
      });
    }

    // Default: get active verifications
    const activeVerifications = await Verification.find({
      userWallet: address.toLowerCase(),
      status: "success",
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      address: address.toLowerCase(),
      verified: activeVerifications.length > 0,
      activeVerifications: activeVerifications.map((v) => ({
        id: v._id.toString(),
        moduleType: v.attestation?.moduleType,
        expiresAt: v.expiresAt,
        transactionHash: v.attestation?.transactionHash,
      })),
    });
  } catch (error) {
    console.error("Verification check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
