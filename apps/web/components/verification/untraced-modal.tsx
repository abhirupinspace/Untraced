"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  EmailIcon,
  CheckCircleIcon,
  LoaderIcon,
  ShieldCheckIcon,
} from "@/components/ui/icons";
import { cn } from "@/lib/cn";

type VerificationStatus =
  | "idle"
  | "generating"
  | "submitting"
  | "success"
  | "error";

interface UntracedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify: () => Promise<void>;
  verified?: boolean;
  expiresAt?: Date | null;
  error?: Error | null;
}

export function UntracedModal({
  open,
  onOpenChange,
  onVerify,
  verified = false,
  expiresAt,
  error: externalError,
}: UntracedModalProps) {
  const [status, setStatus] = useState<VerificationStatus>(
    verified ? "success" : "idle"
  );
  const [error, setError] = useState<Error | null>(externalError || null);

  // Update status when verified prop changes
  useEffect(() => {
    if (verified) {
      setStatus("success");
    }
  }, [verified]);

  // Update error when external error changes
  useEffect(() => {
    if (externalError) {
      setError(externalError);
      setStatus("error");
    }
  }, [externalError]);

  const handleVerify = useCallback(async () => {
    setStatus("generating");
    setError(null);

    try {
      // Simulate proof generation phase
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStatus("submitting");

      // Call the actual verify function
      await onVerify();

      setStatus("success");
    } catch (err) {
      console.error("Verification failed:", err);
      setError(err instanceof Error ? err : new Error("Verification failed"));
      setStatus("error");
    }
  }, [onVerify]);

  const handleRetry = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  // Calculate days until expiry
  const daysUntilExpiry = expiresAt
    ? Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 30;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-[#0a0a0a] border-white/10">
        {/* Header */}
        <div className="relative p-6 border-b border-white/5">
          <div className="flex items-center gap-2.5 mb-4">
            <Image
              src="/icon.png"
              alt="UNTRACED"
              width={24}
              height={24}
              className="rounded-md"
            />
            <span className="text-sm font-medium text-gray-400">UNTRACED</span>
          </div>
          <DialogHeader className="p-0">
            <DialogTitle className="text-xl text-white font-semibold">
              Email Verification
            </DialogTitle>
            <DialogDescription className="text-gray-500 font-light">
              Prove your email is verified without revealing it
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <AnimatePresence mode="wait">
            {status === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Module Icon */}
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <EmailIcon className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Privacy Messaging */}
                <div className="space-y-3 bg-white/5 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-white">
                    Privacy Guarantee
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircleIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">
                        Email is verified
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <XIcon className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <span className="text-gray-300">
                        Email address is never shared
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <XIcon className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <span className="text-gray-300">
                        Identity is never revealed
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={handleVerify}
                  className="w-full bg-white text-black hover:bg-gray-200"
                  size="lg"
                >
                  Generate Proof
                </Button>
              </motion.div>
            )}

            {status === "generating" && (
              <motion.div
                key="generating"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center space-y-6 py-4"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mx-auto flex items-center justify-center">
                    <LoaderIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full border-2 border-purple-500/30 animate-ping" />
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg text-white mb-2">
                    Running zero-knowledge proof locally...
                  </h3>
                  <p className="text-sm text-gray-500">
                    This may take a few seconds
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                  <ShieldCheckIcon className="w-4 h-4" />
                  <span>Your data never leaves your device</span>
                </div>
              </motion.div>
            )}

            {status === "submitting" && (
              <motion.div
                key="submitting"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center space-y-6 py-4"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 mx-auto flex items-center justify-center">
                    <LoaderIcon className="w-8 h-8 text-white" />
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg text-white mb-2">
                    Submitting to Mantle...
                  </h3>
                  <p className="text-sm text-gray-500">
                    Please confirm the transaction in your wallet
                  </p>
                </div>
              </motion.div>
            )}

            {status === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 py-4"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/20 mx-auto flex items-center justify-center">
                  <CheckCircleIcon className="w-8 h-8 text-green-400" />
                </div>

                <div>
                  <h3 className="font-semibold text-lg text-white mb-2">
                    Verification Complete
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Your email verification is now stored on-chain
                  </p>

                  {/* Validity Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-sm text-green-400">
                      Valid for {daysUntilExpiry} days
                    </span>
                  </div>
                </div>

                {/* Privacy Summary */}
                <div className="bg-white/5 rounded-xl p-4 text-left">
                  <h4 className="text-sm font-medium text-white mb-2">
                    What the smart contract knows:
                  </h4>
                  <p className="text-sm text-gray-400">
                    Only that <code className="text-purple-400">EMAIL_VERIFIED == true</code>
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    Nothing else. No email, no identity.
                  </p>
                </div>

                <Button
                  onClick={() => onOpenChange(false)}
                  className="w-full bg-white text-black hover:bg-gray-200"
                  size="lg"
                >
                  Continue
                </Button>
              </motion.div>
            )}

            {status === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center space-y-6 py-4"
              >
                <div className="w-16 h-16 rounded-full bg-red-500/20 mx-auto flex items-center justify-center">
                  <XIcon className="w-8 h-8 text-red-400" />
                </div>

                <div>
                  <h3 className="font-semibold text-lg text-white mb-2">
                    Verification Failed
                  </h3>
                  <p className="text-sm text-gray-500">
                    {error?.message || "Something went wrong. Please try again."}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleRetry}
                    variant="outline"
                    className="flex-1 border-white/10 text-white hover:bg-white/5"
                  >
                    Try Again
                  </Button>
                  <Button
                    onClick={() => onOpenChange(false)}
                    variant="ghost"
                    className="flex-1 text-gray-400 hover:text-white hover:bg-white/5"
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Module: zk-email</span>
            <span>Powered by UNTRACED</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// X Icon for privacy messaging
function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// Simple verify button that triggers the modal
interface UntracedVerifyButtonProps {
  onVerify: () => Promise<void>;
  verified?: boolean;
  expiresAt?: Date | null;
  error?: Error | null;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function UntracedVerifyButton({
  onVerify,
  verified,
  expiresAt,
  error,
  children,
  className,
  disabled,
}: UntracedVerifyButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className={className}
        disabled={disabled || verified}
      >
        {children || (verified ? "Verified" : "Verify Email")}
      </Button>
      <UntracedModal
        open={open}
        onOpenChange={setOpen}
        onVerify={onVerify}
        verified={verified}
        expiresAt={expiresAt}
        error={error}
      />
    </>
  );
}
