export interface UntracedConfig {
  chainId: number;
  registryAddress?: string;
  rpcUrl?: string;
}

export interface Module {
  id: string;
  name: string;
  attributeType: `0x${string}`;
}

export interface Flow {
  name: string;
  modules: string[];
  contractAddress?: string;
}

export interface Proof {
  moduleType: `0x${string}`;
  proof: `0x${string}`;
  publicInputs: `0x${string}`[];
}

export interface Attestation {
  valid: boolean;
  timestamp: number;
  expiry: number;
  issuerHash: `0x${string}`;
}

export interface TransactionResult {
  hash: `0x${string}`;
  wait: () => Promise<{ status: "success" | "reverted" }>;
}

export interface ModuleProofOptions {
  provider?: string;
  threshold?: number;
}
