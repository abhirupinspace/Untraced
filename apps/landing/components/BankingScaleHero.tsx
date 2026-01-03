"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, Fingerprint, Lock, ShieldCheck, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { GridPattern } from "@/components/magicui/grid-pattern"
import { BorderBeam } from "@/components/magicui/border-beam"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

const steps = [
  {
    id: "connect",
    title: "Authenticate",
    subtitle: "OAuth or Wallet",
    description: "Connect your identity source securely. Your credentials never leave your device.",
    icon: Fingerprint,
  },
  {
    id: "prove",
    title: "Generate Proof",
    subtitle: "Client-side ZK",
    description: "A cryptographic proof is created locally. The raw data stays with you.",
    icon: Lock,
  },
  {
    id: "attest",
    title: "Verify & Sign",
    subtitle: "EIP-712 Attestation",
    description: "The proof is validated and signed. Only the boolean result is recorded.",
    icon: ShieldCheck,
  },
  {
    id: "complete",
    title: "On-Chain",
    subtitle: "Privacy Preserved",
    description: "Your verification lives on-chain. Your identity doesn't.",
    icon: CheckCircle2,
  },
]


export const BankingScaleHero = () => {
  const sectionRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  // Subtle parallax for background elements
  const gridY = useTransform(scrollYProgress, [0, 1], [-30, 30])
  const gridOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.3, 0.5, 0.5, 0.3])

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-24 md:py-32 overflow-hidden bg-background"
      id="how-it-works"
    >
      {/* Background Grid Pattern with Parallax */}
      <motion.div
        style={{ y: gridY, opacity: gridOpacity }}
        className="absolute inset-0 pointer-events-none"
      >
        <GridPattern
          width={50}
          height={50}
          x={-1}
          y={-1}
          className={cn(
            "[mask-image:radial-gradient(700px_circle_at_center,white,transparent)]"
          )}
        />
      </motion.div>

      {/* Ambient gradient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] animate-soft-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-[350px] h-[350px] bg-accent/5 rounded-full blur-[80px] animate-soft-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16 md:mb-20"
        >
          <Badge variant="outline" className="mb-4 px-4 py-1.5 text-xs font-medium border-primary/20 text-primary/90">
            How It Works
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-foreground mb-5">
            From identity to <span className="text-primary">boolean</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Four steps separate your private data from a verifiable on-chain claim.
            At no point does your identity leave your control.
          </p>
        </motion.div>

        {/* Timeline Flow */}
        <div className="relative mb-12">
          {/* Connecting line - desktop only */}
          <div className="hidden lg:block absolute top-[52px] left-[calc(12.5%+36px)] right-[calc(12.5%+36px)] h-px">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="relative group"
                >
                  <Card className="relative border-border/40 bg-card/50 backdrop-blur-sm py-0 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 overflow-hidden">
                    <BorderBeam
                      size={150}
                      duration={10}
                      delay={index * 2}
                      colorFrom="#7c3aed"
                      colorTo="#a855f7"
                      borderWidth={1}
                    />
                    <CardContent className="pt-8 pb-6 flex flex-col items-center text-center">
                      {/* Step indicator */}
                      <div className="relative mb-5">
                        <div
                          className={cn(
                            "w-16 h-16 rounded-2xl flex items-center justify-center",
                            "bg-gradient-to-br from-primary/10 to-accent/10",
                            "border border-primary/20",
                            "transition-all duration-300",
                            "group-hover:from-primary/15 group-hover:to-accent/15"
                          )}
                        >
                          <Icon className="w-7 h-7 text-primary/80 group-hover:text-primary transition-colors" />
                        </div>
                        {/* Step number badge */}
                        <Badge className="absolute -top-2 -right-2 h-6 w-6 p-0 flex items-center justify-center text-[10px] font-bold">
                          {index + 1}
                        </Badge>
                      </div>

                      {/* Content */}
                      <div className="space-y-2">
                        <h3 className="text-base font-medium text-foreground">{step.title}</h3>
                        <p className="text-[11px] font-medium text-primary/60 tracking-wider uppercase">
                          {step.subtitle}
                        </p>
                        <p className="text-sm text-muted-foreground/80 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Arrow between steps - hidden on last */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:flex absolute top-[52px] -right-3 z-20">
                      <div className="w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center">
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center"
        >
          <a
            href="#modules"
            className={cn(
              "inline-flex items-center gap-2 text-sm font-medium",
              "text-primary/80 hover:text-primary transition-colors group"
            )}
          >
            Explore verification modules
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
