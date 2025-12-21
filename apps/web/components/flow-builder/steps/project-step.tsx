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
    <div className="h-full flex items-center justify-center p-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Create a new flow
          </h1>
          <p className="text-sm text-muted-foreground">
            Build your ZK verification flow
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              Flow Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. kyc_verification"
              className="w-full px-4 py-3 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-white/20 transition-all text-foreground placeholder:text-muted-foreground font-mono"
              autoFocus
            />
          </div>

          <Button
            type="submit"
            disabled={!isValid}
            className="w-full h-11 bg-primary text-primary-foreground hover:bg-accent font-medium"
          >
            Create Flow
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
