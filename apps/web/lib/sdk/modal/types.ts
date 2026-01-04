import type { Hex } from "viem";

export type VerificationModule =
  | "zk-email"
  | "zk-age"
  | "zk-github"
  | "zk-twitter"
  | "zk-balance";

export type VerificationStatus =
  | "idle"
  | "connecting"
  | "verifying"
  | "submitting"
  | "success"
  | "error";

export interface UntracedConfig {
  clientId: string;
  apiUrl?: string;
  chainId?: number;
  registryAddress?: Hex;
  theme?: "light" | "dark" | "auto";
  accentColor?: string;
  modules?: VerificationModule[];
  onSuccess?: (result: VerificationResult) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
}

export interface VerificationResult {
  moduleId: VerificationModule;
  userAddress: Hex;
  attestation: {
    moduleType: Hex;
    expiry: string;
    signature: {
      v: number;
      r: Hex;
      s: Hex;
      full: Hex;
    };
  };
  transactionHash?: Hex;
  verificationId: string;
  verified: boolean;
}

export interface ModuleConfig {
  id: VerificationModule;
  name: string;
  description: string;
  icon: string;
  color: string;
  requiresOAuth?: boolean;
  oauthProvider?: "github" | "twitter";
  configOptions?: ModuleConfigOption[];
}

export interface ModuleConfigOption {
  id: string;
  label: string;
  type: "number" | "select";
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  default: string | number;
}

export interface UntracedContextValue {
  config: UntracedConfig | null;
  isOpen: boolean;
  isConnected: boolean;
  userAddress: Hex | null;
  status: VerificationStatus;
  currentModule: VerificationModule | null;
  verificationResult: VerificationResult | null;
  error: Error | null;
  open: (module?: VerificationModule) => void;
  close: () => void;
  verify: (module: VerificationModule, options?: Record<string, unknown>) => Promise<VerificationResult>;
  reset: () => void;
}

export type ModuleIconType = "email" | "user" | "github" | "twitter" | "wallet";

export const AVAILABLE_MODULES: ModuleConfig[] = [
  {
    id: "zk-email",
    name: "Email",
    description: "Verify email ownership",
    icon: "email",
    color: "#7c3aed",
    configOptions: [
      {
        id: "provider",
        label: "Provider",
        type: "select",
        options: [
          { label: "Any", value: "any" },
          { label: "Gmail", value: "gmail" },
          { label: "Outlook", value: "outlook" },
        ],
        default: "any",
      },
    ],
  },
  {
    id: "zk-age",
    name: "Age",
    description: "Prove you meet age requirements",
    icon: "user",
    color: "#8b5cf6",
    configOptions: [
      {
        id: "minAge",
        label: "Minimum Age",
        type: "number",
        min: 13,
        max: 100,
        default: 18,
      },
    ],
  },
  {
    id: "zk-github",
    name: "GitHub",
    description: "Verify GitHub activity",
    icon: "github",
    color: "#6d28d9",
    requiresOAuth: true,
    oauthProvider: "github",
    configOptions: [
      {
        id: "minCommits",
        label: "Min Commits",
        type: "number",
        min: 0,
        max: 10000,
        default: 10,
      },
    ],
  },
  {
    id: "zk-twitter",
    name: "Twitter/X",
    description: "Verify Twitter account",
    icon: "twitter",
    color: "#a855f7",
    requiresOAuth: true,
    oauthProvider: "twitter",
    configOptions: [
      {
        id: "verificationType",
        label: "Verify",
        type: "select",
        options: [
          { label: "Account Exists", value: "account" },
          { label: "Followers", value: "followers" },
          { label: "Verified Badge", value: "verified" },
        ],
        default: "account",
      },
    ],
  },
  {
    id: "zk-balance",
    name: "Balance",
    description: "Prove wallet balance threshold",
    icon: "wallet",
    color: "#9333ea",
    configOptions: [
      {
        id: "minBalance",
        label: "Min Balance (ETH)",
        type: "number",
        min: 0,
        max: 1000000,
        default: 0.1,
      },
    ],
  },
];
