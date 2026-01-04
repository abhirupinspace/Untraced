"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { GeneratedCode } from "./types";
import { Check, Copy, FileCode, FileJson, Code2 } from "lucide-react";

interface CodePreviewProps {
  code: GeneratedCode;
}

type TabType = "solidity" | "sdk" | "json";

const tabIcons = {
  sdk: Code2,
  solidity: FileCode,
  json: FileJson,
};

export function CodePreview({ code }: CodePreviewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("sdk");
  const [copied, setCopied] = useState(false);

  const tabs: { id: TabType; label: string }[] = [
    { id: "sdk", label: "SDK" },
    { id: "solidity", label: "Solidity" },
    { id: "json", label: "JSON" },
  ];

  const currentCode = code[activeTab];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border-2 border-untraced-dark/10 bg-white overflow-hidden shadow-sm">
      <div className="flex items-center justify-between border-b border-untraced-dark/10 px-2 bg-untraced-light/30">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tabIcons[tab.id];
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-all duration-200",
                  activeTab === tab.id
                    ? "border-untraced-dark text-untraced-dark"
                    : "border-transparent text-untraced-dark/50 hover:text-untraced-dark/70"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
        <button
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-all duration-200",
            copied
              ? "text-green-600 bg-green-50"
              : "text-untraced-dark/60 hover:text-untraced-dark hover:bg-untraced-dark/5"
          )}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span className="font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 bg-untraced-dark/[0.02] max-h-[500px] overflow-auto">
        <pre className="text-sm font-mono text-untraced-dark/80 whitespace-pre-wrap leading-relaxed">
          <code>{currentCode}</code>
        </pre>
      </div>
    </div>
  );
}
