"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

const WEB_APP_URL = "https://untraced-web.vercel.app"

const supportedChains = [
  { name: "Ethereum", symbol: "ETH", logo: "/images/Ethereum.svg" },
  { name: "BNB Chain", symbol: "BNB", logo: "/images/bnb-bnb-logo.svg" },
  { name: "XRP Ledger", symbol: "XRP", logo: "/images/xrp-xrp-logo.svg" },
  { name: "Dogecoin", symbol: "DOGE", logo: "/images/dogecoin.svg" },
  { name: "Litecoin", symbol: "LTC", logo: "/images/litecoin-ltc-logo.svg" },
  { name: "Flare", symbol: "FLR", logo: "/images/flare-flr-logo.svg" },
  { name: "Mantle", symbol: "MNT", logo: "/images/mantle-mnt-logo.svg" },
]

const features = [
  {
    title: "Cross-Chain Proofs",
    description: "Verify balances from any chain. Wallet stays hidden.",
  },
  {
    title: "Flare Data Connector",
    description: "Decentralized oracle. Trustless data feeds.",
  },
  {
    title: "One SDK",
    description: "Same interface everywhere. Ship faster.",
  },
]

export const CrossChainSection = () => {
  return (
    <section
      className="relative w-full py-32 md:py-40 overflow-hidden bg-background"
      id="cross-chain"
    >
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
            Untraced Cross-Chain Attestation Protocol
          </p>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-foreground max-w-3xl leading-[1.1]">
              One protocol.
              <br />
              <span className="text-muted-foreground">Every chain.</span>
            </h2>
            <p className="text-muted-foreground max-w-md leading-relaxed lg:text-right">
              Powered by Flare Network's Data Connector for trustless cross-chain attestations.
            </p>
          </div>
        </motion.div>

        {/* Chains Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-20"
        >
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {supportedChains.map((chain, index) => (
              <motion.div
                key={chain.symbol}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex flex-col items-center gap-3 group"
              >
                <div className="w-14 h-14 rounded-xl border border-border/50 bg-secondary/30 flex items-center justify-center overflow-hidden group-hover:border-primary/30 group-hover:bg-secondary/50 transition-all">
                  <Image
                    src={chain.logo}
                    alt={chain.name}
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <span className="text-xs text-muted-foreground/60 font-mono">
                  {chain.symbol}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border/50 rounded-2xl overflow-hidden mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="bg-background p-8 hover:bg-secondary/30 transition-colors"
            >
              <h3 className="text-xl font-medium text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
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
            href={`${WEB_APP_URL}/dashboard`}
            className="inline-flex items-center gap-2 text-base font-medium text-foreground hover:text-primary transition-colors group"
          >
            <span>Learn more about U-CCAP</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
