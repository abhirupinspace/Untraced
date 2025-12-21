"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"

const WEB_APP_URL = "http://localhost:3000"

const navigationLinks = [
  { name: "How It Works", href: "#how-it-works" },
  { name: "Modules", href: "#modules" },
  { name: "Use Cases", href: "#use-cases" },
  { name: "Pricing", href: "#pricing" },
  { name: "FAQ", href: "#faq" },
]

export const PortfolioNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLinkClick = (href: string) => {
    setIsMobileMenuOpen(false)
    if (href.startsWith("#")) {
      const element = document.querySelector(href)
      element?.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: "smooth" })
            }}
            className="flex items-center gap-2.5 group"
          >
            <Image
              src="/icon.png"
              alt="UNTRACED"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="text-lg font-medium text-foreground tracking-tight">
              UNTRACED
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navigationLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleLinkClick(link.href)}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-all duration-300 rounded-lg hover:bg-secondary/50"
              >
                {link.name}
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <AnimatedThemeToggler />
            <a
              href="https://github.com/untraced"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              GitHub
            </a>
            <a
              href={`${WEB_APP_URL}/dashboard`}
              className="group inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-medium hover:bg-primary-hover transition-all duration-300 hover:shadow-[0_0_20px_rgba(107,33,168,0.35)]"
            >
              Launch App
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center gap-2">
            <AnimatedThemeToggler />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-foreground"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-background/95 backdrop-blur-xl border-b border-border/50"
          >
            <div className="px-6 py-4 space-y-1">
              {navigationLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleLinkClick(link.href)}
                  className="block w-full text-left px-4 py-3 text-base text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
                >
                  {link.name}
                </button>
              ))}
              <div className="pt-4 border-t border-border/50 mt-4 space-y-2">
                <a
                  href="https://github.com/untraced"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-3 text-base text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                >
                  GitHub
                </a>
                <a
                  href={`${WEB_APP_URL}/dashboard`}
                  className="block w-full text-center bg-primary text-primary-foreground px-4 py-3 rounded-xl text-base font-medium"
                >
                  Launch App
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
