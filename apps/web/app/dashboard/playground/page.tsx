"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DashboardNavbar } from "@/components/dashboard/dashboard-navbar";
import { cn } from "@/lib/cn";
import {
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Shield,
  Zap,
  ChevronRight,
  Copy,
  Check,
  AlertTriangle,
  Terminal,
  Mail,
  User,
  Github,
  Wallet,
  Calendar,
  Hash,
  AtSign,
  Loader2,
  LogOut,
  Link as LinkIcon,
} from "lucide-react";
import { useWallet } from "@/lib/use-wallet";

type ModuleStatus = "idle" | "running" | "success" | "error";

interface ModuleInput {
  id: string;
  label: string;
  placeholder: string;
  type: string;
  required?: boolean;
  hint?: string;
  oauth?: "github" | "twitter"; // OAuth provider for this input
}

interface Module {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  inputs: ModuleInput[];
  config?: {
    type: "threshold" | "selection";
    label: string;
    options?: string[];
    min?: number;
    max?: number;
    default: string | number;
  };
  requiresOAuth?: "github" | "twitter"; // Requires OAuth connection
}

interface ConnectedAccount {
  username: string;
  name?: string;
  avatar?: string;
  followers?: number;
  repos?: number;
  tweets?: number;
  verified?: boolean;
}

const modules: Module[] = [
  {
    id: "zk-email",
    name: "Email Verification",
    description: "Prove email ownership without revealing the address",
    icon: Mail,
    color: "bg-blue-500",
    inputs: [
      {
        id: "email",
        label: "Email Address",
        placeholder: "you@example.com",
        type: "email",
        required: true,
        hint: "Your email will be verified but never shared",
      },
    ],
    config: {
      type: "selection",
      label: "Provider",
      options: ["Gmail", "Outlook", "Any"],
      default: "Any",
    },
  },
  {
    id: "zk-age",
    name: "Age Verification",
    description: "Prove you meet age requirements using ZK proofs",
    icon: Calendar,
    color: "bg-purple-500",
    inputs: [
      {
        id: "birthdate",
        label: "Date of Birth",
        placeholder: "YYYY-MM-DD",
        type: "date",
        required: true,
        hint: "Used to calculate age, never stored or shared",
      },
    ],
    config: {
      type: "threshold",
      label: "Minimum Age Required",
      min: 13,
      max: 100,
      default: 18,
    },
  },
  {
    id: "zk-github",
    name: "GitHub Verification",
    description: "Verify GitHub account and contribution history",
    icon: Github,
    color: "bg-gray-500",
    inputs: [],
    requiresOAuth: "github",
    config: {
      type: "threshold",
      label: "Minimum Commits Required",
      min: 0,
      max: 1000,
      default: 10,
    },
  },
  {
    id: "zk-twitter",
    name: "Twitter/X Verification",
    description: "Verify Twitter account ownership",
    icon: XIcon,
    color: "bg-black",
    inputs: [],
    requiresOAuth: "twitter",
    config: {
      type: "selection",
      label: "Verification Type",
      options: ["Account Ownership", "Follower Count", "Verified Badge"],
      default: "Account Ownership",
    },
  },
  {
    id: "zk-balance",
    name: "Balance Verification",
    description: "Prove balance threshold without revealing amount",
    icon: Wallet,
    color: "bg-green-500",
    inputs: [
      {
        id: "address",
        label: "Wallet Address",
        placeholder: "0x...",
        type: "text",
        required: true,
        hint: "Your Ethereum wallet address",
      },
    ],
    config: {
      type: "threshold",
      label: "Minimum Balance (ETH)",
      min: 0,
      max: 100,
      default: 1,
    },
  },
];

export default function PlaygroundPage() {
  return (
    <Suspense fallback={<PlaygroundLoading />}>
      <PlaygroundContent />
    </Suspense>
  );
}

function PlaygroundLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );
}

