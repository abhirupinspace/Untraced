import Link from "next/link";
import Image from "next/image";
import { GithubIcon } from "@/components/ui/icons";

export function Footer() {
  return (
    <footer className="py-16 px-6 border-t border-border bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <Image
              src="/icon.png"
              alt="Untraced Logo"
              width={40}
              height={40}
              className="rounded-xl"
            />
            <div>
              <span className="font-semibold text-lg block text-foreground">UNTRACED</span>
              <span className="text-xs text-muted-foreground font-light">
                Zero-Knowledge Verification
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-8">
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
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <GithubIcon className="w-5 h-5" />
            </a>
          </nav>

          <p className="text-sm text-muted-foreground font-light">
            Built for Mantle Hackathon 2025
          </p>
        </div>
      </div>
    </footer>
  );
}
