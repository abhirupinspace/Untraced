"use client";

import { useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";

export function useApi() {
  const { user, getAccessToken } = usePrivy();

  const fetchWithAuth = useCallback(
    async <T>(
      url: string,
      options: RequestInit = {}
    ): Promise<{ data: T | null; error: string | null }> => {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          ...(options.headers as Record<string, string>),
        };

        // Add Privy auth headers
        if (user) {
          headers["x-privy-id"] = user.id;

          // Get wallet address
          const wallet = user.wallet;
          if (wallet?.address) {
            headers["x-wallet-address"] = wallet.address;
          }

          // Get email if available
          const email = user.email?.address;
          if (email) {
            headers["x-user-email"] = email;
          }

          // Get access token for additional verification
          try {
            const token = await getAccessToken();
            if (token) {
              headers["Authorization"] = `Bearer ${token}`;
            }
          } catch {
            // Token fetch failed, continue without it
          }
        }

        const response = await fetch(url, {
          ...options,
          headers,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          return {
            data: null,
            error: errorData.error || `Request failed: ${response.status}`,
          };
        }

        const data = await response.json();
        return { data, error: null };
      } catch (err) {
        return {
          data: null,
          error: err instanceof Error ? err.message : "Unknown error",
        };
      }
    },
    [user, getAccessToken]
  );

  const get = useCallback(
    <T>(url: string) => fetchWithAuth<T>(url, { method: "GET" }),
    [fetchWithAuth]
  );

  const post = useCallback(
    <T>(url: string, body: unknown) =>
      fetchWithAuth<T>(url, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    [fetchWithAuth]
  );

  const patch = useCallback(
    <T>(url: string, body: unknown) =>
      fetchWithAuth<T>(url, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    [fetchWithAuth]
  );

  const del = useCallback(
    <T>(url: string) => fetchWithAuth<T>(url, { method: "DELETE" }),
    [fetchWithAuth]
  );

  return { get, post, patch, del, fetchWithAuth };
}
