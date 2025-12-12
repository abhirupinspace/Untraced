"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { FlowModule } from "./types";
import {
  Layers,
  Shield,
  Clock,
  Zap,
  CheckCircle,
  AlertCircle,
  Hash,
} from "lucide-react";

interface FlowStatsProps {
  flowName: string;
  modules: FlowModule[];
  className?: string;
}

export function FlowStats({ flowName, modules, className }: FlowStatsProps) {
  const activeModules = modules.filter((m) => m.status === "active");
  const hasThresholds = modules.some((m) => m.config?.type === "threshold");
  const hasSelections = modules.some((m) => m.config?.type === "selection");

  const stats = [
    {
      label: "Modules",
      value: modules.length,
      icon: Layers,
      color: "from-blue-500 to-cyan-500",
      description: "verification steps",
    },
    {
      label: "Active",
      value: activeModules.length,
      icon: CheckCircle,
      color: "from-green-500 to-emerald-500",
      description: "live modules",
    },
    {
      label: "Est. Time",
      value: `${modules.length * 15}s`,
      icon: Clock,
      color: "from-purple-500 to-pink-500",
      description: "to complete",
    },
    {
      label: "Security",
      value: modules.length >= 3 ? "High" : modules.length >= 2 ? "Medium" : "Basic",
      icon: Shield,
      color: "from-orange-500 to-red-500",
      description: "level",
    },
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Flow Name Card */}
      <div className="bg-gradient-to-br from-untraced-dark to-untraced-dark-hover rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Hash className="w-4 h-4 opacity-60" />
          <span className="text-xs font-medium opacity-60">Flow Name</span>
        </div>
        <p className="font-mono text-lg font-semibold truncate">
          {flowName || "untitled_flow"}
        </p>
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1 opacity-70">
              <Zap className="w-3 h-3" />
              Mantle Sepolia
            </span>
            {modules.length > 0 && (
              <span className="flex items-center gap-1 opacity-70">
                <CheckCircle className="w-3 h-3" />
                Ready to Deploy
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-4 border border-untraced-dark/5 hover:border-untraced-dark/10 transition-all hover:shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center",
                  stat.color
                )}
              >
                <stat.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-untraced-dark">{stat.value}</p>
            <p className="text-xs text-untraced-dark/50 mt-0.5">
              {stat.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Module Summary */}
      {modules.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-untraced-dark/5">
          <h4 className="text-xs font-medium text-untraced-dark/60 mb-3">
            Flow Requirements
          </h4>
          <div className="space-y-2">
            {modules.map((module, index) => (
              <motion.div
                key={module.instanceId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full bg-gradient-to-br",
                      module.gradient
                    )}
                  />
                  <span className="text-untraced-dark/80">{module.name}</span>
                </div>
                {module.configValue !== undefined && (
                  <span className="text-xs text-untraced-dark/50 font-mono bg-untraced-dark/5 px-2 py-0.5 rounded">
                    {module.configValue}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts */}
      {modules.length === 0 && (
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">No modules added</p>
              <p className="text-xs text-amber-600 mt-1">
                Add at least one verification module to create your flow.
              </p>
            </div>
          </div>
        </div>
      )}

      {modules.length === 1 && (
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Basic security</p>
              <p className="text-xs text-blue-600 mt-1">
                Consider adding more modules for stronger verification.
              </p>
            </div>
          </div>
        </div>
      )}

      {modules.length >= 3 && (
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800">Strong verification</p>
              <p className="text-xs text-green-600 mt-1">
                Your flow has multiple verification layers. Ready to deploy.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
