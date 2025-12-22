import dbConnect from "./db/mongodb";
import { Verification, Flow, Project, type IVerification } from "./db/models";
import type { Hex } from "viem";

export interface RecordVerificationParams {
  userWallet: string;
  moduleId: string;
  flowId?: string;
  projectId?: string;
  attestation: {
    moduleType: string;
    expiry: Date;
    signature: {
      v: number;
      r: string;
      s: string;
    };
  };
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    country?: string;
    referrer?: string;
  };
}

/**
 * Record a successful verification in the database
 */
export async function recordVerification(
  params: RecordVerificationParams
): Promise<IVerification> {
  await dbConnect();

  const {
    userWallet,
    moduleId,
    flowId,
    projectId,
    attestation,
    metadata,
  } = params;

  // Create verification record
  const verification = await Verification.create({
    flowId: flowId || null,
    projectId: projectId || null,
    userWallet: userWallet.toLowerCase(),
    status: "success",
    modules: [
      {
        moduleId,
        status: "success",
        startedAt: new Date(),
        completedAt: new Date(),
      },
    ],
    attestation: {
      moduleType: attestation.moduleType,
      expiry: attestation.expiry,
      signature: attestation.signature,
    },
    metadata: metadata || {},
    startedAt: new Date(),
    completedAt: new Date(),
    expiresAt: attestation.expiry,
  });

  // Update flow stats if flowId is provided
  if (flowId) {
    await Flow.findByIdAndUpdate(flowId, {
      $inc: {
        "stats.totalVerifications": 1,
        "stats.successfulVerifications": 1,
      },
    });
  }

  return verification;
}

/**
 * Record a failed verification attempt
 */
export async function recordFailedVerification(params: {
  userWallet: string;
  moduleId: string;
  flowId?: string;
  projectId?: string;
  errorMessage: string;
  metadata?: RecordVerificationParams["metadata"];
}): Promise<IVerification> {
  await dbConnect();

  const { userWallet, moduleId, flowId, projectId, errorMessage, metadata } = params;

  const verification = await Verification.create({
    flowId: flowId || null,
    projectId: projectId || null,
    userWallet: userWallet.toLowerCase(),
    status: "failed",
    modules: [
      {
        moduleId,
        status: "failed",
        startedAt: new Date(),
        completedAt: new Date(),
        errorMessage,
      },
    ],
    metadata: metadata || {},
    startedAt: new Date(),
    completedAt: new Date(),
  });

  // Update flow stats if flowId is provided
  if (flowId) {
    await Flow.findByIdAndUpdate(flowId, {
      $inc: {
        "stats.totalVerifications": 1,
        "stats.failedVerifications": 1,
      },
    });
  }

  return verification;
}

/**
 * Get verification history for a wallet
 */
export async function getVerificationHistory(
  userWallet: string,
  options: { limit?: number; moduleType?: string } = {}
): Promise<IVerification[]> {
  await dbConnect();

  const query: Record<string, unknown> = {
    userWallet: userWallet.toLowerCase(),
  };

  if (options.moduleType) {
    query["attestation.moduleType"] = options.moduleType;
  }

  return Verification.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 50);
}

/**
 * Check if a wallet has a valid verification for a module type
 */
export async function hasValidVerification(
  userWallet: string,
  moduleType: string
): Promise<boolean> {
  await dbConnect();

  const verification = await Verification.findOne({
    userWallet: userWallet.toLowerCase(),
    "attestation.moduleType": moduleType,
    status: "success",
    expiresAt: { $gt: new Date() },
  });

  return !!verification;
}

/**
 * Update verification with on-chain transaction details
 */
export async function updateVerificationWithTransaction(
  verificationId: string,
  transactionHash: string,
  blockNumber: number
): Promise<IVerification | null> {
  await dbConnect();

  return Verification.findByIdAndUpdate(
    verificationId,
    {
      $set: {
        "attestation.transactionHash": transactionHash,
        "attestation.blockNumber": blockNumber,
      },
    },
    { new: true }
  );
}
