"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

type FAQItem = {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: "What is UNTRACED?",
    answer:
      "UNTRACED is a modular zero-knowledge verification suite that allows users to prove specific facts about themselves without revealing their identity or personal data. Smart contracts only learn true/false answers — nothing else.",
  },
  {
    question: "What claims can I verify?",
    answer:
      "Currently supported: email ownership, age thresholds (18+/21+), wallet balance minimums. Coming soon: GitHub verification, Twitter/X verification, country residency, and KYC status. Each module proves exactly one claim.",
  },
  {
    question: "How is privacy guaranteed?",
    answer:
      "ZK proofs are generated client-side using Noir circuits. No PII is ever sent to our servers or stored on-chain. The blockchain only receives boolean results. All attestations are user-controlled and revocable.",
  },
  {
    question: "How do I integrate UNTRACED?",
    answer:
      "Use our SDK: `useUntraced('zk-email')` on the frontend, and `registry.hasAttribute(user, ZK_EMAIL)` in your contracts. We provide React hooks, TypeScript SDK, and Solidity interfaces.",
  },
  {
    question: "Which chains are supported?",
    answer:
      "Currently deployed on Mantle Sepolia (testnet). The protocol uses EIP-712 signatures, making it compatible with any EVM chain. Multi-chain support is on the roadmap.",
  },
  {
    question: "Is UNTRACED open source?",
    answer:
      "Yes. Smart contracts, SDK, Noir circuits, and all code are open source on GitHub. We believe in transparency and community-driven development.",
  },
]

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="relative w-full py-32 overflow-hidden bg-secondary/30" id="faq">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-background/50 text-sm text-muted-foreground mb-6">
            <span className="font-mono">{"// FAQ"}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-foreground mb-6">
            Questions? <span className="text-primary">Answers.</span>
          </h2>
        </motion.div>

        {/* FAQ items */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <div
                className={cn(
                  "rounded-2xl border transition-all duration-300",
                  openIndex === index
                    ? "border-primary/30 bg-primary/5"
                    : "border-border/50 bg-card/30 hover:border-border"
                )}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                  aria-expanded={openIndex === index}
                >
                  <span className="text-base font-medium text-foreground pr-4">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0"
                  >
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-4">Still have questions?</p>
          <a
            href="mailto:hello@untraced.io"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-hover transition-colors font-medium"
          >
            Get in touch
          </a>
        </motion.div>
      </div>
    </section>
  )
}
