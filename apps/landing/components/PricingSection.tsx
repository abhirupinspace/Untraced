"use client"

import { useState, useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Check, ArrowRight, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { BorderBeam } from "@/components/magicui/border-beam"

const WEB_APP_URL = "http://localhost:3000"

type Plan = {
  name: string
  description: string
  price: { monthly: number; yearly: number }
  features: string[]
  highlighted?: boolean
  cta: string
}

const plans: Plan[] = [
  {
    name: "Developer",
    description: "Perfect for testing and small projects",
    price: { monthly: 0, yearly: 0 },
    features: [
      "zk-email module",
      "1,000 verifications/month",
      "Basic SDK access",
      "Community support",
      "Mantle Sepolia testnet",
    ],
    cta: "Start Free",
  },
  {
    name: "Production",
    description: "For teams shipping to production",
    price: { monthly: 15, yearly: 1299 },
    features: [
      "All active modules",
      "10,000 verifications/month",
      "Priority support",
      "Custom thresholds",
      "Mantle mainnet access",
      "Analytics dashboard",
    ],
    highlighted: true,
    cta: "Get Started",
  },
  {
    name: "Enterprise",
    description: "Custom solutions at scale",
    price: { monthly: 0, yearly: 0 },
    features: [
      "Unlimited verifications",
      "Custom module development",
      "Dedicated support",
      "SLA guarantees",
      "Private deployment option",
      "On-chain audit reports",
    ],
    cta: "Contact Sales",
  },
]

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  })

  // Parallax decorative elements
  const orbY = useTransform(scrollYProgress, [0, 1], [80, -80])
  const orbX = useTransform(scrollYProgress, [0, 1], [-20, 20])

  return (
    <section ref={sectionRef} className="relative w-full py-32 overflow-hidden bg-background" id="pricing">
      {/* Parallax decorative orb */}
      <motion.div
        style={{ y: orbY, x: orbX }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-800/5 rounded-full blur-[150px] pointer-events-none"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-secondary/50 text-sm text-muted-foreground mb-6">
            <span className="font-mono">{"// PRICING"}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-foreground mb-6">
            Simple, Transparent <span className="text-primary">Pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Start building with zero-knowledge verification. All plans include core protocol access.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 p-1.5 rounded-full bg-secondary/50 border border-border">
            <button
              onClick={() => setIsYearly(false)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium transition-all",
                !isYearly
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                isYearly
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Yearly
              <span className="text-xs text-primary">Save 17%</span>
            </button>
          </div>
        </motion.div>

        {/* Plans grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              <div
                className={cn(
                  "relative h-full p-8 rounded-3xl border transition-all duration-300",
                  plan.highlighted
                    ? "border-primary/50 bg-gradient-to-b from-primary/10 to-transparent"
                    : "border-border/50 bg-card/30 hover:border-border"
                )}
              >
                {plan.highlighted && (
                  <>
                    <BorderBeam size={200} duration={12} delay={0} />
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                        <Sparkles className="w-3 h-3" />
                        Most Popular
                      </span>
                    </div>
                  </>
                )}

                {/* Plan header */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-foreground mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

                  <div className="flex items-baseline gap-1">
                    {plan.price.monthly === 0 ? (
                      <span className="text-4xl font-bold text-foreground">
                        {plan.name === "Enterprise" ? "Custom" : "Free"}
                      </span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-foreground">
                          ${isYearly ? Math.floor(plan.price.yearly / 12) : plan.price.monthly}
                        </span>
                        <span className="text-muted-foreground">/month</span>
                      </>
                    )}
                  </div>
                  {plan.price.monthly > 0 && isYearly && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Billed ${plan.price.yearly} yearly
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <a
                  href={plan.name === "Enterprise" ? "#contact" : `${WEB_APP_URL}/dashboard`}
                  className={cn(
                    "flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium transition-all",
                    plan.highlighted
                      ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                      : "bg-secondary text-foreground hover:bg-secondary/80 border border-border"
                  )}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center text-sm text-muted-foreground mt-12"
        >
          All plans include access to the open-source protocol and on-chain verification.
        </motion.p>
      </div>
    </section>
  )
}
