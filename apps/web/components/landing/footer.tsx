import Link from "next/link";
import Image from "next/image";
import { GithubIcon } from "@/components/ui/icons";

export function Footer() {
  return (
    <footer className="py-16 px-6 border-t border-untraced-dark/5">
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
              <span className="font-semibold text-lg block">UNTRACED</span>
              <span className="text-xs text-untraced-dark/40 font-light">
                Zero-Knowledge Verification
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-8">
            <Link
              href="#modules"
              className="text-sm text-untraced-dark/50 hover:text-untraced-dark transition-colors font-light"
            >
              Modules
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm text-untraced-dark/50 hover:text-untraced-dark transition-colors font-light"
            >
              How It Works
            </Link>
            <Link
              href="/builder"
              className="text-sm text-untraced-dark/50 hover:text-untraced-dark transition-colors font-light"
            >
              Builder
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-untraced-dark/50 hover:text-untraced-dark transition-colors"
            >
              <GithubIcon className="w-5 h-5" />
            </a>
          </nav>

          <p className="text-sm text-untraced-dark/40 font-light">
            Built for Mantle Hackathon 2024
          </p>
        </div>
      </div>
    </footer>
  );
}
