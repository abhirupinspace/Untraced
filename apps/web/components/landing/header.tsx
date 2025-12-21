"use client";

import { useWallet } from "@/lib/use-wallet";
import { Button } from "@/components/ui/button";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { useEffect, useState } from "react";

export function Header() {
  const { ready, authenticated, login, logout, user } = useWallet();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-lg border-b border-border"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/icon.png"
            alt="Untraced Logo"
            width={40}
            height={40}
            className="rounded-xl group-hover:scale-105 transition-transform"
          />
          <span className="font-semibold text-xl tracking-tight hidden sm:block text-foreground">
            UNTRACED
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="#modules"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors font-light"
          >
            Modules
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors font-light"
          >
            How It Works
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors font-light"
          >
            Dashboard
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <AnimatedThemeToggler />
          {!ready ? (
            <Button variant="ghost" size="sm" disabled>
              Loading...
            </Button>
          ) : authenticated ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm font-mono text-muted-foreground">
                  {user?.wallet?.address
                    ? truncateAddress(user.wallet.address)
                    : user?.email?.address}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={logout} className="border-border text-foreground hover:bg-secondary">
                Disconnect
              </Button>
            </div>
          ) : (
            <Button onClick={login} size="sm" className="bg-primary text-primary-foreground hover:bg-accent">
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </motion.header>
  );
}
