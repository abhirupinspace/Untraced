"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

type FAQItem = {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: "What is UNTRACED?",
    answer:
      "A modular zero-knowledge verification suite. Users prove facts about themselves without revealing identity or personal data. Smart contracts only receive true/false answers.",
  },
  {
    question: "What can I verify?",
    answer:
      "Currently: email ownership, age thresholds (18+/21+), wallet balance minimums, GitHub accounts. Coming soon: Twitter/X, country residency, KYC status, Aadhaar.",
  },
  {
    question: "How is privacy guaranteed?",
    answer:
      "ZK proofs are generated client-side using Noir circuits. No PII is ever sent to servers or stored on-chain. Only boolean results are recorded. Attestations are user-controlled and revocable.",
  },
  {
    question: "How do I integrate?",
    answer:
      "Frontend: useUntraced('zk-email'). Contracts: registry.hasAttribute(user, ZK_EMAIL). We provide React hooks, TypeScript SDK, and Solidity interfaces.",
  },
  {
    question: "Which chains are supported?",
    answer:
      "Currently deployed on Mantle. The protocol uses EIP-712 signatures, making it compatible with any EVM chain. Multi-chain support coming soon.",
  },
  {
    question: "Is it open source?",
    answer:
      "Yes. Smart contracts, SDK, Noir circuits, and all code are open source on GitHub. Transparency is core to the protocol.",
  },
]

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="relative w-full py-32 md:py-40 overflow-hidden bg-secondary/20" id="faq">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="text-sm text-primary font-medium tracking-wide uppercase mb-4">
            FAQ
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-foreground leading-[1.1]">
            Questions?
            <br />
            <span className="text-muted-foreground">Answered.</span>
          </h2>
        </motion.div>

        {/* FAQ items */}
        <div className="space-y-px bg-border/50 rounded-2xl overflow-hidden">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: index * 0.03 }}
              className={cn(
                "bg-background transition-colors",
                openIndex === index && "bg-secondary/30"
              )}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left group"
                aria-expanded={openIndex === index}
              >
                <span className="text-base font-medium text-foreground pr-4 group-hover:text-primary transition-colors">
                  {faq.question}
                </span>
                <span className="shrink-0 w-6 h-6 rounded-full border border-border/50 flex items-center justify-center group-hover:border-primary/30 transition-colors">
                  {openIndex === index ? (
                    <Minus className="w-3 h-3 text-muted-foreground" />
                  ) : (
                    <Plus className="w-3 h-3 text-muted-foreground" />
                  )}
                </span>
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
                      <p className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-4">Still have questions?</p>
          <a
            href="mailto:hello@untraced.io"
            className="inline-flex items-center gap-2 text-base font-medium text-foreground hover:text-primary transition-colors group"
          >
            <span>Get in touch</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
