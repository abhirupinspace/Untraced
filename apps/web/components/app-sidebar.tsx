"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar, SidebarBody, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  FolderKanban,
  BarChart3,
  Settings,
  BookOpen,
  ExternalLink,
  LogOut,
  Loader2,
  Play,
} from "lucide-react";
import { useWallet } from "@/lib/use-wallet";
import { Button } from "@/components/ui/button";

// Sidebar navigation items
const sidebarLinks = [
  {
    name: "Projects",
    href: "/dashboard",
    icon: "FolderKanban",
  },
  {
    name: "Playground",
    href: "/dashboard/playground",
    icon: "Play",
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: "BarChart3",
    label: "Beta",
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: "Settings",
  },
];

const footerLinks = [
  {
    name: "Documentation",
    href: "https://docs.untraced.io",
    icon: "BookOpen",
    external: true,
  },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FolderKanban,
  BarChart3,
  Settings,
  BookOpen,
  Play,
};

const getIcon = (iconName: string) => {
  const IconComponent = iconMap[iconName];
  return IconComponent ? <IconComponent className="w-5 h-5" /> : null;
};

const getBadgeVariant = (label: string) => {
  const labelLower = label.toLowerCase();
  if (labelLower === "beta") return "bg-yellow-300/20 text-yellow-300 border-transparent";
  if (labelLower === "coming soon") return "bg-white/10 text-white/50 border-transparent";
  return "bg-white/10 text-white/60 border-transparent";
};

interface SidebarLinkItemProps {
  link: {
    name: string;
    href: string;
    icon: string;
    label?: string;
    sublinks?: Array<{
      name: string;
      href: string;
      icon?: string;
      label?: string;
    }>;
  };
  idx: number;
  pathname: string;
  expandedItems: number[];
  setExpandedItems: React.Dispatch<React.SetStateAction<number[]>>;
}

