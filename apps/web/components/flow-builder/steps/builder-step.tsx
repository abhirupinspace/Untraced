"use client";

import { useState, useCallback, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, AnimatePresence } from "framer-motion";
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
}: BuilderStepProps) {
  const [activeTab, setActiveTab] = useState<TabId>("canvas");

  const tabs = [
    { id: "canvas" as const, label: "Canvas", icon: Layers },
    { id: "preview" as const, label: "Preview", icon: Eye },
    { id: "code" as const, label: "Code", icon: Code2 },
  ];

  return (
    <div className="h-[calc(100vh-7.5rem)] flex bg-[#0a0a0a]">
      {/* Left Sidebar - Module Selector */}
      <aside className="w-64 border-r border-white/5 bg-[#0f0f0f] flex flex-col">
        <div className="p-4 border-b border-white/5">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                    : "hover:bg-white/5"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br flex-shrink-0",
                    module.gradient
                  )}
                >
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {module.name}
                  </p>
                  <p className="text-[10px] text-gray-500 truncate">
                    {module.description}
                  </p>
                </div>
                {!isDisabled && (
                  <Plus className="w-4 h-4 text-gray-600 group-hover:text-gray-400 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="h-12 border-b border-white/5 bg-[#0f0f0f] px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-1.5 rounded-md hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
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
              className="text-sm font-mono text-white bg-transparent border-0 focus:outline-none focus:ring-0 w-48"
              placeholder="flow_name"
            />
          </div>

          {/* Tabs */}
          <div className="flex items-center bg-white/5 rounded-lg p-0.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-purple-500 text-white"
                    : "text-gray-400 hover:text-white"
                )}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          <Button
            size="sm"
            disabled={flowModules.length === 0}
            className="h-8 text-xs bg-purple-500 hover:bg-purple-600 text-white"
          >
            <Rocket className="w-3.5 h-3.5 mr-1.5" />
            Deploy
          </Button>
        </div>

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
      <div className="h-full flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-600" />
          </div>
          <p className="text-sm text-gray-400 mb-1">No modules added</p>
          <p className="text-xs text-gray-500">
            Select modules from the sidebar to build your flow
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-[#0a0a0a] p-6">
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
            className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-white/10"
          >
            <GripVertical className="w-4 h-4 text-gray-600" />
          </button>

          <div
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br flex-shrink-0",
              module.gradient
            )}
          >
            <Icon className="w-4 h-4 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">{module.name}</p>
            {module.configValue !== undefined && !showConfig && (
              <p className="text-xs text-gray-500">
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
                  showConfig ? "bg-purple-500 text-white" : "hover:bg-white/10 text-gray-500"
                )}
              >
                <Settings2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onRemove}
              className="p-1.5 rounded-md hover:bg-red-500/20 text-gray-500 hover:text-red-400"
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
              className="overflow-hidden border-t border-white/5"
            >
              <div className="p-3">
                <label className="text-xs text-gray-500 block mb-2">
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
                      className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500"
                    />
                    <input
                      type="number"
                      min={module.config.min}
                      max={module.config.max}
                      value={module.configValue as number}
                      onChange={(e) => onConfigChange(parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 text-xs font-mono border border-white/10 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500/30 bg-white/5 text-white"
                    />
                  </div>
                ) : (
                  <select
                    value={module.configValue as string}
                    onChange={(e) => onConfigChange(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-white/10 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500/30 bg-white/5 text-white"
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
  const Icon = currentModule ? (iconMap[currentModule.icon] || ShieldCheckIcon) : ShieldCheckIcon;

  if (modules.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <Smartphone className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-light">Add modules to see preview</p>
        </div>
      </div>
    );
  }

  const isDark = previewTheme === "dark";

  return (
    <div className="h-full bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] flex p-6 gap-6">
      {/* Customization Panel */}
      <div className="w-64 flex-shrink-0 space-y-4">
        <div>
          <h3 className="text-xs font-normal text-gray-400 mb-3 uppercase tracking-wider">Customize Modal</h3>

          {/* Theme Toggle */}
          <div className="space-y-2">
            <label className="text-xs text-gray-500 font-light">Theme</label>
            <div className="flex gap-2">
              <button
                onClick={() => setPreviewTheme("dark")}
                className={cn(
                  "flex-1 py-2 px-3 rounded-lg text-xs font-light transition-all",
                  isDark ? "bg-white/10 text-white" : "bg-white/5 text-gray-500 hover:bg-white/10"
                )}
              >
                Dark
              </button>
              <button
                onClick={() => setPreviewTheme("light")}
                className={cn(
                  "flex-1 py-2 px-3 rounded-lg text-xs font-light transition-all",
                  !isDark ? "bg-white/10 text-white" : "bg-white/5 text-gray-500 hover:bg-white/10"
                )}
              >
                Light
              </button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="pt-4 border-t border-white/5 space-y-2">
          <Button
            size="sm"
            onClick={handleSimulate}
            disabled={isSimulating || allCompleted}
            className="w-full h-9 text-xs bg-purple-500 hover:bg-purple-600 text-white font-normal"
          >
            <Play className="w-3 h-3 mr-1.5" />
            {isSimulating ? "Simulating..." : "Run Simulation"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            disabled={isSimulating}
            className="w-full h-9 text-xs border-white/10 text-white hover:bg-white/5 font-light"
          >
            <RotateCcw className="w-3 h-3 mr-1.5" />
            Reset
          </Button>
        </div>

        {/* Module List */}
        <div className="pt-4 border-t border-white/5">
          <label className="text-xs text-gray-500 font-light mb-2 block">Flow Steps</label>
          <div className="space-y-1">
            {modules.map((module, idx) => {
              const ModuleIcon = iconMap[module.icon] || ShieldCheckIcon;
              const stepStatus = steps[idx]?.status || "pending";
              return (
                <div
                  key={module.instanceId}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all",
                    stepStatus === "completed" && "bg-green-500/10 text-green-400",
                    stepStatus === "in_progress" && "bg-purple-500/20 text-purple-400",
                    stepStatus === "pending" && "text-gray-500"
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
          "rounded-2xl shadow-2xl overflow-hidden w-[400px]",
          isDark ? "bg-[#0a0a0a] border border-white/10" : "bg-white"
        )}>
          {/* Modal Header */}
          <div className={cn(
            "px-6 py-5 border-b",
            isDark ? "border-white/5" : "border-gray-100"
          )}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">U</span>
              </div>
              <span className={cn(
                "text-xs font-normal",
                isDark ? "text-gray-400" : "text-gray-500"
              )}>UNTRACED</span>
            </div>
            <h3 className={cn(
              "text-lg font-normal",
              isDark ? "text-white" : "text-gray-900"
            )}>Identity Verification</h3>
            <p className={cn(
              "text-sm font-light",
              isDark ? "text-gray-500" : "text-gray-500"
            )}>Complete the following verification steps</p>
          </div>

          {/* Progress Steps */}
          <div className={cn(
            "px-6 py-4",
            isDark ? "bg-[#0f0f0f]" : "bg-gray-50"
          )}>
            <div className="flex items-center justify-center gap-2">
              {steps.map((step, idx) => {
                const stepModule = modules[idx];
                const StepIcon = stepModule ? iconMap[stepModule.icon] || ShieldCheckIcon : ShieldCheckIcon;
                return (
                  <div key={idx} className="flex items-center">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                        step.status === "completed" && (isDark ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-600"),
                        step.status === "in_progress" && "bg-purple-500 text-white",
                        step.status === "pending" && (isDark ? "bg-white/5 text-gray-500" : "bg-gray-200 text-gray-400")
                      )}
                    >
                      {step.status === "completed" ? (
                        <CheckCircleIcon className="w-4 h-4" />
                      ) : step.status === "in_progress" ? (
                        <LoaderIcon className="w-4 h-4" />
                      ) : (
                        <StepIcon className="w-4 h-4" />
                      )}
                    </div>
                    {idx < steps.length - 1 && (
                      <div
                        className={cn(
                          "w-10 h-0.5 mx-2 transition-all",
                          step.status === "completed"
                            ? "bg-green-500"
                            : isDark ? "bg-white/10" : "bg-gray-200"
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
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
                      "w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-gradient-to-br",
                      currentModule?.gradient || "from-gray-400 to-gray-500"
                    )}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className={cn(
                    "text-base font-normal mb-1",
                    isDark ? "text-white" : "text-gray-900"
                  )}>
                    {currentModule?.name || "Module"}
                  </h4>
                  <p className={cn(
                    "text-sm font-light mb-6",
                    isDark ? "text-gray-500" : "text-gray-500"
                  )}>
                    {currentModule?.description}
                  </p>
                  <button className={cn(
                    "w-full py-3 rounded-xl text-sm font-normal transition-all",
                    isDark
                      ? "bg-white text-black hover:bg-gray-200"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  )}>
                    {steps[currentStep]?.status === "in_progress" ? "Verifying..." : "Verify Now"}
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4"
                >
                  <div className={cn(
                    "w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center",
                    isDark ? "bg-green-500/20" : "bg-green-100"
                  )}>
                    <CheckCircleIcon className={cn(
                      "w-8 h-8",
                      isDark ? "text-green-400" : "text-green-600"
                    )} />
                  </div>
                  <h4 className={cn(
                    "text-base font-normal mb-1",
                    isDark ? "text-white" : "text-gray-900"
                  )}>Verification Complete</h4>
                  <p className={cn(
                    "text-sm font-light mb-6",
                    isDark ? "text-gray-500" : "text-gray-500"
                  )}>All verification steps have been completed</p>
                  <button className={cn(
                    "w-full py-3 rounded-xl text-sm font-normal transition-all",
                    isDark
                      ? "bg-white text-black hover:bg-gray-200"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  )}>
                    Continue
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className={cn(
            "px-6 py-3 border-t",
            isDark ? "border-white/5 bg-[#0f0f0f]" : "border-gray-100 bg-gray-50"
          )}>
            <div className={cn(
              "flex items-center justify-between text-[10px]",
              isDark ? "text-gray-600" : "text-gray-400"
            )}>
              <span className="font-mono">{flowName}</span>
              <span>Powered by UNTRACED</span>
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
      <div className="h-full flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <Code2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Add modules to generate code</p>
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
    <div className="h-full flex flex-col bg-[#0f0f0f]">
      {/* Tabs */}
      <div className="flex items-center justify-between px-4 border-b border-white/5">
        <div className="flex">
          {(["sdk", "solidity", "json"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-3 text-xs font-medium border-b-2 -mb-px transition-colors",
                activeTab === tab
                  ? "border-purple-500 text-white"
                  : "border-transparent text-gray-500 hover:text-white"
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
            copied ? "text-green-400 bg-green-500/20" : "text-gray-400 hover:bg-white/10"
          )}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {/* Code */}
      <div className="flex-1 overflow-auto p-4 bg-black/30">
        <pre className="text-xs font-mono text-gray-300 leading-relaxed">
          {code[activeTab]}
        </pre>
      </div>
    </div>
  );
}
