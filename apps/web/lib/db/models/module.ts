import mongoose, { Schema, Document, Model } from "mongoose";

export interface IModule extends Document {
  _id: mongoose.Types.ObjectId;
  moduleId: string;
  name: string;
  description: string;
  icon: string;
  category: "identity" | "financial" | "social" | "government";
  status: "active" | "beta" | "coming_soon" | "deprecated";
  version: string;
  contractAddress?: string;
  config: {
    schema?: Record<string, unknown>;
    defaults?: Record<string, unknown>;
    options?: Record<string, unknown>;
  };
  pricing: {
    perVerification: number;
    includedInPlan: string[];
  };
  documentation?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ModuleSchema = new Schema<IModule>(
  {
    moduleId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["identity", "financial", "social", "government"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "beta", "coming_soon", "deprecated"],
      default: "coming_soon",
    },
    version: {
      type: String,
      default: "1.0.0",
    },
    contractAddress: String,
    config: {
      schema: {
        type: Schema.Types.Mixed,
        default: {},
      },
      defaults: {
        type: Schema.Types.Mixed,
        default: {},
      },
      options: {
        type: Schema.Types.Mixed,
        default: {},
      },
    },
    pricing: {
      perVerification: {
        type: Number,
        default: 0,
      },
      includedInPlan: {
        type: [String],
        default: ["free", "pro", "enterprise"],
      },
    },
    documentation: String,
  },
  {
    timestamps: true,
  }
);

const Module: Model<IModule> =
  mongoose.models.Module || mongoose.model<IModule>("Module", ModuleSchema);

export default Module;
