import {
  UntracedConfig,
  Proof,
  Attestation,
  TransactionResult,
  ModuleProofOptions,
} from "./types";

const MANTLE_SEPOLIA_CHAIN_ID = 5003;

export class UntracedClient {
  private config: UntracedConfig;

  constructor(config: UntracedConfig) {
    this.config = {
      chainId: MANTLE_SEPOLIA_CHAIN_ID,
      ...config,
    };
  }

  /**
   * Generate a proof for a specific module
   */
  async generateProof(
    moduleId: string,
    _options?: ModuleProofOptions
  ): Promise<Proof> {
    // TODO: Integrate with zkTLS provider (Reclaim/vlayer)
    // 1. Open popup/iframe for user to connect Web2 service
    // 2. Capture TLS transcript via notary
    // 3. Generate ZK proof client-side

    console.log(`Generating proof for module: ${moduleId}`);

    // Placeholder - will be replaced with actual zkTLS integration
    return {
      moduleType: `0x${Buffer.from(moduleId).toString("hex").padEnd(64, "0")}` as `0x${string}`,
      proof: "0x" as `0x${string}`,
      publicInputs: [],
    };
  }

  /**
   * Generate proofs for all modules in a flow
   */
  async generateFlowProof(flowName: string): Promise<Proof[]> {
    // TODO: Load flow config and generate all required proofs
    console.log(`Generating flow proof for: ${flowName}`);
    return [];
  }

  /**
   * Submit a proof to the registry contract
   */
  async submitProof(_proof: Proof): Promise<TransactionResult> {
    // TODO: Call registry.submitProof()
    console.log("Submitting proof to registry...");

    return {
      hash: "0x" as `0x${string}`,
      wait: async () => ({ status: "success" as const }),
    };
  }

  /**
   * Submit all proofs for a flow
   */
  async submitFlowProof(
    flowName: string,
    _proofs: Proof[]
  ): Promise<TransactionResult> {
    console.log(`Submitting flow proofs for: ${flowName}`);

    return {
      hash: "0x" as `0x${string}`,
      wait: async () => ({ status: "success" as const }),
    };
  }

  /**
   * Check if a user has a specific attribute
   */
  async hasAttribute(_address: string, _moduleType: string): Promise<boolean> {
    // TODO: Call registry.hasAttribute()
    return false;
  }

  /**
   * Get attestation details for a user
   */
  async getAttestation(
    _address: string,
    _moduleType: string
  ): Promise<Attestation | null> {
    // TODO: Call registry.attestations()
    return null;
  }

  /**
   * Verify if a user passes all requirements for a flow
   */
  async verifyFlow(_flowName: string, _address: string): Promise<boolean> {
    // TODO: Call flow contract verifyFlow()
    return false;
  }
}

/**
 * Create a new Untraced client
 */
export function createClient(config: Partial<UntracedConfig> = {}): UntracedClient {
  return new UntracedClient({
    chainId: config.chainId ?? MANTLE_SEPOLIA_CHAIN_ID,
    ...config,
  });
}

// Default export for convenience
export const untraced = {
  createClient,
};
