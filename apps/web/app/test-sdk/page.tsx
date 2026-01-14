"use client";

import { useState } from "react";
import { UntracedProvider, UntracedModal, UntracedButton, useUntracedModal } from "@untraced/sdk";
import type { VerificationResult, VerificationModule } from "@untraced/sdk";

function TestSDKContent() {
  const {
    open,
    close,
    verify,
    reset,
    isOpen,
    isConnected,
    userAddress,
    status,
    currentModule,
    verificationResult,
    error,
  } = useUntracedModal();

  const [testResults, setTestResults] = useState<string[]>([]);
  const [programmaticResult, setProgrammaticResult] = useState<VerificationResult | null>(null);

  const addTestResult = (message: string) => {
    setTestResults((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const testModalOpen = (module: VerificationModule) => {
    addTestResult(`Testing modal open for module: ${module}`);
    open(module);
  };

  const testProgrammaticVerification = async (module: VerificationModule) => {
    addTestResult(`Testing programmatic verification for: ${module}`);
    try {
      const result = await verify(module, {
        // Add module-specific config
        ...(module === "zk-age" && { minAge: 18 }),
        ...(module === "zk-github" && { minCommits: 10 }),
        ...(module === "zk-email" && { provider: "any" }),
      });
      setProgrammaticResult(result);
      addTestResult(`✓ Verification successful: ${result.verificationId}`);
    } catch (err: any) {
      addTestResult(`✗ Verification failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Untraced SDK Test Suite</h1>
          <p className="text-muted-foreground">
            Test all SDK functionality including OAuth integration
          </p>
        </div>

        {/* Status Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-border rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Modal Status</div>
            <div className="text-lg font-semibold text-foreground">
              {isOpen ? "Open" : "Closed"}
            </div>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Wallet Status</div>
            <div className="text-lg font-semibold text-foreground">
              {isConnected ? "Connected" : "Disconnected"}
            </div>
            {userAddress && (
              <div className="text-xs text-muted-foreground mt-1">
                {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
              </div>
            )}
          </div>
          <div className="p-4 border border-border rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Verification Status</div>
            <div className="text-lg font-semibold text-foreground capitalize">{status}</div>
            {currentModule && (
              <div className="text-xs text-muted-foreground mt-1">{currentModule}</div>
            )}
          </div>
        </div>

        {/* Test Section 1: Modal Tests */}
        <div className="border border-border rounded-lg p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Test 1: Modal Opening</h2>
          <p className="text-muted-foreground mb-4">
            Click each button to test modal opening for different modules
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <button
              onClick={() => testModalOpen("zk-email")}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Email Module
            </button>
            <button
              onClick={() => testModalOpen("zk-age")}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Age Module
            </button>
            <button
              onClick={() => testModalOpen("zk-github")}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              GitHub Module
            </button>
            <button
              onClick={() => testModalOpen("zk-twitter")}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Twitter Module
            </button>
            <button
              onClick={() => testModalOpen("zk-balance")}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Balance Module
            </button>
          </div>
        </div>

        {/* Test Section 2: UntracedButton Component */}
        <div className="border border-border rounded-lg p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Test 2: UntracedButton Component
          </h2>
          <p className="text-muted-foreground mb-4">Pre-styled button components</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-foreground">Primary Variant</div>
              <UntracedButton module="zk-email" variant="primary" size="lg">
                Verify Email (Primary)
              </UntracedButton>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-foreground">Secondary Variant</div>
              <UntracedButton module="zk-github" variant="secondary" size="lg">
                Verify GitHub (Secondary)
              </UntracedButton>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-foreground">Outline Variant</div>
              <UntracedButton module="zk-twitter" variant="outline" size="md">
                Verify Twitter (Outline)
              </UntracedButton>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-foreground">Ghost Variant</div>
              <UntracedButton module="zk-age" variant="ghost" size="md">
                Verify Age (Ghost)
              </UntracedButton>
            </div>
          </div>
        </div>

        {/* Test Section 3: Programmatic Verification */}
        <div className="border border-border rounded-lg p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Test 3: Programmatic Verification
          </h2>
          <p className="text-muted-foreground mb-4">
            Test the verify() function directly (will still trigger OAuth for GitHub/Twitter)
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <button
              onClick={() => testProgrammaticVerification("zk-email")}
              disabled={status === "verifying"}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Verify Email
            </button>
            <button
              onClick={() => testProgrammaticVerification("zk-age")}
              disabled={status === "verifying"}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Verify Age 18+
            </button>
            <button
              onClick={() => testProgrammaticVerification("zk-github")}
              disabled={status === "verifying"}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Verify GitHub
            </button>
            <button
              onClick={() => testProgrammaticVerification("zk-twitter")}
              disabled={status === "verifying"}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Verify Twitter
            </button>
            <button
              onClick={() => testProgrammaticVerification("zk-balance")}
              disabled={status === "verifying"}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Verify Balance
            </button>
          </div>
          {programmaticResult && (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="text-sm font-medium text-green-600 mb-2">
                ✓ Verification Result
              </div>
              <pre className="text-xs text-foreground overflow-x-auto">
                {JSON.stringify(programmaticResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Test Section 4: State Management */}
        <div className="border border-border rounded-lg p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Test 4: State Management</h2>
          <p className="text-muted-foreground mb-4">Test state control functions</p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                reset();
                addTestResult("Reset called");
              }}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
            >
              Reset State
            </button>
            <button
              onClick={() => {
                close();
                addTestResult("Close called");
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Close Modal
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="border border-red-500/20 bg-red-500/10 rounded-lg p-4">
            <div className="text-sm font-medium text-red-600 mb-2">Error</div>
            <div className="text-sm text-red-600">{error.message}</div>
          </div>
        )}

        {/* Verification Result Display */}
        {verificationResult && (
          <div className="border border-green-500/20 bg-green-500/10 rounded-lg p-4">
            <div className="text-sm font-medium text-green-600 mb-2">
              ✓ Verification Successful
            </div>
            <div className="space-y-2 text-sm text-foreground">
              <div>
                <span className="font-medium">Module:</span> {verificationResult.moduleId}
              </div>
              <div>
                <span className="font-medium">Verification ID:</span>{" "}
                {verificationResult.verificationId}
              </div>
              <div>
                <span className="font-medium">User Address:</span> {verificationResult.userAddress}
              </div>
              {verificationResult.transactionHash && (
                <div>
                  <span className="font-medium">Transaction:</span>{" "}
                  <a
                    href={`https://sepolia.mantlescan.xyz/tx/${verificationResult.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    View on Explorer
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Test Log */}
        <div className="border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">Test Log</h2>
            <button
              onClick={() => setTestResults([])}
              className="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Clear Log
            </button>
          </div>
          <div className="bg-black/50 rounded-lg p-4 max-h-64 overflow-y-auto font-mono text-xs">
            {testResults.length === 0 ? (
              <div className="text-muted-foreground">No test logs yet...</div>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="text-green-400 mb-1">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TestSDKPage() {
  return (
    <UntracedProvider
      config={{
        clientId: "test-client-id",
        apiUrl: "/api",
        theme: "dark",
        accentColor: "#a855f7",
        onSuccess: (result) => {
          console.log("✓ SDK Success Callback:", result);
        },
        onError: (error) => {
          console.error("✗ SDK Error Callback:", error);
        },
        onClose: () => {
          console.log("Modal Closed");
        },
      }}
    >
      <TestSDKContent />
      <UntracedModal />
    </UntracedProvider>
  );
}
