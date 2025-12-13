"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import type { Project } from "./builder-step";
import {
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Eye,
  EyeOff,
  Key,
  AlertTriangle,
} from "lucide-react";

interface ApiKeysStepProps {
  project: Project;
  onContinue: () => void;
  onBack: () => void;
}

export function ApiKeysStep({ project, onContinue, onBack }: ApiKeysStepProps) {
  const [showSecret, setShowSecret] = useState(false);
  const [copiedKey, setCopiedKey] = useState<"api" | "secret" | null>(null);

  const copyToClipboard = async (text: string, type: "api" | "secret") => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(type);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="h-full flex items-center justify-center p-6 bg-[#0a0a0a]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-purple-500 flex items-center justify-center mx-auto mb-4">
            <Key className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">
            Your API Keys
          </h1>
          <p className="text-sm text-gray-400">
            Use these keys to integrate UNTRACED into your application
          </p>
        </div>

        <div className="space-y-4">
          {/* API Key */}
          <Card variant="bordered" className="p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-400">
                API Key
              </label>
              <Badge variant="secondary" className="text-[10px]">Public</Badge>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm font-mono text-white bg-white/5 px-3 py-2 rounded-lg truncate">
                {project.apiKey}
              </code>
              <button
                onClick={() => copyToClipboard(project.apiKey, "api")}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  copiedKey === "api"
                    ? "bg-green-500/20 text-green-400"
                    : "hover:bg-white/10 text-gray-400"
                )}
              >
                {copiedKey === "api" ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </Card>

          {/* Secret Key */}
          <Card variant="bordered" className="p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-400">
                Secret Key
              </label>
              <Badge variant="destructive" className="text-[10px]">Private</Badge>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm font-mono text-white bg-white/5 px-3 py-2 rounded-lg truncate">
                {showSecret ? project.secretKey : "•".repeat(40)}
              </code>
              <button
                onClick={() => setShowSecret(!showSecret)}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 transition-all"
              >
                {showSecret ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => copyToClipboard(project.secretKey, "secret")}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  copiedKey === "secret"
                    ? "bg-green-500/20 text-green-400"
                    : "hover:bg-white/10 text-gray-400"
                )}
              >
                {copiedKey === "secret" ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </Card>

          {/* Warning */}
          <Card className="bg-amber-500/10 border border-amber-500/20 p-4">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <p className="text-xs text-amber-400/80">
                Never expose your secret key in client-side code. This key will only be shown once.
              </p>
            </div>
          </Card>

          {/* Quick Start */}
          <Card variant="bordered" className="p-4">
            <span className="text-xs font-medium text-gray-500 block mb-3">Quick Start</span>
            <pre className="text-xs font-mono text-gray-300 bg-black/50 p-3 rounded-lg overflow-x-auto">
{`import { createClient } from "@untraced/sdk";

const untraced = createClient({
  apiKey: "${project.apiKey}",
});`}
            </pre>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onBack}
            className="h-11 border-white/10 text-white hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={onContinue}
            className="flex-1 h-11 bg-purple-500 hover:bg-purple-600 text-white"
          >
            Continue to Builder
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
