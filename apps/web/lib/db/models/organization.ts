import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrgMember {
  userId: mongoose.Types.ObjectId;
  role: "owner" | "admin" | "developer" | "viewer";
  joinedAt: Date;
}

export interface IOrganization extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  ownerId: mongoose.Types.ObjectId;
  members: IOrgMember[];
  plan: "free" | "pro" | "enterprise";
  limits: {
    maxProjects: number;
    maxFlows: number;
    maxVerificationsPerMonth: number;
  };
  billing?: {
    customerId?: string;
    subscriptionId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    members: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["owner", "admin", "developer", "viewer"],
          default: "developer",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    plan: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free",
    },
    limits: {
      maxProjects: {
        type: Number,
        default: 3, // Free plan default
      },
      maxFlows: {
        type: Number,
        default: 5,
      },
      maxVerificationsPerMonth: {
        type: Number,
        default: 1000,
      },
    },
    billing: {
      customerId: String,
      subscriptionId: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for finding organizations by member
OrganizationSchema.index({ "members.userId": 1 });

const Organization: Model<IOrganization> =
  mongoose.models.Organization ||
  mongoose.model<IOrganization>("Organization", OrganizationSchema);

export default Organization;
