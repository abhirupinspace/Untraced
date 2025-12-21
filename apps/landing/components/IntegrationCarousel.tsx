"use client"

import { motion } from "framer-motion"
import { Marquee } from "@/components/magicui/marquee"
import { cn } from "@/lib/utils"

type Integration = {
  name: string
  description: string
  icon: string
  category: "protocol" | "provider" | "chain"
}

const integrations: Integration[] = [
  { name: "Noir", description: "ZK DSL", icon: "◆", category: "protocol" },
  { name: "UltraHonk", description: "Proving system", icon: "⚡", category: "protocol" },
  { name: "Mantle", description: "L2 Network", icon: "▲", category: "chain" },
  { name: "EIP-712", description: "Typed signatures", icon: "✍", category: "protocol" },
  { name: "Privy", description: "Auth provider", icon: "🔐", category: "provider" },
  { name: "OAuth 2.0", description: "Auth standard", icon: "🔗", category: "provider" },
  { name: "viem", description: "TS library", icon: "⬡", category: "protocol" },
  { name: "wagmi", description: "React hooks", icon: "⚛", category: "protocol" },
]

const verificationTypes = [
  { name: "Email", icon: "✉", color: "#6b21a8" },
  { name: "Age", icon: "📅", color: "#7e22ce" },
  { name: "Balance", icon: "💰", color: "#9333ea" },
  { name: "GitHub", icon: "⌘", color: "#a855f7" },
  { name: "Twitter", icon: "𝕏", color: "#c084fc" },
  { name: "Country", icon: "🌍", color: "#d8b4fe" },
  { name: "KYC", icon: "🛡", color: "#9333ea" },
  { name: "Aadhaar", icon: "🪪", color: "#a855f7" },
]

const IntegrationCard = ({ integration }: { integration: Integration }) => {
  return (
    <div className={cn(
      "relative flex items-center gap-3 px-5 py-3 rounded-xl",
      "bg-card/50 border border-border/50 backdrop-blur-sm",
      "hover:border-primary/30 hover:bg-card/80 transition-all duration-300",
      "cursor-default select-none"
    )}>
      <span className="text-xl">{integration.icon}</span>
      <div>
        <div className="text-sm font-medium text-foreground">{integration.name}</div>
        <div className="text-xs text-muted-foreground">{integration.description}</div>
      </div>
    </div>
  )
}

const VerificationBadge = ({ item }: { item: typeof verificationTypes[0] }) => {
  return (
    <div className={cn(
      "flex items-center gap-2 px-4 py-2 rounded-full",
      "border border-border/50 backdrop-blur-sm",
      "hover:scale-105 transition-transform duration-300",
      "cursor-default select-none"
    )}
    style={{ backgroundColor: `${item.color}15`, borderColor: `${item.color}30` }}
    >
      <span className="text-base">{item.icon}</span>
      <span className="text-sm font-medium" style={{ color: item.color }}>{item.name}</span>
    </div>
  )
}

export const IntegrationCarousel = () => {
  return (
    <section className="relative w-full py-24 overflow-hidden bg-background" id="integrations">
      {/* Section header */}
      <div className="max-w-4xl mx-auto px-6 text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-secondary/50 text-sm text-muted-foreground mb-6">
            <span className="font-mono">{"// POWERED BY"}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-foreground mb-4">
            Built on Industry Standards
          </h2>
          <p className="text-lg text-muted-foreground">
            UNTRACED integrates with the protocols and tools you trust.
          </p>
        </motion.div>
      </div>

      {/* Verification types marquee */}
      <div className="relative mb-12">
        <Marquee pauseOnHover className="[--duration:30s]" gap="1rem">
          {verificationTypes.map((item) => (
            <VerificationBadge key={item.name} item={item} />
          ))}
        </Marquee>

        {/* Gradient overlays */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent" />
      </div>

      {/* Integrations marquee - reverse direction */}
      <div className="relative">
        <Marquee pauseOnHover reverse className="[--duration:40s]" gap="1rem">
          {integrations.map((integration) => (
            <IntegrationCard key={integration.name} integration={integration} />
          ))}
        </Marquee>

        {/* Gradient overlays */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent" />
      </div>

      {/* Bottom text */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-center mt-12"
      >
        <p className="text-sm text-muted-foreground">
          Open source protocol. Auditable circuits. Verifiable on-chain.
        </p>
      </motion.div>
    </section>
  )
}
