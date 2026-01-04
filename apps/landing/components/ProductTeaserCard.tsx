"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

const WEB_APP_URL = "http://localhost:3000"

export const ProductTeaserCard = () => {
  const sectionRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95])
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100])

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen flex flex-col overflow-hidden bg-background"
      id="home"
    >
      {/* Video Background - Dark Mode */}
      <div className="absolute inset-0 hidden dark:block pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover opacity-35"
        >
          <source src="/bgvid.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background" />
      </div>

      {/* Video Background - Light Mode */}
      <div className="absolute inset-0 dark:hidden pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover opacity-30"
        >
          <source src="/bgvidlight.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background" />
      </div>

      {/* Main Content */}
      <motion.div
        style={{ opacity, scale, y }}
        className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-32 pb-24"
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-secondary/50 backdrop-blur-sm text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Now live on Mantle
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-center max-w-5xl"
        >
          <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium tracking-tight text-foreground leading-[0.95]">
            Verify everything.
          </span>
          <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium tracking-tight leading-[0.95] mt-2 text-primary">
            Reveal nothing.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-8 text-center text-xl sm:text-2xl text-muted-foreground max-w-xl leading-relaxed tracking-tight"
        >
          Verify users <span className="text-foreground font-medium">without</span> ever seeing their data.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 flex flex-col sm:flex-row items-center gap-4"
        >
          <Button
            asChild
            size="lg"
            className="h-14 px-8 text-base font-medium rounded-full shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300"
          >
            <a href={`${WEB_APP_URL}/dashboard`} className="inline-flex items-center gap-2">
              Start Building
              <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="lg"
            className="h-14 px-8 text-base font-medium rounded-full hover:bg-secondary/80"
          >
            <a href="#how-it-works">
              See how it works
            </a>
          </Button>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground/60"
        >
          <span className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
            Noir Circuits
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
            Client-side Proofs
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
            On-chain Attestations
          </span>
        </motion.div>

        {/* Floating Code Snippets */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20 w-full max-w-4xl"
        >
          <div className="relative">
            {/* Code Preview */}
            <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl overflow-hidden shadow-2xl">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30 bg-secondary/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <span className="text-xs text-muted-foreground/60 font-mono ml-2">verify.ts</span>
              </div>
              <div className="p-6 font-mono text-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground/50">// One line. Complete privacy.</span>
                  <div className="mt-2">
                    <span className="text-purple-400">const</span>
                    <span className="text-foreground"> result </span>
                    <span className="text-purple-400">=</span>
                    <span className="text-foreground"> </span>
                    <span className="text-purple-400">await</span>
                    <span className="text-foreground"> untraced.</span>
                    <span className="text-blue-400">verify</span>
                    <span className="text-foreground">(</span>
                    <span className="text-green-400">&apos;age-over-18&apos;</span>
                    <span className="text-foreground">)</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border/20">
                    <span className="text-muted-foreground/50">// Smart contract receives:</span>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-foreground">{"{"}</span>
                      <span className="text-blue-400">verified</span>
                      <span className="text-foreground">:</span>
                      <span className="text-green-400 font-semibold">true</span>
                      <span className="text-foreground">{"}"}</span>
                      <span className="text-muted-foreground/40 ml-2">// That&apos;s it. Nothing else.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <a
          href="#how-it-works"
          className="flex flex-col items-center gap-2 text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </a>
      </motion.div>
    </section>
  )
}
