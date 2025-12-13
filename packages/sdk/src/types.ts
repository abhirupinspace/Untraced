import type { Hex } from "viem";

export interface UntracedConfig {
  chainId: number;
  registryAddress: Hex;
  rpcUrl?: string;
  apiUrl?: string;
}

export interface Module {
  id: string;
  name: string;
  attributeType: Hex;
}

export interface Flow {
  name: string;
  modules: string[];
  contractAddress?: string;
}

export interface SignedAttestation {
  moduleType: Hex;
  expiry: bigint;
  v: number;
  r: Hex;
  s: Hex;
}

export interface Proof {
  moduleType: Hex;
  expiry: bigint;
  signature: {
    v: number;
    r: Hex;
    s: Hex;
    full: Hex;
  };
}

export interface Attestation {
  valid: boolean;
  timestamp: number;
  expiry: number;
  issuerHash: Hex;
}

export interface TransactionResult {
  hash: Hex;
  wait: () => Promise<{ status: "success" | "reverted" }>;
}

export interface ModuleProofOptions {
  provider?: string;
  threshold?: number;
}

export interface AttestationResponse {
  success: boolean;
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
  meta: {
    emailVerified: boolean;
    validityDays: number;
    attestor: Hex;
  };
}

// Chain configuration
export const MANTLE_SEPOLIA = {
  id: 5003,
  name: "Mantle Sepolia",
  rpcUrl: "https://rpc.sepolia.mantle.xyz",
  blockExplorer: "https://sepolia.mantlescan.xyz",
} as const;
