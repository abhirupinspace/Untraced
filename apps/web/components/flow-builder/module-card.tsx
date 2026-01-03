"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/cn";
import { FlowModule, Module } from "./types";
import { GripVertical, X, Settings } from "lucide-react";
import { useState } from "react";
import {
  EmailIcon,
  UserIcon,
  GithubIcon,
  BankIcon,
  IdCardIcon,
  AmazonIcon,
  GlobeIcon,
  ShieldCheckIcon,
  ChainsIcon,
} from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Email: EmailIcon,
  User: UserIcon,
  Github: GithubIcon,
  Bank: BankIcon,
  IdCard: IdCardIcon,
  Amazon: AmazonIcon,
  Globe: GlobeIcon,
  Shield: ShieldCheckIcon,
  Chains: ChainsIcon,
};

interface ModuleCardProps {
  module: Module;
  onClick?: () => void;
  disabled?: boolean;
}

export function ModuleCard({ module, onClick, disabled }: ModuleCardProps) {
  const Icon = iconMap[module.icon] || EmailIcon;
  const isDisabled = disabled || module.status === "coming";

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        "group w-full p-4 rounded-xl border-2 text-left transition-all duration-300",
        "hover:border-untraced-dark/30 hover:shadow-lg hover:-translate-y-0.5",
        "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:border-untraced-dark/10 disabled:hover:shadow-none disabled:hover:translate-y-0",
        "border-untraced-dark/10 bg-white"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300",
            "group-hover:scale-110 group-disabled:group-hover:scale-100",
            module.gradient
              ? `bg-gradient-to-br ${module.gradient}`
              : "bg-untraced-dark/5"
          )}
        >
          <Icon
            className={cn(
              "w-5 h-5",
              module.gradient ? "text-foreground" : "text-untraced-dark"
            )}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{module.name}</span>
            {module.status === "coming" && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                Soon
              </Badge>
            )}
          </div>
          <p className="text-xs text-untraced-dark/50 mt-0.5 truncate font-light">
            {module.description}
          </p>
        </div>
      </div>
    </button>
  );
}

interface FlowModuleCardProps {
  module: FlowModule;
  onRemove: () => void;
  onConfigChange: (value: string | number) => void;
}

export function FlowModuleCard({
  module,
  onRemove,
  onConfigChange,
}: FlowModuleCardProps) {
  const [showConfig, setShowConfig] = useState(false);
  const Icon = iconMap[module.icon] || EmailIcon;

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
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "p-4 rounded-xl border-2 border-untraced-dark/20 bg-white transition-all duration-200",
        isDragging && "opacity-50 shadow-xl scale-105 rotate-1"
      )}
    >
      <div className="flex items-start gap-3">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing text-untraced-dark/30 hover:text-untraced-dark/50 transition-colors"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
            module.gradient
              ? `bg-gradient-to-br ${module.gradient}`
              : "bg-untraced-dark"
          )}
        >
          <Icon className="w-5 h-5 text-foreground" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-medium">{module.name}</span>
            <div className="flex items-center gap-1">
              {module.config && (
                <button
                  onClick={() => setShowConfig(!showConfig)}
                  className={cn(
                    "p-1.5 rounded-lg transition-all duration-200",
                    showConfig
                      ? "bg-untraced-dark text-foreground"
                      : "hover:bg-untraced-dark/5 text-untraced-dark/50 hover:text-untraced-dark"
                  )}
                >
                  <Settings className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onRemove}
                className="p-1.5 rounded-lg hover:bg-red-50 text-untraced-dark/50 hover:text-red-500 transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-xs text-untraced-dark/50 mt-0.5 font-light">
            {module.description}
          </p>

          {module.config && showConfig && (
            <div className="mt-3 pt-3 border-t border-untraced-dark/10 animate-in slide-in-from-top-2 duration-200">
              <label className="text-xs text-untraced-dark/60 block mb-2 font-medium">
                {module.config.label}
              </label>
              {module.config.type === "threshold" ? (
                <input
                  type="number"
                  min={module.config.min}
                  max={module.config.max}
                  value={module.configValue ?? module.config.default}
                  onChange={(e) => onConfigChange(parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-untraced-dark/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-untraced-dark/30 focus:border-untraced-dark/30 transition-all"
                />
              ) : module.config.type === "selection" ? (
                <select
                  value={module.configValue ?? module.config.default}
                  onChange={(e) => onConfigChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-untraced-dark/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-untraced-dark/30 focus:border-untraced-dark/30 bg-white transition-all cursor-pointer"
                >
                  {module.config.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
