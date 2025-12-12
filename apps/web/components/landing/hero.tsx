"use client";

import { useWallet } from "@/lib/use-wallet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedBorder } from "@/components/ui/animated-border";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Zap, Lock } from "lucide-react";

export function Hero() {
  const { login, authenticated } = useWallet();

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-32 px-6 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-untraced-dark/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-untraced-dark/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="secondary" className="mb-8 py-2 px-4">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2 inline-block" />
            Built on Mantle Network
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tight mb-6"
        >
          Verify Without
          <br />
          <span className="font-semibold bg-gradient-to-r from-untraced-dark to-untraced-dark-hover bg-clip-text text-transparent">
            Revealing
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-untraced-dark/60 max-w-2xl mx-auto mb-12 font-light leading-relaxed"
        >
          Build privacy-preserving verification flows with modular ZK modules.
          Prove identity, age, and more — without revealing underlying data.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          {authenticated ? (
            <Link href="/builder">
              <Button size="xl" variant="glow" className="group">
                Open Flow Builder
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          ) : (
            <Button size="xl" variant="glow" onClick={login} className="group">
              Get Started
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          )}
          <Link href="#how-it-works">
            <Button variant="outline" size="xl">
              Learn More
            </Button>
          </Link>
        </motion.div>

        {/* Feature highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto"
        >
          {[
            {
              icon: Shield,
              label: "Zero Knowledge",
              description: "Prove without revealing",
            },
            {
              icon: Zap,
              label: "Instant Verification",
              description: "Sub-second proofs",
            },
            {
              icon: Lock,
              label: "100% Private",
              description: "Data never leaves device",
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
            >
              <AnimatedBorder containerClassName="h-full">
                <div className="p-6 text-center h-full">
                  <div className="w-12 h-12 rounded-xl bg-untraced-dark/5 flex items-center justify-center mx-auto mb-3">
                    <feature.icon className="w-6 h-6 text-untraced-dark" />
                  </div>
                  <div className="font-medium mb-1">{feature.label}</div>
                  <div className="text-sm text-untraced-dark/50 font-light">
                    {feature.description}
                  </div>
                </div>
              </AnimatedBorder>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
