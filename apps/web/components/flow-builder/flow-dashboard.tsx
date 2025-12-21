"use client";

import { useState, useCallback } from "react";
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
import { useWallet } from "@/lib/use-wallet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ModuleSelector } from "./module-selector";
import { FlowCanvas } from "./flow-canvas";
import { FlowPreview } from "./flow-preview";
import { FlowStats } from "./flow-stats";
import { CodePreview } from "./code-preview";
import { availableModules } from "./module-data";
import { FlowModule, Flow } from "./types";
import { generateCode } from "./code-generator";
import {
  Rocket,
  Code2,
  Eye,
  LayoutGrid,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Download,
  Share2,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";

type RightPanel = "preview" | "code";

export function FlowDashboard() {
  const { authenticated, login, logout, user } = useWallet();
  const [flowName, setFlowName] = useState("my_verification_flow");
  const [flowModules, setFlowModules] = useState<FlowModule[]>([]);
  const [rightPanel, setRightPanel] = useState<RightPanel>("preview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
  const addedModuleIds = flowModules.map((m) => m.id);

  return (
    <div className="h-screen flex flex-col bg-untraced-light overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-untraced-dark/5 bg-white flex-shrink-0 z-50">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-untraced-dark/5"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-untraced-dark flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                <span className="text-untraced-light font-bold">U</span>
              </div>
              <span className="hidden sm:block font-semibold text-untraced-dark">
                UNTRACED
              </span>
            </Link>

            <div className="hidden sm:block h-6 w-px bg-untraced-dark/10" />

            <div className="hidden sm:flex items-center gap-2">
              <h1 className="font-semibold text-untraced-dark">Flow Builder</h1>
              <Badge variant="secondary" className="text-[10px]">
                Beta
              </Badge>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            {/* Panel Toggle */}
            <div className="hidden md:flex items-center bg-untraced-dark/5 rounded-lg p-1">
              <button
                onClick={() => setRightPanel("preview")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  rightPanel === "preview"
                    ? "bg-white shadow-sm text-untraced-dark"
                    : "text-untraced-dark/50 hover:text-untraced-dark"
                )}
              >
                <Eye className="w-3.5 h-3.5" />
                Preview
              </button>
              <button
                onClick={() => setRightPanel("code")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  rightPanel === "code"
                    ? "bg-white shadow-sm text-untraced-dark"
                    : "text-untraced-dark/50 hover:text-untraced-dark"
                )}
              >
                <Code2 className="w-3.5 h-3.5" />
                Code
              </button>
            </div>

            <div className="h-6 w-px bg-untraced-dark/10 hidden md:block" />

            {/* Export */}
            <Button variant="ghost" size="sm" className="hidden md:flex">
              <Download className="w-4 h-4 mr-1.5" />
              Export
            </Button>

            {/* Wallet */}
            {!authenticated ? (
              <Button onClick={login} size="sm" variant="outline">
                Connect Wallet
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-untraced-dark/5 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-medium text-untraced-dark/70 truncate max-w-[100px]">
                    {user?.wallet?.address?.slice(0, 6)}...{user?.wallet?.address?.slice(-4)}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="glow"
                  disabled={flowModules.length === 0}
                  className="shadow-lg"
                >
                  <Rocket className="w-4 h-4 mr-1.5" />
                  Deploy
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Module Selector */}
        <aside
          className={cn(
            "flex-shrink-0 bg-white border-r border-untraced-dark/5 transition-all duration-300 overflow-hidden",
            sidebarCollapsed ? "w-0 lg:w-16" : "w-80",
            mobileMenuOpen
              ? "fixed inset-y-16 left-0 z-40 w-80 shadow-xl"
              : "hidden lg:block"
          )}
        >
          {!sidebarCollapsed && (
            <ModuleSelector
              onAddModule={addModule}
              addedModuleIds={addedModuleIds}
            />
          )}
          {sidebarCollapsed && (
            <div className="hidden lg:flex flex-col items-center py-4 gap-2">
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="p-2 rounded-lg hover:bg-untraced-dark/5"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </aside>

        {/* Sidebar Toggle (Desktop) */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden lg:flex absolute left-[318px] top-1/2 -translate-y-1/2 z-30 w-5 h-10 bg-white border border-untraced-dark/10 rounded-r-lg items-center justify-center hover:bg-untraced-dark/5 transition-all"
          style={{
            left: sidebarCollapsed ? "62px" : "318px",
          }}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-3 h-3 text-untraced-dark/40" />
          ) : (
            <ChevronLeft className="w-3 h-3 text-untraced-dark/40" />
          )}
        </button>

        {/* Center - Flow Canvas */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Flow Name Input */}
          <div className="flex-shrink-0 p-4 border-b border-untraced-dark/5 bg-secondary0">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-xs font-medium text-untraced-dark/50 block mb-1.5">
                  Flow Name
                </label>
                <input
                  type="text"
                  value={flowName}
                  onChange={(e) =>
                    setFlowName(e.target.value.replace(/[^a-zA-Z0-9_]/g, "_"))
                  }
                  className="w-full max-w-sm px-4 py-2 text-sm bg-white border border-untraced-dark/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-untraced-dark/20 font-mono transition-all"
                  placeholder="my_verification_flow"
                />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="hidden sm:flex">
                  {flowModules.length} {flowModules.length === 1 ? "module" : "modules"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 overflow-auto">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={flowModules.map((m) => m.instanceId)}
                strategy={verticalListSortingStrategy}
              >
                <div className="max-w-xl mx-auto">
                  <FlowCanvas
                    modules={flowModules}
                    onRemove={removeModule}
                    onConfigChange={updateModuleConfig}
                  />
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </main>

        {/* Right Panel - Preview/Code */}
        <aside className="hidden lg:flex flex-col w-[420px] flex-shrink-0 border-l border-untraced-dark/5 bg-white overflow-hidden">
          {rightPanel === "preview" ? (
            <FlowPreview flowName={flowName} modules={flowModules} />
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-untraced-dark/5">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-untraced-dark/40" />
                  <span className="text-sm font-medium text-untraced-dark/60">
                    Generated Code
                  </span>
                </div>
                {generatedCode && (
                  <Badge variant="secondary" className="text-xs">
                    Live
                  </Badge>
                )}
              </div>
              <div className="flex-1 overflow-auto p-4">
                {generatedCode ? (
                  <CodePreview code={generatedCode} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <div className="w-16 h-16 rounded-2xl bg-untraced-dark/5 flex items-center justify-center mb-4">
                      <Code2 className="w-8 h-8 text-untraced-dark/20" />
                    </div>
                    <p className="text-sm text-untraced-dark/40">
                      Add modules to generate code
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>

        {/* Stats Panel - Far Right */}
        <aside className="hidden xl:block w-72 flex-shrink-0 border-l border-untraced-dark/5 bg-untraced-light/50 overflow-auto p-4">
          <FlowStats flowName={flowName} modules={flowModules} />
        </aside>
      </div>

      {/* Mobile Bottom Panel Toggle */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50 flex gap-2">
        <Button
          size="icon"
          variant={rightPanel === "preview" ? "default" : "outline"}
          onClick={() => setRightPanel("preview")}
          className="w-12 h-12 rounded-full shadow-lg"
        >
          <Eye className="w-5 h-5" />
        </Button>
        <Button
          size="icon"
          variant={rightPanel === "code" ? "default" : "outline"}
          onClick={() => setRightPanel("code")}
          className="w-12 h-12 rounded-full shadow-lg"
        >
          <Code2 className="w-5 h-5" />
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
