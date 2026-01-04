"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/cn";
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
import { X, ArrowLeft, ExternalLink, Lock } from "lucide-react";

// Module configuration types
export interface KYCModule {
  id: string;
  name: string;
  description: string;
  icon: string;
  required?: boolean;
  configOptions?: ModuleConfigOption[];
}

interface ModuleConfigOption {
  id: string;
  label: string;
  type: "number" | "select";
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  default: string | number;
}

export interface KYCFlowConfig {
  flowId: string;
  flowName: string;
  modules: KYCModule[];
  theme?: "light" | "dark" | "auto";
  accentColor?: string;
  onSuccess?: (result: VerificationResult) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
}

export interface VerificationResult {
  moduleId: string;
  userAddress: string;
  verified: boolean;
  transactionHash?: string;
}

type VerificationStatus = "idle" | "connecting" | "verifying" | "submitting" | "success" | "error";

interface StepState {
  moduleId: string;
  status: "pending" | "in_progress" | "completed" | "failed";
}

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Github: GithubIcon,
  Email: EmailIcon,
  User: UserIcon,
  Bank: BankIcon,
  Globe: GlobeIcon,
  IdCard: IdCardIcon,
  Shield: ShieldCheckIcon,
};

// Animation variants
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 300 }
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 8,
    transition: { duration: 0.15 }
  },
};

const contentVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.05, duration: 0.2 }
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.15 }
  },
};

interface KYCFlowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: KYCFlowConfig;
  userAddress?: string;
  isConnected?: boolean;
  onVerify?: (moduleId: string, config?: Record<string, unknown>) => Promise<VerificationResult>;
  className?: string;
  embedded?: boolean; // For dashboard preview mode
}

