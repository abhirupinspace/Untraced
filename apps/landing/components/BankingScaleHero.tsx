"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight } from "lucide-react"

const steps = [
  {
    number: "01",
    title: "Connect",
    description: "OAuth, wallet, or API. Your data stays local.",
  },
  {
    number: "02",
    title: "Prove",
    description: "ZK proof generated on your device. Nothing leaves.",
  },
  {
    number: "03",
    title: "Attest",
    description: "Cryptographic signature. Immutable. Private.",
  },
  {
    number: "04",
    title: "Verified",
    description: "On-chain boolean. Your identity? Never stored.",
  },
]

export const BankingScaleHero = () => {
  const sectionRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  const lineWidth = useTransform(scrollYProgress, [0.1, 0.5], ["0%", "100%"])

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-32 md:py-40 overflow-hidden bg-background"
      id="how-it-works"
    >
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-20 md:mb-28"
        >
          <p className="text-sm text-primary font-medium tracking-wide uppercase mb-4">
            How it works
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-foreground max-w-3xl leading-[1.1]">
            Four steps from <span className="italic text-muted-foreground">private data</span> to{" "}
            <span className="text-primary">public proof</span>.
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Animated line */}
          <div className="absolute left-0 top-0 w-full h-px bg-border/30 hidden md:block">
            <motion.div
              style={{ width: lineWidth }}
              className="h-full bg-primary/50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 pt-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                }}
                className="relative"
              >
                {/* Step dot on line */}
                <div className="absolute -top-12 left-0 hidden md:block -translate-y-1/2">
                  <div className="w-3 h-3 rounded-full bg-background border-2 border-primary" />
                </div>

                {/* Number */}
                <span className="text-6xl md:text-7xl font-light text-muted-foreground/20 tracking-tighter leading-none">
                  {step.number}
                </span>

                {/* Content */}
                <div className="mt-4 space-y-3">
                  <h3 className="text-xl font-medium text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-20 md:mt-28"
        >
          <a
            href="#modules"
            className="inline-flex items-center gap-3 text-base font-medium text-foreground hover:text-primary transition-colors group"
          >
            <span>See what you can verify</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
