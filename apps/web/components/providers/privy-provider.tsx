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
          theme: "dark",
          accentColor: "#a855f7",
          logo: "/icon.png",
          showWalletLoginFirst: true,
        },
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
        loginMethods: ["wallet", "email", "google"],
      }}
    >
      {children}
    </Privy>
  );
}
