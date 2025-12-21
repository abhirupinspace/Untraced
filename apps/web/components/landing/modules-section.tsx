"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GithubIcon,
  EmailIcon,
  UserIcon,
  BankIcon,
  GlobeIcon,
  IdCardIcon,
  ShieldCheckIcon,
  AmazonIcon,
} from "@/components/ui/icons";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

const modules = [
  {
    id: "zk-email",
    name: "zk-email",
    description: "Verify email ownership without revealing the address",
    icon: EmailIcon,
    status: "active",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "zk-age",
    name: "zk-age",
    description: "Prove age is above threshold without revealing DOB",
    icon: UserIcon,
    status: "active",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    id: "zk-github",
    name: "zk-github",
    description: "Verify GitHub account and commit history",
    icon: GithubIcon,
    status: "active",
    gradient: "from-gray-700 to-gray-900",
  },
  {
    id: "zk-aadhar",
    name: "zk-aadhar",
    description: "Verify Aadhaar identity without exposing number",
    icon: IdCardIcon,
    status: "coming",
    gradient: "from-indigo-500 to-violet-500",
  },
  {
    id: "zk-bank-balance",
    name: "zk-bank-balance",
    description: "Prove balance exceeds threshold privately",
    icon: BankIcon,
    status: "coming",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    id: "zk-amazon",
    name: "zk-amazon",
    description: "Verify purchase history or Prime status",
    icon: AmazonIcon,
    status: "coming",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    id: "zk-country",
    name: "zk-country",
    description: "Prove residence in allowed regions",
    icon: GlobeIcon,
    status: "coming",
    gradient: "from-teal-500 to-cyan-500",
  },
  {
    id: "zk-kyc",
    name: "zk-kyc",
    description: "Prove KYC passed without revealing details",
    icon: ShieldCheckIcon,
    status: "coming",
    gradient: "from-rose-500 to-red-500",
  },
];

export function ModulesSection() {
  return (
    <section id="modules" className="py-32 px-6 bg-card">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="secondary" className="mb-4">
            Modular Architecture
          </Badge>
          <h2 className="text-4xl md:text-5xl font-light mb-4 text-foreground">
            Verification <span className="font-semibold">Modules</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light">
            Pre-built ZK verification modules that transform Web2 credentials
            into privacy-preserving on-chain attestations.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {modules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                variant="bordered"
                className={cn(
                  "p-5 h-full cursor-pointer group relative overflow-hidden",
                  module.status === "coming" && "opacity-70"
                )}
              >
                {/* Gradient overlay on hover */}
                <div
                  className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-gradient-to-br",
                    module.gradient
                  )}
                />

                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br text-foreground transition-transform duration-300 group-hover:scale-110",
                        module.gradient
                      )}
                    >
                      <module.icon className="w-6 h-6" />
                    </div>
                    {module.status === "coming" && (
                      <Badge variant="outline" className="text-[10px]">
                        Coming Soon
                      </Badge>
                    )}
                    {module.status === "active" && (
                      <Badge variant="success" className="text-[10px]">
                        Active
                      </Badge>
                    )}
                  </div>

                  <h3 className="font-semibold mb-2 text-foreground group-hover:text-purple-400 transition-colors">
                    {module.name}
                  </h3>
                  <p className="text-sm text-muted-foreground font-light leading-relaxed">
                    {module.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
