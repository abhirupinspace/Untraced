"use client";

import { useState } from "react";
import Image from "next/image";
import {
  UntracedProvider,
  UntracedModal,
  UntracedButton,
  useUntracedModal,
} from "@/lib/sdk";
import {
  KYCFlowModal,
  type KYCFlowConfig,
  type KYCModule,
} from "@/components/verification";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

// Demo KYC modules
const demoModules: KYCModule[] = [
  {
    id: "email",
    name: "Email Verification",
    description: "Verify your email address ownership",
    icon: "Email",
  },
  {
    id: "github",
    name: "GitHub Account",
    description: "Verify your GitHub developer activity",
    icon: "Github",
  },
  {
    id: "age",
    name: "Age Verification",
    description: "Prove you meet age requirements",
    icon: "User",
  },
];

function KYCFlowDemo() {
  const [isOpen, setIsOpen] = useState(false);
  const [result, setResult] = useState<any>(null);

  const config: KYCFlowConfig = {
    flowId: "demo-flow",
    flowName: "Identity Verification",
    modules: demoModules,
    onSuccess: (verificationResult) => {
      setResult(verificationResult);
      console.log("Flow completed:", verificationResult);
    },
    onError: (error) => {
      console.error("Flow error:", error);
    },
  };

  const handleVerify = async (moduleId: string) => {
    // Simulate verification
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return {
      moduleId,
      userAddress: "0x1234567890abcdef1234567890abcdef12345678",
      verified: true,
    };
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-card border border-border">
        <h2 className="text-lg font-medium text-foreground mb-2">
          KYC Flow Modal
        </h2>
        <p className="text-sm text-muted-foreground font-light mb-6">
          Multi-step verification flow with progress tracking
        </p>

        <button
          onClick={() => setIsOpen(true)}
          className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Open KYC Flow
        </button>

        {result && (
          <div className="mt-4 p-4 rounded-xl bg-success/10 border border-success/20">
            <p className="text-sm text-success font-medium">
              Verification Complete
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Module: {result.moduleId}
            </p>
          </div>
        )}
      </div>

      <KYCFlowModal
        open={isOpen}
        onOpenChange={setIsOpen}
        config={config}
        isConnected={true}
        userAddress="0x1234...5678"
        onVerify={handleVerify}
      />
    </div>
  );
}

