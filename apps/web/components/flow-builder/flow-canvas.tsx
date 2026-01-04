"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/cn";
import { FlowModule } from "./types";
import {
  GithubIcon,
  EmailIcon,
  UserIcon,
  BankIcon,
  GlobeIcon,
  IdCardIcon,
  ShieldCheckIcon,
} from "@/components/ui/icons";
import {
  GripVertical,
  X,
  Settings2,
  ChevronDown,
  ArrowDown,
  Plus,
} from "lucide-react";
import { useState } from "react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Github: GithubIcon,
  Email: EmailIcon,
  User: UserIcon,
  Bank: BankIcon,
  Globe: GlobeIcon,
  IdCard: IdCardIcon,
  Shield: ShieldCheckIcon,
};

interface FlowNodeProps {
  module: FlowModule;
  index: number;
  total: number;
  onRemove: () => void;
  onConfigChange: (value: string | number) => void;
}

function FlowNode({
  module,
  index,
  total,
  onRemove,
  onConfigChange,
}: FlowNodeProps) {
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
    <div className="flex flex-col items-center">
      <motion.div
        ref={setNodeRef}
        style={style}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8, y: -20 }}
        className={cn(
          "relative w-full max-w-sm",
          isDragging && "z-50"
        )}
      >
        {/* Main Card */}
        <div
          className={cn(
            "bg-white rounded-2xl border-2 border-untraced-dark/10 shadow-lg transition-all duration-200",
            isDragging && "shadow-2xl border-untraced-dark/30 scale-105",
            "hover:border-untraced-dark/20 hover:shadow-xl"
          )}
        >
          {/* Header */}
          <div className="flex items-center gap-3 p-4">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 -ml-1 rounded-lg hover:bg-untraced-dark/5 transition-colors"
            >
              <GripVertical className="w-4 h-4 text-untraced-dark/30" />
            </button>

            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-untraced-dark/10">
              <Icon className="w-5 h-5 text-untraced-dark" />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-untraced-dark truncate">
                {module.name}
              </h4>
              <p className="text-xs text-untraced-dark/50 truncate">
                {module.description}
              </p>
            </div>

            <div className="flex items-center gap-1">
              {module.config && (
                <button
                  onClick={() => setShowConfig(!showConfig)}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    showConfig
                      ? "bg-untraced-dark text-foreground"
                      : "hover:bg-untraced-dark/5 text-untraced-dark/40"
                  )}
                >
                  <Settings2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onRemove}
                className="p-2 rounded-lg hover:bg-red-50 text-untraced-dark/40 hover:text-red-500 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Config Panel */}
          <AnimatePresence>
            {showConfig && module.config && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 pt-2 border-t border-untraced-dark/5">
                  <label className="text-xs font-medium text-untraced-dark/60 block mb-2">
                    {module.config.label}
                  </label>
                  {module.config.type === "threshold" ? (
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={module.config.min}
                        max={module.config.max}
                        value={module.configValue as number}
                        onChange={(e) =>
                          onConfigChange(parseInt(e.target.value))
                        }
                        className="flex-1 h-2 bg-untraced-dark/10 rounded-full appearance-none cursor-pointer accent-untraced-dark"
                      />
                      <input
                        type="number"
                        min={module.config.min}
                        max={module.config.max}
                        value={module.configValue as number}
                        onChange={(e) =>
                          onConfigChange(parseInt(e.target.value) || 0)
                        }
                        className="w-20 px-3 py-1.5 text-sm border border-untraced-dark/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-untraced-dark/20 font-mono"
                      />
                    </div>
                  ) : module.config.type === "selection" ? (
                    <select
                      value={module.configValue as string}
                      onChange={(e) => onConfigChange(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-untraced-dark/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-untraced-dark/20 bg-white"
                    >
                      {module.config.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : null}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Config Preview Badge */}
          {module.configValue !== undefined && !showConfig && (
            <div className="px-4 pb-3">
              <div className="inline-flex items-center px-2.5 py-1 bg-untraced-dark/5 rounded-lg text-xs font-medium text-untraced-dark/60">
                {module.config?.label}: {module.configValue}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Connector */}
      {index < total - 1 && (
        <div className="flex flex-col items-center py-2">
          <div className="w-0.5 h-4 bg-untraced-dark/15" />
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-untraced-dark/5 border border-untraced-dark/10">
            <span className="text-[10px] font-bold text-untraced-dark/40">AND</span>
          </div>
          <div className="w-0.5 h-4 bg-untraced-dark/15" />
        </div>
      )}
    </div>
  );
}

interface FlowCanvasProps {
  modules: FlowModule[];
  onRemove: (instanceId: string) => void;
  onConfigChange: (instanceId: string, value: string | number) => void;
}

export function FlowCanvas({
  modules,
  onRemove,
  onConfigChange,
}: FlowCanvasProps) {
  if (modules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-3xl bg-untraced-dark/5 flex items-center justify-center mx-auto mb-6">
            <Plus className="w-10 h-10 text-untraced-dark/20" />
          </div>
          <h3 className="text-lg font-semibold text-untraced-dark/60 mb-2">
            Start Building Your Flow
          </h3>
          <p className="text-sm text-untraced-dark/40 max-w-xs mx-auto mb-6">
            Select verification modules from the sidebar to create your custom verification flow
          </p>
          <div className="flex items-center justify-center gap-2 text-untraced-dark/30">
            <ArrowDown className="w-5 h-5 animate-bounce" />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-6 px-4">
      {/* Start Node */}
      <div className="flex flex-col items-center mb-2">
        <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/20">
          <span className="text-white text-xs font-bold">START</span>
        </div>
        <div className="w-0.5 h-6 bg-untraced-dark/20" />
      </div>

      {/* Flow Nodes */}
      <AnimatePresence mode="popLayout">
        {modules.map((module, index) => (
          <FlowNode
            key={module.instanceId}
            module={module}
            index={index}
            total={modules.length}
            onRemove={() => onRemove(module.instanceId)}
            onConfigChange={(value) => onConfigChange(module.instanceId, value)}
          />
        ))}
      </AnimatePresence>

      {/* End Node */}
      <div className="flex flex-col items-center mt-2">
        <div className="w-0.5 h-6 bg-untraced-dark/20" />
        <div className="w-12 h-12 rounded-full bg-untraced-dark flex items-center justify-center shadow-lg shadow-untraced-dark/20">
          <span className="text-foreground text-xs font-bold">END</span>
        </div>
      </div>
    </div>
  );
}
