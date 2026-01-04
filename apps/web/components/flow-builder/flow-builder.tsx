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
import { useWallet } from "@/lib/use-wallet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ModuleCard, FlowModuleCard } from "./module-card";
import { CodePreview } from "./code-preview";
import { availableModules } from "./module-data";
import { FlowModule, Flow } from "./types";
import { generateCode } from "./code-generator";
import { Search, Plus, Sparkles, ArrowLeft, Rocket, ChevronDown } from "lucide-react";
import Link from "next/link";

export function FlowBuilder() {
  const { authenticated, login } = useWallet();
  const [flowName, setFlowName] = useState("my_verification_flow");
  const [flowModules, setFlowModules] = useState<FlowModule[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredModules = availableModules.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase())
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

  return (
    <div className="min-h-screen bg-untraced-light">
      {/* Header */}
      <div className="border-b border-untraced-dark/5 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-untraced-dark flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="text-untraced-light font-bold text-sm">U</span>
              </div>
            </Link>
            <div className="h-6 w-px bg-untraced-dark/10" />
            <div className="flex items-center gap-2">
              <h1 className="font-semibold">Flow Builder</h1>
              <Badge variant="secondary">Beta</Badge>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!authenticated ? (
              <Button onClick={login} size="sm" variant="default">
                Connect Wallet
              </Button>
            ) : (
              <Button
                size="sm"
                variant="glow"
                disabled={flowModules.length === 0}
                className="group"
              >
                <Rocket className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                Deploy Flow
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Module Selection Panel */}
          <div className="lg:col-span-3">
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-untraced-dark/60">
                  Available Modules
                </h2>
                <Badge variant="outline" className="text-xs">
                  {availableModules.filter((m) => m.status === "active").length} active
                </Badge>
              </div>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-untraced-dark/40" />
                <input
                  type="text"
                  placeholder="Search modules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-untraced-dark/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-untraced-dark/30 focus:border-untraced-dark/30 bg-white transition-all"
                />
              </div>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
                {filteredModules.map((module) => (
                  <ModuleCard
                    key={module.id}
                    module={module}
                    onClick={() => addModule(module.id)}
                  />
                ))}
                {filteredModules.length === 0 && (
                  <div className="text-center py-8 text-untraced-dark/40 text-sm">
                    No modules found
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Flow Builder Panel */}
          <div className="lg:col-span-5">
            <Card variant="bordered" className="p-5 mb-6">
              <label className="text-sm font-medium text-untraced-dark/60 block mb-2">
                Flow Name
              </label>
              <input
                type="text"
                value={flowName}
                onChange={(e) =>
                  setFlowName(e.target.value.replace(/[^a-zA-Z0-9_]/g, "_"))
                }
                className="w-full px-4 py-2.5 text-sm border border-untraced-dark/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-untraced-dark/30 focus:border-untraced-dark/30 bg-untraced-light/50 font-mono transition-all"
                placeholder="my_verification_flow"
              />
            </Card>

            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-untraced-dark/60">
                Your Flow
              </h2>
              {flowModules.length > 0 && (
                <Badge variant="default" className="text-xs">
                  {flowModules.length} {flowModules.length === 1 ? "module" : "modules"}
                </Badge>
              )}
            </div>

            {flowModules.length === 0 ? (
              <Card variant="bordered" className="border-dashed p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-untraced-dark/5 flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-7 h-7 text-untraced-dark/30" />
                </div>
                <p className="text-untraced-dark/60 text-sm font-medium mb-1">
                  No modules yet
                </p>
                <p className="text-untraced-dark/40 text-xs font-light">
                  Click on modules from the left panel to start building your verification flow
                </p>
                <div className="flex justify-center mt-4">
                  <ChevronDown className="w-5 h-5 text-untraced-dark/20 animate-bounce" />
                </div>
              </Card>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={flowModules.map((m) => m.instanceId)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {flowModules.map((module, index) => (
                      <div key={module.instanceId} className="relative">
                        {index > 0 && (
                          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10">
                            <span className="px-2 py-0.5 text-[10px] font-semibold text-untraced-dark/40 bg-untraced-light rounded-full border border-untraced-dark/10">
                              AND
                            </span>
                          </div>
                        )}
                        <FlowModuleCard
                          module={module}
                          onRemove={() => removeModule(module.instanceId)}
                          onConfigChange={(value) =>
                            updateModuleConfig(module.instanceId, value)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          {/* Code Preview Panel */}
          <div className="lg:col-span-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-untraced-dark/60">
                Generated Code
              </h2>
              {generatedCode && (
                <Badge variant="outline" className="text-xs">
                  Live Preview
                </Badge>
              )}
            </div>
            {generatedCode ? (
              <CodePreview code={generatedCode} />
            ) : (
              <Card variant="bordered" className="border-dashed p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-untraced-dark/5 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-7 h-7 text-untraced-dark/30" />
                </div>
                <p className="text-untraced-dark/60 text-sm font-medium mb-1">
                  Code Preview
                </p>
                <p className="text-untraced-dark/40 text-xs font-light">
                  Add modules to see generated Solidity, SDK, and JSON code
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