export function KYCFlowModal({
  open,
  onOpenChange,
  config,
  userAddress,
  isConnected = false,
  onVerify,
  className,
  embedded = false,
}: KYCFlowModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<StepState[]>([]);
  const [status, setStatus] = useState<VerificationStatus>("idle");
  const [moduleConfig, setModuleConfig] = useState<Record<string, unknown>>({});
  const [error, setError] = useState<Error | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  const { modules, flowName } = config;

  // Initialize steps when modules change
  useEffect(() => {
    setSteps(
      modules.map((m) => ({
        moduleId: m.id,
        status: "pending" as const,
      }))
    );
    setCurrentStep(0);
    setStatus("idle");
    setError(null);
    setVerificationResult(null);
  }, [modules]);

  // Reset module config when step changes
  useEffect(() => {
    const currentModule = modules[currentStep];
    if (currentModule?.configOptions) {
      const defaults: Record<string, unknown> = {};
      currentModule.configOptions.forEach((opt) => {
        defaults[opt.id] = opt.default;
      });
      setModuleConfig(defaults);
    } else {
      setModuleConfig({});
    }
  }, [currentStep, modules]);

  const currentModule = modules[currentStep];
  const allCompleted = steps.length > 0 && steps.every((s) => s.status === "completed");
  const completedCount = steps.filter((s) => s.status === "completed").length;
  const progress = modules.length > 0 ? (completedCount / modules.length) * 100 : 0;

  const handleVerify = useCallback(async () => {
    if (!currentModule || !onVerify) return;

    setStatus("verifying");
    setError(null);
    setSteps((prev) =>
      prev.map((s, i) =>
        i === currentStep ? { ...s, status: "in_progress" } : s
      )
    );

    try {
      const result = await onVerify(currentModule.id, moduleConfig);

      setSteps((prev) =>
        prev.map((s, i) =>
          i === currentStep ? { ...s, status: "completed" } : s
        )
      );

      setVerificationResult(result);

      if (currentStep < modules.length - 1) {
        // Move to next step
        setTimeout(() => {
          setCurrentStep((prev) => prev + 1);
          setStatus("idle");
        }, 1000);
      } else {
        // All steps completed
        setStatus("success");
        config.onSuccess?.(result);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Verification failed");
      setError(error);
      setStatus("error");
      setSteps((prev) =>
        prev.map((s, i) =>
          i === currentStep ? { ...s, status: "failed" } : s
        )
      );
      config.onError?.(error);
    }
  }, [currentModule, currentStep, modules.length, moduleConfig, onVerify, config]);

  const handleRetry = useCallback(() => {
    setStatus("idle");
    setError(null);
    setSteps((prev) =>
      prev.map((s, i) =>
        i === currentStep ? { ...s, status: "pending" } : s
      )
    );
  }, [currentStep]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    config.onClose?.();
  }, [onOpenChange, config]);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setSteps(
      modules.map((m) => ({
        moduleId: m.id,
        status: "pending" as const,
      }))
    );
    setStatus("idle");
    setError(null);
    setVerificationResult(null);
  }, [modules]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const Icon = currentModule ? (iconMap[currentModule.icon] || ShieldCheckIcon) : ShieldCheckIcon;

  // Modal content
  const modalContent = (
    <div className={cn(
      "w-full max-w-[420px] bg-background rounded-2xl overflow-hidden",
      "border border-border shadow-2xl",
      embedded && "max-w-none rounded-none border-0 shadow-none",
      className
    )}>
      {/* Header */}
      <div className="relative px-6 pt-6 pb-5 border-b border-border">
        {/* Brand */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Image
              src="/icon.png"
              alt="Untraced"
              width={28}
              height={28}
              className="rounded-lg"
            />
            <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
              Untraced
            </span>
          </div>
          {!embedded && (
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Title */}
        <h2 className="text-lg font-medium text-foreground tracking-tight">
          Identity Verification
        </h2>
        <p className="text-sm text-muted-foreground font-light mt-1">
          Complete the verification steps below
        </p>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{completedCount} of {modules.length} completed</span>
          </div>
          <div className="h-1 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Steps indicator */}
      <div className="px-6 py-4 border-b border-border bg-secondary/30">
        <div className="flex items-center justify-center gap-2">
          {steps.map((step, index) => {
            const stepModule = modules.find((m) => m.id === step.moduleId);
            const StepIcon = stepModule
              ? iconMap[stepModule.icon] || ShieldCheckIcon
              : ShieldCheckIcon;
            const isActive = index === currentStep;
            const isCompleted = step.status === "completed";
            const isFailed = step.status === "failed";

            return (
              <div key={`${step.moduleId}-${index}`} className="flex items-center">
                <motion.div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200",
                    isCompleted && "bg-success/15 text-success",
                    isActive && !isCompleted && "bg-primary text-primary-foreground",
                    isFailed && "bg-destructive/15 text-destructive",
                    !isActive && !isCompleted && !isFailed && "bg-secondary text-muted-foreground"
                  )}
                  animate={
                    step.status === "in_progress"
                      ? { scale: [1, 1.05, 1] }
                      : { scale: 1 }
                  }
                  transition={{
                    repeat: step.status === "in_progress" ? Infinity : 0,
                    duration: 1.5,
                  }}
                >
                  {isCompleted ? (
                    <CheckCircleIcon className="w-4 h-4" />
                  ) : step.status === "in_progress" ? (
                    <LoaderIcon className="w-4 h-4" />
                  ) : (
                    <StepIcon className="w-4 h-4" />
                  )}
                </motion.div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-8 h-0.5 mx-1.5 transition-colors duration-300",
                      step.status === "completed" ? "bg-success" : "bg-border"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content - Fixed height to prevent layout shifts */}
      <div className="px-6 py-6 min-h-[320px] flex flex-col">
        <AnimatePresence mode="wait">
          {/* Idle state - Module info and config */}
          {status === "idle" && !allCompleted && currentModule && (
            <motion.div
              key="idle"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-5 flex-1"
            >
              {/* Module header */}
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-primary/10">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-base font-medium text-foreground">
                  {currentModule.name}
                </h3>
                <p className="text-sm text-muted-foreground font-light mt-1">
                  {currentModule.description}
                </p>
              </div>

              {/* Wallet info */}
              {isConnected && userAddress && (
                <div className="flex items-center justify-center gap-2 py-2.5 px-4 bg-secondary/50 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <span className="text-sm text-muted-foreground font-mono">
                    {formatAddress(userAddress)}
                  </span>
                </div>
              )}

              {/* Config options */}
              {currentModule.configOptions?.map((option) => (
                <div key={option.id}>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {option.label}
                  </label>
                  {option.type === "select" ? (
                    <select
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      value={String(moduleConfig[option.id] ?? option.default)}
                      onChange={(e) =>
                        setModuleConfig((prev) => ({
                          ...prev,
                          [option.id]: e.target.value,
                        }))
                      }
                    >
                      {option.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      min={option.min}
                      max={option.max}
                      value={Number(moduleConfig[option.id] ?? option.default)}
                      onChange={(e) =>
                        setModuleConfig((prev) => ({
                          ...prev,
                          [option.id]: Number(e.target.value),
                        }))
                      }
                    />
                  )}
                </div>
              ))}

              {/* Privacy notice */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-secondary/50">
                <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground font-light leading-relaxed">
                  Your data is verified locally using zero-knowledge proofs.
                  Only the verification result is shared, never your actual data.
                </div>
              </div>

              {/* Verify button */}
              <button
                onClick={handleVerify}
                className="w-full py-3.5 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity active:scale-[0.98]"
              >
                {isConnected ? "Verify" : "Connect & Verify"}
              </button>
            </motion.div>
          )}

          {/* Verifying state */}
          {status === "verifying" && (
            <motion.div
              key="verifying"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex-1 flex flex-col items-center justify-center text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 mx-auto mb-5 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <LoaderIcon className="w-7 h-7 text-primary" />
                </motion.div>
              </div>
              <h3 className="text-base font-medium text-foreground mb-2">
                Verifying...
              </h3>
              <p className="text-sm text-muted-foreground font-light">
                Running zero-knowledge proof locally
              </p>
              <div className="flex items-center justify-center gap-2 mt-5 text-xs text-muted-foreground">
                <ShieldCheckIcon className="w-3.5 h-3.5" />
                <span>Your data never leaves your device</span>
              </div>
            </motion.div>
          )}

          {/* Submitting state */}
          {status === "submitting" && (
            <motion.div
              key="submitting"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex-1 flex flex-col items-center justify-center text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 mx-auto mb-5 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <LoaderIcon className="w-7 h-7 text-primary" />
                </motion.div>
              </div>
              <h3 className="text-base font-medium text-foreground mb-2">
                Submitting to Blockchain
              </h3>
              <p className="text-sm text-muted-foreground font-light">
                Please confirm the transaction in your wallet
              </p>
            </motion.div>
          )}

          {/* Success state - All completed */}
          {(status === "success" || allCompleted) && (
            <motion.div
              key="success"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex-1 flex flex-col items-center justify-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-success/10 mx-auto mb-5 flex items-center justify-center">
                <CheckCircleIcon className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-base font-medium text-foreground mb-2">
                Verification Complete
              </h3>
              <p className="text-sm text-muted-foreground font-light mb-5">
                All verification steps have been completed
              </p>

              {/* Completed modules summary */}
              <div className="space-y-2 mb-5">
                {modules.map((module) => (
                  <div
                    key={module.id}
                    className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-secondary/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10">
                        {iconMap[module.icon] ? (
                          React.createElement(iconMap[module.icon], { className: "w-4 h-4 text-primary" })
                        ) : (
                          <ShieldCheckIcon className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <span className="text-sm text-foreground">{module.name}</span>
                    </div>
                    <CheckCircleIcon className="w-4 h-4 text-success" />
                  </div>
                ))}
              </div>

              {/* Transaction link */}
              {verificationResult?.transactionHash && (
                <a
                  href={`https://sepolia.mantlescan.xyz/tx/${verificationResult.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-5"
                >
                  View on Explorer
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              <button
                onClick={embedded ? handleReset : handleClose}
                className="w-full py-3.5 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                {embedded ? "Start Over" : "Done"}
              </button>
            </motion.div>
          )}

          {/* Error state */}
          {status === "error" && error && (
            <motion.div
              key="error"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex-1 flex flex-col items-center justify-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-destructive/10 mx-auto mb-5 flex items-center justify-center">
                <X className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-base font-medium text-foreground mb-2">
                Verification Failed
              </h3>
              <p className="text-sm text-muted-foreground font-light mb-5">
                {error.message || "Something went wrong. Please try again."}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleRetry}
                  className="flex-1 py-3 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Try Again
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 py-3 px-4 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border bg-secondary/20">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="truncate max-w-[140px]">Flow: {flowName}</span>
          <span>Powered by Untraced</span>
        </div>
      </div>
    </div>
  );

  // If embedded, return just the content
  if (embedded) {
    return modalContent;
  }

  // Full modal with overlay
  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative z-10"
          >
            {modalContent}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Compact preview component for dashboard
interface KYCFlowPreviewProps {
  flowName: string;
  modules: KYCModule[];
  className?: string;
  onSimulate?: () => void;
}

export function KYCFlowPreview({ flowName, modules, className, onSimulate }: KYCFlowPreviewProps) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(-1);

  const handleSimulate = useCallback(async () => {
    if (isSimulating) return;

    setIsSimulating(true);
    setSimulationStep(0);

    for (let i = 0; i < modules.length; i++) {
      setSimulationStep(i);
      await new Promise((resolve) => setTimeout(resolve, 1200));
    }

    setSimulationStep(modules.length);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSimulating(false);
    setSimulationStep(-1);
    onSimulate?.();
  }, [isSimulating, modules.length, onSimulate]);

  const handleReset = useCallback(() => {
    setIsSimulating(false);
    setSimulationStep(-1);
  }, []);

  const simulatedConfig: KYCFlowConfig = {
    flowId: "preview",
    flowName,
    modules,
  };

  // Create simulated steps for preview
  const simulatedSteps = modules.map((m, i) => ({
    moduleId: m.id,
    status: simulationStep > i
      ? "completed" as const
      : simulationStep === i
        ? "in_progress" as const
        : "pending" as const,
  }));

  return (
    <div className={cn("relative", className)}>
      {/* Device frame */}
      <div className="bg-foreground/90 rounded-[2rem] p-1.5 shadow-2xl">
        <div className="bg-background rounded-[1.75rem] overflow-hidden">
          <KYCFlowModal
            open={true}
            onOpenChange={() => {}}
            config={simulatedConfig}
            embedded={true}
            onVerify={async () => {
              await new Promise((resolve) => setTimeout(resolve, 1000));
              return {
                moduleId: modules[0]?.id || "",
                userAddress: "0x1234...5678",
                verified: true,
              };
            }}
          />
        </div>
      </div>

      {/* Controls overlay */}
      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3">
        <button
          onClick={handleSimulate}
          disabled={isSimulating}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSimulating ? "Simulating..." : "Simulate"}
        </button>
        <button
          onClick={handleReset}
          disabled={!isSimulating && simulationStep === -1}
          className="px-4 py-2 rounded-lg border border-border text-foreground text-xs font-medium hover:bg-secondary transition-colors disabled:opacity-50"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

