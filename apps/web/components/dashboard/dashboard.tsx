"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { useProjects, useApiKeys, type Project, type ApiKey, type Flow } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EditDialog } from "@/components/ui/edit-dialog";
import { KYCFlowBuilder } from "@/components/flow-builder/kyc-flow-builder";
import { DashboardNavbar } from "@/components/dashboard/dashboard-navbar";
import { toast } from "sonner";
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
  Activity,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  Mail,
  Github,
  Wallet,
  User,
  Twitter,
  Shield,
  Globe,
  Zap,
  Trash2,
  Pencil,
  MoreVertical,
} from "lucide-react";

type View = "projects" | "project-detail" | "create-project" | "flow-builder" | "flow-detail";

export function Dashboard() {
  const { projects, loading, error, createProject, deleteProject, updateProject, refreshProjects } = useProjects();

  const [view, setView] = useState<View>("projects");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Delete/Edit states
  const [deleteProjectDialogOpen, setDeleteProjectDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deleteFlowDialogOpen, setDeleteFlowDialogOpen] = useState(false);
  const [flowToDelete, setFlowToDelete] = useState<Flow | null>(null);
  const [editProjectDialogOpen, setEditProjectDialogOpen] = useState(false);
  const [editFlowDialogOpen, setEditFlowDialogOpen] = useState(false);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setView("project-detail");
  };

  const handleSelectFlow = (flow: Flow) => {
    setSelectedFlow(flow);
    setView("flow-detail");
  };

  const handleBack = () => {
    if (view === "project-detail") {
      setSelectedProject(null);
      setView("projects");
    } else if (view === "create-project") {
      setView("projects");
    } else if (view === "flow-builder") {
      setView("project-detail");
    } else if (view === "flow-detail") {
      setSelectedFlow(null);
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

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    const { success, error } = await deleteProject(projectToDelete.id);
    if (success) {
      toast.success("Project deleted", {
        description: `"${projectToDelete.name}" has been permanently deleted.`,
      });
      setSelectedProject(null);
      setView("projects");
    } else {
      toast.error("Failed to delete project", {
        description: error || "An unexpected error occurred.",
      });
    }
    setProjectToDelete(null);
  };

  const handleConfirmDeleteProject = (project: Project) => {
    setProjectToDelete(project);
    setDeleteProjectDialogOpen(true);
  };

  const handleDeleteFlow = async () => {
    if (!flowToDelete || !selectedProject) return;

    try {
      const response = await fetch(`/api/projects/${selectedProject.id}/flows/${flowToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Flow archived", {
          description: `"${flowToDelete.displayName || flowToDelete.name}" has been archived.`,
        });
        // Refresh projects to update flow list
        await refreshProjects();
        setSelectedFlow(null);
        setView("project-detail");
      } else {
        const data = await response.json();
        toast.error("Failed to delete flow", {
          description: data.error || "An unexpected error occurred.",
        });
      }
    } catch {
      toast.error("Failed to delete flow", {
        description: "An unexpected error occurred.",
      });
    }
    setFlowToDelete(null);
  };

  const handleConfirmDeleteFlow = (flow: Flow) => {
    setFlowToDelete(flow);
    setDeleteFlowDialogOpen(true);
  };

  const handleEditProject = async (name: string, description: string) => {
    if (!selectedProject) return;

    const { project, error } = await updateProject(selectedProject.id, { name, description });
    if (project) {
      toast.success("Project updated", {
        description: `"${name}" has been updated successfully.`,
      });
      setSelectedProject({ ...selectedProject, name, description });
      setEditProjectDialogOpen(false);
    } else {
      toast.error("Failed to update project", {
        description: error || "An unexpected error occurred.",
      });
    }
  };

  const handleEditFlow = async (displayName: string) => {
    if (!selectedFlow || !selectedProject) return;

    try {
      const response = await fetch(`/api/projects/${selectedProject.id}/flows/${selectedFlow.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName }),
      });

      if (response.ok) {
        toast.success("Flow updated", {
          description: `Flow has been renamed to "${displayName}".`,
        });
        await refreshProjects();
        setSelectedFlow({ ...selectedFlow, displayName });
        setEditFlowDialogOpen(false);
      } else {
        const data = await response.json();
        toast.error("Failed to update flow", {
          description: data.error || "An unexpected error occurred.",
        });
      }
    } catch {
      toast.error("Failed to update flow", {
        description: "An unexpected error occurred.",
      });
    }
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
            onSelectFlow={handleSelectFlow}
            onDeleteProject={handleConfirmDeleteProject}
            onEditProject={() => setEditProjectDialogOpen(true)}
            copyToClipboard={copyToClipboard}
            copiedId={copiedId}
          />
        )}

        {/* Delete Project Confirmation */}
        <ConfirmDialog
          open={deleteProjectDialogOpen}
          onOpenChange={setDeleteProjectDialogOpen}
          title="Delete Project?"
          description={`This will permanently delete "${projectToDelete?.name}" and all its flows. This action cannot be undone.`}
          confirmLabel="Delete Project"
          variant="destructive"
          onConfirm={handleDeleteProject}
        />

        {view === "flow-detail" && selectedProject && selectedFlow && (
          <FlowDetailView
            flow={selectedFlow}
            project={selectedProject}
            onBack={handleBack}
            onDeleteFlow={handleConfirmDeleteFlow}
            onEditFlow={() => setEditFlowDialogOpen(true)}
          />
        )}

        {/* Delete Flow Confirmation */}
        <ConfirmDialog
          open={deleteFlowDialogOpen}
          onOpenChange={setDeleteFlowDialogOpen}
          title="Delete Flow?"
          description={`This will permanently delete "${flowToDelete?.displayName || flowToDelete?.name}" and all its configuration. This action cannot be undone.`}
          confirmLabel="Delete Flow"
          variant="destructive"
          onConfirm={handleDeleteFlow}
        />

        {/* Edit Project Dialog */}
        <EditDialog
          open={editProjectDialogOpen}
          onOpenChange={setEditProjectDialogOpen}
          title="Edit Project"
          fields={[
            {
              name: "name",
              label: "Project Name",
              placeholder: "e.g. My DeFi App",
              defaultValue: selectedProject?.name || "",
              required: true,
            },
            {
              name: "description",
              label: "Description",
              placeholder: "What is this project for?",
              defaultValue: selectedProject?.description || "",
              type: "textarea",
            },
          ]}
          onSubmit={(values) => handleEditProject(values.name, values.description)}
          submitLabel="Save Changes"
        />

        {/* Edit Flow Dialog */}
        <EditDialog
          open={editFlowDialogOpen}
          onOpenChange={setEditFlowDialogOpen}
          title="Edit Flow"
          fields={[
            {
              name: "displayName",
              label: "Display Name",
              placeholder: "e.g. Age Verification Flow",
              defaultValue: selectedFlow?.displayName || selectedFlow?.name || "",
              required: true,
            },
          ]}
          onSubmit={(values) => handleEditFlow(values.displayName)}
          submitLabel="Save Changes"
        />

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
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="group flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/20 hover:bg-secondary/50 hover:-translate-y-0.5 cursor-pointer transition-all duration-200"
                  onClick={() => onSelectProject(project)}
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
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
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </motion.div>
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
          <div className="text-center mb-6 p-y-4">
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
  onSelectFlow,
  onDeleteProject,
  onEditProject,
  copyToClipboard,
  copiedId,
}: {
  project: Project;
  onBack: () => void;
  onCreateFlow: () => void;
  onSelectFlow: (flow: Flow) => void;
  onDeleteProject: (project: Project) => void;
  onEditProject: () => void;
  copyToClipboard: (text: string, id: string) => void;
  copiedId: string | null;
}) {
  const { keys, loading: keysLoading, createKey, revokeKey } = useApiKeys(project.id);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});
  const [newKey, setNewKey] = useState<ApiKey | null>(null);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [keyToRevoke, setKeyToRevoke] = useState<ApiKey | null>(null);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);

  const handleRevokeKey = async () => {
    if (!keyToRevoke) return;
    const { success, error } = await revokeKey(keyToRevoke.id);
    if (success) {
      toast.success("API key revoked", {
        description: `The ${keyToRevoke.type} key has been revoked and can no longer be used.`,
      });
    } else {
      toast.error("Failed to revoke key", {
        description: error || "An unexpected error occurred.",
      });
    }
    setKeyToRevoke(null);
  };

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
        <h1 className="text-base font-normal text-foreground flex-1">{project.name}</h1>
        <div className="relative">
          <button
            onClick={() => setShowActionsMenu(!showActionsMenu)}
            className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {showActionsMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowActionsMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 z-50 min-w-[140px] bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                <button
                  onClick={() => {
                    setShowActionsMenu(false);
                    onEditProject();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-secondary transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit Project
                </button>
                <button
                  onClick={() => {
                    setShowActionsMenu(false);
                    onDeleteProject(project);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Project
                </button>
              </div>
            </>
          )}
        </div>
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
                  <button
                    onClick={() => {
                      setKeyToRevoke(publishableKey);
                      setRevokeDialogOpen(true);
                    }}
                    className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                    title="Revoke key"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
                  <button
                    onClick={() => {
                      setKeyToRevoke(secretKey);
                      setRevokeDialogOpen(true);
                    }}
                    className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                    title="Revoke key"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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

          {/* Warning
          <div className="bg-warning/5 border border-warning/20 rounded-lg p-2.5">
            <div className="flex gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-warning flex-shrink-0 mt-0.5" />
              <p className="text-xs text-warning font-light">
                Never expose your secret key in client-side code. Use it only on your server.
              </p>
            </div>
          </div> */}

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
                {project.flows.map((flow, index) => (
                  <motion.div
                    key={flow.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    onClick={() => onSelectFlow(flow)}
                    className="group flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:border-primary/20 hover:bg-secondary/50 hover:-translate-y-0.5 cursor-pointer transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
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
                    <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </motion.div>
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

      {/* Revoke Key Confirmation */}
      <ConfirmDialog
        open={revokeDialogOpen}
        onOpenChange={setRevokeDialogOpen}
        title="Revoke API Key?"
        description={`This will permanently revoke your ${keyToRevoke?.type} key. Any applications using this key will stop working immediately.`}
        confirmLabel="Revoke Key"
        variant="destructive"
        onConfirm={handleRevokeKey}
      />
    </>
  );
}

// Module icon mapping
const moduleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "zk-email": Mail,
  "zk-age": User,
  "zk-github": Github,
  "zk-twitter": Twitter,
  "zk-balance": Wallet,
  "zk-country": Globe,
  "zk-kyc": Shield,
};


// Flow Detail View with Analytics
function FlowDetailView({
  flow,
  project,
  onBack,
  onDeleteFlow,
  onEditFlow,
}: {
  flow: Flow;
  project: Project;
  onBack: () => void;
  onDeleteFlow: (flow: Flow) => void;
  onEditFlow: () => void;
}) {
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const stats = flow.stats || { totalVerifications: 0, successfulVerifications: 0, failedVerifications: 0 };
  const modules = flow.modules || [];

  const successRate = stats.totalVerifications > 0
    ? ((stats.successfulVerifications / stats.totalVerifications) * 100).toFixed(1)
    : "0.0";

  const failedCount = stats.totalVerifications - stats.successfulVerifications;

  // Generate mock weekly data based on flow stats
  const avgDaily = Math.floor(stats.totalVerifications / 7) || 0;
  const weeklyData = [
    { day: "M", total: Math.floor(avgDaily * 0.9), success: Math.floor(avgDaily * 0.85) },
    { day: "T", total: Math.floor(avgDaily * 1.1), success: Math.floor(avgDaily * 1.05) },
    { day: "W", total: Math.floor(avgDaily * 1.0), success: Math.floor(avgDaily * 0.95) },
    { day: "T", total: Math.floor(avgDaily * 1.2), success: Math.floor(avgDaily * 1.15) },
    { day: "F", total: Math.floor(avgDaily * 1.3), success: Math.floor(avgDaily * 1.25) },
    { day: "S", total: Math.floor(avgDaily * 0.6), success: Math.floor(avgDaily * 0.55) },
    { day: "S", total: Math.floor(avgDaily * 0.4), success: Math.floor(avgDaily * 0.35) },
  ];

  return (
    <>
      <DashboardNavbar>
        <button
          onClick={onBack}
          className="p-1.5 -ml-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
        <h1 className="text-base font-normal text-foreground">{flow.displayName || flow.name}</h1>
        <Badge
          variant={flow.status === "active" ? "success" : "secondary"}
          className="ml-2 text-[9px] px-1.5 py-0"
        >
          {flow.status}
        </Badge>
        <div className="flex-1" />
        <div className="relative">
          <button
            onClick={() => setShowActionsMenu(!showActionsMenu)}
            className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {showActionsMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowActionsMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 z-50 min-w-[140px] bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                <button
                  onClick={() => {
                    setShowActionsMenu(false);
                    onEditFlow();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-secondary transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit Flow
                </button>
                <button
                  onClick={() => {
                    setShowActionsMenu(false);
                    onDeleteFlow(flow);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Flow
                </button>
              </div>
            </>
          )}
        </div>
      </DashboardNavbar>

      <div className="p-6 flex justify-center">
        <div className="w-full max-w-4xl space-y-4">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card variant="bordered" padding="none" className="p-3">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">Total Verifications</p>
                  <p className="text-lg font-medium text-foreground tabular-nums">
                    {stats.totalVerifications.toLocaleString()}
                  </p>
                </div>
                <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                  <Activity className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Layers className="w-2.5 h-2.5" />
                <span>{modules.length} module{modules.length !== 1 ? "s" : ""}</span>
              </div>
            </Card>

            <Card variant="bordered" padding="none" className="p-3">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">Success Rate</p>
                  <p className="text-lg font-medium text-foreground tabular-nums">{successRate}%</p>
                </div>
                <RingProgress value={parseFloat(successRate)} size={36} />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-[10px] font-medium",
                parseFloat(successRate) >= 90 ? "text-success" : parseFloat(successRate) >= 70 ? "text-warning" : "text-destructive"
              )}>
                {parseFloat(successRate) >= 90 ? (
                  <TrendingUp className="w-2.5 h-2.5" />
                ) : (
                  <TrendingDown className="w-2.5 h-2.5" />
                )}
                <span>{parseFloat(successRate) >= 90 ? "Healthy" : parseFloat(successRate) >= 70 ? "Needs attention" : "Critical"}</span>
              </div>
            </Card>

            <Card variant="bordered" padding="none" className="p-3">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">Successful</p>
                  <p className="text-lg font-medium text-foreground tabular-nums">
                    {stats.successfulVerifications.toLocaleString()}
                  </p>
                </div>
                <div className="p-1.5 rounded-md bg-success/10 text-success">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-success">
                <TrendingUp className="w-2.5 h-2.5" />
                <span>Completed</span>
              </div>
            </Card>

            <Card variant="bordered" padding="none" className="p-3">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">Failed</p>
                  <p className="text-lg font-medium text-foreground tabular-nums">
                    {failedCount.toLocaleString()}
                  </p>
                </div>
                <div className="p-1.5 rounded-md bg-destructive/10 text-destructive">
                  <XCircle className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="w-2.5 h-2.5" />
                <span>Requires review</span>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
            {/* Weekly Chart */}
            <Card variant="bordered" padding="none" className="lg:col-span-3 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="text-xs font-medium text-foreground">Weekly Activity</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                    <span className="text-[10px] text-muted-foreground">Total</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-[10px] text-muted-foreground">Success</span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <FlowBarChart data={weeklyData} />
              </div>
            </Card>

            {/* Flow Info */}
            <Card variant="bordered" padding="none" className="lg:col-span-2 overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <span className="text-xs font-medium text-foreground">Flow Details</span>
              </div>
              <div className="p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Flow ID</span>
                  <code className="text-[10px] font-mono text-foreground bg-secondary px-1.5 py-0.5 rounded">
                    {flow.name}
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Project</span>
                  <span className="text-xs text-foreground">{project.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Created</span>
                  <span className="text-xs text-foreground">
                    {new Date(flow.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {flow.updatedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Updated</span>
                    <span className="text-xs text-foreground">
                      {new Date(flow.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Modules</span>
                  <span className="text-xs text-foreground">{modules.length}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Module Performance */}
          <Card variant="bordered" padding="none" className="overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <span className="text-xs font-medium text-foreground">Module Configuration</span>
            </div>
            <div className="p-3">
              {modules.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {modules.map((module, index) => {
                    const Icon = moduleIcons[module.moduleId] || Shield;
                    const configValue = module.config && Object.entries(module.config)[0];

                    return (
                      <div
                        key={module.instanceId}
                        className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-foreground truncate">
                              {module.moduleId.replace("zk-", "").charAt(0).toUpperCase() +
                               module.moduleId.replace("zk-", "").slice(1)}
                            </span>
                            <Badge variant="outline" className="text-[9px] px-1 py-0">
                              Step {index + 1}
                            </Badge>
                          </div>
                          {configValue && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {String(configValue[0])}: {String(configValue[1])}
                            </p>
                          )}
                        </div>
                        {module.required && (
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                            Required
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Layers className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No modules configured</p>
                </div>
              )}
            </div>
          </Card>

          {/* Quick Integration */}
          <Card variant="bordered" padding="none" className="overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <span className="text-xs font-medium text-foreground">Quick Integration</span>
            </div>
            <div className="p-3">
              <pre className="text-[11px] font-mono text-foreground/80 bg-secondary p-3 rounded-lg overflow-x-auto">
{`import { createClient } from "@untraced/sdk";

const untraced = createClient({ clientId: "your_client_id" });

// Trigger this flow
untraced.verify({
  flow: "${flow.name}",
  onSuccess: (proof) => {
    console.log("Verified!", proof);
  },
  onError: (error) => {
    console.error("Verification failed:", error);
  }
});`}
              </pre>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

// Ring Progress Component
function RingProgress({ value, size = 40 }: { value: number; size?: number }) {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-secondary"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-success transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[8px] font-medium text-foreground tabular-nums">{Math.round(value)}</span>
      </div>
    </div>
  );
}

// Flow Bar Chart Component
function FlowBarChart({ data }: { data: Array<{ day: string; total: number; success: number }> }) {
  const maxValue = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className="flex items-end justify-between gap-2 h-28">
      {data.map((item, index) => {
        const totalHeight = (item.total / maxValue) * 100;
        const successHeight = (item.success / maxValue) * 100;

        return (
          <div key={index} className="flex-1 flex flex-col items-center gap-2 group cursor-default" title={item.total > 0 ? `${Math.round((item.success / item.total) * 100)}% success` : undefined}>
            <div className="relative w-full h-20 flex items-end">
              <div
                className="absolute bottom-0 w-full bg-secondary rounded transition-all"
                style={{ height: `${totalHeight}%` }}
              />
              <div
                className="absolute bottom-0 w-full bg-primary/60 group-hover:bg-primary rounded transition-all"
                style={{ height: `${successHeight}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">
              {item.day}
            </span>
          </div>
        );
      })}
    </div>
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
