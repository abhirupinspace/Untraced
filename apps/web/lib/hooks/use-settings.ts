"use client";

import { useState, useEffect, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useApi } from "./use-api";

export interface UserSettings {
  id: string;
  privyId: string;
  walletAddress: string;
  email?: string;
  name?: string;
  avatar?: string;
  plan: "free" | "pro" | "enterprise";
  settings: {
    defaultChainId: number;
    notifications: boolean;
    timezone: string;
  };
  createdAt: string;
}

export interface OrganizationInfo {
  id: string;
  name: string;
  slug: string;
  plan: "free" | "pro" | "enterprise";
  role: "owner" | "admin" | "developer" | "viewer";
  limits: {
    maxProjects: number;
    maxFlows: number;
    maxVerificationsPerMonth: number;
  };
  memberCount: number;
}

export interface UsageInfo {
  projects: number;
  flows: number;
  verificationsThisMonth: number;
  limits: {
    maxProjects: number;
    maxFlows: number;
    maxVerificationsPerMonth: number;
  };
}

export interface SettingsData {
  user: UserSettings;
  organization: OrganizationInfo;
  usage: UsageInfo;
}

export function useSettings() {
  const { authenticated, user } = usePrivy();
  const { get, patch } = useApi();
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!authenticated || !user?.wallet?.address) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: result, error: fetchError } = await get<SettingsData>("/api/user");

      if (fetchError || !result) {
        throw new Error(fetchError || "Failed to fetch settings");
      }

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [authenticated, user, get]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateUser = useCallback(
    async (updates: {
      name?: string;
      email?: string;
      settings?: Partial<UserSettings["settings"]>;
    }): Promise<{ success: boolean; error?: string }> => {
      if (!authenticated) {
        return { success: false, error: "Not authenticated" };
      }

      setIsSaving(true);
      try {
        const { data: result, error: patchError } = await patch<{ user: UserSettings }>(
          "/api/user",
          updates
        );

        if (patchError || !result) {
          return { success: false, error: patchError || "Update failed" };
        }

        setData((prev) =>
          prev ? { ...prev, user: result.user } : null
        );
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Unknown error",
        };
      } finally {
        setIsSaving(false);
      }
    },
    [authenticated, patch]
  );

  return {
    data,
    loading,
    error,
    isSaving,
    updateUser,
    refetch: fetchSettings,
  };
}

// Plan feature definitions
export const PLAN_FEATURES = {
  free: {
    name: "Free",
    price: 0,
    description: "For developers getting started",
    features: [
      "3 projects",
      "5 flows per project",
      "1,000 verifications/month",
      "Community support",
      "Basic analytics",
    ],
    limits: {
      maxProjects: 3,
      maxFlows: 5,
      maxVerificationsPerMonth: 1000,
    },
  },
  pro: {
    name: "Pro",
    price: 49,
    description: "For growing teams",
    features: [
      "10 projects",
      "25 flows per project",
      "25,000 verifications/month",
      "Priority support",
      "Advanced analytics",
      "Custom branding",
      "Webhooks",
    ],
    limits: {
      maxProjects: 10,
      maxFlows: 25,
      maxVerificationsPerMonth: 25000,
    },
  },
  enterprise: {
    name: "Enterprise",
    price: -1, // Custom pricing
    description: "For large organizations",
    features: [
      "Unlimited projects",
      "Unlimited flows",
      "Unlimited verifications",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
      "On-premise deployment",
      "SSO/SAML",
    ],
    limits: {
      maxProjects: -1,
      maxFlows: -1,
      maxVerificationsPerMonth: -1,
    },
  },
};
