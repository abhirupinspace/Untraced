"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"
import { ArrowRight, Link2, Zap, Shield, Globe, Layers } from "lucide-react"
import { GridPattern } from "@/components/magicui/grid-pattern"
import { BorderBeam } from "@/components/magicui/border-beam"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const WEB_APP_URL = "http://localhost:3000"

const supportedChains = [
  { name: "Ethereum", symbol: "ETH", color: "#627EEA" },
  { name: "BNB Chain", symbol: "BNB", color: "#F0B90B" },
  { name: "XRP Ledger", symbol: "XRP", color: "#23292F" },
  { name: "Dogecoin", symbol: "DOGE", color: "#C2A633" },
  { name: "Litecoin", symbol: "LTC", color: "#345D9D" },
  { name: "Flare", symbol: "FLR", color: "#E62058" },
  { name: "Mantle", symbol: "MNT", color: "#000000" },
]

const features = [
  {
    icon: Link2,
    title: "Cross-Chain Proofs",
    description: "Verify balances and state from any supported blockchain without exposing wallet addresses.",
  },
  {
    icon: Shield,
    title: "Flare Data Connector",
    description: "Secured by Flare Network's decentralized data infrastructure and state connector.",
  },
  {
    icon: Zap,
    title: "Unified Interface",
    description: "Same developer experience across all chains. One SDK, multiple blockchains.",
  },
]

export const CrossChainSection = () => {
  const sectionRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  // Parallax transforms
  const gridY = useTransform(scrollYProgress, [0, 1], [20, -20])
  const orbY1 = useTransform(scrollYProgress, [0, 1], [40, -60])
  const orbY2 = useTransform(scrollYProgress, [0, 1], [-30, 50])

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-24 md:py-32 overflow-hidden bg-background"
      id="cross-chain"
    >
      {/* Background Grid Pattern with Parallax */}
      <motion.div
        style={{ y: gridY }}
        className="absolute inset-0 pointer-events-none opacity-30"
      >
        <GridPattern
          width={60}
          height={60}
          x={-1}
          y={-1}
          className={cn(
            "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]"
          )}
        />
      </motion.div>

      {/* Floating parallax orbs - using purple tones for consistency */}
      <motion.div
        style={{ y: orbY1 }}
        className="absolute top-20 -left-32 w-[400px] h-[400px] bg-violet-500/8 rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div
        style={{ y: orbY2 }}
        className="absolute bottom-20 -right-32 w-[350px] h-[350px] bg-purple-600/8 rounded-full blur-[100px] pointer-events-none"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Badge variant="outline" className="px-4 py-1.5 text-xs font-medium border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5">
              <Globe className="w-3 h-3 mr-1.5" />
              Coming Soon
            </Badge>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-foreground mb-5">
            Cross-Chain <span className="text-primary">Verification</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Verify facts from any blockchain with the same privacy guarantees.
            Powered by Flare Network's Data Connector.
          </p>
        </motion.div>

        {/* Supported Chains */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-14"
        >
          <p className="text-center text-xs font-medium text-muted-foreground/60 mb-5 tracking-wider uppercase">
            Supported Chains
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {supportedChains.map((chain, index) => (
              <motion.div
                key={chain.symbol}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className={cn(
                  "flex items-center gap-2.5 px-4 py-2.5 rounded-xl",
                  "border border-border/50 bg-card/40 backdrop-blur-sm",
                  "hover:border-primary/20 hover:bg-card/60 transition-all duration-200",
                  "cursor-default"
                )}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                  style={{ backgroundColor: chain.color }}
                >
                  {chain.symbol.slice(0, 2)}
                </div>
                <span className="text-sm text-foreground/90 font-medium">
                  {chain.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="relative h-full border-border/40 bg-card/50 backdrop-blur-sm py-0 overflow-hidden group hover:border-primary/20 transition-all duration-300">
                  <BorderBeam
                    size={120}
                    duration={12}
                    delay={index * 3}
                    colorFrom="#7c3aed"
                    colorTo="#a855f7"
                    borderWidth={1}
                  />
                  <CardHeader className="pb-2 pt-6">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center mb-3",
                        "bg-gradient-to-br from-primary/10 to-accent/10",
                        "border border-primary/15",
                        "group-hover:from-primary/15 group-hover:to-accent/15 transition-all duration-300"
                      )}
                    >
                      <Icon className="w-5 h-5 text-primary/80 group-hover:text-primary transition-colors" />
                    </div>
                    <CardTitle className="text-base font-medium">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <CardDescription className="text-sm leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Protocol Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="relative border-border/40 bg-gradient-to-br from-card via-card to-primary/5 py-0 overflow-hidden">
            <BorderBeam
              size={200}
              duration={15}
              colorFrom="#7c3aed"
              colorTo="#a855f7"
              borderWidth={1}
            />
            <CardContent className="py-8 flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 border border-primary/20 flex items-center justify-center">
                  <Layers className="w-8 h-8 text-primary" />
                </div>
              </div>
              <div className="text-center md:text-left">
                <Badge variant="secondary" className="mb-2 text-[10px] tracking-wider">
                  U-CCAP
                </Badge>
                <p className="text-base text-foreground/90 leading-relaxed max-w-2xl">
                  <span className="font-medium">UNTRACED Cross-Chain Attestation Protocol</span> — A native sub-protocol
                  that extends UNTRACED verification from Web2 identity data to Web3 cross-chain state,
                  enabling privacy-preserving proofs across any supported blockchain.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-10"
        >
          <a
            href={`${WEB_APP_URL}/dashboard`}
            className={cn(
              "inline-flex items-center gap-2 text-sm font-medium",
              "text-primary/80 hover:text-primary transition-colors group"
            )}
          >
            Learn more about U-CCAP
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
