"use client";

import { useWallet } from "@/lib/use-wallet";
import { Button } from "@/components/ui/button";
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
          ? "bg-[#0a0a0a]/80 backdrop-blur-lg border-b border-white/5"
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
          <span className="font-semibold text-xl tracking-tight hidden sm:block text-white">
            UNTRACED
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="#modules"
            className="text-sm text-gray-400 hover:text-white transition-colors font-light"
          >
            Modules
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm text-gray-400 hover:text-white transition-colors font-light"
          >
            How It Works
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-gray-400 hover:text-white transition-colors font-light"
          >
            Dashboard
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {!ready ? (
            <Button variant="ghost" size="sm" disabled>
              Loading...
            </Button>
          ) : authenticated ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm font-mono text-gray-400">
                  {user?.wallet?.address
                    ? truncateAddress(user.wallet.address)
                    : user?.email?.address}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={logout} className="border-white/10 text-white hover:bg-white/5">
                Disconnect
              </Button>
            </div>
          ) : (
            <Button onClick={login} size="sm" className="bg-white text-black hover:bg-gray-200">
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </motion.header>
  );
}
