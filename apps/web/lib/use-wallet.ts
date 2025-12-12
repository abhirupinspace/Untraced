"use client";

import { usePrivy } from "@privy-io/react-auth";

const PRIVY_CONFIGURED = !!process.env.NEXT_PUBLIC_PRIVY_APP_ID;

interface WalletState {
  ready: boolean;
  authenticated: boolean;
  user: {
    wallet?: { address: string };
    email?: { address: string };
  } | null;
  login: () => void;
  logout: () => void;
}

// Fallback hook when Privy is not configured
function useMockWallet(): WalletState {
  return {
    ready: true,
    authenticated: false,
    user: null,
    login: () => {
      console.warn("Privy not configured. Add NEXT_PUBLIC_PRIVY_APP_ID to .env.local");
      alert("Wallet connection requires Privy. Add NEXT_PUBLIC_PRIVY_APP_ID to .env.local");
    },
    logout: () => {},
  };
}

// Real Privy hook
function usePrivyWallet(): WalletState {
  const { ready, authenticated, user, login, logout } = usePrivy();

  return {
    ready,
    authenticated,
    user: user
      ? {
          wallet: user.wallet ? { address: user.wallet.address } : undefined,
          email: user.email ? { address: user.email.address } : undefined,
        }
      : null,
    login,
    logout,
  };
}

// Export the appropriate hook based on configuration
export function useWallet(): WalletState {
  if (!PRIVY_CONFIGURED) {
    return useMockWallet();
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return usePrivyWallet();
}
