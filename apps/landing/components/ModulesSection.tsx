"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Mail, Calendar, Wallet, Globe, CreditCard, Shield, ArrowRight, Link } from "lucide-react"
import { cn } from "@/lib/utils"
import { GridPattern } from "@/components/magicui/grid-pattern"
import { BorderBeam } from "@/components/magicui/border-beam"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

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
    id: "zk-chain-balance",
    name: "zk-chain-balance",
    description: "Verify cross-chain balances via Flare Network",
    icon: Link,
    status: "coming-soon",
  },
  {
    id: "zk-country",
    name: "zk-country",
    description: "Prove residency in allowed regions",
    icon: Globe,
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
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="group"
    >
      <Card className={cn(
        "relative h-full border-border/40 bg-card/40 backdrop-blur-sm py-0 overflow-hidden",
        "transition-all duration-300",
        "hover:border-primary/30 hover:bg-card/60 hover:shadow-lg hover:shadow-primary/5",
        !isActive && "opacity-60 hover:opacity-80"
      )}>
        {isActive && (
          <BorderBeam
            size={100}
            duration={12}
            delay={index * 1.5}
            colorFrom="#7c3aed"
            colorTo="#a855f7"
            borderWidth={1}
          />
        )}
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
              "bg-gradient-to-br from-primary/10 to-accent/10",
              "border border-primary/15",
              "group-hover:from-primary/15 group-hover:to-accent/15 transition-all duration-300"
            )}>
              <Icon className="w-5 h-5 text-primary/80 group-hover:text-primary transition-colors" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="text-sm font-medium text-foreground font-mono">{module.name}</h3>
                {isActive ? (
                  <Badge className="h-5 px-1.5 text-[9px] font-semibold">
                    Live
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="h-5 px-1.5 text-[9px] font-medium">
                    Soon
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground/80 leading-relaxed">{module.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export const ModulesSection = () => {
  const sectionRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  })

  // Parallax transforms
  const gridY = useTransform(scrollYProgress, [0, 1], [-20, 20])
  const orbY1 = useTransform(scrollYProgress, [0, 1], [50, -80])
  const orbY2 = useTransform(scrollYProgress, [0, 1], [-30, 60])

  return (
    <section ref={sectionRef} className="relative w-full py-24 md:py-32 overflow-hidden bg-background" id="modules">
      {/* Background Grid Pattern with Parallax */}
      <motion.div
        style={{ y: gridY }}
        className="absolute inset-0 pointer-events-none opacity-25"
      >
        <GridPattern
          width={55}
          height={55}
          x={-1}
          y={-1}
          className={cn(
            "[mask-image:radial-gradient(650px_circle_at_center,white,transparent)]"
          )}
        />
      </motion.div>

      {/* Floating parallax orbs */}
      <motion.div
        style={{ y: orbY1 }}
        className="absolute top-20 -right-32 w-[350px] h-[350px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"
      />
      <motion.div
        style={{ y: orbY2 }}
        className="absolute bottom-20 -left-32 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[100px] pointer-events-none"
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
          <Badge variant="outline" className="mb-4 px-4 py-1.5 text-xs font-medium border-primary/20 text-primary/90">
            Verification Modules
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-foreground mb-5">
            One Claim. <span className="text-primary">Zero Exposure.</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
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
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center"
        >
          <a
            href={`${WEB_APP_URL}/dashboard/playground`}
            className={cn(
              "inline-flex items-center gap-2 text-sm font-medium",
              "text-primary/80 hover:text-primary transition-colors group"
            )}
          >
            Try in Playground
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
