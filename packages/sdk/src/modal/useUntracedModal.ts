"use client";

import { useCallback } from "react";
import { useUntracedContext } from "./context";
import type { VerificationModule, VerificationResult } from "./types";

export interface UseUntracedModalReturn {
  /** Whether the modal is currently open */
  isOpen: boolean;
  /** Whether a wallet is connected */
  isConnected: boolean;
  /** The connected wallet address */
  userAddress: string | null;
  /** Current verification status */
  status: "idle" | "connecting" | "verifying" | "submitting" | "success" | "error";
  /** The currently selected module */
  currentModule: VerificationModule | null;
  /** The result of the last verification */
  verificationResult: VerificationResult | null;
  /** Any error that occurred */
  error: Error | null;
  /** Open the modal, optionally pre-selecting a module */
  open: (module?: VerificationModule) => void;
  /** Close the modal */
  close: () => void;
  /** Verify a specific module with optional configuration */
  verify: (module: VerificationModule, options?: Record<string, unknown>) => Promise<VerificationResult>;
  /** Reset the modal state */
  reset: () => void;
  /** Check if a specific module is available */
  isModuleAvailable: (module: VerificationModule) => boolean;
}

/**
 * Hook to control the Untraced verification modal
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { open, isConnected, verificationResult } = useUntracedModal();
 *
 *   return (
 *     <button onClick={() => open()}>
 *       {verificationResult ? "Verified ✓" : "Verify Identity"}
 *     </button>
 *   );
 * }
 * ```
 */
export function useUntracedModal(): UseUntracedModalReturn {
  const context = useUntracedContext();

  const isModuleAvailable = useCallback(
    (module: VerificationModule): boolean => {
      const allowedModules = context.config?.modules || [
        "zk-email",
        "zk-age",
        "zk-github",
        "zk-twitter",
        "zk-balance",
      ];
      return allowedModules.includes(module);
    },
    [context.config?.modules]
  );

  return {
    isOpen: context.isOpen,
    isConnected: context.isConnected,
    userAddress: context.userAddress,
    status: context.status,
    currentModule: context.currentModule,
    verificationResult: context.verificationResult,
    error: context.error,
    open: context.open,
    close: context.close,
    verify: context.verify,
    reset: context.reset,
    isModuleAvailable,
  };
}
