"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GithubIcon,
  EmailIcon,
  UserIcon,
  BankIcon,
  GlobeIcon,
  IdCardIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  LoaderIcon,
} from "@/components/ui/icons";
import { cn } from "@/lib/cn";

// Module definitions with icons
const MODULE_CONFIG = {
  "zk-email": {
    icon: EmailIcon,
    name: "Email Verification",
    description: "Verify your email ownership",
    color: "from-blue-500 to-cyan-500",
  },
  "zk-age": {
    icon: UserIcon,
    name: "Age Verification",
    description: "Prove you're over 18",
    color: "from-purple-500 to-pink-500",
  },
  "zk-github": {
    icon: GithubIcon,
    name: "GitHub Verification",
    description: "Verify your GitHub account",
    color: "from-gray-700 to-gray-900",
  },
  "zk-bank-balance": {
    icon: BankIcon,
    name: "Bank Balance",
    description: "Prove minimum balance",
    color: "from-green-500 to-emerald-500",
  },
  "zk-country": {
    icon: GlobeIcon,
    name: "Country Verification",
    description: "Verify your location",
    color: "from-orange-500 to-red-500",
  },
  "zk-aadhar": {
    icon: IdCardIcon,
    name: "Aadhaar Verification",
    description: "Verify your identity",
    color: "from-indigo-500 to-violet-500",
  },
  "zk-kyc": {
    icon: ShieldCheckIcon,
    name: "KYC Verification",
    description: "Complete KYC check",
    color: "from-teal-500 to-cyan-500",
  },
} as const;

type ModuleId = keyof typeof MODULE_CONFIG;

interface VerificationStep {
  moduleId: ModuleId;
  status: "pending" | "in_progress" | "completed" | "failed";
  config?: Record<string, unknown>;
}

interface UntracedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flowName: string;
  modules: ModuleId[];
  onComplete?: (success: boolean) => void;
  onStepComplete?: (moduleId: ModuleId, success: boolean) => void;
  theme?: "light" | "dark";
  logo?: string;
  title?: string;
  description?: string;
}

export function UntracedModal({
  open,
  onOpenChange,
  flowName,
  modules,
  onComplete,
  onStepComplete,
  title = "Identity Verification",
  description = "Complete the following verification steps to continue",
}: UntracedModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<VerificationStep[]>(
    modules.map((moduleId) => ({
      moduleId,
      status: "pending",
    }))
  );
  const [isVerifying, setIsVerifying] = useState(false);

  const currentModule = modules[currentStep];
  const moduleConfig = MODULE_CONFIG[currentModule];
  const allCompleted = steps.every((s) => s.status === "completed");

  const handleVerify = useCallback(async () => {
    if (!currentModule) return;

    setIsVerifying(true);
    setSteps((prev) =>
      prev.map((s, i) =>
        i === currentStep ? { ...s, status: "in_progress" } : s
      )
    );

    // Simulate verification process
    // In real implementation, this would call the SDK
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const success = Math.random() > 0.1; // 90% success rate for demo

    setSteps((prev) =>
      prev.map((s, i) =>
        i === currentStep
          ? { ...s, status: success ? "completed" : "failed" }
          : s
      )
    );

    setIsVerifying(false);
    onStepComplete?.(currentModule, success);

    if (success && currentStep < modules.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else if (success && currentStep === modules.length - 1) {
      onComplete?.(true);
    }
  }, [currentModule, currentStep, modules.length, onComplete, onStepComplete]);

  const handleRetry = useCallback(() => {
    setSteps((prev) =>
      prev.map((s, i) =>
        i === currentStep ? { ...s, status: "pending" } : s
      )
    );
  }, [currentStep]);

  const Icon = moduleConfig?.icon || ShieldCheckIcon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-br from-untraced-dark to-untraced-dark-hover p-6 text-white">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <span className="text-white font-bold text-sm">U</span>
              </div>
              <span className="text-sm font-medium opacity-80">UNTRACED</span>
            </div>
            <DialogHeader className="p-0">
              <DialogTitle className="text-xl text-white font-semibold">
                {title}
              </DialogTitle>
              <DialogDescription className="text-white/70 font-light">
                {description}
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        {/* Progress steps */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => {
              const StepIcon = MODULE_CONFIG[step.moduleId].icon;
              return (
                <div key={step.moduleId} className="flex items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                      step.status === "completed" && "bg-green-100 text-green-600",
                      step.status === "in_progress" && "bg-untraced-dark text-white",
                      step.status === "pending" && "bg-gray-100 text-gray-400",
                      step.status === "failed" && "bg-red-100 text-red-600"
                    )}
                  >
                    {step.status === "completed" ? (
                      <CheckCircleIcon className="w-5 h-5" />
                    ) : step.status === "in_progress" ? (
                      <LoaderIcon className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "w-12 h-0.5 mx-2 transition-all duration-300",
                        step.status === "completed"
                          ? "bg-green-500"
                          : "bg-gray-200"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Current step content */}
        <div className="px-6 pb-6">
          <AnimatePresence mode="wait">
            {!allCompleted ? (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="text-center"
              >
                <div
                  className={cn(
                    "w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-gradient-to-br",
                    moduleConfig.color
                  )}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-1">
                  {moduleConfig.name}
                </h3>
                <p className="text-sm text-untraced-dark/60 mb-6 font-light">
                  {moduleConfig.description}
                </p>

                {steps[currentStep].status === "failed" ? (
                  <div className="space-y-3">
                    <Badge variant="destructive">Verification Failed</Badge>
                    <div className="flex gap-3 justify-center">
                      <Button variant="outline" onClick={handleRetry}>
                        Try Again
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={handleVerify}
                    loading={isVerifying}
                    className="w-full"
                    size="lg"
                  >
                    {isVerifying ? "Verifying..." : "Verify Now"}
                  </Button>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <div className="w-16 h-16 rounded-full bg-green-100 mx-auto mb-4 flex items-center justify-center">
                  <CheckCircleIcon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-1">
                  Verification Complete
                </h3>
                <p className="text-sm text-untraced-dark/60 mb-6 font-light">
                  You have successfully completed all verification steps
                </p>
                <Button onClick={() => onOpenChange(false)} className="w-full" size="lg">
                  Continue
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-untraced-dark/40">
            <span>Flow: {flowName}</span>
            <span>Powered by UNTRACED</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Simple trigger button for the modal
export function UntracedVerifyButton({
  flowName,
  modules,
  onComplete,
  children,
  className,
  ...props
}: Omit<UntracedModalProps, "open" | "onOpenChange"> & {
  children?: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} className={className} {...props}>
        {children || "Verify Identity"}
      </Button>
      <UntracedModal
        open={open}
        onOpenChange={setOpen}
        flowName={flowName}
        modules={modules}
        onComplete={onComplete}
      />
    </>
  );
}
