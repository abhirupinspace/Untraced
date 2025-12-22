"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { FlowModule } from "./types";
import { Button } from "@/components/ui/button";
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
import { Play, RotateCcw, Smartphone, Monitor, Tablet, Eye, EyeOff, X, Lock } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Github: GithubIcon,
  Email: EmailIcon,
  User: UserIcon,
  Bank: BankIcon,
  Globe: GlobeIcon,
  IdCard: IdCardIcon,
  Shield: ShieldCheckIcon,
};

interface VerificationStep {
  moduleId: string;
  status: "pending" | "in_progress" | "completed" | "failed";
}

type DeviceSize = "mobile" | "tablet" | "desktop";

interface FlowPreviewProps {
  flowName: string;
  modules: FlowModule[];
  className?: string;
}

export function FlowPreview({ flowName, modules, className }: FlowPreviewProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<VerificationStep[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [deviceSize, setDeviceSize] = useState<DeviceSize>("mobile");
  const [showPreview, setShowPreview] = useState(true);

  // Reset steps when modules change
  useEffect(() => {
    setSteps(
      modules.map((m) => ({
        moduleId: m.id,
        status: "pending",
      }))
    );
    setCurrentStep(0);
    setIsSimulating(false);
  }, [modules]);

  const currentModule = modules[currentStep];
  const allCompleted = steps.length > 0 && steps.every((s) => s.status === "completed");
  const completedCount = steps.filter((s) => s.status === "completed").length;
  const progress = modules.length > 0 ? (completedCount / modules.length) * 100 : 0;

  const handleVerify = useCallback(async () => {
    if (!currentModule) return;

    setIsVerifying(true);
    setSteps((prev) =>
      prev.map((s, i) =>
        i === currentStep ? { ...s, status: "in_progress" } : s
      )
    );

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setSteps((prev) =>
      prev.map((s, i) =>
        i === currentStep ? { ...s, status: "completed" } : s
      )
    );

    setIsVerifying(false);

    if (currentStep < modules.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentModule, currentStep, modules.length]);

  const handleSimulate = useCallback(async () => {
    setIsSimulating(true);
    setCurrentStep(0);
    setSteps(
      modules.map((m) => ({
        moduleId: m.id,
        status: "pending",
      }))
    );

    for (let i = 0; i < modules.length; i++) {
      setCurrentStep(i);
      setSteps((prev) =>
        prev.map((s, idx) =>
          idx === i ? { ...s, status: "in_progress" } : s
        )
      );

      await new Promise((resolve) => setTimeout(resolve, 1200));

      setSteps((prev) =>
        prev.map((s, idx) =>
          idx === i ? { ...s, status: "completed" } : s
        )
      );
    }

    setIsSimulating(false);
  }, [modules]);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setSteps(
      modules.map((m) => ({
        moduleId: m.id,
        status: "pending",
      }))
    );
    setIsSimulating(false);
  }, [modules]);

  const getDeviceWidth = () => {
    switch (deviceSize) {
      case "mobile":
        return "w-[340px]";
      case "tablet":
        return "w-[420px]";
      case "desktop":
        return "w-[500px]";
    }
  };

  const Icon = currentModule ? (iconMap[currentModule.icon] || ShieldCheckIcon) : ShieldCheckIcon;

  if (modules.length === 0) {
    return (
      <div className={cn("flex flex-col h-full", className)}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Live Preview</span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-8 bg-secondary/30">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground font-light">
              Add modules to see the live preview
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Preview Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              showPreview
                ? "bg-primary text-primary-foreground"
                : "hover:bg-secondary text-muted-foreground"
            )}
          >
            {showPreview ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </button>
          <span className="text-sm font-medium text-muted-foreground">Live Preview</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Device Size Toggle */}
          <div className="flex items-center bg-secondary rounded-lg p-1">
            <button
              onClick={() => setDeviceSize("mobile")}
              className={cn(
                "p-1.5 rounded-md transition-all",
                deviceSize === "mobile"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeviceSize("tablet")}
              className={cn(
                "p-1.5 rounded-md transition-all",
                deviceSize === "tablet"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeviceSize("desktop")}
              className={cn(
                "p-1.5 rounded-md transition-all",
                deviceSize === "desktop"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action Buttons */}
          <button
            onClick={handleReset}
            disabled={isSimulating}
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <Button
            size="sm"
            variant="default"
            onClick={handleSimulate}
            disabled={isSimulating || allCompleted}
            className="text-xs h-8"
          >
            <Play className="w-3 h-3 mr-1" />
            {isSimulating ? "Running..." : "Simulate"}
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      {showPreview && (
        <div className="flex-1 overflow-auto bg-gradient-to-br from-secondary/50 to-muted/50 dark:from-secondary/20 dark:to-background p-6">
          <div className="flex justify-center">
            {/* Device Frame */}
            <div
              className={cn(
                "transition-all duration-300",
                getDeviceWidth()
              )}
            >
              {/* Phone Frame - Sleek design */}
              <div className="bg-foreground/90 dark:bg-foreground/10 rounded-[2.5rem] p-1.5 shadow-2xl">
                <div className="bg-background rounded-[2.25rem] overflow-hidden border border-border">
                  {/* Modal Content - Stripe-like design */}
                  <div className="relative">
                    {/* Header */}
                    <div className="px-6 pt-6 pb-5 border-b border-border">
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
                        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                          <X className="w-4 h-4" />
                        </button>
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

                    {/* Current Step Content - Fixed height */}
                    <div className="px-6 py-6 min-h-[280px] flex flex-col">
                      <AnimatePresence mode="wait">
                        {!allCompleted ? (
                          <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-5 flex-1"
                          >
                            {/* Module header */}
                            <div className="text-center">
                              <div
                                className={cn(
                                  "w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-gradient-to-br",
                                  currentModule?.gradient || "from-primary/80 to-primary"
                                )}
                              >
                                <Icon className="w-7 h-7 text-white" />
                              </div>
                              <h3 className="text-base font-medium text-foreground">
                                {currentModule?.name || "Module"}
                              </h3>
                              <p className="text-sm text-muted-foreground font-light mt-1">
                                {currentModule?.description || "Verification step"}
                              </p>
                            </div>

                            {/* Wallet placeholder */}
                            <div className="flex items-center justify-center gap-2 py-2.5 px-4 bg-secondary/50 rounded-xl">
                              <div className="w-2 h-2 rounded-full bg-success" />
                              <span className="text-sm text-muted-foreground font-mono">
                                0x1234...5678
                              </span>
                            </div>

                            {/* Privacy notice */}
                            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-secondary/50">
                              <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                              <div className="text-xs text-muted-foreground font-light leading-relaxed">
                                Your data is verified locally using zero-knowledge proofs.
                              </div>
                            </div>

                            {/* Verify button */}
                            <button
                              onClick={handleVerify}
                              disabled={isVerifying || isSimulating}
                              className={cn(
                                "w-full py-3.5 px-4 rounded-xl text-sm font-medium transition-all active:scale-[0.98]",
                                "bg-primary text-primary-foreground hover:opacity-90",
                                "disabled:opacity-50 disabled:cursor-not-allowed"
                              )}
                            >
                              {isVerifying ? (
                                <span className="flex items-center justify-center gap-2">
                                  <LoaderIcon className="w-4 h-4" />
                                  Verifying...
                                </span>
                              ) : (
                                "Verify"
                              )}
                            </button>
                          </motion.div>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
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
                              {modules.map((module) => {
                                const ModuleIcon = iconMap[module.icon] || ShieldCheckIcon;
                                return (
                                  <div
                                    key={module.id}
                                    className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-secondary/50"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br",
                                        module.gradient || "from-primary/80 to-primary"
                                      )}>
                                        <ModuleIcon className="w-4 h-4 text-white" />
                                      </div>
                                      <span className="text-sm text-foreground">{module.name}</span>
                                    </div>
                                    <CheckCircleIcon className="w-4 h-4 text-success" />
                                  </div>
                                );
                              })}
                            </div>

                            <button
                              onClick={handleReset}
                              className="w-full py-3.5 px-4 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                            >
                              Done
                            </button>
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
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
