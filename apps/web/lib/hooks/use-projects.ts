"use client";

import { useState, useEffect, useCallback } from "react";
import { useApi } from "./use-api";
import { usePrivy } from "@privy-io/react-auth";

export interface FlowStats {
  totalVerifications: number;
  successfulVerifications: number;
  failedVerifications: number;
}

export interface Flow {
  id: string;
  name: string;
  displayName: string;
  status: "draft" | "active" | "paused" | "archived";
  moduleCount: number;
  modules: Array<{
    moduleId: string;
    instanceId: string;
    order: number;
    required: boolean;
    config: Record<string, unknown>;
  }>;
  stats: FlowStats;
  createdAt: string;
  updatedAt?: string;
}

export interface ProjectStats {
  totalVerifications: number;
  successfulVerifications: number;
  failedVerifications: number;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: "active" | "paused" | "archived";
  stats: ProjectStats;
  settings: {
    defaultChainId: number;
    webhookUrl?: string;
    allowedOrigins: string[];
    customBranding?: {
      logo?: string;
      primaryColor?: string;
      companyName?: string;
    };
  };
  flows: Flow[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiKey {
  id: string;
  name: string;
  type: "publishable" | "secret";
  keyPrefix: string;
  lastFour: string;
  key?: string; // Only present on creation
  permissions: string[];
  rateLimit: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
  lastUsedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

interface ProjectsResponse {
  projects: Project[];
}

interface ProjectResponse {
  project: Project;
}

interface KeysResponse {
  keys: ApiKey[];
}

interface KeyResponse {
  key: ApiKey;
  warning?: string;
}

interface FlowResponse {
  flow: Flow;
}

export function useProjects() {
  const { authenticated } = usePrivy();
  const { get, post, patch, del } = useApi();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!authenticated) {
      setProjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await get<ProjectsResponse>(
      "/api/projects"
    );

    if (fetchError) {
      setError(fetchError);
      setProjects([]);
    } else if (data) {
      setProjects(data.projects);
    }

    setLoading(false);
  }, [authenticated, get]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = useCallback(
    async (name: string, description?: string) => {
      const { data, error: createError } = await post<ProjectResponse>(
        "/api/projects",
        { name, description }
      );

      if (createError) {
        return { project: null, error: createError };
      }

      if (data?.project) {
        setProjects((prev) => [data.project, ...prev]);
        return { project: data.project, error: null };
      }

      return { project: null, error: "Failed to create project" };
    },
    [post]
  );

  const updateProject = useCallback(
    async (
      projectId: string,
      updates: Partial<Pick<Project, "name" | "description" | "status" | "settings">>
    ) => {
      const { data, error: updateError } = await patch<ProjectResponse>(
        `/api/projects/${projectId}`,
        updates
      );

      if (updateError) {
        return { project: null, error: updateError };
      }

      if (data?.project) {
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? { ...p, ...data.project } : p))
        );
        return { project: data.project, error: null };
      }

      return { project: null, error: "Failed to update project" };
    },
    [patch]
  );

  const deleteProject = useCallback(
    async (projectId: string) => {
      const { error: deleteError } = await del(`/api/projects/${projectId}`);

      if (deleteError) {
        return { success: false, error: deleteError };
      }

      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      return { success: true, error: null };
    },
    [del]
  );

  const refreshProjects = useCallback(() => {
    return fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refreshProjects,
  };
}

