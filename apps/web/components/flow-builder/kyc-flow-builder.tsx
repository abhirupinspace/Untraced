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
import { cn } from "@/lib/cn";
import { availableModules } from "./module-data";
import { FlowModule, Flow } from "./types";
import { generateCode } from "./code-generator";
import { useFlows } from "@/lib/hooks";

// Import sub-components
import { BuilderStep } from "./steps/builder-step";

import {
  ArrowLeft,
  Layers,
} from "lucide-react";

export interface ProjectContext {
  id: string;
  name: string;
  slug: string;
}

interface KYCFlowBuilderProps {
  onBack?: () => void;
  onFlowCreated?: () => void;
  projectContext?: ProjectContext;
}

export function KYCFlowBuilder({ onBack, onFlowCreated, projectContext }: KYCFlowBuilderProps) {
  // Flow state
  const [flowName, setFlowName] = useState(
    projectContext?.slug?.toLowerCase().replace(/\s+/g, "_") || "kyc_verification"
  );
  const [flowModules, setFlowModules] = useState<FlowModule[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { createFlow } = useFlows(projectContext?.id || null);

  const handleSaveFlow = useCallback(async () => {
    if (!projectContext || flowModules.length === 0) return;

    setIsSaving(true);
    setSaveError(null);

    const { flow, error } = await createFlow({
      name: flowName,
      displayName: flowName.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
      modules: flowModules.map((m, index) => ({
        moduleId: m.id,
        instanceId: m.instanceId,
        config: { value: m.configValue },
        order: index,
      })),
    });

    setIsSaving(false);

    if (error) {
      setSaveError(error);
      return;
    }

    if (flow && onFlowCreated) {
      onFlowCreated();
    }
  }, [projectContext, flowName, flowModules, createFlow, onFlowCreated]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-border bg-background sticky top-0 z-50 flex-shrink-0">
        <div className="h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 -ml-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <Layers className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <h1 className="text-base font-normal text-foreground">Flow Builder</h1>
                {projectContext && (
                  <p className="text-xs text-muted-foreground font-light">{projectContext.name}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
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
              project={projectContext ? {
                name: projectContext.name,
                description: "",
                apiKey: projectContext.id,
                secretKey: "",
                createdAt: new Date(),
              } : null}
              flowName={flowName}
              setFlowName={setFlowName}
              flowModules={flowModules}
              addModule={addModule}
              removeModule={removeModule}
              updateModuleConfig={updateModuleConfig}
              generatedCode={generatedCode}
              onBack={onBack}
              onSave={handleSaveFlow}
              isSaving={isSaving}
              saveError={saveError}
            />
          </SortableContext>
        </DndContext>
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
