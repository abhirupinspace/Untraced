"use client";

import { useState, useCallback, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useWallet } from "@/lib/use-wallet";
import { Button } from "@/components/ui/button";
import { availableModules } from "./module-data";
import { FlowModule, Flow } from "./types";
import { generateCode } from "./code-generator";

// Import sub-components
import { ProjectStep } from "./steps/project-step";
import { ApiKeysStep } from "./steps/api-keys-step";
import { BuilderStep } from "./steps/builder-step";

import {
  ChevronLeft,
  FolderPlus,
  Key,
  Layers,
  Check,
  LogOut,
} from "lucide-react";

// Step definitions
const STEPS = [
  { id: "project", label: "Create Project", icon: FolderPlus },
  { id: "api-keys", label: "API Keys", icon: Key },
  { id: "builder", label: "Flow Builder", icon: Layers },
] as const;

type StepId = (typeof STEPS)[number]["id"];

export interface Project {
  name: string;
  description: string;
  apiKey: string;
  secretKey: string;
  createdAt: Date;
}

export function KYCFlowBuilder() {
  const { authenticated, login, logout, user } = useWallet();

  // Step management
  const [currentStep, setCurrentStep] = useState<StepId>("project");
  const [completedSteps, setCompletedSteps] = useState<Set<StepId>>(new Set());

  // Project state
  const [project, setProject] = useState<Project | null>(null);

  // Flow state
  const [flowName, setFlowName] = useState("kyc_verification");
  const [flowModules, setFlowModules] = useState<FlowModule[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get current step index
  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

  // Navigation
  const goToStep = (stepId: StepId) => {
    const targetIndex = STEPS.findIndex((s) => s.id === stepId);
    const canNavigate = targetIndex <= currentStepIndex || completedSteps.has(STEPS[targetIndex - 1]?.id);
    if (canNavigate) {
      setCurrentStep(stepId);
    }
  };

  const nextStep = () => {
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].id);
    }
  };

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].id);
    }
  };

  // Project handlers
  const handleCreateProject = (name: string, description: string) => {
    const newProject: Project = {
      name,
      description,
      apiKey: `uk_live_${generateRandomKey(24)}`,
      secretKey: `sk_live_${generateRandomKey(32)}`,
      createdAt: new Date(),
    };
    setProject(newProject);
    setFlowName(name.toLowerCase().replace(/\s+/g, "_"));
    nextStep();
  };

  // Flow handlers
  const addModule = useCallback((moduleId: string) => {
    const module = availableModules.find((m) => m.id === moduleId);
    if (!module || module.status === "coming") return;

    const flowModule: FlowModule = {
      ...module,
      instanceId: `${module.id}-${Date.now()}`,
      configValue: module.config?.default,
    };

    setFlowModules((prev) => [...prev, flowModule]);
  }, []);

  const removeModule = useCallback((instanceId: string) => {
    setFlowModules((prev) => prev.filter((m) => m.instanceId !== instanceId));
  }, []);

  const updateModuleConfig = useCallback(
    (instanceId: string, value: string | number) => {
      setFlowModules((prev) =>
        prev.map((m) =>
          m.instanceId === instanceId ? { ...m, configValue: value } : m
        )
      );
    },
    []
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFlowModules((items) => {
        const oldIndex = items.findIndex((i) => i.instanceId === active.id);
        const newIndex = items.findIndex((i) => i.instanceId === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const flow: Flow = {
    name: flowName,
    modules: flowModules,
  };

  const generatedCode = flowModules.length > 0 ? generateCode(flow) : null;

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      {/* Minimal Header */}
      <header className="h-14 border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="h-full max-w-screen-2xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <Image
                src="/icon.png"
                alt="UNTRACED"
                width={28}
                height={28}
                className="group-hover:scale-105 transition-transform"
              />
              <span className="font-semibold text-gray-900 text-sm">
                UNTRACED
              </span>
            </Link>

            {project && (
              <>
                <div className="h-4 w-px bg-gray-200" />
                <span className="text-sm text-gray-500">{project.name}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {authenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 font-mono">
                  {user?.wallet?.address?.slice(0, 6)}...{user?.wallet?.address?.slice(-4)}
                </span>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Button onClick={login} size="sm" variant="outline" className="text-xs h-8">
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Step Progress */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="flex items-center gap-1 py-3">
            {STEPS.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = completedSteps.has(step.id);
              const isPast = index < currentStepIndex;
              const Icon = step.icon;

              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => goToStep(step.id)}
                    disabled={index > currentStepIndex && !completedSteps.has(STEPS[index - 1]?.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                      isActive && "bg-gray-900 text-white",
                      !isActive && isCompleted && "bg-gray-100 text-gray-700 hover:bg-gray-200",
                      !isActive && !isCompleted && "text-gray-400",
                      index > currentStepIndex && !completedSteps.has(STEPS[index - 1]?.id) && "cursor-not-allowed opacity-50"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center text-[10px]",
                      isActive && "bg-white/20",
                      isCompleted && !isActive && "bg-green-500 text-white"
                    )}>
                      {isCompleted && !isActive ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Icon className="w-3 h-3" />
                      )}
                    </div>
                    <span className="hidden sm:inline">{step.label}</span>
                  </button>

                  {index < STEPS.length - 1 && (
                    <div className={cn(
                      "w-8 h-px mx-2",
                      isPast || isCompleted ? "bg-gray-300" : "bg-gray-200"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {currentStep === "project" && (
            <motion.div
              key="project"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <ProjectStep onSubmit={handleCreateProject} />
            </motion.div>
          )}

          {currentStep === "api-keys" && project && (
            <motion.div
              key="api-keys"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <ApiKeysStep
                project={project}
                onContinue={nextStep}
                onBack={prevStep}
              />
            </motion.div>
          )}

          {currentStep === "builder" && project && (
            <motion.div
              key="builder"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={flowModules.map((m) => m.instanceId)}
                  strategy={verticalListSortingStrategy}
                >
                  <BuilderStep
                    project={project}
                    flowName={flowName}
                    setFlowName={setFlowName}
                    flowModules={flowModules}
                    addModule={addModule}
                    removeModule={removeModule}
                    updateModuleConfig={updateModuleConfig}
                    generatedCode={generatedCode}
                    onBack={prevStep}
                  />
                </SortableContext>
              </DndContext>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// Utility function
function generateRandomKey(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
