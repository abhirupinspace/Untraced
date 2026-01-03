"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, Shield, Lock, Eye, EyeOff } from "lucide-react"
import { Particles } from "@/components/magicui/particles"
import { BorderBeam } from "@/components/magicui/border-beam"
import { GridPattern } from "@/components/magicui/grid-pattern"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const WEB_APP_URL = "http://localhost:3000"

const TypewriterText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [displayText, setDisplayText] = useState("")
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => {
      let i = 0
      const interval = setInterval(() => {
        if (i <= text.length) {
          setDisplayText(text.slice(0, i))
          i++
        } else {
          clearInterval(interval)
          setTimeout(() => setShowCursor(false), 1000)
        }
      }, 50)
      return () => clearInterval(interval)
    }, delay)
    return () => clearTimeout(timeout)
  }, [text, delay])

  return (
    <span className="font-mono text-primary">
      {displayText}
      {showCursor && <span className="animate-pulse">|</span>}
    </span>
  )
}

export const ProductTeaserCard = () => {
  const [revealed, setRevealed] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  })

  // Parallax transforms for different elements
  const gridY = useTransform(scrollYProgress, [0, 1], [0, 100])
  const orbY1 = useTransform(scrollYProgress, [0, 1], [0, 200])
  const orbY2 = useTransform(scrollYProgress, [0, 1], [0, 300])
  const particlesY = useTransform(scrollYProgress, [0, 1], [0, 150])
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 50])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1, 0.3])

  return (
    <section ref={sectionRef} className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-background" id="home">
      {/* Background Grid Pattern with Parallax */}
      <motion.div
        style={{ y: gridY }}
        className="absolute inset-0 pointer-events-none"
      >
        <GridPattern
          width={60}
          height={60}
          x={-1}
          y={-1}
          className={cn(
            "[mask-image:radial-gradient(800px_circle_at_center,white,transparent)]",
            "opacity-30"
          )}
        />
      </motion.div>

      {/* Background particles with parallax */}
      <motion.div style={{ y: particlesY }} className="absolute inset-0">
        <Particles
          className="absolute inset-0"
          quantity={50}
          staticity={50}
          color="#7c3aed"
          ease={100}
        />
      </motion.div>

      {/* Gradient orbs with parallax - soothing purple theme */}
      <motion.div
        style={{ y: orbY1 }}
        className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] animate-soft-pulse"
      />
      <motion.div
        style={{ y: orbY2 }}
        className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] bg-accent/8 rounded-full blur-[150px] animate-soft-pulse"
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        style={{ animationDelay: "2s", y: orbY2 }}
      />

      <motion.div style={{ y: contentY, opacity: contentOpacity }} className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center mb-8"
        >
          <Badge variant="outline" className="px-4 py-2 text-sm font-medium border-primary/30 bg-primary/5 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse mr-2" />
            Zero-Knowledge Protocol on Mantle
          </Badge>
        </motion.div>

        {/* Main headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-foreground leading-[1.1]">
            Prove Facts.
            <br />
            <span className="gradient-text">Reveal Nothing.</span>
          </h1>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg md:text-xl text-muted-foreground text-center max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          A modular zero-knowledge verification suite. Users prove claims about themselves
          without revealing identity. Smart contracts only see: <code className="text-primary font-mono px-1.5 py-0.5 bg-primary/10 rounded">true</code> or <code className="text-primary font-mono px-1.5 py-0.5 bg-primary/10 rounded">false</code>.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <Button asChild size="lg" className="rounded-full px-8 h-12 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300">
            <a href={`${WEB_APP_URL}/dashboard`} className="inline-flex items-center gap-2">
              Launch App
              <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full px-8 h-12 text-base font-medium border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300">
            <a href="#modules">
              Explore Modules
            </a>
          </Button>
        </motion.div>

        {/* Interactive Demo Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-4xl mx-auto"
        >
          <Card className="relative border-border/50 bg-card/50 backdrop-blur-xl py-0 overflow-hidden">
            <BorderBeam size={300} duration={12} delay={0} colorFrom="#7c3aed" colorTo="#a855f7" />

            {/* Demo header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-sm text-muted-foreground font-mono">verification_flow.ts</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRevealed(!revealed)}
                className="text-muted-foreground hover:text-foreground"
              >
                {revealed ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {revealed ? "Hide" : "Show"} private data
              </Button>
            </div>

            {/* Demo content */}
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Input side */}
                <div className="p-6 border-r border-border/50">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5" />
                    User's Private Data
                  </div>
                  <div className="space-y-3 font-mono text-sm">
                    <div className="flex justify-between p-3 rounded-lg bg-secondary/50 border border-border/30">
                      <span className="text-muted-foreground">email:</span>
                      <span className={revealed ? "text-foreground" : "blur-sm select-none text-muted-foreground"}>
                        {revealed ? "alice@company.com" : "••••••@••••••.com"}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 rounded-lg bg-secondary/50 border border-border/30">
                      <span className="text-muted-foreground">dob:</span>
                      <span className={revealed ? "text-foreground" : "blur-sm select-none text-muted-foreground"}>
                        {revealed ? "1995-03-15" : "••••-••-••"}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 rounded-lg bg-secondary/50 border border-border/30">
                      <span className="text-muted-foreground">balance:</span>
                      <span className={revealed ? "text-foreground" : "blur-sm select-none text-muted-foreground"}>
                        {revealed ? "142.5 ETH" : "••••• ETH"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Output side */}
                <div className="p-6 bg-gradient-to-br from-primary/5 to-transparent">
                  <div className="text-xs uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5" />
                    On-Chain Result
                  </div>
                  <div className="space-y-3 font-mono text-sm">
                    <div className="flex justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <span className="text-muted-foreground">hasEmail:</span>
                      <span className="text-green-500 font-semibold">true</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <span className="text-muted-foreground">isOver18:</span>
                      <span className="text-green-500 font-semibold">true</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <span className="text-muted-foreground">hasMinBalance:</span>
                      <span className="text-green-500 font-semibold">true</span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2 text-green-500 text-sm">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      ZK Proof verified on-chain
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-6 md:gap-8 mt-12"
        >
          {[
            { label: "Noir ZK Circuits" },
            { label: "Mantle Sepolia" },
            { label: "EIP-712 Attestations" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-5 h-5 rounded-full bg-green-500/15 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>
              <span>{item.label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