function PlaygroundContent() {
  const searchParams = useSearchParams();
  const { user } = useWallet();
  const [selectedModule, setSelectedModule] = useState<Module>(modules[0]);
  const [configValue, setConfigValue] = useState<string | number>(
    modules[0].config?.default || ""
  );
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<ModuleStatus>("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [proofData, setProofData] = useState<any>(null);
  const [executionTime, setExecutionTime] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // OAuth connected accounts
  const [githubAccount, setGithubAccount] = useState<ConnectedAccount | null>(null);
  const [twitterAccount, setTwitterAccount] = useState<ConnectedAccount | null>(null);
  const [oauthError, setOauthError] = useState<string | null>(null);

  // Load connected accounts from cookies on mount
  useEffect(() => {
    // Check for OAuth callback errors
    const error = searchParams.get("oauth_error");
    if (error) {
      setOauthError(decodeURIComponent(error));
      // Clear the error from URL
      window.history.replaceState({}, "", "/dashboard/playground");
    }

    // Check for successful GitHub connection
    if (searchParams.get("github_connected") === "true") {
      const username = searchParams.get("github_username");
      if (username) {
        // Read full user data from cookie
        try {
          const userData = document.cookie
            .split("; ")
            .find((row) => row.startsWith("github_user="));
          if (userData) {
            const user = JSON.parse(decodeURIComponent(userData.split("=")[1]));
            setGithubAccount(user);
          } else {
            setGithubAccount({ username });
          }
        } catch {
          setGithubAccount({ username });
        }
        window.history.replaceState({}, "", "/dashboard/playground");
      }
    }

    // Check for successful Twitter connection
    if (searchParams.get("twitter_connected") === "true") {
      const username = searchParams.get("twitter_username");
      if (username) {
        try {
          const userData = document.cookie
            .split("; ")
            .find((row) => row.startsWith("twitter_user="));
          if (userData) {
            const user = JSON.parse(decodeURIComponent(userData.split("=")[1]));
            setTwitterAccount(user);
          } else {
            setTwitterAccount({ username });
          }
        } catch {
          setTwitterAccount({ username });
        }
        window.history.replaceState({}, "", "/dashboard/playground");
      }
    }

    // Load existing accounts from cookies
    try {
      const githubCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("github_user="));
      if (githubCookie) {
        setGithubAccount(JSON.parse(decodeURIComponent(githubCookie.split("=")[1])));
      }

      const twitterCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("twitter_user="));
      if (twitterCookie) {
        setTwitterAccount(JSON.parse(decodeURIComponent(twitterCookie.split("=")[1])));
      }
    } catch (e) {
      console.error("Failed to load connected accounts:", e);
    }
  }, [searchParams]);

  const handleModuleSelect = (module: Module) => {
    setSelectedModule(module);
    setConfigValue(module.config?.default || "");
    setInputValues({});
    setStatus("idle");
    setLogs([]);
    setProofData(null);
    setValidationError(null);
    setOauthError(null);
  };

  const connectOAuth = (provider: "github" | "twitter") => {
    const returnUrl = encodeURIComponent("/dashboard/playground");
    window.location.href = `/api/auth/${provider}?returnUrl=${returnUrl}`;
  };

  const disconnectOAuth = async (provider: "github" | "twitter") => {
    try {
      await fetch("/api/auth/tokens", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });
      if (provider === "github") setGithubAccount(null);
      if (provider === "twitter") setTwitterAccount(null);
    } catch (e) {
      console.error("Failed to disconnect:", e);
    }
  };

  const handleInputChange = (inputId: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [inputId]: value }));
    setValidationError(null);
  };

  const addLog = useCallback((message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  }, []);

  const validateInputs = (): boolean => {
    for (const input of selectedModule.inputs) {
      if (input.required && !inputValues[input.id]?.trim()) {
        setValidationError(`${input.label} is required`);
        return false;
      }

      // Email validation
      if (input.type === "email" && inputValues[input.id]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(inputValues[input.id])) {
          setValidationError("Please enter a valid email address");
          return false;
        }
      }

      // Date validation for age
      if (input.type === "date" && inputValues[input.id]) {
        const birthDate = new Date(inputValues[input.id]);
        const today = new Date();
        const age = Math.floor(
          (today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
        );
        if (age < 0 || age > 150) {
          setValidationError("Please enter a valid date of birth");
          return false;
        }
      }

      // Wallet address validation
      if (input.id === "address" && inputValues[input.id]) {
        if (!inputValues[input.id].match(/^0x[a-fA-F0-9]{40}$/)) {
          setValidationError("Please enter a valid Ethereum address");
          return false;
        }
      }
    }
    return true;
  };

  const runVerification = async () => {
    // Check OAuth requirements
    if (selectedModule.requiresOAuth === "github" && !githubAccount) {
      setValidationError("Please connect your GitHub account first");
      return;
    }
    if (selectedModule.requiresOAuth === "twitter" && !twitterAccount) {
      setValidationError("Please connect your Twitter account first");
      return;
    }

    if (!validateInputs()) return;

    setStatus("running");
    setLogs([]);
    setProofData(null);
    setValidationError(null);
    const startTime = Date.now();

    try {
      // Module-specific verification
      addLog(`Initializing ${selectedModule.name}...`);
      await delay(400);

      // Handle OAuth-based modules
      if (selectedModule.requiresOAuth === "github") {
        await runGitHubVerification();
      } else if (selectedModule.requiresOAuth === "twitter") {
        await runTwitterVerification();
      } else {
        // Standard input-based modules
        const mainInput = selectedModule.inputs[0];
        const inputValue = inputValues[mainInput?.id];
        if (mainInput && inputValue) {
          const maskedValue = maskInput(mainInput.type, inputValue);
          addLog(`Processing input: ${maskedValue}`);
        }
        await delay(300);

        addLog("Loading Noir circuit from ACIR...");
        await delay(500);

        addLog("Initializing proving backend (UltraPlonk)...");
        await delay(400);

        // Module-specific witness generation
        if (selectedModule.id === "zk-age") {
          const birthDate = new Date(inputValues.birthdate);
          const age = Math.floor(
            (Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
          );
          addLog(`Computing age from birthdate: ${age} years`);
          await delay(300);
          addLog(`Checking against threshold: ${configValue} years`);
          await delay(200);

          if (age < (configValue as number)) {
            throw new Error(`Age verification failed: ${age} < ${configValue}`);
          }
          addLog(`Age requirement satisfied: ${age} >= ${configValue}`);
        } else if (selectedModule.id === "zk-email") {
          addLog(`Verifying email domain...`);
          await delay(400);
          addLog(`Email domain verified successfully`);
        } else if (selectedModule.id === "zk-balance") {
          addLog(`Querying balance for ${inputValues.address.slice(0, 10)}...`);
          await delay(500);
          const mockBalance = (Math.random() * 10 + 0.5).toFixed(4);
          addLog(`Current balance: ${mockBalance} ETH`);
          await delay(200);
          if (parseFloat(mockBalance) < (configValue as number)) {
            throw new Error(`Balance ${mockBalance} ETH < required ${configValue} ETH`);
          }
          addLog(`Balance requirement satisfied`);
        }

        await delay(300);
        addLog("Generating witness from private inputs...");
        await delay(600);

        addLog("Computing zero-knowledge proof...");
        await delay(1200);

        addLog("Serializing proof to bytes...");
        await delay(300);

        addLog("Verifying proof locally...");
        await delay(400);

        addLog("Proof verification: PASSED");
        await delay(200);

        const endTime = Date.now();
        setExecutionTime(endTime - startTime);

        // Generate mock proof data
        const mockProof = {
          proof: generateMockHex(256),
          publicInputs: [
            generateMockHex(64),
            selectedModule.id === "zk-age" ? `0x${(configValue as number).toString(16).padStart(4, '0')}` : generateMockHex(8),
          ],
          nullifier: generateMockHex(64),
          commitment: generateMockHex(64),
          verified: true,
          module: selectedModule.id,
          config: configValue,
          timestamp: new Date().toISOString(),
          circuit: `${selectedModule.id}_v1.0`,
          backend: "UltraPlonk",
        };

        setProofData(mockProof);
        setStatus("success");
        addLog("Verification complete!");
      }
    } catch (error: any) {
      setStatus("error");
      addLog(`Error: ${error.message || "Verification failed"}`);
      setExecutionTime(Date.now() - startTime);
    }
  };

  const runGitHubVerification = async () => {
    addLog(`Connected as @${githubAccount?.username}`);
    await delay(300);

    addLog("Fetching access token from session...");
    await delay(200);

    // Get the actual token from server
    const tokenRes = await fetch("/api/auth/tokens");
    const tokens = await tokenRes.json();

    if (!tokens.github?.connected) {
      throw new Error("GitHub session expired. Please reconnect.");
    }

    addLog(`Calling GitHub attestation API...`);
    addLog(`Minimum commits required: ${configValue}`);
    await delay(400);

    // Call the real attestation API
    const userAddress = user?.wallet?.address || "0x0000000000000000000000000000000000000000";
    const response = await fetch("/api/attest/github", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userAddress,
        githubAccessToken: tokens.github.token,
        minCommits: configValue as number,
        nonce: Date.now(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.required !== undefined && data.actual !== undefined) {
        addLog(`Fetched ${data.actual} commits from GitHub API`);
        throw new Error(`Commit requirement not met: ${data.actual} < ${data.required}`);
      }
      throw new Error(data.error || "GitHub verification failed");
    }

    addLog(`Username: @${data.meta.githubUsername}`);
    addLog(`Total commits found: ${data.meta.actualCommits}`);
    addLog(`Repositories: ${data.meta.totalRepos}`);
    addLog(`Account age: ${data.meta.accountAgeDays} days`);
    await delay(300);

    addLog(`Commit requirement met: ${data.meta.actualCommits} >= ${data.meta.minCommitsVerified}`);
    await delay(200);

    addLog("Generating EIP-712 attestation signature...");
    await delay(400);

    addLog("Attestation signed by trusted attestor");
    addLog(`Attestor: ${data.meta.attestor.slice(0, 10)}...`);
    await delay(200);

    addLog("Proof verification: PASSED");
    setExecutionTime(Date.now());

    setProofData({
      proof: data.attestation.signature.full,
      publicInputs: [
        data.attestation.moduleType,
        `0x${(data.meta.minCommitsVerified).toString(16).padStart(8, '0')}`,
      ],
      nullifier: generateMockHex(64),
      commitment: data.attestation.proofData,
      verified: true,
      module: selectedModule.id,
      config: configValue,
      timestamp: new Date().toISOString(),
      attestation: data.attestation,
      meta: data.meta,
    });

    setStatus("success");
    addLog("Verification complete!");
  };

  const runTwitterVerification = async () => {
    addLog(`Connected as @${twitterAccount?.username}`);
    await delay(300);

    addLog("Fetching access token from session...");
    await delay(200);

    // Get the actual token from server
    const tokenRes = await fetch("/api/auth/tokens");
    const tokens = await tokenRes.json();

    if (!tokens.twitter?.connected) {
      throw new Error("Twitter session expired. Please reconnect.");
    }

    // Map config value to verification type
    const verificationTypeMap: Record<string, "account" | "followers" | "verified"> = {
      "Account Ownership": "account",
      "Follower Count": "followers",
      "Verified Badge": "verified",
    };
    const verificationType = verificationTypeMap[configValue as string] || "account";

    addLog(`Calling Twitter attestation API...`);
    addLog(`Verification type: ${configValue}`);
    await delay(400);

    // Call the real attestation API
    const userAddress = user?.wallet?.address || "0x0000000000000000000000000000000000000000";
    const response = await fetch("/api/attest/twitter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userAddress,
        twitterAccessToken: tokens.twitter.token,
        verificationType,
        minFollowers: verificationType === "followers" ? 100 : 0,
        nonce: Date.now(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Twitter verification failed");
    }

    addLog(`Username: @${data.meta.twitterUsername}`);
    addLog(`Followers: ${data.meta.followers.toLocaleString()}`);
    addLog(`Tweets: ${data.meta.tweets.toLocaleString()}`);
    addLog(`Account age: ${data.meta.accountAgeDays} days`);
    if (data.meta.isVerified) {
      addLog(`Verified: Yes`);
    }
    await delay(300);

    addLog(`Verification type "${configValue}" passed`);
    await delay(200);

    addLog("Generating EIP-712 attestation signature...");
    await delay(400);

    addLog("Attestation signed by trusted attestor");
    addLog(`Attestor: ${data.meta.attestor.slice(0, 10)}...`);
    await delay(200);

    addLog("Proof verification: PASSED");
    setExecutionTime(Date.now());

    setProofData({
      proof: data.attestation.signature.full,
      publicInputs: [
        data.attestation.moduleType,
        `0x${verificationType === "account" ? "00" : verificationType === "followers" ? "01" : "02"}`,
      ],
      nullifier: generateMockHex(64),
      commitment: data.attestation.proofData,
      verified: true,
      module: selectedModule.id,
      config: configValue,
      timestamp: new Date().toISOString(),
      attestation: data.attestation,
      meta: data.meta,
    });

    setStatus("success");
    addLog("Verification complete!");
  };

  const resetPlayground = () => {
    setStatus("idle");
    setLogs([]);
    setProofData(null);
    setExecutionTime(0);
    setInputValues({});
    setValidationError(null);
  };

  const copyProof = () => {
    if (proofData) {
      navigator.clipboard.writeText(JSON.stringify(proofData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Check if OAuth is connected for modules that require it
  const isOAuthConnected = () => {
    if (selectedModule.requiresOAuth === "github") return !!githubAccount;
    if (selectedModule.requiresOAuth === "twitter") return !!twitterAccount;
    return true;
  };

  const canRun =
    isOAuthConnected() &&
    selectedModule.inputs.every(
      (input) => !input.required || inputValues[input.id]?.trim()
    );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <DashboardNavbar title="Playground">
        <Badge variant="secondary" className="text-[10px] font-medium">Testnet</Badge>
        <div className="ml-auto mr-4">
          <Button
            variant="outline"
            size="sm"
            onClick={resetPlayground}
            className="border-border text-muted-foreground hover:text-foreground h-8 gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </Button>
        </div>
      </DashboardNavbar>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Module Selection & Inputs */}
          <div className="space-y-4">
            {/* Module List */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="text-sm font-normal text-foreground">Select Module</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Choose a ZK module to test</p>
              </div>
              <div className="p-2">
                {modules.map((module) => {
                  const Icon = module.icon;
                  const isSelected = selectedModule.id === module.id;
                  return (
                    <button
                      key={module.id}
                      onClick={() => handleModuleSelect(module)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                        isSelected ? "bg-primary/10 dark:bg-white/10" : "hover:bg-secondary"
                      )}
                    >
                      <div className={cn("p-2 rounded-lg", module.color)}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className={cn(
                          "text-sm font-light truncate",
                          isSelected ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {module.name}
                        </p>
                      </div>
                      {isSelected && (
                        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input Fields / OAuth Connection */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="text-sm font-normal text-foreground">
                  {selectedModule.requiresOAuth ? "Account Connection" : "Input Data"}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedModule.requiresOAuth
                    ? `Connect your ${selectedModule.requiresOAuth === "github" ? "GitHub" : "Twitter"} account`
                    : "Provide the required information"}
                </p>
              </div>
              <div className="p-4 space-y-4">
                {/* OAuth Connection UI */}
                {selectedModule.requiresOAuth === "github" && (
                  <OAuthConnectionCard
                    provider="github"
                    account={githubAccount}
                    onConnect={() => connectOAuth("github")}
                    onDisconnect={() => disconnectOAuth("github")}
                    icon={<Github className="w-5 h-5" />}
                    label="GitHub"
                    stats={
                      githubAccount
                        ? [
                            { label: "Repos", value: githubAccount.repos?.toString() || "0" },
                            { label: "Followers", value: githubAccount.followers?.toString() || "0" },
                          ]
                        : undefined
                    }
                  />
                )}

                {selectedModule.requiresOAuth === "twitter" && (
                  <OAuthConnectionCard
                    provider="twitter"
                    account={twitterAccount}
                    onConnect={() => connectOAuth("twitter")}
                    onDisconnect={() => disconnectOAuth("twitter")}
                    icon={<XIcon className="w-5 h-5" />}
                    label="Twitter / X"
                    stats={
                      twitterAccount
                        ? [
                            { label: "Followers", value: twitterAccount.followers?.toLocaleString() || "0" },
                            { label: "Tweets", value: twitterAccount.tweets?.toLocaleString() || "0" },
                          ]
                        : undefined
                    }
                  />
                )}

                {/* OAuth Error */}
                {oauthError && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                    <p className="text-xs text-destructive">{oauthError}</p>
                  </div>
                )}

                {/* Standard input fields */}
                {selectedModule.inputs.map((input) => (
                  <div key={input.id}>
                    <Input
                      label={input.label}
                      type={input.type}
                      placeholder={input.placeholder}
                      value={inputValues[input.id] || ""}
                      onChange={(e) => handleInputChange(input.id, e.target.value)}
                      hint={input.hint}
                    />
                  </div>
                ))}

                {/* Configuration */}
                {selectedModule.config && (
                  <div className="pt-4 border-t border-border">
                    <label className="block text-xs text-muted-foreground mb-2">
                      {selectedModule.config.label}
                    </label>
                    {selectedModule.config.type === "threshold" ? (
                      <div className="space-y-2">
                        <input
                          type="range"
                          min={selectedModule.config.min}
                          max={selectedModule.config.max}
                          value={configValue as number}
                          onChange={(e) => setConfigValue(Number(e.target.value))}
                          className="w-full accent-primary h-1.5 bg-secondary rounded-full appearance-none cursor-pointer"
                        />
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{selectedModule.config.min}</span>
                          <span className="text-foreground font-medium tabular-nums px-2 py-0.5 bg-secondary rounded">
                            {configValue}
                          </span>
                          <span className="text-muted-foreground">{selectedModule.config.max}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {selectedModule.config.options?.map((option) => (
                          <button
                            key={option}
                            onClick={() => setConfigValue(option)}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-xs font-light transition-all",
                              configValue === option
                                ? "bg-primary/10 text-foreground dark:bg-white/10"
                                : "bg-secondary text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Validation Error */}
                {validationError && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                    <p className="text-xs text-destructive">{validationError}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Run Button */}
            <Button
              onClick={runVerification}
              disabled={status === "running" || !canRun}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 gap-2 text-sm font-normal disabled:opacity-50"
            >
              {status === "running" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Verification
                </>
              )}
            </Button>
          </div>

          {/* Middle Panel - Terminal */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-normal text-foreground">Console</h3>
              </div>
              {status === "running" && (
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                  </span>
                  <span className="text-xs text-muted-foreground">Running</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-h-[400px] max-h-[500px] overflow-auto p-4 font-mono text-xs bg-muted/30 dark:bg-black/20">
              {logs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Run a verification to see logs</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  {logs.map((log, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.15 }}
                      className={cn(
                        "py-0.5 leading-relaxed",
                        log.includes("Error")
                          ? "text-destructive"
                          : log.includes("PASSED") || log.includes("complete") || log.includes("satisfied") || log.includes("verified") || log.includes("confirmed")
                          ? "text-success"
                          : log.includes("...")
                          ? "text-warning"
                          : "text-muted-foreground"
                      )}
                    >
                      {log}
                    </motion.div>
                  ))}
                  {status === "running" && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="text-muted-foreground"
                    >
                      █
                    </motion.span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="space-y-4">
            {/* Status Card */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="text-sm font-normal text-foreground">Status</h3>
              </div>
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {status === "idle" && (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center"
                    >
                      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-3">
                        <Zap className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">Ready to run</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        Fill in the inputs and click run
                      </p>
                    </motion.div>
                  )}

                  {status === "running" && (
                    <motion.div
                      key="running"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center"
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-3">
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      </div>
                      <p className="text-sm text-foreground">Generating proof...</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        This may take a few seconds
                      </p>
                    </motion.div>
                  )}

                  {status === "success" && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center"
                    >
                      <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      </div>
                      <p className="text-sm text-foreground">Verification Successful</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Completed in {(executionTime / 1000).toFixed(2)}s
                      </p>
                    </motion.div>
                  )}

                  {status === "error" && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center"
                    >
                      <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center mx-auto mb-3">
                        <XCircle className="w-5 h-5 text-destructive" />
                      </div>
                      <p className="text-sm text-foreground">Verification Failed</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Check the console for details
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Proof Output */}
            {proofData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border bg-card overflow-hidden"
              >
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-normal text-foreground">Proof Output</h3>
                  </div>
                  <button
                    onClick={copyProof}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-success" />
                        <span className="text-success">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  <ProofField label="Circuit" value={proofData.circuit} />
                  <ProofField label="Backend" value={proofData.backend} />
                  <ProofField label="Proof" value={proofData.proof} truncate />
                  <ProofField label="Nullifier" value={proofData.nullifier} truncate />
                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Verified</span>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-success" />
                        <span className="text-xs text-success">true</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Info Card */}
            <div className="rounded-2xl border border-warning/20 bg-warning/5 p-4">
              <div className="flex gap-3">
                <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                <div className="text-xs text-warning space-y-1">
                  <p>
                    GitHub and Twitter modules use real OAuth authentication.
                    Other modules are simulated.
                  </p>
                  <p>
                    Attestations are signed but not submitted to the blockchain.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProofField({
  label,
  value,
  truncate,
}: {
  label: string;
  value: string;
  truncate?: boolean;
}) {
  return (
    <div>
      <span className="text-xs text-muted-foreground block mb-1">{label}</span>
      <code
        className={cn(
          "text-xs text-foreground/80 font-mono bg-secondary px-2 py-1.5 rounded block",
          truncate && "truncate"
        )}
      >
        {truncate && value.length > 40 ? `${value.slice(0, 16)}...${value.slice(-16)}` : value}
      </code>
    </div>
  );
}

function OAuthConnectionCard({
  provider,
  account,
  onConnect,
  onDisconnect,
  icon,
  label,
  stats,
}: {
  provider: "github" | "twitter";
  account: ConnectedAccount | null;
  onConnect: () => void;
  onDisconnect: () => void;
  icon: React.ReactNode;
  label: string;
  stats?: { label: string; value: string }[];
}) {
  if (account) {
    return (
      <div className="rounded-xl border border-border bg-secondary/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary text-foreground">{icon}</div>
            <div>
              <p className="text-sm text-foreground font-light">@{account.username}</p>
              {account.name && (
                <p className="text-xs text-muted-foreground">{account.name}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-success/10">
              <CheckCircle2 className="w-3 h-3 text-success" />
              <span className="text-xs text-success">Connected</span>
            </div>
          </div>
        </div>
        {stats && stats.length > 0 && (
          <div className="flex items-center gap-4 mb-3 pb-3 border-b border-border">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">{stat.label}:</span>
                <span className="text-xs text-foreground tabular-nums">{stat.value}</span>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={onDisconnect}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-destructive transition-colors"
        >
          <LogOut className="w-3 h-3" />
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onConnect}
      className="w-full flex items-center justify-center gap-3 p-4 rounded-xl border border-dashed border-border bg-secondary/30 hover:bg-secondary/50 hover:border-primary/30 transition-all"
    >
      <div className="p-2 rounded-lg bg-secondary text-muted-foreground">{icon}</div>
      <div className="text-left">
        <p className="text-sm text-foreground font-light">Connect {label}</p>
        <p className="text-xs text-muted-foreground">Authenticate to verify your account</p>
      </div>
      <LinkIcon className="w-4 h-4 text-muted-foreground ml-auto" />
    </button>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateMockHex(length: number): string {
  const chars = "0123456789abcdef";
  let result = "0x";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function maskInput(type: string, value: string): string {
  if (!value) return "***";
  if (type === "email") {
    const [local, domain] = value.split("@");
    if (local && domain) {
      return `${local.slice(0, 2)}***@${domain}`;
    }
  }
  if (type === "date") {
    return "****-**-**";
  }
  if (value.startsWith("0x")) {
    return `${value.slice(0, 6)}...${value.slice(-4)}`;
  }
  if (value.startsWith("@")) {
    return `@${value.slice(1, 3)}***`;
  }
  return `${value.slice(0, 3)}***`;
}
