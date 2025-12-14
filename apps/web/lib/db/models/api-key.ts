import mongoose, { Schema, Document, Model } from "mongoose";
import crypto from "crypto";

export interface IApiKey extends Document {
  _id: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  name: string;
  type: "publishable" | "secret";
  keyPrefix: string;
  keyHash: string;
  lastFour: string;
  permissions: string[];
  rateLimit: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
  lastUsedAt?: Date;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  createdBy: mongoose.Types.ObjectId;
  revokedAt?: Date;
  revokedBy?: mongoose.Types.ObjectId;
}

const ApiKeySchema = new Schema<IApiKey>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["publishable", "secret"],
      required: true,
    },
    keyPrefix: {
      type: String,
      required: true,
    },
    keyHash: {
      type: String,
      required: true,
    },
    lastFour: {
      type: String,
      required: true,
    },
    permissions: {
      type: [String],
      default: ["verify", "read"],
    },
    rateLimit: {
      requestsPerMinute: {
        type: Number,
        default: 60,
      },
      requestsPerDay: {
        type: Number,
        default: 10000,
      },
    },
    lastUsedAt: Date,
    expiresAt: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    revokedAt: Date,
    revokedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Index for key lookup
ApiKeySchema.index({ keyPrefix: 1, keyHash: 1 });

// Static methods for key generation and verification
ApiKeySchema.statics.generateKey = function (
  type: "publishable" | "secret"
): { key: string; hash: string; prefix: string; lastFour: string } {
  const prefix = type === "publishable" ? "uk_live_" : "sk_live_";
  const randomPart = crypto.randomBytes(24).toString("hex");
  const key = `${prefix}${randomPart}`;
  const hash = crypto.createHash("sha256").update(key).digest("hex");
  const lastFour = randomPart.slice(-4);

  return { key, hash, prefix, lastFour };
};

ApiKeySchema.statics.hashKey = function (key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
};

const ApiKey: Model<IApiKey> =
  mongoose.models.ApiKey || mongoose.model<IApiKey>("ApiKey", ApiKeySchema);

export default ApiKey;
