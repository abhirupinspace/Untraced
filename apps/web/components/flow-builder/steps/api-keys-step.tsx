"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { Project } from "../kyc-flow-builder";
import {
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Eye,
  EyeOff,
  Key,
  AlertTriangle,
  Shield,
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
    <div className="h-full flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center mx-auto mb-4">
            <Key className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Your API Keys
          </h1>
          <p className="text-sm text-gray-500">
            Use these keys to integrate UNTRACED into your application
          </p>
        </div>

        <div className="space-y-4">
          {/* API Key */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-600">
                API Key
              </label>
              <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                Public
              </span>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm font-mono text-gray-900 bg-gray-50 px-3 py-2 rounded-lg truncate">
                {project.apiKey}
              </code>
              <button
                onClick={() => copyToClipboard(project.apiKey, "api")}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  copiedKey === "api"
                    ? "bg-green-100 text-green-600"
                    : "hover:bg-gray-100 text-gray-400"
                )}
              >
                {copiedKey === "api" ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Secret Key */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-600">
                Secret Key
              </label>
              <span className="text-[10px] text-red-500 bg-red-50 px-2 py-0.5 rounded">
                Private
              </span>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm font-mono text-gray-900 bg-gray-50 px-3 py-2 rounded-lg truncate">
                {showSecret ? project.secretKey : "•".repeat(40)}
              </code>
              <button
                onClick={() => setShowSecret(!showSecret)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-all"
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
                    ? "bg-green-100 text-green-600"
                    : "hover:bg-gray-100 text-gray-400"
                )}
              >
                {copiedKey === "secret" ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Keep your secret key safe
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Never expose your secret key in client-side code or public repositories.
                  This key will only be shown once.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Start */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-medium text-gray-600">Quick Start</span>
            </div>
            <pre className="text-xs font-mono text-gray-700 bg-white p-3 rounded-lg overflow-x-auto">
{`import { createClient } from "@untraced/sdk";

const untraced = createClient({
  apiKey: "${project.apiKey}",
});`}
            </pre>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onBack}
            className="h-11"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={onContinue}
            className="flex-1 h-11"
          >
            Continue to Builder
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
