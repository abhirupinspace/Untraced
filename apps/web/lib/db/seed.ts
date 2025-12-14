import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env.local
config({ path: resolve(__dirname, "../../.env.local") });

import dbConnect from "./mongodb";
import { Module } from "./models";

const SEED_MODULES = [
  {
    moduleId: "zk-email",
    name: "Email Verification",
    description: "Verify email ownership without revealing the actual email address",
    icon: "Mail",
    category: "identity" as const,
    status: "active" as const,
    version: "1.0.0",
    config: {
      defaults: {
        provider: "any",
      },
      options: {
        providers: ["any", "gmail", "outlook", "corporate"],
      },
    },
    pricing: {
      perVerification: 0,
      includedInPlan: ["free", "pro", "enterprise"],
    },
  },
  {
    moduleId: "zk-age",
    name: "Age Verification",
    description: "Prove age is above a threshold without revealing date of birth",
    icon: "Calendar",
    category: "identity" as const,
    status: "coming_soon" as const,
    version: "1.0.0",
    config: {
      defaults: {
        threshold: 18,
      },
      options: {
        thresholdRange: { min: 13, max: 100 },
      },
    },
    pricing: {
      perVerification: 0,
      includedInPlan: ["free", "pro", "enterprise"],
    },
  },
  {
    moduleId: "zk-github",
    name: "GitHub Verification",
    description: "Verify GitHub account activity without exposing username",
    icon: "Github",
    category: "social" as const,
    status: "coming_soon" as const,
    version: "1.0.0",
    config: {
      defaults: {
        minCommits: 10,
      },
      options: {
        commitsRange: { min: 1, max: 10000 },
      },
    },
    pricing: {
      perVerification: 0,
      includedInPlan: ["free", "pro", "enterprise"],
    },
  },
  {
    moduleId: "zk-bank-balance",
    name: "Bank Balance Verification",
    description: "Prove bank balance exceeds threshold without revealing exact amount",
    icon: "Landmark",
    category: "financial" as const,
    status: "coming_soon" as const,
    version: "1.0.0",
    config: {
      defaults: {
        threshold: 1000,
        currency: "USD",
      },
      options: {
        currencies: ["USD", "EUR", "GBP", "INR"],
        thresholdRange: { min: 100, max: 10000000 },
      },
    },
    pricing: {
      perVerification: 50, // cents
      includedInPlan: ["pro", "enterprise"],
    },
  },
  {
    moduleId: "zk-country",
    name: "Country Verification",
    description: "Prove residency in allowed countries without revealing exact location",
    icon: "Globe",
    category: "identity" as const,
    status: "coming_soon" as const,
    version: "1.0.0",
    config: {
      defaults: {
        allowedCountries: ["US"],
      },
      options: {
        countries: ["US", "UK", "EU", "CA", "AU", "IN", "SG", "JP"],
      },
    },
    pricing: {
      perVerification: 25,
      includedInPlan: ["pro", "enterprise"],
    },
  },
  {
    moduleId: "zk-aadhaar",
    name: "Aadhaar Verification",
    description: "Verify Aadhaar validity and age without revealing identity",
    icon: "CreditCard",
    category: "government" as const,
    status: "coming_soon" as const,
    version: "1.0.0",
    config: {
      defaults: {
        verifyAge: true,
        minAge: 18,
      },
      options: {
        ageRange: { min: 18, max: 100 },
      },
    },
    pricing: {
      perVerification: 100,
      includedInPlan: ["enterprise"],
    },
  },
];

export async function seedModules() {
  await dbConnect();

  console.log("Seeding modules...");

  for (const moduleData of SEED_MODULES) {
    await Module.findOneAndUpdate(
      { moduleId: moduleData.moduleId },
      moduleData,
      { upsert: true, new: true }
    );
    console.log(`  - ${moduleData.moduleId}: OK`);
  }

  console.log("Modules seeded successfully!");
}

// Run if called directly
if (require.main === module) {
  seedModules()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
