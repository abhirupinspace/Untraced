"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

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
    name: "Free",
    description: "For developers getting started",
    price: { monthly: 0, yearly: 0 },
    features: [
      "3 projects",
      "1,000 verifications/month",
      "Basic SDK access",
      "Community support",
      "Mantle Sepolia testnet",
    ],
    cta: "Start Free",
  },
  {
    name: "Pro",
    description: "For teams shipping to production",
    price: { monthly: 20, yearly: 216 },
    features: [
      "Unlimited projects",
      "25,000 verifications/month",
      "All active modules",
      "Priority support",
      "Mantle mainnet access",
      "Advanced analytics",
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

  return (
    <section className="relative w-full py-32 md:py-40 overflow-hidden bg-background" id="pricing">
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="text-sm text-primary font-medium tracking-wide uppercase mb-4">
            Pricing
          </p>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-foreground max-w-2xl leading-[1.1]">
              Simple pricing.
              <br />
              <span className="text-muted-foreground">No surprises.</span>
            </h2>

            {/* Billing toggle */}
            <div className="flex items-center gap-3 p-1 rounded-full bg-secondary/50 border border-border/50 self-start lg:self-auto">
              <button
                onClick={() => setIsYearly(false)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
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
                  "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                  isYearly
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Yearly
                <span className="text-xs text-primary">-10%</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Plans grid */}
        <div className="grid md:grid-cols-3 gap-px bg-border/50 rounded-2xl overflow-hidden">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className={cn(
                "bg-background p-8 flex flex-col",
                plan.highlighted && "bg-primary/5"
              )}
            >
              {/* Plan header */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium text-foreground">{plan.name}</h3>
                  {plan.highlighted && (
                    <span className="text-xs text-primary font-medium">Popular</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

                <div className="flex items-baseline gap-1">
                  {plan.price.monthly === 0 ? (
                    <span className="text-4xl font-medium text-foreground">
                      {plan.name === "Enterprise" ? "Custom" : "Free"}
                    </span>
                  ) : (
                    <>
                      <span className="text-4xl font-medium text-foreground">
                        ${isYearly ? Math.floor(plan.price.yearly / 12) : plan.price.monthly}
                      </span>
                      <span className="text-muted-foreground">/mo</span>
                    </>
                  )}
                </div>
                {plan.price.monthly > 0 && isYearly && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Billed ${plan.price.yearly}/year
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href={plan.name === "Enterprise" ? "mailto:hello@untraced.io" : `${WEB_APP_URL}/dashboard`}
                className={cn(
                  "flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium transition-all",
                  plan.highlighted
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                )}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center text-sm text-muted-foreground/60 mt-12"
        >
          All plans include open-source protocol access and on-chain verification.
        </motion.p>
      </div>
    </section>
  )
}
