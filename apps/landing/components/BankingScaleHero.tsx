"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, Database, Lock, Zap, Shield } from "lucide-react"
import { GridPattern } from "@/components/magicui/grid-pattern"
import { cn } from "@/lib/utils"

const steps = [
  {
    step: "01",
    title: "Connect",
    description: "User authenticates with OAuth provider or wallet",
    icon: Database,
    color: "#6b21a8",
  },
  {
    step: "02",
    title: "Prove",
    description: "Generate ZK proof client-side, never exposing raw data",
    icon: Lock,
    color: "#7e22ce",
  },
  {
    step: "03",
    title: "Attest",
    description: "Attester signs EIP-712 message after verification",
    icon: Shield,
    color: "#9333ea",
  },
  {
    step: "04",
    title: "Register",
    description: "Boolean result stored on-chain, identity stays private",
    icon: Zap,
    color: "#a855f7",
  },
]

const stats = [
  { value: "0", label: "PII on-chain", sublabel: "Zero identity data stored" },
  { value: "<2s", label: "Proof generation", sublabel: "Client-side UltraHonk" },
  { value: "100%", label: "Privacy preserved", sublabel: "Only boolean results" },
]

export const BankingScaleHero = () => {
  const sectionRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  })

  // Parallax for background grid
  const gridY = useTransform(scrollYProgress, [0, 1], [-50, 100])
  const gridScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.1])

  return (
    <section ref={sectionRef} className="relative w-full py-32 overflow-hidden bg-background" id="how-it-works">
      {/* Background pattern with parallax */}
      <motion.div
        style={{ y: gridY, scale: gridScale }}
        className="absolute inset-0 pointer-events-none"
      >
        <GridPattern
          width={60}
          height={60}
          x={-1}
          y={-1}
          className={cn(
            "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
            "opacity-40"
          )}
        />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-secondary/50 text-sm text-muted-foreground mb-6">
            <span className="font-mono">{"// HOW IT WORKS"}</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-foreground mb-6">
            From Data to <span className="text-primary">Boolean</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            A seamless flow that transforms sensitive credentials into verifiable claims,
            without ever exposing the underlying data.
          </p>
        </motion.div>

        {/* Process steps */}
        <div className="relative mb-24">
          {/* Connection line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent hidden lg:block" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative group"
              >
                <div className="relative p-6 rounded-2xl bg-card/50 border border-border backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:bg-card/80">
                  {/* Step number */}
                  <div
                    className="absolute -top-3 left-6 px-3 py-1 rounded-full text-xs font-mono font-bold"
                    style={{ backgroundColor: step.color, color: "#fff" }}
                  >
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 mt-2 transition-colors duration-300"
                    style={{ backgroundColor: `${step.color}20` }}
                  >
                    <step.icon className="w-6 h-6" style={{ color: step.color }} />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>

                {/* Arrow connector (hidden on last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-muted-foreground/30" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative p-8 rounded-2xl border border-border bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={cn(
                  "text-center",
                  index !== stats.length - 1 && "md:border-r md:border-border"
                )}
              >
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2 font-mono">
                  {stat.value}
                </div>
                <div className="text-base font-medium text-foreground mb-1">{stat.label}</div>
                <div className="text-sm text-muted-foreground">{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mt-12"
        >
          <a
            href="#modules"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-hover transition-colors font-medium"
          >
            Explore the verification modules
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
