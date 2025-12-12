"use client";

import { useState, useCallback, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { availableModules } from "../module-data";
import { FlowModule, GeneratedCode } from "../types";
import type { Project } from "../kyc-flow-builder";
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
  ChevronDown,
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
  project: Project;
  flowName: string;
  setFlowName: (name: string) => void;
  flowModules: FlowModule[];
  addModule: (moduleId: string) => void;
  removeModule: (instanceId: string) => void;
  updateModuleConfig: (instanceId: string, value: string | number) => void;
  generatedCode: GeneratedCode | null;
  onBack: () => void;
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
    <div className="h-[calc(100vh-7.5rem)] flex">
      {/* Left Sidebar - Module Selector */}
      <aside className="w-64 border-r border-gray-100 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-100">
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
                    : "hover:bg-gray-50"
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
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {module.name}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate">
                    {module.description}
                  </p>
                </div>
                {!isDisabled && (
                  <Plus className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="h-12 border-b border-gray-100 bg-white px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={flowName}
              onChange={(e) =>
                setFlowName(e.target.value.replace(/[^a-zA-Z0-9_]/g, "_"))
              }
              className="text-sm font-mono text-gray-700 bg-transparent border-0 focus:outline-none focus:ring-0 w-48"
              placeholder="flow_name"
            />
          </div>

          {/* Tabs */}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
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
            className="h-8 text-xs"
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
      <div className="h-full flex items-center justify-center bg-gray-50/50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-sm text-gray-500 mb-1">No modules added</p>
          <p className="text-xs text-gray-400">
            Select modules from the sidebar to build your flow
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-gray-50/50 p-6">
      <div className="max-w-md mx-auto space-y-3">
        {/* Start */}
        <div className="flex justify-center">
          <div className="px-4 py-1.5 bg-green-500 text-white text-xs font-medium rounded-full">
            Start
          </div>
        </div>

        <div className="flex justify-center">
          <div className="w-px h-6 bg-gray-300" />
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
          <div className="w-px h-6 bg-gray-300" />
        </div>

        {/* End */}
        <div className="flex justify-center">
          <div className="px-4 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-full">
            End
          </div>
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
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "bg-white rounded-xl border border-gray-200 shadow-sm transition-all",
          isDragging && "shadow-lg scale-[1.02] z-50"
        )}
      >
        <div className="flex items-center gap-3 p-3">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100"
          >
            <GripVertical className="w-4 h-4 text-gray-300" />
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
            <p className="text-sm font-medium text-gray-900">{module.name}</p>
            {module.configValue !== undefined && !showConfig && (
              <p className="text-xs text-gray-400">
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
                  showConfig ? "bg-gray-900 text-white" : "hover:bg-gray-100 text-gray-400"
                )}
              >
                <Settings2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onRemove}
              className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500"
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
              className="overflow-hidden border-t border-gray-100"
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
                      className="flex-1 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-gray-900"
                    />
                    <input
                      type="number"
                      min={module.config.min}
                      max={module.config.max}
                      value={module.configValue as number}
                      onChange={(e) => onConfigChange(parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 text-xs font-mono border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
                    />
                  </div>
                ) : (
                  <select
                    value={module.configValue as string}
                    onChange={(e) => onConfigChange(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300 bg-white"
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
      </div>

      {showConnector && (
        <div className="flex flex-col items-center py-1">
          <div className="w-px h-3 bg-gray-300" />
          <div className="px-2 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-100 rounded">
            AND
          </div>
          <div className="w-px h-3 bg-gray-300" />
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
      await new Promise((r) => setTimeout(r, 1000));
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
      <div className="h-full flex items-center justify-center bg-gray-50/50">
        <div className="text-center">
          <Smartphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Add modules to see preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4">
        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            disabled={isSimulating}
            className="h-8 text-xs"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset
          </Button>
          <Button
            size="sm"
            onClick={handleSimulate}
            disabled={isSimulating || allCompleted}
            className="h-8 text-xs"
          >
            <Play className="w-3 h-3 mr-1" />
            {isSimulating ? "Running..." : "Simulate"}
          </Button>
        </div>

        {/* Phone Frame */}
        <div className="bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl">
          <div className="w-[300px] bg-white rounded-[2rem] overflow-hidden">
            {/* Header */}
            <div className="bg-gray-900 px-5 py-4 text-white">
              <p className="text-[10px] text-gray-400 mb-1">UNTRACED</p>
              <h3 className="text-sm font-semibold">Identity Verification</h3>
            </div>

            {/* Progress */}
            <div className="px-5 py-4 flex items-center justify-center gap-1">
              {steps.map((step, idx) => {
                const stepModule = modules[idx];
                const StepIcon = stepModule ? iconMap[stepModule.icon] || ShieldCheckIcon : ShieldCheckIcon;
                return (
                  <div key={idx} className="flex items-center">
                    <div
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center transition-all",
                        step.status === "completed" && "bg-green-100 text-green-600",
                        step.status === "in_progress" && "bg-gray-900 text-white",
                        step.status === "pending" && "bg-gray-100 text-gray-400"
                      )}
                    >
                      {step.status === "completed" ? (
                        <CheckCircleIcon className="w-3.5 h-3.5" />
                      ) : step.status === "in_progress" ? (
                        <LoaderIcon className="w-3.5 h-3.5" />
                      ) : (
                        <StepIcon className="w-3.5 h-3.5" />
                      )}
                    </div>
                    {idx < steps.length - 1 && (
                      <div
                        className={cn(
                          "w-6 h-px mx-1",
                          step.status === "completed" ? "bg-green-500" : "bg-gray-200"
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Content */}
            <div className="px-5 pb-5">
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
                        "w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center bg-gradient-to-br",
                        currentModule?.gradient || "from-gray-400 to-gray-500"
                      )}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                      {currentModule?.name || "Module"}
                    </h4>
                    <p className="text-xs text-gray-500 mb-4">
                      {currentModule?.description}
                    </p>
                    <div className="bg-gray-900 text-white text-xs font-medium py-2.5 rounded-lg">
                      {steps[currentStep]?.status === "in_progress" ? "Verifying..." : "Verify Now"}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-green-100 mx-auto mb-3 flex items-center justify-center">
                      <CheckCircleIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Complete</h4>
                    <p className="text-xs text-gray-500">All steps verified</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-gray-50 border-t text-[10px] text-gray-400 flex justify-between">
              <span>{flowName}</span>
              <span>UNTRACED</span>
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
      <div className="h-full flex items-center justify-center bg-gray-50/50">
        <div className="text-center">
          <Code2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
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
    <div className="h-full flex flex-col bg-white">
      {/* Tabs */}
      <div className="flex items-center justify-between px-4 border-b border-gray-100">
        <div className="flex">
          {(["sdk", "solidity", "json"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-3 text-xs font-medium border-b-2 -mb-px transition-colors",
                activeTab === tab
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-400 hover:text-gray-600"
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
            copied ? "text-green-600 bg-green-50" : "text-gray-500 hover:bg-gray-100"
          )}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {/* Code */}
      <div className="flex-1 overflow-auto p-4 bg-gray-50">
        <pre className="text-xs font-mono text-gray-700 leading-relaxed">
          {code[activeTab]}
        </pre>
      </div>
    </div>
  );
}
