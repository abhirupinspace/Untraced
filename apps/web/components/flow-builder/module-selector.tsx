"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";
import { Module } from "./types";
import { availableModules } from "./module-data";
import {
  GithubIcon,
  EmailIcon,
  UserIcon,
  BankIcon,
  GlobeIcon,
  IdCardIcon,
  ShieldCheckIcon,
  AmazonIcon,
} from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Filter,
  Sparkles,
  Clock,
  CheckCircle2,
  ChevronRight,
  X,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Github: GithubIcon,
  Email: EmailIcon,
  User: UserIcon,
  Bank: BankIcon,
  Globe: GlobeIcon,
  IdCard: IdCardIcon,
  Shield: ShieldCheckIcon,
  Amazon: AmazonIcon,
};

const categories = [
  { id: "all", name: "All Modules", icon: Sparkles },
  { id: "identity", name: "Identity", icon: UserIcon },
  { id: "financial", name: "Financial", icon: BankIcon },
  { id: "social", name: "Social", icon: GithubIcon },
];

const moduleCategories: Record<string, string> = {
  "zk-email": "identity",
  "zk-age": "identity",
  "zk-aadhar": "identity",
  "zk-kyc": "identity",
  "zk-github": "social",
  "zk-amazon": "social",
  "zk-bank-balance": "financial",
  "zk-country": "identity",
};

interface ModuleSelectorProps {
  onAddModule: (moduleId: string) => void;
  addedModuleIds: string[];
  className?: string;
}

export function ModuleSelector({
  onAddModule,
  addedModuleIds,
  className,
}: ModuleSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  const filteredModules = useMemo(() => {
    return availableModules.filter((module) => {
      const matchesSearch =
        module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        activeCategory === "all" ||
        moduleCategories[module.id] === activeCategory;

      const matchesStatus = !showActiveOnly || module.status === "active";

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchQuery, activeCategory, showActiveOnly]);

  const activeCount = availableModules.filter((m) => m.status === "active").length;
  const comingSoonCount = availableModules.filter((m) => m.status === "coming").length;

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="p-4 border-b border-untraced-dark/5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-untraced-dark">Modules</h2>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-xs">
              {activeCount} active
            </Badge>
            <Badge variant="outline" className="text-xs">
              {comingSoonCount} soon
            </Badge>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-untraced-dark/30" />
          <input
            type="text"
            placeholder="Search modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-10 py-2.5 text-sm bg-untraced-dark/5 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-untraced-dark/20 transition-all placeholder:text-untraced-dark/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-untraced-dark/10 transition-colors"
            >
              <X className="w-3 h-3 text-untraced-dark/40" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="px-4 py-3 border-b border-untraced-dark/5">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                activeCategory === category.id
                  ? "bg-untraced-dark text-foreground"
                  : "bg-untraced-dark/5 text-untraced-dark/60 hover:bg-untraced-dark/10"
              )}
            >
              <category.icon className="w-3.5 h-3.5" />
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Active Only Toggle */}
      <div className="px-4 py-2 border-b border-untraced-dark/5">
        <button
          onClick={() => setShowActiveOnly(!showActiveOnly)}
          className={cn(
            "flex items-center gap-2 text-xs transition-colors",
            showActiveOnly ? "text-untraced-dark" : "text-untraced-dark/50"
          )}
        >
          <div
            className={cn(
              "w-4 h-4 rounded border-2 flex items-center justify-center transition-all",
              showActiveOnly
                ? "bg-untraced-dark border-untraced-dark"
                : "border-untraced-dark/20"
            )}
          >
            {showActiveOnly && <CheckCircle2 className="w-3 h-3 text-foreground" />}
          </div>
          Show active only
        </button>
      </div>

      {/* Module List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <AnimatePresence mode="popLayout">
          {filteredModules.map((module, index) => {
            const Icon = iconMap[module.icon] || ShieldCheckIcon;
            const isAdded = addedModuleIds.includes(module.id);
            const isDisabled = module.status === "coming";

            return (
              <motion.button
                key={module.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => !isDisabled && onAddModule(module.id)}
                disabled={isDisabled}
                className={cn(
                  "w-full group relative flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                  isDisabled
                    ? "opacity-50 cursor-not-allowed bg-untraced-dark/5"
                    : isAdded
                    ? "bg-untraced-dark/5 hover:bg-untraced-dark/10"
                    : "hover:bg-untraced-dark/5"
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br transition-transform group-hover:scale-105",
                    module.gradient,
                    isDisabled && "opacity-60"
                  )}
                >
                  <Icon className="w-5 h-5 text-foreground" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "font-medium text-sm truncate",
                        isDisabled ? "text-untraced-dark/50" : "text-untraced-dark"
                      )}
                    >
                      {module.name}
                    </span>
                    {isDisabled && (
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                        <Clock className="w-2.5 h-2.5 mr-0.5" />
                        Soon
                      </Badge>
                    )}
                    {isAdded && !isDisabled && (
                      <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                        <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />
                        Added
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-untraced-dark/50 truncate">
                    {module.description}
                  </p>
                </div>

                {/* Add Button */}
                {!isDisabled && (
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg transition-all",
                      isAdded
                        ? "bg-untraced-dark/10 text-untraced-dark/40"
                        : "bg-untraced-dark/5 text-untraced-dark/40 group-hover:bg-untraced-dark group-hover:text-foreground"
                    )}
                  >
                    <Plus className="w-4 h-4" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>

        {filteredModules.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="w-10 h-10 text-untraced-dark/20 mb-3" />
            <p className="text-sm text-untraced-dark/40">No modules found</p>
            <p className="text-xs text-untraced-dark/30 mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-untraced-dark/5 bg-untraced-dark/[0.02]">
        <div className="flex items-center gap-2 text-xs text-untraced-dark/40">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Click a module to add it to your flow</span>
        </div>
      </div>
    </div>
  );
}
