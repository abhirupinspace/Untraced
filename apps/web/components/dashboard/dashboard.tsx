"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { useWallet } from "@/lib/use-wallet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KYCFlowBuilder } from "@/components/flow-builder/kyc-flow-builder";
import {
  Layers,
  BarChart3,
  Settings,
  BookOpen,
  Search,
  Plus,
  Copy,
  Check,
  LogOut,
  FolderKanban,
  ChevronRight,
  Key,
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowLeft,
  Trash2,
  MoreHorizontal,
  ExternalLink,
  Loader2,
} from "lucide-react";

// Types
interface Project {
  id: string;
  name: string;
  description: string;
  clientId: string;
  secretKey: string;
  createdAt: string;
  flows: Flow[];
}

interface Flow {
  id: string;
  name: string;
  verifications: number;
  modules: string[];
  createdAt: string;
  status: "active" | "draft";
}

// Mock data
const MOCK_PROJECTS: Project[] = [
  {
    id: "proj_1",
    name: "DeFi Protocol",
    description: "KYC verification for DeFi users",
    clientId: "uk_live_8d4f2bc13f2a9e1d7c4b5fa3",
    secretKey: "sk_test_EXAMPLE_FAKE_KEY_1",
    createdAt: "Dec 12, 2024",
    flows: [
      {
        id: "flow_1",
        name: "defi_kyc",
        verifications: 2847,
        modules: ["zk-email", "zk-age"],
        createdAt: "Dec 12, 2024",
        status: "active",
      },
      {
        id: "flow_2",
        name: "whale_verification",
        verifications: 156,
        modules: ["zk-bank-balance"],
        createdAt: "Dec 13, 2024",
        status: "active",
      },
    ],
  },
  {
    id: "proj_2",
    name: "Developer Portal",
    description: "GitHub verification for developers",
    clientId: "uk_live_2bc19e1d7c4b5fa38d4f3f2a",
    secretKey: "sk_test_EXAMPLE_FAKE_KEY_2",
    createdAt: "Dec 10, 2024",
    flows: [
      {
        id: "flow_3",
        name: "dev_verify",
        verifications: 1256,
        modules: ["zk-github"],
        createdAt: "Dec 10, 2024",
        status: "active",
      },
    ],
  },
];

type View = "projects" | "project-detail" | "create-project" | "create-flow" | "flow-builder";

const NAV_ITEMS = [
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

const FOOTER_NAV_ITEMS = [
  { id: "docs", label: "Documentation", icon: BookOpen, href: "https://docs.untraced.io" },
];

export function Dashboard() {
  const { ready, authenticated, login, logout, user } = useWallet();
  const [view, setView] = useState<View>("projects");
  const [activeNav, setActiveNav] = useState("projects");
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
    } else if (view === "create-flow" || view === "flow-builder") {
      setView("project-detail");
    }
  };

  const handleCreateProject = (name: string, description: string) => {
    const newProject: Project = {
      id: `proj_${Date.now()}`,
      name,
      description,
      clientId: `uk_live_${generateRandomKey(24)}`,
      secretKey: `sk_live_${generateRandomKey(32)}`,
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      flows: [],
    };
    setProjects([newProject, ...projects]);
    setSelectedProject(newProject);
    setView("project-detail");
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.clientId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Left Sidebar */}
      <aside className="w-60 bg-[#0a0a0a] border-r border-white/5 flex flex-col fixed h-full">
        {/* Logo */}
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <Image
              src="/icon.png"
              alt="UNTRACED"
              width={28}
              height={28}
              className="rounded-lg"
            />
            <span className="font-normal text-white text-base tracking-tight">UNTRACED</span>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveNav(item.id);
                  if (item.id === "projects") {
                    setView("projects");
                    setSelectedProject(null);
                  }
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-light transition-all",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-gray-500 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer Navigation */}
        <div className="p-3 border-t border-white/5">
          {FOOTER_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-light text-gray-500 hover:text-white hover:bg-white/5 transition-all"
              >
                <Icon className="w-4 h-4" />
                {item.label}
                <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
              </a>
            );
          })}
        </div>

        {/* User section */}
        <div className="p-3 border-t border-white/5">
          {!ready ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
            </div>
          ) : authenticated ? (
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-medium text-white">
                {user?.wallet?.address?.slice(2, 4).toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white font-normal truncate">
                  {user?.email?.address || `${user?.wallet?.address?.slice(0, 6)}...${user?.wallet?.address?.slice(-4)}`}
                </p>
                <p className="text-[10px] text-gray-500 font-light">Connected</p>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Button
              onClick={login}
              className="w-full bg-white text-black hover:bg-gray-200 text-sm font-normal h-10"
            >
              Connect Wallet
            </Button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-60">
        {view === "projects" && (
          <ProjectsView
            projects={filteredProjects}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSelectProject={handleSelectProject}
            onCreateProject={() => setView("create-project")}
            copyToClipboard={copyToClipboard}
            copiedId={copiedId}
          />
        )}

        {view === "create-project" && (
          <CreateProjectView onBack={handleBack} onSubmit={handleCreateProject} />
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
          />
        )}
      </main>
    </div>
  );
}

