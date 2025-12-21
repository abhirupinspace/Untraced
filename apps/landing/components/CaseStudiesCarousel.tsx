"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { Shield, Vote, Users, Coins, Gamepad2, Building2, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

type CaseStudy = {
  id: string
  category: string
  title: string
  description: string
  icon: React.ElementType
  modules: string[]
}

const caseStudies: CaseStudy[] = [
  {
    id: "age-gating",
    category: "Age Verification",
    title: "Verify users are 18+ without collecting birthdates",
    description: "Age verification that respects privacy. Users prove they meet age thresholds without ever revealing their actual date of birth.",
    icon: Shield,
    modules: ["zk-age"],
  },
  {
    id: "dao-voting",
    category: "DAO Governance",
    title: "Gate voting by contributions or holdings",
    description: "Enable private governance. Contributors prove their activity without linking their wallet to their real identity.",
    icon: Vote,
    modules: ["zk-github", "zk-balance"],
  },
  {
    id: "sybil-resistance",
    category: "Sybil Resistance",
    title: "One-person-one-account without storing credentials",
    description: "Eliminate bots and duplicate accounts. Users prove unique email ownership without your platform ever seeing the address.",
    icon: Users,
    modules: ["zk-email"],
  },
  {
    id: "whale-proof",
    category: "Token Distribution",
    title: "Distribute tokens based on balance thresholds",
    description: "Whale-proof airdrops. Users prove they hold a minimum balance without revealing their exact holdings.",
    icon: Coins,
    modules: ["zk-balance"],
  },
  {
    id: "gaming",
    category: "Gaming",
    title: "Verify player reputation for matchmaking",
    description: "Fair competition. Players prove they're real without revealing their username to opponents.",
    icon: Gamepad2,
    modules: ["zk-github"],
  },
  {
    id: "enterprise",
    category: "Enterprise",
    title: "Gate B2B features by company email domain",
    description: "Private enterprise verification. Verify customers work at specific companies without knowing which employee.",
    icon: Building2,
    modules: ["zk-email"],
  },
]

export const CaseStudiesCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  })

  // Parallax floating elements
  const floatY1 = useTransform(scrollYProgress, [0, 1], [40, -60])
  const floatY2 = useTransform(scrollYProgress, [0, 1], [-20, 40])

  const next = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % caseStudies.length)
  }

  const prev = () => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + caseStudies.length) % caseStudies.length)
  }

  const currentStudy = caseStudies[currentIndex]
  const Icon = currentStudy.icon

  return (
    <section ref={sectionRef} className="relative w-full py-28 overflow-hidden bg-card/30" id="use-cases">
      {/* Parallax floating orbs */}
      <motion.div
        style={{ y: floatY1 }}
        className="absolute top-10 right-10 w-[200px] h-[200px] bg-purple-800/8 rounded-full blur-[100px] pointer-events-none"
      />
      <motion.div
        style={{ y: floatY2 }}
        className="absolute bottom-10 left-10 w-[250px] h-[250px] bg-purple-900/8 rounded-full blur-[100px] pointer-events-none"
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
            USE CASES
          </p>
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-foreground mb-4">
            Built for Real Applications
          </h2>
          <p className="text-base text-muted-foreground/80 max-w-xl mx-auto leading-relaxed">
            See how teams use UNTRACED to build privacy-preserving verification.
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStudy.id}
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm overflow-hidden"
            >
              <div className="p-8 md:p-10">
                {/* Category & Icon */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/8 border border-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary/70" />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground/60 uppercase tracking-wider">
                    {currentStudy.category}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-xl md:text-2xl font-medium text-foreground mb-3 leading-tight">
                  {currentStudy.title}
                </h3>

                <p className="text-muted-foreground/80 leading-relaxed mb-6 max-w-2xl">
                  {currentStudy.description}
                </p>

                {/* Modules */}
                <div className="flex flex-wrap gap-2">
                  {currentStudy.modules.map((module) => (
                    <span
                      key={module}
                      className="px-2.5 py-1 rounded-md text-xs font-mono bg-primary/8 text-primary/70 border border-primary/10"
                    >
                      {module}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            {/* Dots */}
            <div className="flex gap-1.5">
              {caseStudies.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setDirection(idx > currentIndex ? 1 : -1)
                    setCurrentIndex(idx)
                  }}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    idx === currentIndex
                      ? "w-6 bg-primary/60"
                      : "w-1.5 bg-muted-foreground/20 hover:bg-muted-foreground/30"
                  )}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Arrows */}
            <div className="flex gap-2">
              <button
                onClick={prev}
                className="p-2 rounded-lg border border-border/40 text-muted-foreground hover:text-foreground hover:border-border/60 transition-all"
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={next}
                className="p-2 rounded-lg border border-border/40 text-muted-foreground hover:text-foreground hover:border-border/60 transition-all"
                aria-label="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
