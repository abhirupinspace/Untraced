import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFlowModule {
  moduleId: string;
  instanceId: string;
  order: number;
  required: boolean;
  config: Record<string, unknown>;
}

export interface IFlow extends Document {
  _id: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  name: string;
  displayName: string;
  description?: string;
  version: number;
  status: "draft" | "active" | "paused" | "archived";
  modules: IFlowModule[];
  settings: {
    attestationValidityDays: number;
    chainId: number;
    registryAddress?: string;
    requireAllModules: boolean;
    customMessages?: {
      welcome?: string;
      success?: string;
      failure?: string;
    };
  };
  stats: {
    totalVerifications: number;
    successfulVerifications: number;
    failedVerifications: number;
  };
  deployedAt?: Date;
  deployedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  createdBy: mongoose.Types.ObjectId;
}

const FlowModuleSchema = new Schema<IFlowModule>(
  {
    moduleId: {
      type: String,
      required: true,
    },
    instanceId: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    required: {
      type: Boolean,
      default: true,
    },
    config: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: false }
);

const FlowSchema = new Schema<IFlow>(
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
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ["draft", "active", "paused", "archived"],
      default: "draft",
    },
    modules: {
      type: [FlowModuleSchema],
      default: [],
    },
    settings: {
      attestationValidityDays: {
        type: Number,
        default: 30,
      },
      chainId: {
        type: Number,
        default: 5003,
      },
      registryAddress: String,
      requireAllModules: {
        type: Boolean,
        default: true,
      },
      customMessages: {
        welcome: String,
        success: String,
        failure: String,
      },
    },
    stats: {
      totalVerifications: {
        type: Number,
        default: 0,
      },
      successfulVerifications: {
        type: Number,
        default: 0,
      },
      failedVerifications: {
        type: Number,
        default: 0,
      },
    },
    deployedAt: Date,
    deployedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique name within project
FlowSchema.index({ projectId: 1, name: 1 }, { unique: true });

const Flow: Model<IFlow> =
  mongoose.models.Flow || mongoose.model<IFlow>("Flow", FlowSchema);

export default Flow;
