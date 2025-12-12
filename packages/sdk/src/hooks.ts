"use client";

import { useState, useEffect, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { createClient } from "./client";

const client = createClient();

interface UseUntracedResult {
  verified: boolean;
  loading: boolean;
  error: Error | null;
  verify: () => Promise<void>;
}

/**
 * React hook for single module verification
 */
export function useUntraced(moduleId: string): UseUntracedResult {
  const { user, authenticated } = usePrivy();
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const address = user?.wallet?.address;

  useEffect(() => {
    if (!authenticated || !address) {
      setLoading(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const hasAttr = await client.hasAttribute(address, moduleId);
        setVerified(hasAttr);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [address, authenticated, moduleId]);

  const verify = useCallback(async () => {
    if (!authenticated) {
      throw new Error("Not authenticated");
    }

    setLoading(true);
    setError(null);

    try {
      const proof = await client.generateProof(moduleId);
      await client.submitProof(proof);
      setVerified(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Verification failed"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authenticated, moduleId]);

  return { verified, loading, error, verify };
}

interface UseUntracedFlowResult {
  allowed: boolean;
  loading: boolean;
  error: Error | null;
  verify: () => Promise<void>;
  missingModules: string[];
}

/**
 * React hook for flow verification
 */
export function useUntracedFlow(flowName: string): UseUntracedFlowResult {
  const { user, authenticated } = usePrivy();
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [missingModules, setMissingModules] = useState<string[]>([]);

  const address = user?.wallet?.address;

  useEffect(() => {
    if (!authenticated || !address) {
      setLoading(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const isAllowed = await client.verifyFlow(flowName, address);
        setAllowed(isAllowed);
        // TODO: Get list of missing modules
        setMissingModules([]);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [address, authenticated, flowName]);

  const verify = useCallback(async () => {
    if (!authenticated) {
      throw new Error("Not authenticated");
    }

    setLoading(true);
    setError(null);

    try {
      const proofs = await client.generateFlowProof(flowName);
      await client.submitFlowProof(flowName, proofs);
      setAllowed(true);
      setMissingModules([]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Verification failed"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authenticated, flowName]);

  return { allowed, loading, error, verify, missingModules };
}
