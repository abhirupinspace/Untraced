"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/cn";
import { useProjects, useApiKeys, type Project, type ApiKey } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KYCFlowBuilder } from "@/components/flow-builder/kyc-flow-builder";
import { DashboardNavbar } from "@/components/dashboard/dashboard-navbar";
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
    <div className="min-h-screen bg-background">
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
      <DashboardNavbar title="Projects">
        <button
          onClick={onRefresh}
          className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
          title="Refresh projects"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
        </button>
      </DashboardNavbar>

      <div className="p-6 flex justify-center">
        <div className="w-full max-w-3xl space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-secondary border border-border rounded-lg text-sm font-light text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
              />
            </div>
            <Button
              onClick={onCreateProject}
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 text-xs font-normal h-9"
            >
              <Plus className="w-3.5 h-3.5" />
              New Project
            </Button>
          </div>

          {/* Loading state */}
          {loading && projects.length === 0 && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <div className="flex gap-2.5">
                <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-destructive font-light">{error}</p>
                  <button
                    onClick={onRefresh}
                    className="text-xs text-destructive/60 hover:text-destructive mt-1"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Project Cards */}
          {!loading && !error && (
            <div className="space-y-2">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="group flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/20 hover:bg-secondary/50 cursor-pointer transition-all"
                  onClick={() => onSelectProject(project)}
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
                    <FolderKanban className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-normal text-foreground truncate">{project.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground font-light">{project.flows.length} flows</span>
                      <span className="text-muted-foreground/30">·</span>
                      <span className="text-xs text-muted-foreground font-light">
                        {project.stats.totalVerifications.toLocaleString()} verifications
                      </span>
                    </div>
                  </div>
                  <code className="hidden sm:block text-xs text-muted-foreground font-mono bg-secondary px-2 py-1 rounded">
                    {project.slug}
                  </code>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors flex-shrink-0" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && projects.length === 0 && (
            <div className="text-center py-12 border border-dashed border-border rounded-xl">
              <FolderKanban className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-light mb-1">No projects yet</p>
              <p className="text-xs text-muted-foreground/60 font-light mb-4">Create your first project to get started</p>
              <Button
                onClick={onCreateProject}
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-normal h-8"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Create Project
              </Button>
            </div>
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
      <DashboardNavbar>
        <button
          onClick={onBack}
          className="p-1.5 -ml-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
        <h1 className="text-base font-normal text-foreground">New Project</h1>
      </DashboardNavbar>

      <div className="p-6 flex justify-center">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
              <FolderKanban className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-normal text-foreground mb-1">Create a new project</h2>
            <p className="text-xs text-muted-foreground font-light">
              Projects help you organize your verification flows
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-normal text-muted-foreground mb-1.5">
                Project Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. My DeFi App"
                className="w-full px-3 py-2.5 text-sm font-light bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-foreground placeholder:text-muted-foreground"
                autoFocus
                disabled={isCreating}
              />
            </div>

            <div>
              <label className="block text-xs font-normal text-muted-foreground mb-1.5">
                Description <span className="text-muted-foreground/50">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this project for?"
                rows={2}
                className="w-full px-3 py-2.5 text-sm font-light bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-foreground placeholder:text-muted-foreground resize-none"
                disabled={isCreating}
              />
            </div>

            <Button
              type="submit"
              disabled={!isValid || isCreating}
              className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90 font-normal text-sm mt-4"
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
      <DashboardNavbar>
        <button
          onClick={onBack}
          className="p-1.5 -ml-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
        <h1 className="text-base font-normal text-foreground">{project.name}</h1>
      </DashboardNavbar>

      <div className="p-6 flex justify-center">
        <div className="w-full max-w-3xl space-y-5">
          {/* New Key Alert */}
          {newKey?.key && (
            <div className="bg-success/10 border border-success/20 rounded-lg p-3">
              <div className="flex gap-2.5">
                <Key className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-success font-medium mb-1.5">
                    New {newKey.type} key created
                  </p>
                  <p className="text-xs text-success/70 mb-2">
                    Copy this key now. You won&apos;t be able to see it again.
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs font-mono text-success bg-success/10 px-2.5 py-1.5 rounded truncate">
                      {newKey.key}
                    </code>
                    <button
                      onClick={() => copyToClipboard(newKey.key!, "new-key")}
                      className="p-1.5 rounded hover:bg-success/20 text-success transition-all"
                    >
                      {copiedId === "new-key" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <button onClick={() => setNewKey(null)} className="text-xs text-success/50 hover:text-success mt-2">
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* API Keys Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="border border-border rounded-lg p-3 bg-card">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-normal text-muted-foreground">Client ID</span>
                </div>
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0">Public</Badge>
              </div>
              {keysLoading ? (
                <div className="flex items-center justify-center py-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                </div>
              ) : publishableKey ? (
                <div className="flex items-center gap-1.5">
                  <code className="flex-1 text-xs font-mono text-foreground bg-secondary px-2 py-1.5 rounded truncate">
                    {publishableKey.keyPrefix}...{publishableKey.lastFour}
                  </code>
                  <button
                    onClick={() => copyToClipboard(`${publishableKey.keyPrefix}...${publishableKey.lastFour}`, `${project.id}-client`)}
                    className={cn(
                      "p-1.5 rounded transition-all",
                      copiedId === `${project.id}-client` ? "bg-success/20 text-success" : "hover:bg-secondary text-muted-foreground"
                    )}
                  >
                    {copiedId === `${project.id}-client` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ) : (
                <Button
                  onClick={() => handleGenerateKey("publishable")}
                  disabled={isGeneratingKey}
                  variant="outline"
                  size="sm"
                  className="w-full h-8 border-border text-muted-foreground text-xs"
                >
                  {isGeneratingKey ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Plus className="w-3.5 h-3.5 mr-1.5" />}
                  Generate
                </Button>
              )}
            </div>

            <div className="border border-border rounded-lg p-3 bg-card">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-normal text-muted-foreground">Secret Key</span>
                </div>
                <Badge variant="destructive" className="text-[9px] px-1.5 py-0">Private</Badge>
              </div>
              {keysLoading ? (
                <div className="flex items-center justify-center py-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                </div>
              ) : secretKey ? (
                <div className="flex items-center gap-1.5">
                  <code className="flex-1 text-xs font-mono text-foreground bg-secondary px-2 py-1.5 rounded truncate">
                    {showSecret[secretKey.id] ? `${secretKey.keyPrefix}...${secretKey.lastFour}` : "•".repeat(20)}
                  </code>
                  <button
                    onClick={() => setShowSecret(prev => ({ ...prev, [secretKey.id]: !prev[secretKey.id] }))}
                    className="p-1.5 rounded hover:bg-secondary text-muted-foreground transition-all"
                  >
                    {showSecret[secretKey.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(`${secretKey.keyPrefix}...${secretKey.lastFour}`, `${project.id}-secret`)}
                    className={cn(
                      "p-1.5 rounded transition-all",
                      copiedId === `${project.id}-secret` ? "bg-success/20 text-success" : "hover:bg-secondary text-muted-foreground"
                    )}
                  >
                    {copiedId === `${project.id}-secret` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ) : (
                <Button
                  onClick={() => handleGenerateKey("secret")}
                  disabled={isGeneratingKey}
                  variant="outline"
                  size="sm"
                  className="w-full h-8 border-border text-muted-foreground text-xs"
                >
                  {isGeneratingKey ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Plus className="w-3.5 h-3.5 mr-1.5" />}
                  Generate
                </Button>
              )}
            </div>
          </div>

          {/* Warning */}
          <div className="bg-warning/5 border border-warning/20 rounded-lg p-2.5">
            <div className="flex gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-warning flex-shrink-0 mt-0.5" />
              <p className="text-xs text-warning font-light">
                Never expose your secret key in client-side code. Use it only on your server.
              </p>
            </div>
          </div>

          {/* Flows Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-foreground">Verification Flows</h2>
              <Button
                onClick={onCreateFlow}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 text-xs font-normal h-8"
              >
                <Plus className="w-3.5 h-3.5" />
                New Flow
              </Button>
            </div>

            {project.flows.length > 0 ? (
              <div className="space-y-2">
                {project.flows.map((flow) => (
                  <div
                    key={flow.id}
                    className="group flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:border-primary/20 hover:bg-secondary/50 cursor-pointer transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
                      <Layers className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-sm font-normal text-foreground font-mono truncate">{flow.name}</h3>
                        <Badge variant={flow.status === "active" ? "success" : "secondary"} className="text-[9px] px-1.5 py-0">
                          {flow.status}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground font-light">
                        {flow.moduleCount} module{flow.moduleCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-normal text-foreground tabular-nums">{flow.stats.totalVerifications.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground font-light">verifications</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors flex-shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed border-border rounded-xl">
                <Layers className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground font-light mb-1">No flows yet</p>
                <p className="text-xs text-muted-foreground/60 font-light mb-3">Create your first verification flow</p>
                <Button onClick={onCreateFlow} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-normal h-8">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Create Flow
                </Button>
              </div>
            )}
          </div>

          {/* Quick Start Code */}
          {publishableKey && (
            <div className="border border-border rounded-lg p-3 bg-card">
              <span className="text-xs font-normal text-muted-foreground block mb-2">Quick Start</span>
              <pre className="text-[11px] font-mono text-foreground/80 bg-secondary p-3 rounded-lg overflow-x-auto">
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
            </div>
          )}
        </div>
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
