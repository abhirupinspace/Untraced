"use client";

import { PrivyProvider as Privy } from "@privy-io/react-auth";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  // If no Privy App ID is configured, render children without Privy
  // This allows development without a Privy account
  if (!PRIVY_APP_ID) {
    return <>{children}</>;
  }

  return (
    <Privy
      appId={PRIVY_APP_ID}
      config={{
        appearance: {
          theme: "light",
          accentColor: "#3d0040",
          logo: "/logo.svg",
        },
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
        loginMethods: ["email", "wallet", "google"],
      }}
    >
      {children}
    </Privy>
  );
}
