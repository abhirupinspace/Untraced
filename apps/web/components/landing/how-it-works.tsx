"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Boxes, Code2, Fingerprint, CheckCircle } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    number: "01",
    icon: Boxes,
    title: "Select Modules",
    description:
      "Choose verification modules for your app — email, age, KYC, or custom requirements.",
  },
  {
    number: "02",
    icon: Code2,
    title: "Build Your Flow",
    description:
      "Combine modules into a custom verification flow using our visual builder or SDK.",
  },
  {
    number: "03",
    icon: Fingerprint,
    title: "Generate Proofs",
    description:
      "Users connect Web2 accounts. zkTLS extracts data, ZK circuits generate proofs client-side.",
  },
  {
    number: "04",
    icon: CheckCircle,
    title: "Verify On-Chain",
    description:
      "Proofs are verified on Mantle. Only boolean attestations stored — never raw data.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="secondary" className="mb-4">
            Simple Integration
          </Badge>
          <h2 className="text-4xl md:text-5xl font-light mb-4 text-foreground">
            How It <span className="font-semibold">Works</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light">
            Four simple steps from Web2 data to privacy-preserving on-chain verification.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-px">
                  <div className="h-full w-full bg-border" />
                </div>
              )}

              <Card variant="bordered" className="p-6 h-full">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  STEP {step.number}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">
                  {step.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="relative overflow-hidden bg-primary p-8 md:p-12">
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-semibold text-primary-foreground mb-2">
                  Ready to build?
                </h3>
                <p className="text-primary-foreground/70 font-light">
                  Start creating your custom verification flow in minutes.
                </p>
              </div>
              <Link href="/dashboard">
                <Button
                  size="lg"
                  variant="secondary"
                  className="group"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
