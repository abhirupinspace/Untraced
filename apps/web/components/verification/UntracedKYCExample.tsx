"use client";

/**
 * Example usage of the Untraced ZK-KYC Modal SDK
 *
 * This component demonstrates how developers can integrate
 * the Untraced verification modal into their applications.
 */

import {
  UntracedProvider,
  UntracedModal,
  UntracedButton,
  useUntracedModal,
} from "@/lib/sdk";

// ===========================================
// OPTION 1: Quick Integration with UntracedButton
// ===========================================

export function QuickIntegration() {
  return (
    <UntracedProvider
      config={{
        clientId: "your-project-client-id",
        theme: "dark",
        accentColor: "#a855f7",
        onSuccess: (result) => {
          console.log("Verification successful:", result);
          // Handle successful verification
          // e.g., update user state, grant access, etc.
        },
        onError: (error) => {
          console.error("Verification failed:", error);
        },
      }}
    >
      <UntracedModal />
      <UntracedButton />
    </UntracedProvider>
  );
}

// ===========================================
// OPTION 2: Custom Button with Hook
// ===========================================

function CustomVerifyButton() {
  const { open, verificationResult, status } = useUntracedModal();

  const isVerified = !!verificationResult;
  const isLoading = status === "verifying" || status === "submitting";

  return (
    <button
      onClick={() => open()}
      disabled={isLoading}
      className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold
                 hover:bg-purple-700 disabled:opacity-50 transition-all"
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="animate-spin">⏳</span>
          Verifying...
        </span>
      ) : isVerified ? (
        <span className="flex items-center gap-2">
          <span>✓</span>
          Verified
        </span>
      ) : (
        <span className="flex items-center gap-2">
          Verify Identity
        </span>
      )}
    </button>
  );
}

export function CustomButtonIntegration() {
  return (
    <UntracedProvider
      config={{
        clientId: "your-project-client-id",
        modules: ["zk-github", "zk-twitter"], // Only allow these modules
        onSuccess: (result) => {
          console.log("User verified:", result.moduleId);
        },
      }}
    >
      <UntracedModal />
      <CustomVerifyButton />
    </UntracedProvider>
  );
}

// ===========================================
// OPTION 3: Pre-select a specific module
// ===========================================

function GitHubOnlyVerification() {
  const { open } = useUntracedModal();

  return (
    <button
      onClick={() => open("zk-github")}
      className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg"
    >
      <span>🐙</span>
      Verify GitHub Activity
    </button>
  );
}

export function SingleModuleIntegration() {
  return (
    <UntracedProvider
      config={{
        clientId: "your-project-client-id",
        modules: ["zk-github"],
      }}
    >
      <UntracedModal />
      <GitHubOnlyVerification />
    </UntracedProvider>
  );
}

// ===========================================
// OPTION 4: Full control with programmatic API
// ===========================================

function ProgrammaticVerification() {
  const { verify, verificationResult, status, error } = useUntracedModal();

  const handleVerifyAge = async () => {
    try {
      const result = await verify("zk-age", { minAge: 21 });
      console.log("Age verified:", result);
      // Grant access to age-restricted content
    } catch (err) {
      console.error("Age verification failed:", err);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleVerifyAge}
        disabled={status === "verifying"}
        className="px-4 py-2 bg-green-600 text-white rounded-lg"
      >
        {status === "verifying" ? "Verifying..." : "Verify Age (21+)"}
      </button>

      {verificationResult && (
        <div className="p-4 bg-green-100 rounded-lg">
          <p className="text-green-800">
            ✓ Age verified! Module: {verificationResult.moduleId}
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-100 rounded-lg">
          <p className="text-red-800">Error: {error.message}</p>
        </div>
      )}
    </div>
  );
}

export function ProgrammaticIntegration() {
  return (
    <UntracedProvider
      config={{
        clientId: "your-project-client-id",
      }}
    >
      <UntracedModal />
      <ProgrammaticVerification />
    </UntracedProvider>
  );
}

// ===========================================
// FULL EXAMPLE: Complete Integration
// ===========================================

export default function UntracedKYCExample() {
  return (
    <UntracedProvider
      config={{
        // Required: Your project's client ID from the Untraced dashboard
        clientId: process.env.NEXT_PUBLIC_UNTRACED_CLIENT_ID || "demo-client",

        // Optional: API endpoint (defaults to /api)
        apiUrl: "/api",

        // Optional: Blockchain configuration
        chainId: 5003, // Mantle Sepolia
        registryAddress: "0xA5f2af132B0163f9333c67f5EfD4C35f037BbA60",

        // Optional: UI customization
        theme: "dark", // "light" | "dark" | "auto"
        accentColor: "#a855f7", // Your brand color

        // Optional: Limit available modules
        modules: ["zk-email", "zk-age", "zk-github", "zk-twitter", "zk-balance"],

        // Callbacks
        onSuccess: (result) => {
          console.log("Verification successful!", result);
          // Update your app state
          // Grant access to features
          // Store verification status
        },
        onError: (error) => {
          console.error("Verification failed:", error);
          // Handle error (show notification, retry logic, etc.)
        },
        onClose: () => {
          console.log("Modal closed");
        },
      }}
    >
      {/* The modal component - renders as a portal */}
      <UntracedModal />

      {/* Your app content */}
      <div className="p-8 space-y-8">
        <h1 className="text-2xl font-bold">Untraced ZK-KYC Integration</h1>

        {/* Simple button */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Default Button</h2>
          <UntracedButton />
        </section>

        {/* Styled variants */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Button Variants</h2>
          <div className="flex gap-4">
            <UntracedButton variant="primary">Primary</UntracedButton>
            <UntracedButton variant="secondary">Secondary</UntracedButton>
            <UntracedButton variant="outline">Outline</UntracedButton>
            <UntracedButton variant="ghost">Ghost</UntracedButton>
          </div>
        </section>

        {/* Pre-select module */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Module-Specific</h2>
          <div className="flex gap-4">
            <UntracedButton module="zk-github">Verify GitHub</UntracedButton>
            <UntracedButton module="zk-twitter">Verify Twitter</UntracedButton>
            <UntracedButton module="zk-age">Verify Age</UntracedButton>
          </div>
        </section>
      </div>
    </UntracedProvider>
  );
}
