import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVerificationModule {
  moduleId: string;
  status: "pending" | "processing" | "success" | "failed";
  startedAt?: Date;
  completedAt?: Date;
  errorMessage?: string;
}

export interface IVerification extends Document {
  _id: mongoose.Types.ObjectId;
  flowId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  userWallet: string;
  status: "pending" | "processing" | "success" | "failed" | "revoked";
  modules: IVerificationModule[];
  attestation?: {
    moduleType: string;
    expiry: Date;
    signature: {
      v: number;
      r: string;
      s: string;
    };
    transactionHash?: string;
    blockNumber?: number;
  };
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    country?: string;
    referrer?: string;
  };
  startedAt: Date;
  completedAt?: Date;
  expiresAt?: Date;
  revokedAt?: Date;
  revokedBy?: "user" | "admin" | "system";
}

const VerificationModuleSchema = new Schema<IVerificationModule>(
  {
    moduleId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "success", "failed"],
      default: "pending",
    },
    startedAt: Date,
    completedAt: Date,
    errorMessage: String,
  },
  { _id: false }
);

const VerificationSchema = new Schema<IVerification>(
  {
    flowId: {
      type: Schema.Types.ObjectId,
      ref: "Flow",
      required: true,
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    userWallet: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "success", "failed", "revoked"],
      default: "pending",
    },
    modules: {
      type: [VerificationModuleSchema],
      default: [],
    },
    attestation: {
      moduleType: String,
      expiry: Date,
      signature: {
        v: Number,
        r: String,
        s: String,
      },
      transactionHash: String,
      blockNumber: Number,
    },
    metadata: {
      ipAddress: String,
      userAgent: String,
      country: String,
      referrer: String,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
    expiresAt: Date,
    revokedAt: Date,
    revokedBy: {
      type: String,
      enum: ["user", "admin", "system"],
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
VerificationSchema.index({ projectId: 1, createdAt: -1 });
VerificationSchema.index({ flowId: 1, status: 1 });
VerificationSchema.index({ userWallet: 1, flowId: 1 });

const Verification: Model<IVerification> =
  mongoose.models.Verification ||
  mongoose.model<IVerification>("Verification", VerificationSchema);

export default Verification;
