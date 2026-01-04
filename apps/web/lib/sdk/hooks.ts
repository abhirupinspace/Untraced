"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { createWalletClient, custom, type Hex, type WalletClient } from "viem";
import { mantleSepoliaTestnet } from "viem/chains";
import { createClient, ZK_EMAIL } from "./client";
import type { Attestation, Proof, UntracedConfig } from "./types";

// Default config - can be overridden
const DEFAULT_CONFIG: Partial<UntracedConfig> = {
  chainId: 5003,
  apiUrl: "/api/attest",
};

interface UseUntracedResult {
  verified: boolean;
  loading: boolean;
  error: Error | null;
  attestation: Attestation | null;
  expiresAt: Date | null;
  verify: () => Promise<void>;
  revoke: () => Promise<void>;
}

/**
 * React hook for email verification
 * @param config Optional configuration overrides
 */
export function useUntraced(config?: Partial<UntracedConfig>): UseUntracedResult {
  const { user, authenticated, getAccessToken } = usePrivy();
  const { wallets } = useWallets();

  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [attestation, setAttestation] = useState<Attestation | null>(null);

  const mergedConfig = useMemo(() => {
    const registryAddress = config?.registryAddress ||
      (process.env.NEXT_PUBLIC_REGISTRY_ADDRESS as Hex) ||
      ("0x" as Hex);

    return {
      ...DEFAULT_CONFIG,
      ...config,
      registryAddress,
    } as UntracedConfig;
  }, [config]);

  const client = useMemo(
    () => createClient(mergedConfig),
    [mergedConfig]
  );

  const address = user?.wallet?.address as Hex | undefined;

  // Get wallet client from Privy
  const getWalletClient = useCallback(async (): Promise<WalletClient> => {
    const wallet = wallets.find((w) => w.walletClientType === "privy");
    if (!wallet) {
      throw new Error("No wallet connected");
    }

    const provider = await wallet.getEthereumProvider();

    return createWalletClient({
      chain: mantleSepoliaTestnet,
      transport: custom(provider),
      account: address,
    });
  }, [wallets, address]);

  // Check verification status on mount and when address changes
  useEffect(() => {
    if (!authenticated || !address) {
      setLoading(false);
      setVerified(false);
      setAttestation(null);
      return;
    }

    const checkStatus = async () => {
      try {
        setLoading(true);
        const hasAttr = await client.hasEmailVerification(address);
        setVerified(hasAttr);

        if (hasAttr) {
          const att = await client.getAttestation(address, ZK_EMAIL);
          setAttestation(att);
        } else {
          setAttestation(null);
        }
      } catch (err) {
        console.error("Failed to check verification status:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [address, authenticated, client]);

  // Verify email
  const verify = useCallback(async () => {
    if (!authenticated || !address) {
      throw new Error("Not authenticated");
    }

    setLoading(true);
    setError(null);

    try {
      // Get GitHub access token from Privy
      const githubAccount = user?.linkedAccounts?.find(
        (account) => account.type === "github_oauth"
      );

      if (!githubAccount) {
        throw new Error("Please link your GitHub account first");
      }

      // Get fresh access token
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Failed to get access token");
      }

      // Generate proof from API
      const proof = await client.generateProof("zk-email", accessToken, address);

      // Get wallet client and submit proof
      const walletClient = await getWalletClient();
      const result = await client.submitProof(proof, walletClient);

      // Wait for transaction
      await result.wait();

      // Update state
      setVerified(true);
      const att = await client.getAttestation(address, ZK_EMAIL);
      setAttestation(att);
    } catch (err) {
      console.error("Verification failed:", err);
      const error = err instanceof Error ? err : new Error("Verification failed");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [authenticated, address, user, client, getAccessToken, getWalletClient]);

  // Revoke attestation
  const revoke = useCallback(async () => {
    if (!authenticated || !address) {
      throw new Error("Not authenticated");
    }

    setLoading(true);
    setError(null);

    try {
      const walletClient = await getWalletClient();
      const result = await client.revokeAttestation(ZK_EMAIL, walletClient);
      await result.wait();

      setVerified(false);
      setAttestation(null);
    } catch (err) {
      console.error("Revocation failed:", err);
      const error = err instanceof Error ? err : new Error("Revocation failed");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [authenticated, address, client, getWalletClient]);

  // Calculate expiry date
  const expiresAt = useMemo(() => {
    if (!attestation || !attestation.expiry) return null;
    return new Date(attestation.expiry * 1000);
  }, [attestation]);

  return {
    verified,
    loading,
    error,
    attestation,
    expiresAt,
    verify,
    revoke,
  };
}

// Re-export for convenience
export { ZK_EMAIL, createClient };
export type { UntracedConfig, Attestation, Proof };
