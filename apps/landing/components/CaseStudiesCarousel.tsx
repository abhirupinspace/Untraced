"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"

type CaseStudy = {
  id: string
  category: string
  title: string
  description: string
  modules: string[]
}

const caseStudies: CaseStudy[] = [
  {
    id: "age-gating",
    category: "Age Verification",
    title: "Verify 18+ without collecting birthdates",
    description: "Users prove they meet age thresholds without revealing their actual date of birth.",
    modules: ["zk-age"],
  },
  {
    id: "dao-voting",
    category: "DAO Governance",
    title: "Gate voting by contributions or holdings",
    description: "Contributors prove activity without linking their wallet to their real identity.",
    modules: ["zk-github", "zk-balance"],
  },
  {
    id: "sybil-resistance",
    category: "Sybil Resistance",
    title: "One-person-one-account verification",
    description: "Users prove unique email ownership without your platform ever seeing the address.",
    modules: ["zk-email"],
  },
  {
    id: "whale-proof",
    category: "Token Distribution",
    title: "Whale-proof airdrops",
    description: "Users prove they hold a minimum balance without revealing exact holdings.",
    modules: ["zk-balance"],
  },
  {
    id: "gaming",
    category: "Gaming",
    title: "Private player reputation",
    description: "Players prove they're real without revealing their username to opponents.",
    modules: ["zk-github"],
  },
  {
    id: "enterprise",
    category: "Enterprise",
    title: "B2B feature gating",
    description: "Verify customers work at specific companies without knowing which employee.",
    modules: ["zk-email"],
  },
]

export const CaseStudiesCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  const next = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % caseStudies.length)
  }

  const prev = () => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + caseStudies.length) % caseStudies.length)
  }

  const currentStudy = caseStudies[currentIndex]

  return (
    <section className="relative w-full py-32 md:py-40 overflow-hidden bg-secondary/20" id="use-cases">
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
            Use Cases
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-foreground max-w-3xl leading-[1.1]">
            Real applications.
            <br />
            <span className="text-muted-foreground">Real privacy.</span>
          </h2>
        </motion.div>

        {/* Carousel Content */}
        <div className="relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStudy.id}
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 30 : -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -30 : 30 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="border border-border/50 rounded-2xl bg-background p-8 md:p-12"
            >
              {/* Category */}
              <span className="font-mono text-xs text-muted-foreground/60 bg-secondary/50 px-2 py-1 rounded">
                {currentStudy.category}
              </span>

              {/* Title */}
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-medium text-foreground mt-6 mb-4 max-w-2xl leading-tight">
                {currentStudy.title}
              </h3>

              {/* Description */}
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mb-8">
                {currentStudy.description}
              </p>

              {/* Modules */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground/60 mr-2">Uses:</span>
                {currentStudy.modules.map((module) => (
                  <span
                    key={module}
                    className="font-mono text-xs text-primary/80 bg-primary/5 border border-primary/10 px-2 py-1 rounded"
                  >
                    {module}
                  </span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            {/* Counter */}
            <div className="flex items-center gap-4">
              <span className="font-mono text-sm text-muted-foreground">
                <span className="text-foreground">{String(currentIndex + 1).padStart(2, '0')}</span>
                <span className="mx-2">/</span>
                <span>{String(caseStudies.length).padStart(2, '0')}</span>
              </span>

              {/* Progress bar */}
              <div className="hidden sm:flex w-32 h-px bg-border">
                <motion.div
                  className="h-full bg-primary"
                  initial={false}
                  animate={{ width: `${((currentIndex + 1) / caseStudies.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Arrows */}
            <div className="flex gap-2">
              <button
                onClick={prev}
                className="w-10 h-10 rounded-full border border-border/50 flex items-center justify-center hover:border-primary/30 hover:bg-secondary/50 transition-all"
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={next}
                className="w-10 h-10 rounded-full border border-border/50 flex items-center justify-center hover:border-primary/30 hover:bg-secondary/50 transition-all"
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
