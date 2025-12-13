"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useCallback, useMemo } from "react";

const PRIVY_CONFIGURED = !!process.env.NEXT_PUBLIC_PRIVY_APP_ID;

interface WalletState {
  ready: boolean;
  authenticated: boolean;
  connecting: boolean;
  user: {
    wallet?: { address: string };
    email?: { address: string };
  } | null;
  login: () => void;
  logout: () => Promise<void>;
}

// Fallback hook when Privy is not configured
function useMockWallet(): WalletState {
  return {
    ready: true,
    authenticated: false,
    connecting: false,
    user: null,
    login: () => {
      console.warn("Privy not configured. Add NEXT_PUBLIC_PRIVY_APP_ID to .env.local");
      // Show a toast or alert instead of blocking alert
      if (typeof window !== "undefined") {
        const event = new CustomEvent("privy-not-configured");
        window.dispatchEvent(event);
      }
    },
    logout: async () => {},
  };
}

// Real Privy hook
function usePrivyWallet(): WalletState {
  const { ready, authenticated, user, login, logout, connectWallet } = usePrivy();

  const handleLogin = useCallback(() => {
    login();
  }, [login]);

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  const walletUser = useMemo(() => {
    if (!user) return null;
    return {
      wallet: user.wallet ? { address: user.wallet.address } : undefined,
      email: user.email ? { address: user.email.address } : undefined,
    };
  }, [user]);

  return {
    ready,
    authenticated,
    connecting: !ready,
    user: walletUser,
    login: handleLogin,
    logout: handleLogout,
  };
}

// Export the appropriate hook based on configuration
export function useWallet(): WalletState {
  if (!PRIVY_CONFIGURED) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useMockWallet();
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return usePrivyWallet();
}