// Projects List View
function ProjectsView({
  projects,
  searchQuery,
  setSearchQuery,
  onSelectProject,
  onCreateProject,
  copyToClipboard,
  copiedId,
}: {
  projects: Project[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectProject: (project: Project) => void;
  onCreateProject: () => void;
  copyToClipboard: (text: string, id: string) => void;
  copiedId: string | null;
}) {
  return (
    <>
      <header className="h-14 border-b border-white/5 bg-[#0a0a0a] sticky top-0 z-40">
        <div className="h-full px-6 flex items-center justify-between">
          <h1 className="text-lg font-normal text-white">Projects</h1>
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

          {/* Project Cards */}
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
                        <span className="text-xs text-gray-500 font-light">{project.createdAt}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-500 font-light mb-1">Client ID</p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-gray-400 font-mono">
                          {project.clientId.slice(0, 12)}...
                        </code>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(project.clientId, project.id);
                          }}
                          className="p-1 rounded hover:bg-white/10 text-gray-600 hover:text-white transition-all"
                        >
                          {copiedId === project.id ? (
                            <Check className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Empty state */}
          {projects.length === 0 && (
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
}: {
  onBack: () => void;
  onSubmit: (name: string, description: string) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
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
              />
            </div>

            <Button
              type="submit"
              disabled={!isValid}
              className="w-full h-12 bg-white text-black hover:bg-gray-200 font-normal text-sm mt-6"
            >
              Create Project
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
  const [showSecret, setShowSecret] = useState(false);
  const [activeTab, setActiveTab] = useState<"flows" | "settings">("flows");

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
        {/* API Keys Section */}
        <div className="grid grid-cols-2 gap-4">
          <Card variant="bordered" className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-normal text-gray-400">Client ID</span>
              </div>
              <Badge variant="secondary" className="text-[10px]">Public</Badge>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm font-mono text-white bg-white/5 px-3 py-2 rounded-lg truncate">
                {project.clientId}
              </code>
              <button
                onClick={() => copyToClipboard(project.clientId, `${project.id}-client`)}
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
          </Card>

          <Card variant="bordered" className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-normal text-gray-400">Secret Key</span>
              </div>
              <Badge variant="destructive" className="text-[10px]">Private</Badge>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm font-mono text-white bg-white/5 px-3 py-2 rounded-lg truncate">
                {showSecret ? project.secretKey : "•".repeat(32)}
              </code>
              <button
                onClick={() => setShowSecret(!showSecret)}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 transition-all"
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={() => copyToClipboard(project.secretKey, `${project.id}-secret`)}
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
                          {flow.modules.map((module) => (
                            <Badge key={module} variant="outline" className="text-[10px] font-mono">
                              {module}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-normal text-white">{flow.verifications.toLocaleString()}</p>
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
        <Card variant="bordered" className="p-4">
          <span className="text-xs font-normal text-gray-500 block mb-3">Quick Start</span>
          <pre className="text-xs font-mono text-gray-300 bg-black/50 p-4 rounded-lg overflow-x-auto">
{`import { createClient } from "@untraced/sdk";

const untraced = createClient({
  clientId: "${project.clientId}",
});

// Open verification modal
untraced.verify({
  flow: "your_flow_name",
  onSuccess: (proof) => console.log("Verified!", proof),
});`}
          </pre>
        </Card>
      </div>
    </>
  );
}

// Flow Builder View
function FlowBuilderView({
  project,
  onBack,
}: {
  project: Project;
  onBack: () => void;
}) {
  return (
    <KYCFlowBuilder
      onBack={onBack}
      projectContext={{
        id: project.id,
        name: project.name,
        clientId: project.clientId,
      }}
    />
  );
}

// Utility
function generateRandomKey(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
