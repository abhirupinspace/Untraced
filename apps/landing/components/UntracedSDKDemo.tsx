"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * Demo component showing how to integrate the Untraced SDK
 * This demonstrates the SDK modal integration pattern
 */
export function UntracedSDKDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [verificationResult, setVerificationResult] = useState<string | null>(null);

  const handleVerify = () => {
    setIsModalOpen(true);
    // In a real implementation, the SDK modal would open here
    // Example:
    // const untraced = useUntracedModal();
    // untraced.open();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className="h-14 px-8 text-base font-medium rounded-full border-primary/20 hover:bg-primary/10"
        >
          Try SDK Demo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Untraced SDK Integration</DialogTitle>
          <DialogDescription>
            Here's how easy it is to integrate the Untraced verification modal into your app
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step 1: Installation */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">1. Install the SDK</h3>
            <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto">
              <code>{`npm install @untraced/sdk`}</code>
            </pre>
          </div>

          {/* Step 2: Setup Provider */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">2. Wrap your app with UntracedProvider</h3>
            <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto">
              <code>{`import { UntracedProvider, UntracedModal } from '@untraced/sdk';

function App() {
  return (
    <UntracedProvider config={{
      clientId: "your-client-id",
      apiUrl: "https://untraced-web.vercel.app/api",
      theme: "dark",
      onSuccess: (result) => console.log(result)
    }}>
      <YourApp />
      <UntracedModal />
    </UntracedProvider>
  );
}`}</code>
            </pre>
          </div>

          {/* Step 3: Use the hook */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">3. Trigger verification from anywhere</h3>
            <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto">
              <code>{`import { useUntracedModal } from '@untraced/sdk';

function MyComponent() {
  const { open } = useUntracedModal();

  return (
    <button onClick={() => open('zk-email')}>
      Verify Email
    </button>
  );
}`}</code>
            </pre>
          </div>

          {/* Available Modules */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Available Verification Modules</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "zk-email", name: "Email" },
                { id: "zk-age", name: "Age" },
                { id: "zk-github", name: "GitHub" },
                { id: "zk-twitter", name: "Twitter" },
                { id: "zk-balance", name: "Balance" },
              ].map((module) => (
                <div key={module.id} className="p-3 bg-muted rounded-md text-sm">
                  <code className="text-xs text-primary">{module.id}</code>
                  <p className="text-xs text-muted-foreground mt-1">{module.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="pt-4 border-t">
            <div className="flex gap-3">
              <Button
                className="flex-1"
                onClick={() => window.open("https://docs.untraced.io", "_blank")}
              >
                View Full Documentation
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.open("https://untraced-web.vercel.app/dashboard", "_blank")}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
