"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { Play, RotateCcw, Smartphone, Monitor, Tablet, Eye, EyeOff } from "lucide-react";

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
        return "w-[320px]";
      case "tablet":
        return "w-[400px]";
      case "desktop":
        return "w-[480px]";
    }
  };

  const Icon = currentModule ? (iconMap[currentModule.icon] || ShieldCheckIcon) : ShieldCheckIcon;

  if (modules.length === 0) {
    return (
      <div className={cn("flex flex-col h-full", className)}>
        <div className="flex items-center justify-between p-4 border-b border-untraced-dark/5">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-untraced-dark/40" />
            <span className="text-sm font-medium text-untraced-dark/60">Live Preview</span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-untraced-dark/5 flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8 text-untraced-dark/20" />
            </div>
            <p className="text-sm text-untraced-dark/40">
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
      <div className="flex items-center justify-between p-4 border-b border-untraced-dark/5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              showPreview ? "bg-untraced-dark text-white" : "hover:bg-untraced-dark/5"
            )}
          >
            {showPreview ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </button>
          <span className="text-sm font-medium text-untraced-dark/60">Live Preview</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Device Size Toggle */}
          <div className="flex items-center bg-untraced-dark/5 rounded-lg p-1">
            <button
              onClick={() => setDeviceSize("mobile")}
              className={cn(
                "p-1.5 rounded-md transition-all",
                deviceSize === "mobile"
                  ? "bg-white shadow-sm text-untraced-dark"
                  : "text-untraced-dark/40 hover:text-untraced-dark/60"
              )}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeviceSize("tablet")}
              className={cn(
                "p-1.5 rounded-md transition-all",
                deviceSize === "tablet"
                  ? "bg-white shadow-sm text-untraced-dark"
                  : "text-untraced-dark/40 hover:text-untraced-dark/60"
              )}
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeviceSize("desktop")}
              className={cn(
                "p-1.5 rounded-md transition-all",
                deviceSize === "desktop"
                  ? "bg-white shadow-sm text-untraced-dark"
                  : "text-untraced-dark/40 hover:text-untraced-dark/60"
              )}
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action Buttons */}
          <button
            onClick={handleReset}
            disabled={isSimulating}
            className="p-1.5 rounded-lg hover:bg-untraced-dark/5 text-untraced-dark/40 hover:text-untraced-dark transition-colors disabled:opacity-50"
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
        <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-100 to-gray-200 p-6">
          <div className="flex justify-center">
            {/* Device Frame */}
            <div
              className={cn(
                "transition-all duration-300",
                getDeviceWidth()
              )}
            >
              {/* Phone Frame */}
              <div className="bg-black rounded-[2.5rem] p-2 shadow-2xl">
                <div className="bg-white rounded-[2rem] overflow-hidden">
                  {/* Modal Content */}
                  <div className="relative">
                    {/* Header */}
                    <div className="relative bg-gradient-to-br from-untraced-dark to-untraced-dark-hover p-5 text-white">
                      <div className="absolute inset-0 opacity-10">
                        <svg
                          className="w-full h-full"
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                        >
                          <defs>
                            <pattern
                              id="preview-grid"
                              width="10"
                              height="10"
                              patternUnits="userSpaceOnUse"
                            >
                              <path
                                d="M 10 0 L 0 0 0 10"
                                fill="none"
                                stroke="white"
                                strokeWidth="0.5"
                              />
                            </pattern>
                          </defs>
                          <rect width="100" height="100" fill="url(#preview-grid)" />
                        </svg>
                      </div>
                      <div className="relative">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center">
                            <span className="text-white font-bold text-xs">U</span>
                          </div>
                          <span className="text-xs font-medium opacity-80">UNTRACED</span>
                        </div>
                        <h3 className="text-base font-semibold">Identity Verification</h3>
                        <p className="text-xs text-white/70 font-light mt-1">
                          Complete the verification steps
                        </p>
                      </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="px-4 pt-4">
                      <div className="flex items-center justify-center gap-1">
                        {steps.map((step, index) => {
                          const stepModule = modules.find((m) => m.id === step.moduleId);
                          const StepIcon = stepModule
                            ? iconMap[stepModule.icon] || ShieldCheckIcon
                            : ShieldCheckIcon;
                          return (
                            <div key={`${step.moduleId}-${index}`} className="flex items-center">
                              <motion.div
                                className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                                  step.status === "completed" && "bg-green-100 text-green-600",
                                  step.status === "in_progress" && "bg-untraced-dark text-white",
                                  step.status === "pending" && "bg-gray-100 text-gray-400",
                                  step.status === "failed" && "bg-red-100 text-red-600"
                                )}
                                animate={{
                                  scale: step.status === "in_progress" ? [1, 1.1, 1] : 1,
                                }}
                                transition={{
                                  repeat: step.status === "in_progress" ? Infinity : 0,
                                  duration: 1,
                                }}
                              >
                                {step.status === "completed" ? (
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
                                    "w-6 h-0.5 mx-1 transition-all duration-300",
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

                    {/* Current Step */}
                    <div className="p-5">
                      <AnimatePresence mode="wait">
                        {!allCompleted ? (
                          <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-center"
                          >
                            <div
                              className={cn(
                                "w-14 h-14 rounded-xl mx-auto mb-3 flex items-center justify-center bg-gradient-to-br",
                                currentModule?.gradient || "from-gray-400 to-gray-500"
                              )}
                            >
                              <Icon className="w-7 h-7 text-white" />
                            </div>
                            <h4 className="font-semibold text-sm mb-1">
                              {currentModule?.name || "Module"}
                            </h4>
                            <p className="text-xs text-untraced-dark/50 mb-4">
                              {currentModule?.description || "Verification step"}
                            </p>
                            <button
                              onClick={handleVerify}
                              disabled={isVerifying || isSimulating}
                              className={cn(
                                "w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-all",
                                "bg-untraced-dark text-white hover:bg-untraced-dark-hover",
                                "disabled:opacity-50 disabled:cursor-not-allowed"
                              )}
                            >
                              {isVerifying ? (
                                <span className="flex items-center justify-center gap-2">
                                  <LoaderIcon className="w-4 h-4" />
                                  Verifying...
                                </span>
                              ) : (
                                "Verify Now"
                              )}
                            </button>
                          </motion.div>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-4"
                          >
                            <div className="w-14 h-14 rounded-full bg-green-100 mx-auto mb-3 flex items-center justify-center">
                              <CheckCircleIcon className="w-7 h-7 text-green-600" />
                            </div>
                            <h4 className="font-semibold text-sm mb-1">
                              Verification Complete
                            </h4>
                            <p className="text-xs text-untraced-dark/50 mb-4">
                              All steps completed successfully
                            </p>
                            <button
                              onClick={handleReset}
                              className="w-full py-2.5 px-4 rounded-xl text-sm font-medium bg-untraced-dark text-white hover:bg-untraced-dark-hover transition-all"
                            >
                              Continue
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                      <div className="flex items-center justify-between text-[10px] text-untraced-dark/40">
                        <span className="truncate max-w-[120px]">Flow: {flowName}</span>
                        <span>Powered by UNTRACED</span>
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