function DemoContent() {
  const { open, verificationResult, status, isConnected, userAddress } =
    useUntracedModal();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/icon.png"
              alt="Untraced"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="font-medium text-foreground">Untraced Demo</span>
          </div>
          <div className="flex items-center gap-4">
            {isConnected && userAddress && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-full text-sm">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span className="font-mono text-xs text-muted-foreground">
                  {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                </span>
              </div>
            )}
            <AnimatedThemeToggler />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-medium tracking-tight text-foreground mb-4">
            ZK-KYC Verification
          </h1>
          <p className="text-lg text-muted-foreground font-light max-w-2xl mx-auto">
            Privacy-preserving identity verification. Prove attributes without
            revealing data.
          </p>
        </div>

        {/* Status Card */}
        {verificationResult && (
          <div className="mb-12 p-6 rounded-2xl bg-success/5 border border-success/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-success">
                  Verification Complete
                </h3>
                <p className="text-sm text-muted-foreground">
                  Module: {verificationResult.moduleId}
                </p>
              </div>
            </div>
            <pre className="text-xs bg-secondary/50 p-4 rounded-xl overflow-auto text-muted-foreground">
              {JSON.stringify(verificationResult, null, 2)}
            </pre>
          </div>
        )}

        {/* KYC Flow Demo Section */}
        <div className="mb-12">
          <h2 className="text-xl font-medium text-foreground mb-6">
            KYC Flow Modal
          </h2>
          <KYCFlowDemo />
        </div>

        {/* SDK Demo Grid */}
        <div className="mb-12">
          <h2 className="text-xl font-medium text-foreground mb-2">
            SDK Components
          </h2>
          <p className="text-sm text-muted-foreground font-light mb-6">
            Pre-built components for quick integration
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Quick Start */}
            <div className="p-6 rounded-2xl bg-card border border-border">
              <h3 className="text-base font-medium text-foreground mb-2">Quick Start</h3>
              <p className="text-sm text-muted-foreground font-light mb-6">
                One button to verify. Click to open the modal.
              </p>
              <UntracedButton />
            </div>

            {/* Button Variants */}
            <div className="p-6 rounded-2xl bg-card border border-border">
              <h3 className="text-base font-medium text-foreground mb-2">Button Variants</h3>
              <p className="text-sm text-muted-foreground font-light mb-6">
                Different styles to match your app.
              </p>
              <div className="flex flex-wrap gap-3">
                <UntracedButton variant="primary" size="sm">
                  Primary
                </UntracedButton>
                <UntracedButton variant="secondary" size="sm">
                  Secondary
                </UntracedButton>
                <UntracedButton variant="outline" size="sm">
                  Outline
                </UntracedButton>
              </div>
            </div>

            {/* Module Selection */}
            <div className="p-6 rounded-2xl bg-card border border-border">
              <h3 className="text-base font-medium text-foreground mb-2">Pre-select Module</h3>
              <p className="text-sm text-muted-foreground font-light mb-6">
                Open directly to a specific verification type.
              </p>
              <div className="flex flex-wrap gap-3">
                <UntracedButton module="zk-github" variant="secondary" size="sm">
                  GitHub
                </UntracedButton>
                <UntracedButton module="zk-email" variant="secondary" size="sm">
                  Email
                </UntracedButton>
                <UntracedButton module="zk-age" variant="secondary" size="sm">
                  Age
                </UntracedButton>
              </div>
            </div>

            {/* Programmatic Control */}
            <div className="p-6 rounded-2xl bg-card border border-border">
              <h3 className="text-base font-medium text-foreground mb-2">Programmatic API</h3>
              <p className="text-sm text-muted-foreground font-light mb-6">
                Control the modal with the useUntracedModal hook.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => open()}
                  className="px-4 py-2.5 bg-primary text-primary-foreground hover:opacity-90 rounded-xl text-sm font-medium transition-opacity"
                >
                  open()
                </button>
                <button
                  onClick={() => open("zk-email")}
                  className="px-4 py-2.5 bg-secondary text-foreground hover:bg-secondary/80 rounded-xl text-sm font-medium transition-colors"
                >
                  open("zk-email")
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Code Example */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <h2 className="text-base font-medium text-foreground mb-4">Integration Code</h2>
          <pre className="text-sm bg-secondary/50 p-4 rounded-xl overflow-auto">
            <code className="text-muted-foreground">{`import { KYCFlowModal, type KYCFlowConfig } from "@/components/verification";

const modules = [
  { id: "email", name: "Email", icon: "Email" },
  { id: "github", name: "GitHub", icon: "Github" },
];

function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Open KYC Flow
      </button>
      <KYCFlowModal
        open={isOpen}
        onOpenChange={setIsOpen}
        config={{ flowId: "my-flow", flowName: "Verification", modules }}
        onVerify={async (moduleId) => {
          // Your verification logic
          return { moduleId, userAddress: "0x...", verified: true };
        }}
      />
    </>
  );
}`}</code>
          </pre>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            Powered by{" "}
            <a href="/" className="text-primary hover:underline">
              Untraced
            </a>{" "}
            - Zero-Knowledge Verification on Mantle
          </p>
        </footer>
      </main>
    </div>
  );
}

export default function DemoPage() {
  return (
    <UntracedProvider
      config={{
        clientId: "demo-client",
        apiUrl: "/api",
        chainId: 5003,
        registryAddress: "0xA5f2af132B0163f9333c67f5EfD4C35f037BbA60",
        theme: "auto",
        accentColor: "#7c3aed",
        onSuccess: (result) => {
          console.log("Verification successful!", result);
        },
        onError: (error) => {
          console.error("Verification failed:", error);
        },
      }}
    >
      <UntracedModal />
      <DemoContent />
    </UntracedProvider>
  );
}
