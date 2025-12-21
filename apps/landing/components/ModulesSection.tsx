"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Mail, Calendar, Wallet, Globe, CreditCard, Shield, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

const WEB_APP_URL = "http://localhost:3000"

type Module = {
  id: string
  name: string
  description: string
  icon: React.ElementType
  status: "active" | "coming-soon"
}

const modules: Module[] = [
  {
    id: "zk-email",
    name: "zk-email",
    description: "Prove email ownership without revealing the address",
    icon: Mail,
    status: "active",
  },
  {
    id: "zk-age",
    name: "zk-age",
    description: "Prove age meets threshold without revealing DOB",
    icon: Calendar,
    status: "active",
  },
  {
    id: "zk-balance",
    name: "zk-balance",
    description: "Prove wallet balance exceeds threshold privately",
    icon: Wallet,
    status: "active",
  },
  {
    id: "zk-country",
    name: "zk-country",
    description: "Prove residency in allowed regions",
    icon: Globe,
    status: "coming-soon",
  },
  {
    id: "zk-kyc",
    name: "zk-kyc",
    description: "Prove KYC status without revealing identity",
    icon: Shield,
    status: "coming-soon",
  },
  {
    id: "zk-aadhar",
    name: "zk-aadhar",
    description: "Prove Aadhaar validity and age threshold",
    icon: CreditCard,
    status: "coming-soon",
  },
]

const ModuleCard = ({ module, index }: { module: Module; index: number }) => {
  const Icon = module.icon
  const isActive = module.status === "active"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="group"
    >
      <div className={cn(
        "relative h-full p-6 rounded-2xl border transition-all duration-300",
        "border-border/40 bg-card/20 backdrop-blur-sm",
        "hover:border-border/60 hover:bg-card/40",
        !isActive && "opacity-50"
      )}>
        <div className="flex items-start gap-4">
          <div className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
            "bg-primary/8 border border-primary/10"
          )}>
            <Icon className="w-5 h-5 text-primary/80" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="text-base font-medium text-foreground font-mono">{module.name}</h3>
              {isActive ? (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary/80">
                  Live
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">
                  Soon
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground/80 leading-relaxed">{module.description}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export const ModulesSection = () => {
  const sectionRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  })

  // Floating decorative orbs with parallax
  const orbY1 = useTransform(scrollYProgress, [0, 1], [50, -80])
  const orbY2 = useTransform(scrollYProgress, [0, 1], [-30, 60])

  return (
    <section ref={sectionRef} className="relative w-full py-28 overflow-hidden bg-background" id="modules">
      {/* Floating parallax orbs */}
      <motion.div
        style={{ y: orbY1 }}
        className="absolute top-20 -right-40 w-[300px] h-[300px] bg-purple-800/10 rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div
        style={{ y: orbY2 }}
        className="absolute bottom-20 -left-40 w-[250px] h-[250px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none"
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-sm font-mono text-muted-foreground/60 mb-4 tracking-wide">
            VERIFICATION MODULES
          </p>
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-foreground mb-4">
            One Claim. Zero Exposure.
          </h2>
          <p className="text-base text-muted-foreground/80 max-w-xl mx-auto leading-relaxed">
            Each module proves exactly one verifiable claim without exposing the underlying data.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {modules.map((module, index) => (
            <ModuleCard key={module.id} module={module} index={index} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center"
        >
          <a
            href={`${WEB_APP_URL}/dashboard/playground`}
            className="group inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
          >
            Try in Playground
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
