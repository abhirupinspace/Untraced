"use client";

import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useWallet } from "@/lib/use-wallet";
import { Loader2 } from "lucide-react";

interface DashboardNavbarProps {
  title?: string;
  children?: React.ReactNode;
  className?: string;
}

export function DashboardNavbar({ title, children, className }: DashboardNavbarProps) {
  const { ready, authenticated, login, logout, user } = useWallet();

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header
      className={cn(
        "h-14 border-b border-border bg-header backdrop-blur-xl sticky top-0 z-40",
        className
      )}
    >
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {title && <h1 className="text-lg font-medium text-foreground">{title}</h1>}
          {children}
        </div>

        <div className="flex items-center gap-3">
          <AnimatedThemeToggler />

          {!ready ? (
            <Button variant="ghost" size="sm" disabled className="h-8">
              <Loader2 className="w-4 h-4 animate-spin" />
            </Button>
          ) : authenticated ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary border border-border">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span className="text-xs font-mono text-muted-foreground">
                  {user?.wallet?.address
                    ? truncateAddress(user.wallet.address)
                    : user?.email?.address}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="h-8 text-xs border-border text-foreground hover:bg-secondary"
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <Button
              onClick={login}
              size="sm"
              className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
