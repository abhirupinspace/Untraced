"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from "react";
import type { Hex } from "viem";
import type {
  UntracedConfig,
  UntracedContextValue,
  VerificationModule,
  VerificationResult,
  VerificationStatus,
} from "./types";
import { authenticate, type OAuthProvider } from "./oauth";
import { AVAILABLE_MODULES } from "./types";

const UntracedContext = createContext<UntracedContextValue | null>(null);

interface UntracedProviderProps {
  children: ReactNode;
  config: UntracedConfig;
}

export function UntracedProvider({ children, config }: UntracedProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<Hex | null>(null);
  const [status, setStatus] = useState<VerificationStatus>("idle");
  const [currentModule, setCurrentModule] = useState<VerificationModule | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Merge config with defaults
  const mergedConfig = useMemo(
    () => ({
      apiUrl: "/api",
      chainId: 5003,
      theme: "dark" as const,
      accentColor: "#a855f7",
      modules: ["zk-email", "zk-age", "zk-github", "zk-twitter", "zk-balance"] as VerificationModule[],
      ...config,
    }),
    [config]
  );

  // Check for existing wallet connection
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length > 0) {
            setIsConnected(true);
            setUserAddress(accounts[0] as Hex);
          }
        } catch {
          // Not connected
        }
      }
    };
    checkConnection();
  }, []);

  const open = useCallback((module?: VerificationModule) => {
    setIsOpen(true);
    setStatus("idle");
    setError(null);
    if (module) {
      setCurrentModule(module);
    }
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setCurrentModule(null);
    setStatus("idle");
    setError(null);
    mergedConfig.onClose?.();
  }, [mergedConfig]);

  const reset = useCallback(() => {
    setStatus("idle");
    setCurrentModule(null);
    setVerificationResult(null);
    setError(null);
  }, []);

  const connectWallet = useCallback(async (): Promise<Hex> => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      throw new Error("No wallet detected. Please install MetaMask or another wallet.");
    }

    setStatus("connecting");

    try {
      const accounts = await (window as any).ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const address = accounts[0] as Hex;
      setIsConnected(true);
      setUserAddress(address);
      return address;
    } catch (err: any) {
      throw new Error(err.message || "Failed to connect wallet");
    }
  }, []);

  const verify = useCallback(
    async (
      module: VerificationModule,
      options: Record<string, unknown> = {}
    ): Promise<VerificationResult> => {
      setCurrentModule(module);
      setError(null);

      try {
        // Ensure wallet is connected
        let address = userAddress;
        if (!address) {
          address = await connectWallet();
        }

        // Check if module requires OAuth
        const moduleConfig = AVAILABLE_MODULES.find((m) => m.id === module);
        let accessToken: string | undefined;

        if (moduleConfig?.requiresOAuth && moduleConfig.oauthProvider) {
          setStatus("verifying");
          try {
            // Start OAuth flow
            accessToken = await authenticate(
              moduleConfig.oauthProvider as OAuthProvider,
              mergedConfig.apiUrl || "/api"
            );
          } catch (oauthError: any) {
            throw new Error(
              oauthError.message || `${moduleConfig.oauthProvider} authentication failed`
            );
          }
        } else {
          setStatus("verifying");
        }

        // Build request based on module type
        const endpoint = `${mergedConfig.apiUrl}/attest/${module.replace("zk-", "")}`;

        // Use timestamp-based nonce for better security and uniqueness
        const nonce = Date.now();

        const requestBody: Record<string, unknown> = {
          userAddress: address,
          nonce,
          ...options,
        };

        // Add OAuth token if present
        if (accessToken) {
          if (moduleConfig?.oauthProvider === "github") {
            requestBody.githubAccessToken = accessToken;
          } else if (moduleConfig?.oauthProvider === "twitter") {
            requestBody.twitterAccessToken = accessToken;
          }
        }

        // Make attestation request
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-client-id": mergedConfig.clientId,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Verification failed: ${response.status}`);
        }

        const data = await response.json();

        const result: VerificationResult = {
          moduleId: module,
          userAddress: address,
          attestation: data.attestation,
          verificationId: data.verificationId,
          verified: true,
        };

        setVerificationResult(result);
        setStatus("success");
        mergedConfig.onSuccess?.(result);

        return result;
      } catch (err: any) {
        const error = err instanceof Error ? err : new Error("Verification failed");
        setError(error);
        setStatus("error");
        mergedConfig.onError?.(error);
        throw error;
      }
    },
    [userAddress, connectWallet, mergedConfig]
  );

  const contextValue = useMemo<UntracedContextValue>(
    () => ({
      config: mergedConfig,
      isOpen,
      isConnected,
      userAddress,
      status,
      currentModule,
      verificationResult,
      error,
      open,
      close,
      verify,
      reset,
    }),
    [
      mergedConfig,
      isOpen,
      isConnected,
      userAddress,
      status,
      currentModule,
      verificationResult,
      error,
      open,
      close,
      verify,
      reset,
    ]
  );

  return (
    <UntracedContext.Provider value={contextValue}>
      {children}
    </UntracedContext.Provider>
  );
}

export function useUntracedContext(): UntracedContextValue {
  const context = useContext(UntracedContext);
  if (!context) {
    throw new Error("useUntracedContext must be used within an UntracedProvider");
  }
  return context;
}
