"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/cn";
import { useProjects, useApiKeys, type Project, type ApiKey } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KYCFlowBuilder } from "@/components/flow-builder/kyc-flow-builder";
import {
  Layers,
  Search,
  Plus,
  Copy,
  Check,
  FolderKanban,
  ChevronRight,
  Key,  
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowLeft,
  Loader2,
  RefreshCw,
  Settings,
} from "lucide-react";

type View = "projects" | "project-detail" | "create-project" | "flow-builder";

export function Dashboard() {
  const { projects, loading, error, createProject, refreshProjects } = useProjects();

  const [view, setView] = useState<View>("projects");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setView("project-detail");
  };

  const handleBack = () => {
    if (view === "project-detail") {
      setSelectedProject(null);
      setView("projects");
    } else if (view === "create-project") {
      setView("projects");
    } else if (view === "flow-builder") {
      setView("project-detail");
    }
  };

  const handleCreateProject = async (name: string, description: string) => {
    setIsCreating(true);
    const { project, error } = await createProject(name, description);
    setIsCreating(false);

    if (project) {
      setSelectedProject(project);
      setView("project-detail");
    } else {
      console.error("Failed to create project:", error);
    }
  };

  const handleFlowCreated = () => {
    // Refresh the selected project to get the new flow
    if (selectedProject) {
      refreshProjects().then(() => {
        const updatedProject = projects.find(p => p.id === selectedProject.id);
        if (updatedProject) {
          setSelectedProject(updatedProject);
        }
      });
    }
    setView("project-detail");
  };

  // Update selected project when projects change
  useEffect(() => {
    if (selectedProject) {
      const updated = projects.find(p => p.id === selectedProject.id);
      if (updated) {
        setSelectedProject(updated);
      }
    }
  }, [projects, selectedProject]);

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
        {view === "projects" && (
          <ProjectsView
            projects={filteredProjects}
            loading={loading}
            error={error}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSelectProject={handleSelectProject}
            onCreateProject={() => setView("create-project")}
            onRefresh={refreshProjects}
            copyToClipboard={copyToClipboard}
            copiedId={copiedId}
          />
        )}

        {view === "create-project" && (
          <CreateProjectView
            onBack={handleBack}
            onSubmit={handleCreateProject}
            isCreating={isCreating}
          />
        )}

        {view === "project-detail" && selectedProject && (
          <ProjectDetailView
            project={selectedProject}
            onBack={handleBack}
            onCreateFlow={() => setView("flow-builder")}
            copyToClipboard={copyToClipboard}
            copiedId={copiedId}
          />
        )}

        {view === "flow-builder" && selectedProject && (
          <FlowBuilderView
            project={selectedProject}
            onBack={handleBack}
            onFlowCreated={handleFlowCreated}
          />
        )}
    </div>
  );
}

