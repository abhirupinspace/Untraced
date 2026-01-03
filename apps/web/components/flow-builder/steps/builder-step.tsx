"use client";

import { useState, useCallback, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { availableModules } from "../module-data";
import { FlowModule, GeneratedCode } from "../types";
export interface Project {
  name: string;
  description: string;
  apiKey: string;
  secretKey: string;
  createdAt: Date;
}

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
  TwitterIcon,
  ChainsIcon,
} from "@/components/ui/icons";
import {
  ArrowLeft,
  Plus,
  Rocket,
  Play,
  RotateCcw,
  GripVertical,
  X,
  Settings2,
  Code2,
  Eye,
  Layers,
  Copy,
  Check,
  Smartphone,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Github: GithubIcon,
  Email: EmailIcon,
  User: UserIcon,
  Bank: BankIcon,
  Globe: GlobeIcon,
  IdCard: IdCardIcon,
  Shield: ShieldCheckIcon,
  Twitter: TwitterIcon,
  Chains: ChainsIcon,
};

type TabId = "canvas" | "preview" | "code";

interface BuilderStepProps {
  project: Project | null;
  flowName: string;
  setFlowName: (name: string) => void;
  flowModules: FlowModule[];
  addModule: (moduleId: string) => void;
  removeModule: (instanceId: string) => void;
  updateModuleConfig: (instanceId: string, value: string | number) => void;
  generatedCode: GeneratedCode | null;
  onBack?: () => void;
  onSave?: () => void;
  isSaving?: boolean;
  saveError?: string | null;
}

