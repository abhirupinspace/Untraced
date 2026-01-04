"use client"

import { motion } from "framer-motion"
import { Marquee } from "@/components/magicui/marquee"

type Integration = {
  name: string
  description: string
}

const integrations: Integration[] = [
  { name: "Noir", description: "ZK DSL" },
  { name: "UltraHonk", description: "Proving system" },
  { name: "Mantle", description: "L2 Network" },
  { name: "EIP-712", description: "Typed signatures" },
  { name: "Privy", description: "Auth provider" },
  { name: "OAuth 2.0", description: "Auth standard" },
  { name: "viem", description: "TS library" },
  { name: "wagmi", description: "React hooks" },
]

const IntegrationBadge = ({ integration }: { integration: Integration }) => {
  return (
    <div className="flex items-center gap-3 px-5 py-3 rounded-xl border border-border/50 bg-secondary/30 hover:bg-secondary/50 transition-all">
      <span className="text-sm font-medium text-foreground">{integration.name}</span>
      <span className="text-xs text-muted-foreground/60 font-mono">{integration.description}</span>
    </div>
  )
}

export const IntegrationCarousel = () => {
  return (
    <section className="relative w-full py-24 md:py-32 overflow-hidden bg-background" id="integrations">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm text-primary font-medium tracking-wide uppercase mb-4">
            Integrations
          </p>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-foreground max-w-2xl leading-[1.1]">
              Built on standards.
              <br />
              <span className="text-muted-foreground">Works everywhere.</span>
            </h2>
            <p className="text-muted-foreground max-w-md leading-relaxed lg:text-right">
              UNTRACED integrates with the protocols and tools you already use.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Marquee */}
      <div className="relative">
        <Marquee pauseOnHover className="[--duration:30s]" gap="1rem">
          {integrations.map((integration) => (
            <IntegrationBadge key={integration.name} integration={integration} />
          ))}
        </Marquee>

        {/* Gradient overlays */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent" />
      </div>

      {/* Bottom note */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-center mt-12"
      >
        <p className="text-sm text-muted-foreground/60">
          Open source. Auditable circuits. Verifiable on-chain.
        </p>
      </motion.div>
    </section>
  )
}
