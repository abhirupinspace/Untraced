"use client"

import { motion } from "framer-motion"
import { ArrowRight, ArrowUpRight } from "lucide-react"

const WEB_APP_URL = "https://untraced-web.vercel.app"

const modules = [
  {
    id: "zk-email",
    name: "Email",
    code: "zk-email",
    description: "Prove ownership without revealing the address.",
    status: "live",
  },
  {
    id: "zk-age",
    name: "Age",
    code: "zk-age",
    description: "Prove you meet age requirements. DOB stays private.",
    status: "live",
  },
  {
    id: "zk-balance",
    name: "Balance",
    code: "zk-balance",
    description: "Prove wallet balance thresholds. Exact amount hidden.",
    status: "live",
  },
  {
    id: "zk-github",
    name: "GitHub",
    code: "zk-github",
    description: "Prove account ownership and contribution history.",
    status: "live",
  },
  {
    id: "zk-country",
    name: "Residency",
    code: "zk-country",
    description: "Prove you're in allowed regions. Location stays yours.",
    status: "soon",
  },
  {
    id: "zk-aadhar",
    name: "Aadhaar",
    code: "zk-aadhar",
    description: "Indian identity verification. Zero data exposure.",
    status: "soon",
  },
]

export const ModulesSection = () => {
  return (
    <section className="relative w-full py-32 md:py-40 overflow-hidden bg-background" id="modules">
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <p className="text-sm text-primary font-medium tracking-wide uppercase mb-4">
            Modules
          </p>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-foreground max-w-2xl leading-[1.1]">
              Pick what to prove.
              <br />
              <span className="text-muted-foreground">We handle the rest.</span>
            </h2>
            <a
              href={`${WEB_APP_URL}/dashboard/playground`}
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group shrink-0"
            >
              Try in Playground
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </motion.div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border/50 rounded-2xl overflow-hidden">
          {modules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="bg-background p-8 hover:bg-secondary/30 transition-colors group"
            >
              <div className="flex items-start justify-between mb-6">
                <span className="font-mono text-xs text-muted-foreground/60 bg-secondary/50 px-2 py-1 rounded">
                  {module.code}
                </span>
                {module.status === "live" ? (
                  <span className="flex items-center gap-1.5 text-xs text-green-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Live
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground/50">
                    Coming soon
                  </span>
                )}
              </div>

              <h3 className="text-2xl font-medium text-foreground mb-3 group-hover:text-primary transition-colors">
                {module.name}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {module.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground mb-4">
            Need a custom module?
          </p>
          <a
            href="mailto:hello@untraced.io"
            className="inline-flex items-center gap-2 text-base font-medium text-foreground hover:text-primary transition-colors group"
          >
            <span>Let's talk</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