export function BuilderStep({
  project,
  flowName,
  setFlowName,
  flowModules,
  addModule,
  removeModule,
  updateModuleConfig,
  generatedCode,
  onBack,
  onSave,
  isSaving,
  saveError,
}: BuilderStepProps) {
  const [activeTab, setActiveTab] = useState<TabId>("canvas");

  const tabs = [
    { id: "canvas" as const, label: "Canvas", icon: Layers },
    { id: "preview" as const, label: "Preview", icon: Eye },
    { id: "code" as const, label: "Code", icon: Code2 },
  ];

  return (
    <div className="h-[calc(100vh-7.5rem)] flex bg-background">
      {/* Left Sidebar - Module Selector */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Modules
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {availableModules.map((module) => {
            const Icon = iconMap[module.icon] || ShieldCheckIcon;
            const isDisabled = module.status === "coming";
            const isAdded = flowModules.some((m) => m.id === module.id);

            return (
              <button
                key={module.id}
                onClick={() => !isDisabled && addModule(module.id)}
                disabled={isDisabled}
                className={cn(
                  "w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all group",
                  isDisabled
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:bg-secondary"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br flex-shrink-0",
                    module.gradient
                  )}
                >
                  <Icon className="w-4 h-4 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {module.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {module.description}
                  </p>
                </div>
                {!isDisabled && (
                  <Plus className="w-4 h-4 text-muted-foreground group-hover:text-muted-foreground flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="h-12 border-b border-border bg-card px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <input
              type="text"
              value={flowName}
              onChange={(e) =>
                setFlowName(e.target.value.replace(/[^a-zA-Z0-9_]/g, "_"))
              }
              className="text-sm font-mono text-foreground bg-transparent border-0 focus:outline-none focus:ring-0 w-48"
              placeholder="flow_name"
            />
          </div>

          {/* Tabs */}
          <div className="flex items-center bg-secondary rounded-lg p-0.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-purple-500 text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          <Button
            size="sm"
            disabled={flowModules.length === 0 || isSaving}
            onClick={onSave}
            className="h-8 text-xs bg-purple-500 hover:bg-purple-600 text-foreground"
          >
            {isSaving ? (
              <>
                <LoaderIcon className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Rocket className="w-3.5 h-3.5 mr-1.5" />
                Save Flow
              </>
            )}
          </Button>
        </div>

        {/* Error message */}
        {saveError && (
          <div className="px-6 py-2 bg-red-500/10 border-b border-red-500/20">
            <p className="text-xs text-red-400">{saveError}</p>
          </div>
        )}

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === "canvas" && (
              <motion.div
                key="canvas"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <CanvasView
                  flowModules={flowModules}
                  removeModule={removeModule}
                  updateModuleConfig={updateModuleConfig}
                />
              </motion.div>
            )}

            {activeTab === "preview" && (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <PreviewView flowName={flowName} modules={flowModules} />
              </motion.div>
            )}

            {activeTab === "code" && (
              <motion.div
                key="code"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <CodeView code={generatedCode} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Canvas View Component
function CanvasView({
  flowModules,
  removeModule,
  updateModuleConfig,
}: {
  flowModules: FlowModule[];
  removeModule: (instanceId: string) => void;
  updateModuleConfig: (instanceId: string, value: string | number) => void;
}) {
  if (flowModules.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">No modules added</p>
          <p className="text-xs text-muted-foreground">
            Select modules from the sidebar to build your flow
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-background p-6">
      <div className="max-w-md mx-auto space-y-3">
        {/* Start */}
        <div className="flex justify-center">
          <Badge variant="success">Start</Badge>
        </div>

        <div className="flex justify-center">
          <div className="w-px h-6 bg-white/20" />
        </div>

        {/* Modules */}
        {flowModules.map((module, index) => (
          <FlowNodeCard
            key={module.instanceId}
            module={module}
            onRemove={() => removeModule(module.instanceId)}
            onConfigChange={(value) => updateModuleConfig(module.instanceId, value)}
            showConnector={index < flowModules.length - 1}
          />
        ))}

        <div className="flex justify-center">
          <div className="w-px h-6 bg-white/20" />
        </div>

        {/* End */}
        <div className="flex justify-center">
          <Badge variant="default">Complete</Badge>
        </div>
      </div>
    </div>
  );
}

// Flow Node Card
function FlowNodeCard({
  module,
  onRemove,
  onConfigChange,
  showConnector,
}: {
  module: FlowModule;
  onRemove: () => void;
  onConfigChange: (value: string | number) => void;
  showConnector: boolean;
}) {
  const [showConfig, setShowConfig] = useState(false);
  const Icon = iconMap[module.icon] || ShieldCheckIcon;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.instanceId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        variant="bordered"
        className={cn(
          "transition-all",
          isDragging && "shadow-lg scale-[1.02] z-50"
        )}
      >
        <div className="flex items-center gap-3 p-3">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-secondary"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </button>

          <div
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br flex-shrink-0",
              module.gradient
            )}
          >
            <Icon className="w-4 h-4 text-foreground" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{module.name}</p>
            {module.configValue !== undefined && !showConfig && (
              <p className="text-xs text-muted-foreground">
                {module.config?.label}: {module.configValue}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1">
            {module.config && (
              <button
                onClick={() => setShowConfig(!showConfig)}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  showConfig ? "bg-purple-500 text-foreground" : "hover:bg-secondary text-muted-foreground"
                )}
              >
                <Settings2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onRemove}
              className="p-1.5 rounded-md hover:bg-red-500/20 text-muted-foreground hover:text-red-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showConfig && module.config && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-border"
            >
              <div className="p-3">
                <label className="text-xs text-muted-foreground block mb-2">
                  {module.config.label}
                </label>
                {module.config.type === "threshold" ? (
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={module.config.min}
                      max={module.config.max}
                      value={module.configValue as number}
                      onChange={(e) => onConfigChange(parseInt(e.target.value))}
                      className="flex-1 h-1.5 bg-secondary rounded-full appearance-none cursor-pointer accent-purple-500"
                    />
                    <input
                      type="number"
                      min={module.config.min}
                      max={module.config.max}
                      value={module.configValue as number}
                      onChange={(e) => onConfigChange(parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 text-xs font-mono border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500/30 bg-secondary text-foreground"
                    />
                  </div>
                ) : (
                  <select
                    value={module.configValue as string}
                    onChange={(e) => onConfigChange(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500/30 bg-secondary text-foreground"
                  >
                    {module.config.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {showConnector && (
        <div className="flex flex-col items-center py-1">
          <div className="w-px h-3 bg-white/20" />
          <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
            AND
          </Badge>
          <div className="w-px h-3 bg-white/20" />
        </div>
      )}
    </>
  );
}

// Preview View Component
function PreviewView({
  flowName,
  modules,
}: {
  flowName: string;
  modules: FlowModule[];
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<Array<{ status: "pending" | "in_progress" | "completed" }>>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    setSteps(modules.map(() => ({ status: "pending" })));
    setCurrentStep(0);
  }, [modules]);

  const handleSimulate = useCallback(async () => {
    if (modules.length === 0) return;

    setIsSimulating(true);
    setCurrentStep(0);
    setSteps(modules.map(() => ({ status: "pending" })));

    for (let i = 0; i < modules.length; i++) {
      setCurrentStep(i);
      setSteps((prev) => prev.map((s, idx) => (idx === i ? { status: "in_progress" } : s)));
      await new Promise((r) => setTimeout(r, 1500));
      setSteps((prev) => prev.map((s, idx) => (idx === i ? { status: "completed" } : s)));
    }

    setIsSimulating(false);
  }, [modules]);

  const handleReset = () => {
    setSteps(modules.map(() => ({ status: "pending" })));
    setCurrentStep(0);
  };

  const currentModule = modules[currentStep];
  const allCompleted = steps.length > 0 && steps.every((s) => s.status === "completed");
  const completedCount = steps.filter((s) => s.status === "completed").length;
  const progress = modules.length > 0 ? (completedCount / modules.length) * 100 : 0;
  const Icon = currentModule ? (iconMap[currentModule.icon] || ShieldCheckIcon) : ShieldCheckIcon;

  if (modules.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <Smartphone className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-light">Add modules to see preview</p>
        </div>
      </div>
    );
  }

  const isDark = previewTheme === "dark";

  return (
    <div className="h-full bg-gradient-to-br from-secondary/50 to-muted/50 dark:from-secondary/20 dark:to-background flex p-6 gap-6">
      {/* Customization Panel */}
      <div className="w-64 flex-shrink-0 space-y-4">
        <div>
          <h3 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Customize Modal</h3>

          {/* Theme Toggle */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground font-light">Theme</label>
            <div className="flex gap-2">
              <button
                onClick={() => setPreviewTheme("dark")}
                className={cn(
                  "flex-1 py-2 px-3 rounded-lg text-xs font-light transition-all",
                  isDark ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                )}
              >
                Dark
              </button>
              <button
                onClick={() => setPreviewTheme("light")}
                className={cn(
                  "flex-1 py-2 px-3 rounded-lg text-xs font-light transition-all",
                  !isDark ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                )}
              >
                Light
              </button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="pt-4 border-t border-border space-y-2">
          <Button
            size="sm"
            onClick={handleSimulate}
            disabled={isSimulating || allCompleted}
            className="w-full h-9 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          >
            <Play className="w-3 h-3 mr-1.5" />
            {isSimulating ? "Simulating..." : "Run Simulation"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            disabled={isSimulating}
            className="w-full h-9 text-xs border-border text-foreground hover:bg-secondary font-light"
          >
            <RotateCcw className="w-3 h-3 mr-1.5" />
            Reset
          </Button>
        </div>

        {/* Module List */}
        <div className="pt-4 border-t border-border">
          <label className="text-xs text-muted-foreground font-light mb-2 block">Flow Steps</label>
          <div className="space-y-1">
            {modules.map((module, idx) => {
              const ModuleIcon = iconMap[module.icon] || ShieldCheckIcon;
              const stepStatus = steps[idx]?.status || "pending";
              return (
                <div
                  key={module.instanceId}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all",
                    stepStatus === "completed" && "bg-success/10 text-success",
                    stepStatus === "in_progress" && "bg-primary/20 text-primary",
                    stepStatus === "pending" && "text-muted-foreground"
                  )}
                >
                  <ModuleIcon className="w-3.5 h-3.5" />
                  <span className="font-light">{module.name}</span>
                  {stepStatus === "completed" && <CheckCircleIcon className="w-3 h-3 ml-auto" />}
                  {stepStatus === "in_progress" && <LoaderIcon className="w-3 h-3 ml-auto" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal Preview */}
      <div className="flex-1 flex items-center justify-center">
        <div className={cn(
          "rounded-2xl shadow-2xl overflow-hidden w-[420px]",
          isDark ? "bg-[#09090b] border border-[#27272a]" : "bg-white border border-gray-200"
        )}>
          {/* Modal Header */}
          <div className={cn(
            "px-6 pt-6 pb-5 border-b",
            isDark ? "border-[#27272a]" : "border-gray-100"
          )}>
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
                <span className={cn(
                  "text-xs font-medium tracking-wide uppercase",
                  isDark ? "text-[#a1a1aa]" : "text-gray-500"
                )}>Untraced</span>
              </div>
              <button className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                isDark ? "text-[#a1a1aa] hover:text-white hover:bg-[#27272a]" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              )}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Title */}
            <h3 className={cn(
              "text-lg font-medium tracking-tight",
              isDark ? "text-white" : "text-gray-900"
            )}>Identity Verification</h3>
            <p className={cn(
              "text-sm font-light mt-1",
              isDark ? "text-[#a1a1aa]" : "text-gray-500"
            )}>Complete the verification steps below</p>

            {/* Progress bar */}
            <div className="mt-5">
              <div className={cn(
                "flex items-center justify-between text-xs mb-2",
                isDark ? "text-[#a1a1aa]" : "text-gray-500"
              )}>
                <span>Progress</span>
                <span>{completedCount} of {modules.length} completed</span>
              </div>
              <div className={cn(
                "h-1 rounded-full overflow-hidden",
                isDark ? "bg-[#27272a]" : "bg-gray-200"
              )}>
                <motion.div
                  className={cn(
                    "h-full rounded-full",
                    isDark ? "bg-[#a78bfa]" : "bg-[#7c3aed]"
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>

          {/* Steps indicator */}
          <div className={cn(
            "px-6 py-4 border-b",
            isDark ? "border-[#27272a] bg-[#18181b]/50" : "border-gray-100 bg-gray-50"
          )}>
            <div className="flex items-center justify-center gap-2">
              {steps.map((step, idx) => {
                const stepModule = modules[idx];
                const StepIcon = stepModule ? iconMap[stepModule.icon] || ShieldCheckIcon : ShieldCheckIcon;
                const isActive = idx === currentStep;
                const isCompleted = step.status === "completed";

                return (
                  <div key={idx} className="flex items-center">
                    <motion.div
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200",
                        isCompleted && (isDark ? "bg-[#34d399]/15 text-[#34d399]" : "bg-green-100 text-green-600"),
                        isActive && !isCompleted && (isDark ? "bg-[#a78bfa] text-white" : "bg-[#7c3aed] text-white"),
                        !isActive && !isCompleted && (isDark ? "bg-[#27272a] text-[#71717a]" : "bg-gray-200 text-gray-400")
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
                    {idx < steps.length - 1 && (
                      <div
                        className={cn(
                          "w-8 h-0.5 mx-1.5 transition-colors duration-300",
                          isCompleted
                            ? (isDark ? "bg-[#34d399]" : "bg-green-500")
                            : (isDark ? "bg-[#27272a]" : "bg-gray-200")
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content - Fixed height */}
          <div className="px-6 py-6 min-h-[280px] flex flex-col">
            <AnimatePresence mode="wait">
              {!allCompleted ? (
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 flex flex-col"
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
                    <h4 className={cn(
                      "text-base font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>
                      {currentModule?.name || "Module"}
                    </h4>
                    <p className={cn(
                      "text-sm font-light mt-1",
                      isDark ? "text-[#a1a1aa]" : "text-gray-500"
                    )}>
                      {currentModule?.description}
                    </p>
                  </div>

                  {/* Wallet placeholder */}
                  <div className={cn(
                    "flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl mt-5",
                    isDark ? "bg-[#27272a]/50" : "bg-gray-100"
                  )}>
                    <div className="w-2 h-2 rounded-full bg-[#34d399]" />
                    <span className={cn(
                      "text-sm font-mono",
                      isDark ? "text-[#a1a1aa]" : "text-gray-500"
                    )}>
                      0x1234...5678
                    </span>
                  </div>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Verify button */}
                  <button className={cn(
                    "w-full py-3.5 rounded-xl text-sm font-medium transition-all mt-5",
                    isDark
                      ? "bg-[#a78bfa] text-white hover:bg-[#a78bfa]/90"
                      : "bg-[#7c3aed] text-white hover:bg-[#7c3aed]/90"
                  )}>
                    {steps[currentStep]?.status === "in_progress" ? "Verifying..." : "Verify"}
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-1 flex flex-col items-center justify-center text-center"
                >
                  <div className={cn(
                    "w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center",
                    isDark ? "bg-[#34d399]/10" : "bg-green-100"
                  )}>
                    <CheckCircleIcon className={cn(
                      "w-8 h-8",
                      isDark ? "text-[#34d399]" : "text-green-600"
                    )} />
                  </div>
                  <h4 className={cn(
                    "text-base font-medium mb-2",
                    isDark ? "text-white" : "text-gray-900"
                  )}>Verification Complete</h4>
                  <p className={cn(
                    "text-sm font-light mb-5",
                    isDark ? "text-[#a1a1aa]" : "text-gray-500"
                  )}>All verification steps have been completed</p>

                  {/* Completed modules summary */}
                  <div className="w-full space-y-2 mb-5">
                    {modules.map((module) => {
                      const ModuleIcon = iconMap[module.icon] || ShieldCheckIcon;
                      return (
                        <div
                          key={module.instanceId}
                          className={cn(
                            "flex items-center justify-between px-4 py-2.5 rounded-xl",
                            isDark ? "bg-[#27272a]/50" : "bg-gray-100"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br",
                              module.gradient || "from-primary/80 to-primary"
                            )}>
                              <ModuleIcon className="w-4 h-4 text-white" />
                            </div>
                            <span className={cn(
                              "text-sm",
                              isDark ? "text-white" : "text-gray-900"
                            )}>{module.name}</span>
                          </div>
                          <CheckCircleIcon className={cn(
                            "w-4 h-4",
                            isDark ? "text-[#34d399]" : "text-green-600"
                          )} />
                        </div>
                      );
                    })}
                  </div>

                  <button className={cn(
                    "w-full py-3.5 rounded-xl text-sm font-medium transition-all",
                    isDark
                      ? "bg-[#a78bfa] text-white hover:bg-[#a78bfa]/90"
                      : "bg-[#7c3aed] text-white hover:bg-[#7c3aed]/90"
                  )}>
                    Done
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className={cn(
            "px-6 py-4 border-t",
            isDark ? "border-[#27272a] bg-[#18181b]/30" : "border-gray-100 bg-gray-50"
          )}>
            <div className={cn(
              "flex items-center justify-between text-xs",
              isDark ? "text-[#71717a]" : "text-gray-400"
            )}>
              <span className="truncate max-w-[140px]">Flow: {flowName}</span>
              <span>Powered by Untraced</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Code View Component
function CodeView({ code }: { code: GeneratedCode | null }) {
  const [activeTab, setActiveTab] = useState<"sdk" | "solidity" | "json">("sdk");
  const [copied, setCopied] = useState(false);

  if (!code) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <Code2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Add modules to generate code</p>
        </div>
      </div>
    );
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Tabs */}
      <div className="flex items-center justify-between px-4 border-b border-border">
        <div className="flex">
          {(["sdk", "solidity", "json"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-3 text-xs font-medium border-b-2 -mb-px transition-colors",
                activeTab === tab
                  ? "border-purple-500 text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
        <button
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors",
            copied ? "text-green-400 bg-green-500/20" : "text-muted-foreground hover:bg-secondary"
          )}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {/* Code */}
      <div className="flex-1 overflow-auto p-4 bg-black/30">
        <pre className="text-xs font-mono text-foreground/80 leading-relaxed">
          {code[activeTab]}
        </pre>
      </div>
    </div>
  );
}
