"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface ProjectStepProps {
  onSubmit: (name: string, description: string) => void;
}

export function ProjectStep({ onSubmit }: ProjectStepProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim(), "");
    }
  };

  const isValid = name.trim().length >= 3;

  return (
    <div className="h-full flex items-center justify-center p-6 bg-[#0a0a0a]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-white mb-2">
            Create a new flow
          </h1>
          <p className="text-sm text-gray-500">
            Build your ZK verification flow
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">
              Flow Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. kyc_verification"
              className="w-full px-4 py-3 text-sm bg-[#0f0f0f] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-white/20 transition-all text-white placeholder:text-gray-600 font-mono"
              autoFocus
            />
          </div>

          <Button
            type="submit"
            disabled={!isValid}
            className="w-full h-11 bg-white text-black hover:bg-gray-200 font-medium"
          >
            Create Flow
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
