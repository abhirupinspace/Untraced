"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform, useInView } from "framer-motion"

const features = [
  {
    number: "01",
    title: "Client Side Proofs",
    description: "Data never leaves your device. Proofs generate locally.",
    stat: "100%",
    statLabel: "on device",
  },
  {
    number: "02",
    title: "Instant Verification",
    description: "Optimized circuits. Millisecond proof generation.",
    stat: "500",
    statLabel: "ms average",
  },
  {
    number: "03",
    title: "Math, Not Trust",
    description: "Cryptographic certainty. No assumptions required.",
    stat: "ZK",
    statLabel: "proven",
  },
  {
    number: "04",
    title: "Any Chain",
    description: "Deploy everywhere. Portable attestations across EVM.",
    stat: "10+",
    statLabel: "networks",
  },
  {
    number: "05",
    title: "Three Lines",
    description: "Simple SDK. Ship in hours, not weeks.",
    stat: "3",
    statLabel: "lines of code",
  },
  {
    number: "06",
    title: "Selective Disclosure",
    description: "Prove what matters. Hide everything else.",
    stat: "0",
    statLabel: "data exposed",
  },
]

export const StickyFeatureSection = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" })

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])

  return (
    <section className="relative bg-background" id="features">
      <div ref={containerRef} className="relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2">
            {/* Sticky Left Column */}
            <div className="lg:sticky lg:top-0 lg:h-screen flex items-center px-6 py-16 lg:py-0">
              <div ref={headerRef} className="max-w-md">
                {/* Eyebrow with line */}
                <div className="flex items-center gap-4 mb-8">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={isHeaderInView ? { scaleX: 1 } : {}}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="h-px w-8 bg-primary origin-left"
                  />
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={isHeaderInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="text-xs text-primary font-medium tracking-[0.2em] uppercase"
                  >
                    Why Untraced
                  </motion.span>
                </div>

                {/* Main headline with staggered reveal */}
                <div className="overflow-hidden mb-6">
                  <motion.h2
                    initial={{ y: "100%" }}
                    animate={isHeaderInView ? { y: 0 } : {}}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                    className="text-4xl md:text-5xl lg:text-[3.5rem] font-medium tracking-[-0.03em] text-foreground leading-[1.1]"
                  >
                    Privacy that
                  </motion.h2>
                </div>
                <div className="overflow-hidden mb-8">
                  <motion.h2
                    initial={{ y: "100%" }}
                    animate={isHeaderInView ? { y: 0 } : {}}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                    className="text-4xl md:text-5xl lg:text-[3.5rem] font-light tracking-[-0.03em] text-muted-foreground leading-[1.1] italic"
                  >
                    actually works.
                  </motion.h2>
                </div>

                {/* Subtext */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-base text-muted-foreground/80 leading-relaxed max-w-sm"
                >
                  Zero knowledge from the ground up.
                  No compromises. No shortcuts.
                </motion.p>

                {/* Progress indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={isHeaderInView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="mt-16 hidden lg:block"
                >
                  <div className="space-y-3">
                    <div className="h-px w-full bg-border/50 overflow-hidden">
                      <motion.div
                        style={{ width: progressWidth }}
                        className="h-full bg-foreground/20"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground/50">
                        Scroll
                      </span>
                      <motion.span
                        className="font-mono text-[10px] text-muted-foreground/50 tabular-nums"
                      >
                        {features.length} features
                      </motion.span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Scrolling Right Column */}
            <div className="px-6 py-8 lg:py-32 space-y-2">
              {features.map((feature, index) => (
                <FeatureCard key={feature.number} feature={feature} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

interface FeatureCardProps {
  feature: (typeof features)[number]
  index: number
}

const FeatureCard = ({ feature, index }: FeatureCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(cardRef, { once: true, margin: "-20%" })

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.3, 1, 1, 0.3])
  const filterBlur = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], ["blur(4px)", "blur(0px)", "blur(0px)", "blur(4px)"])

  return (
    <motion.div
      ref={cardRef}
      style={{
        opacity,
        filter: filterBlur
      }}
      className="group relative"
    >
      <div className="relative py-8 lg:py-10 border-t border-border/30">
        <div className="grid grid-cols-12 gap-4 items-start">
          {/* Number */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="col-span-2 lg:col-span-1 font-mono text-[10px] text-muted-foreground/40 pt-1"
          >
            {feature.number}
          </motion.span>

          {/* Title & Description */}
          <div className="col-span-10 lg:col-span-6 space-y-2">
            <motion.h3
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
              className="text-lg lg:text-xl font-medium text-foreground tracking-[-0.02em]"
            >
              {feature.title}
            </motion.h3>
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.05 }}
              className="text-sm text-muted-foreground/70 leading-relaxed"
            >
              {feature.description}
            </motion.p>
          </div>

          {/* Stat */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.05 }}
            className="col-span-12 lg:col-span-5 flex lg:justify-end items-baseline gap-2 mt-4 lg:mt-0"
          >
            <span className="text-3xl lg:text-4xl font-light tracking-[-0.03em] text-foreground tabular-nums">
              {feature.stat}
            </span>
            <span className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground/50">
              {feature.statLabel}
            </span>
          </motion.div>
        </div>

        {/* Hover line */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-0 left-0 right-0 h-px bg-primary/30 origin-left"
        />
      </div>
    </motion.div>
  )
}