export function useProject(projectId: string | null) {
  const { authenticated } = usePrivy();
  const { get } = useApi();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    if (!authenticated || !projectId) {
      setProject(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await get<ProjectResponse>(
      `/api/projects/${projectId}`
    );

    if (fetchError) {
      setError(fetchError);
      setProject(null);
    } else if (data) {
      setProject(data.project);
    }

    setLoading(false);
  }, [authenticated, projectId, get]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  return { project, loading, error, refresh: fetchProject };
}

export function useApiKeys(projectId: string | null) {
  const { authenticated } = usePrivy();
  const { get, post, del } = useApi();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    if (!authenticated || !projectId) {
      setKeys([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await get<KeysResponse>(
      `/api/projects/${projectId}/keys`
    );

    if (fetchError) {
      setError(fetchError);
      setKeys([]);
    } else if (data) {
      setKeys(data.keys);
    }

    setLoading(false);
  }, [authenticated, projectId, get]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const createKey = useCallback(
    async (name: string, type: "publishable" | "secret" = "publishable") => {
      if (!projectId) {
        return { key: null, error: "No project selected" };
      }

      const { data, error: createError } = await post<KeyResponse>(
        `/api/projects/${projectId}/keys`,
        { name, type }
      );

      if (createError) {
        return { key: null, error: createError };
      }

      if (data?.key) {
        // Add to list (without the full key for security)
        const keyForList = { ...data.key };
        delete keyForList.key;
        setKeys((prev) => [keyForList, ...prev]);
        return { key: data.key, error: null };
      }

      return { key: null, error: "Failed to create key" };
    },
    [projectId, post]
  );

  const revokeKey = useCallback(
    async (keyId: string) => {
      if (!projectId) {
        return { success: false, error: "No project selected" };
      }

      const { error: deleteError } = await del(
        `/api/projects/${projectId}/keys/${keyId}`
      );

      if (deleteError) {
        return { success: false, error: deleteError };
      }

      setKeys((prev) => prev.filter((k) => k.id !== keyId));
      return { success: true, error: null };
    },
    [projectId, del]
  );

  return { keys, loading, error, createKey, revokeKey, refresh: fetchKeys };
}

export function useFlows(projectId: string | null) {
  const { authenticated } = usePrivy();
  const { get, post, patch, del } = useApi();
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFlows = useCallback(async () => {
    if (!authenticated || !projectId) {
      setFlows([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await get<{ flows: Flow[] }>(
      `/api/projects/${projectId}/flows`
    );

    if (fetchError) {
      setError(fetchError);
      setFlows([]);
    } else if (data) {
      setFlows(data.flows);
    }

    setLoading(false);
  }, [authenticated, projectId, get]);

  useEffect(() => {
    fetchFlows();
  }, [fetchFlows]);

  const createFlow = useCallback(
    async (flowData: {
      name: string;
      displayName?: string;
      description?: string;
      modules?: Array<{
        moduleId: string;
        instanceId?: string;
        config?: Record<string, unknown>;
      }>;
      settings?: Record<string, unknown>;
    }) => {
      if (!projectId) {
        return { flow: null, error: "No project selected" };
      }

      const { data, error: createError } = await post<FlowResponse>(
        `/api/projects/${projectId}/flows`,
        flowData
      );

      if (createError) {
        return { flow: null, error: createError };
      }

      if (data?.flow) {
        setFlows((prev) => [data.flow as unknown as Flow, ...prev]);
        return { flow: data.flow, error: null };
      }

      return { flow: null, error: "Failed to create flow" };
    },
    [projectId, post]
  );

  const updateFlow = useCallback(
    async (
      flowId: string,
      updates: Partial<{
        displayName: string;
        description: string;
        modules: unknown[];
        settings: Record<string, unknown>;
        status: string;
      }>
    ) => {
      const { data, error: updateError } = await patch<FlowResponse>(
        `/api/flows/${flowId}`,
        updates
      );

      if (updateError) {
        return { flow: null, error: updateError };
      }

      if (data?.flow) {
        setFlows((prev) =>
          prev.map((f) => (f.id === flowId ? (data.flow as unknown as Flow) : f))
        );
        return { flow: data.flow, error: null };
      }

      return { flow: null, error: "Failed to update flow" };
    },
    [patch]
  );

  const deleteFlow = useCallback(
    async (flowId: string) => {
      const { error: deleteError } = await del(`/api/flows/${flowId}`);

      if (deleteError) {
        return { success: false, error: deleteError };
      }

      setFlows((prev) => prev.filter((f) => f.id !== flowId));
      return { success: true, error: null };
    },
    [del]
  );

  return {
    flows,
    loading,
    error,
    createFlow,
    updateFlow,
    deleteFlow,
    refresh: fetchFlows,
  };
}