// Projects List View
function ProjectsView({
  projects,
  loading,
  error,
  searchQuery,
  setSearchQuery,
  onSelectProject,
  onCreateProject,
  onRefresh,
  copyToClipboard,
  copiedId,
}: {
  projects: Project[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectProject: (project: Project) => void;
  onCreateProject: () => void;
  onRefresh: () => void;
  copyToClipboard: (text: string, id: string) => void;
  copiedId: string | null;
}) {
  return (
    <>
      <header className="h-14 border-b border-white/5 bg-[#0a0a0a] sticky top-0 z-40">
        <div className="h-full px-6 flex items-center justify-between">
          <h1 className="text-lg font-normal text-white">Projects</h1>
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-all"
            title="Refresh projects"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
        </div>
      </header>

      <div className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-72 pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm font-light text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
              />
            </div>
            <Button
              onClick={onCreateProject}
              className="bg-white text-black hover:bg-gray-200 gap-2 text-sm font-normal"
            >
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </div>

          {/* Loading state */}
          {loading && projects.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
            </div>
          )}

          {/* Error state */}
          {error && (
            <Card className="bg-red-500/10 border border-red-500/20 p-4">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <div>
                  <p className="text-sm text-red-400 font-light">{error}</p>
                  <button
                    onClick={onRefresh}
                    className="text-xs text-red-400/60 hover:text-red-400 mt-1"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* Project Cards */}
          {!loading && !error && (
            <div className="grid gap-3">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  variant="bordered"
                  className="p-5 cursor-pointer group hover:border-white/20 transition-all"
                  onClick={() => onSelectProject(project)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                        <FolderKanban className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-base font-normal text-white mb-1">{project.name}</h3>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 font-light">{project.flows.length} flows</span>
                          <span className="text-xs text-gray-600">•</span>
                          <span className="text-xs text-gray-500 font-light">
                            {project.stats.totalVerifications.toLocaleString()} verifications
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-gray-500 font-light mb-1">Slug</p>
                        <code className="text-xs text-gray-400 font-mono">
                          {project.slug}
                        </code>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && projects.length === 0 && (
            <Card variant="bordered" className="text-center py-16">
              <FolderKanban className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <p className="text-sm text-gray-400 font-light mb-1">No projects found</p>
              <p className="text-xs text-gray-600 font-light">Create your first project to get started</p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

// Create Project View
function CreateProjectView({
  onBack,
  onSubmit,
  isCreating,
}: {
  onBack: () => void;
  onSubmit: (name: string, description: string) => void;
  isCreating: boolean;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && !isCreating) {
      onSubmit(name.trim(), description.trim());
    }
  };

  const isValid = name.trim().length >= 3;

  return (
    <>
      <header className="h-14 border-b border-white/5 bg-[#0a0a0a] sticky top-0 z-40">
        <div className="h-full px-6 flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-lg font-normal text-white">Create Project</h1>
        </div>
      </header>

      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-5">
              <FolderKanban className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-normal text-white mb-2">Create a new project</h2>
            <p className="text-sm text-gray-500 font-light">
              Projects help you organize your verification flows
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-normal text-gray-400 mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. My DeFi App"
                className="w-full px-4 py-3 text-sm font-light bg-[#0f0f0f] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-white/20 transition-all text-white placeholder:text-gray-600"
                autoFocus
                disabled={isCreating}
              />
            </div>

            <div>
              <label className="block text-xs font-normal text-gray-400 mb-2">
                Description <span className="text-gray-600">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this project for?"
                rows={3}
                className="w-full px-4 py-3 text-sm font-light bg-[#0f0f0f] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-white/20 transition-all text-white placeholder:text-gray-600 resize-none"
                disabled={isCreating}
              />
            </div>

            <Button
              type="submit"
              disabled={!isValid || isCreating}
              className="w-full h-12 bg-white text-black hover:bg-gray-200 font-normal text-sm mt-6"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}

// Project Detail View
function ProjectDetailView({
  project,
  onBack,
  onCreateFlow,
  copyToClipboard,
  copiedId,
}: {
  project: Project;
  onBack: () => void;
  onCreateFlow: () => void;
  copyToClipboard: (text: string, id: string) => void;
  copiedId: string | null;
}) {
  const { keys, loading: keysLoading, createKey } = useApiKeys(project.id);
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});
  const [newKey, setNewKey] = useState<ApiKey | null>(null);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);

  const handleGenerateKey = async (type: "publishable" | "secret") => {
    setIsGeneratingKey(true);
    const name = type === "publishable" ? "Publishable Key" : "Secret Key";
    const { key, error } = await createKey(name, type);
    setIsGeneratingKey(false);

    if (key) {
      setNewKey(key);
    } else {
      console.error("Failed to create key:", error);
    }
  };

  const publishableKey = keys.find(k => k.type === "publishable");
  const secretKey = keys.find(k => k.type === "secret");

  return (
    <>
      <header className="h-14 border-b border-white/5 bg-[#0a0a0a] sticky top-0 z-40">
        <div className="h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-lg font-normal text-white">{project.name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-white/10 text-gray-400 hover:text-white hover:bg-white/5 font-light"
            >
              <Settings className="w-3.5 h-3.5 mr-1.5" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* New Key Alert */}
        {newKey?.key && (
          <Card className="bg-green-500/10 border border-green-500/20 p-4">
            <div className="flex gap-3">
              <Key className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-green-400 font-medium mb-2">
                  New {newKey.type} key created!
                </p>
                <p className="text-xs text-green-400/70 mb-3">
                  Copy this key now. You won&apos;t be able to see it again.
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm font-mono text-green-300 bg-black/30 px-3 py-2 rounded-lg truncate">
                    {newKey.key}
                  </code>
                  <button
                    onClick={() => {
                      copyToClipboard(newKey.key!, "new-key");
                    }}
                    className="p-2 rounded-lg hover:bg-white/10 text-green-400 transition-all"
                  >
                    {copiedId === "new-key" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <button
                  onClick={() => setNewKey(null)}
                  className="text-xs text-green-400/50 hover:text-green-400 mt-2"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* API Keys Section */}
        <div className="grid grid-cols-2 gap-4">
          <Card variant="bordered" className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-normal text-gray-400">Client ID (Publishable)</span>
              </div>
              <Badge variant="secondary" className="text-[10px]">Public</Badge>
            </div>
            {keysLoading ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
              </div>
            ) : publishableKey ? (
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm font-mono text-white bg-white/5 px-3 py-2 rounded-lg truncate">
                  {publishableKey.keyPrefix}...{publishableKey.lastFour}
                </code>
                <button
                  onClick={() => copyToClipboard(`${publishableKey.keyPrefix}...${publishableKey.lastFour}`, `${project.id}-client`)}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    copiedId === `${project.id}-client`
                      ? "bg-green-500/20 text-green-400"
                      : "hover:bg-white/10 text-gray-400"
                  )}
                >
                  {copiedId === `${project.id}-client` ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            ) : (
              <Button
                onClick={() => handleGenerateKey("publishable")}
                disabled={isGeneratingKey}
                variant="outline"
                size="sm"
                className="w-full border-white/10 text-gray-400"
              >
                {isGeneratingKey ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Generate Key
              </Button>
            )}
          </Card>

          <Card variant="bordered" className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-normal text-gray-400">Secret Key</span>
              </div>
              <Badge variant="destructive" className="text-[10px]">Private</Badge>
            </div>
            {keysLoading ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
              </div>
            ) : secretKey ? (
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm font-mono text-white bg-white/5 px-3 py-2 rounded-lg truncate">
                  {showSecret[secretKey.id]
                    ? `${secretKey.keyPrefix}...${secretKey.lastFour}`
                    : "•".repeat(24)
                  }
                </code>
                <button
                  onClick={() => setShowSecret(prev => ({ ...prev, [secretKey.id]: !prev[secretKey.id] }))}
                  className="p-2 rounded-lg hover:bg-white/10 text-gray-400 transition-all"
                >
                  {showSecret[secretKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => copyToClipboard(`${secretKey.keyPrefix}...${secretKey.lastFour}`, `${project.id}-secret`)}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    copiedId === `${project.id}-secret`
                      ? "bg-green-500/20 text-green-400"
                      : "hover:bg-white/10 text-gray-400"
                  )}
                >
                  {copiedId === `${project.id}-secret` ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            ) : (
              <Button
                onClick={() => handleGenerateKey("secret")}
                disabled={isGeneratingKey}
                variant="outline"
                size="sm"
                className="w-full border-white/10 text-gray-400"
              >
                {isGeneratingKey ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Generate Key
              </Button>
            )}
          </Card>
        </div>

        {/* Warning */}
        <Card className="bg-amber-500/5 border border-amber-500/20 p-4">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <p className="text-xs text-amber-400/80 font-light">
              Never expose your secret key in client-side code. Use it only on your server.
            </p>
          </div>
        </Card>

        {/* Flows Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-normal text-white">Verification Flows</h2>
            <Button
              onClick={onCreateFlow}
              size="sm"
              className="bg-purple-500 hover:bg-purple-600 text-white gap-2 text-sm font-normal h-9"
            >
              <Plus className="w-4 h-4" />
              New Flow
            </Button>
          </div>

          {project.flows.length > 0 ? (
            <div className="space-y-2">
              {project.flows.map((flow) => (
                <Card
                  key={flow.id}
                  variant="bordered"
                  className="p-4 cursor-pointer hover:border-white/20 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                        <Layers className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-normal text-white font-mono">{flow.name}</h3>
                          <Badge
                            variant={flow.status === "active" ? "success" : "secondary"}
                            className="text-[10px]"
                          >
                            {flow.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {flow.moduleCount} module{flow.moduleCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-normal text-white">
                          {flow.stats.totalVerifications.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 font-light">verifications</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card variant="bordered" className="text-center py-12">
              <Layers className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-400 font-light mb-1">No flows yet</p>
              <p className="text-xs text-gray-600 font-light mb-4">Create your first verification flow</p>
              <Button
                onClick={onCreateFlow}
                size="sm"
                className="bg-white text-black hover:bg-gray-200 font-normal"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Create Flow
              </Button>
            </Card>
          )}
        </div>

        {/* Quick Start Code */}
        {publishableKey && (
          <Card variant="bordered" className="p-4">
            <span className="text-xs font-normal text-gray-500 block mb-3">Quick Start</span>
            <pre className="text-xs font-mono text-gray-300 bg-black/50 p-4 rounded-lg overflow-x-auto">
{`import { createClient } from "@untraced/sdk";

const untraced = createClient({
  clientId: "${publishableKey.keyPrefix}...${publishableKey.lastFour}",
});

// Open verification modal
untraced.verify({
  flow: "your_flow_name",
  onSuccess: (proof) => console.log("Verified!", proof),
});`}
            </pre>
          </Card>
        )}
      </div>
    </>
  );
}

// Flow Builder View
function FlowBuilderView({
  project,
  onBack,
  onFlowCreated,
}: {
  project: Project;
  onBack: () => void;
  onFlowCreated: () => void;
}) {
  return (
    <KYCFlowBuilder
      onBack={onBack}
      onFlowCreated={onFlowCreated}
      projectContext={{
        id: project.id,
        name: project.name,
        slug: project.slug,
      }}
    />
  );
}