function SidebarLinkItem({
  link,
  idx,
  pathname,
  expandedItems,
  setExpandedItems,
}: SidebarLinkItemProps) {
  const { open, animate } = useSidebar();
  const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
  const isExpanded = expandedItems.includes(idx);
  const hasSublinks = link.sublinks && link.sublinks.length > 0;

  const handleMouseEnter = () => {
    if (hasSublinks && open) {
      setExpandedItems((prev) => (prev.includes(idx) ? prev : [...prev, idx]));
    }
  };

  const handleMouseLeave = () => {
    if (hasSublinks && open) {
      setExpandedItems((prev) => prev.filter((id) => id !== idx));
    }
  };

  if (!hasSublinks) {
    return (
      <Link
        href={link.href}
        className={cn(
          "flex items-center justify-start gap-3 w-full group/sidebar py-2.5 px-2 rounded-lg transition-all",
          isActive ? "bg-white/10 text-white" : "text-white/50 hover:text-white hover:bg-white/5"
        )}
      >
        <span className="flex-shrink-0">{link.icon && getIcon(link.icon)}</span>
        <motion.span
          animate={{
            display: animate ? (open ? "flex" : "none") : "flex",
            opacity: animate ? (open ? 1 : 0) : 1,
          }}
          className={cn(
            "flex-1 flex items-center justify-between text-sm font-light group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre !p-0 !m-0"
          )}
        >
          <span>{link.name}</span>
          {link.label && (
            <Badge className={cn("text-[10px] font-light ml-2", getBadgeVariant(link.label))}>
              {link.label}
            </Badge>
          )}
        </motion.span>
      </Link>
    );
  }

  return (
    <div
      className="space-y-1"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={link.href}
        className={cn(
          "flex items-center justify-start gap-3 w-full group/sidebar py-2.5 px-2 rounded-lg transition-all",
          isActive ? "bg-white/10 text-white" : "text-white/50 hover:text-white hover:bg-white/5"
        )}
      >
        <span className="flex-shrink-0">{link.icon && getIcon(link.icon)}</span>
        <motion.span
          animate={{
            display: animate ? (open ? "inline-block" : "none") : "inline-block",
            opacity: animate ? (open ? 1 : 0) : 1,
          }}
          className={cn(
            "flex items-center gap-2 text-sm font-light group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre !p-0 !m-0"
          )}
        >
          {link.name}
          {link.label && (
            <Badge className={cn("text-[10px] font-light", getBadgeVariant(link.label))}>
              {link.label}
            </Badge>
          )}
        </motion.span>
        {open && hasSublinks && (
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="ml-auto"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        )}
      </Link>

      <AnimatePresence>
        {isExpanded && open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="space-y-1 ml-6 overflow-hidden"
          >
            {link.sublinks?.map((sublink, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Link
                  href={sublink.href}
                  className={cn(
                    "flex items-center gap-2 w-full py-1.5 px-2 text-sm rounded-md transition-colors duration-200",
                    pathname === sublink.href
                      ? "text-white bg-white/5"
                      : "text-white/40 hover:text-white/70 hover:bg-white/5"
                  )}
                >
                  {sublink.icon && getIcon(sublink.icon)}
                  <span>{sublink.name}</span>
                  {sublink.label && (
                    <Badge className={cn("text-[10px] font-light", getBadgeVariant(sublink.label))}>
                      {sublink.label}
                    </Badge>
                  )}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FooterLinkItem({
  link,
}: {
  link: { name: string; href: string; icon: string; external?: boolean };
}) {
  const { open, animate } = useSidebar();

  const LinkContent = (
    <>
      <span className="flex-shrink-0">{link.icon && getIcon(link.icon)}</span>
      <motion.span
        animate={{
          display: animate ? (open ? "flex" : "none") : "flex",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="flex-1 flex items-center justify-between text-sm font-light whitespace-pre"
      >
        <span>{link.name}</span>
        {link.external && open && (
          <ExternalLink className="w-3 h-3 opacity-50" />
        )}
      </motion.span>
    </>
  );

  if (link.external) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-start gap-3 w-full py-2.5 px-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all"
      >
        {LinkContent}
      </a>
    );
  }

  return (
    <Link
      href={link.href}
      className="flex items-center justify-start gap-3 w-full py-2.5 px-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all"
    >
      {LinkContent}
    </Link>
  );
}

function UserSection() {
  const { open, animate } = useSidebar();
  const { ready, authenticated, login, logout, user } = useWallet();

  if (!ready) {
    return (
      <div className="flex items-center justify-center py-2">
        <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <motion.div
        animate={{
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
      >
        {open ? (
          <Button
            onClick={login}
            className="w-full bg-white text-black hover:bg-gray-200 text-sm font-normal h-10"
          >
            Connect Wallet
          </Button>
        ) : (
          <button
            onClick={login}
            className="w-full flex items-center justify-center p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-[10px] font-medium text-white">?</span>
            </div>
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-2 py-2">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-medium text-white flex-shrink-0">
        {user?.wallet?.address?.slice(2, 4).toUpperCase() || "U"}
      </div>
      <motion.div
        animate={{
          display: animate ? (open ? "flex" : "none") : "flex",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="flex-1 min-w-0 flex items-center"
      >
        <div className="flex-1 min-w-0">
          <p className="text-xs text-white font-normal truncate">
            {user?.email?.address ||
              `${user?.wallet?.address?.slice(0, 6)}...${user?.wallet?.address?.slice(-4)}`}
          </p>
          <p className="text-[10px] text-gray-500 font-light">Connected</p>
        </div>
        <button
          onClick={logout}
          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-all"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
}

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  return (
    <div
      className={cn(
        "mx-auto flex w-full h-screen flex-1 flex-col overflow-hidden md:flex-row bg-[#0a0a0a]"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-6 border-r border-white/5">
          {/* Logo */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2.5 px-2 py-1">
              <Image
                src="/icon.png"
                alt="UNTRACED"
                width={28}
                height={28}
                className="rounded-lg flex-shrink-0"
              />
              <motion.span
                animate={{
                  display: open ? "inline-block" : "none",
                  opacity: open ? 1 : 0,
                }}
                className="font-normal text-white text-base tracking-tight whitespace-pre"
              >
                UNTRACED
              </motion.span>
            </Link>

            {/* Main Navigation */}
            <nav className="flex flex-col gap-1">
              {sidebarLinks.map((link, idx) => (
                <SidebarLinkItem
                  key={idx}
                  link={link}
                  idx={idx}
                  pathname={pathname}
                  expandedItems={expandedItems}
                  setExpandedItems={setExpandedItems}
                />
              ))}
            </nav>
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-2">
            {/* Footer Links */}
            <div className="border-t border-white/5 pt-3">
              {footerLinks.map((link, idx) => (
                <FooterLinkItem key={idx} link={link} />
              ))}
            </div>

            {/* User Section */}
            <div className="border-t border-white/5 pt-3">
              <UserSection />
            </div>
          </div>
        </SidebarBody>
      </Sidebar>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
