import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProject extends Document {
  _id: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  status: "active" | "paused" | "archived";
  settings: {
    defaultChainId: number;
    webhookUrl?: string;
    allowedOrigins: string[];
    customBranding?: {
      logo?: string;
      primaryColor?: string;
      companyName?: string;
    };
  };
  stats: {
    totalVerifications: number;
    successfulVerifications: number;
    failedVerifications: number;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: mongoose.Types.ObjectId;
}

const ProjectSchema = new Schema<IProject>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "paused", "archived"],
      default: "active",
    },
    settings: {
      defaultChainId: {
        type: Number,
        default: 5003,
      },
      webhookUrl: String,
      allowedOrigins: {
        type: [String],
        default: [],
      },
      customBranding: {
        logo: String,
        primaryColor: String,
        companyName: String,
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

// Compound index for unique slug within organization
ProjectSchema.index({ organizationId: 1, slug: 1 }, { unique: true });

const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);

export default Project;
