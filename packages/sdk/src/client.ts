import {
  createPublicClient,
  http,
  keccak256,
  toHex,
  type Hex,
  type PublicClient,
  type WalletClient,
} from "viem";
import { mantleSepoliaTestnet } from "viem/chains";
import {
  UntracedConfig,
  Proof,
  Attestation,
  TransactionResult,
  AttestationResponse,
  MANTLE_SEPOLIA,
} from "./types";
import { REGISTRY_ABI } from "./abi/registry";

// Module type for email verification
export const ZK_EMAIL = keccak256(toHex("ZK_EMAIL"));

export class UntracedClient {
  private config: UntracedConfig;
  private publicClient: PublicClient;

  constructor(config: UntracedConfig) {
    this.config = {
      chainId: MANTLE_SEPOLIA.id,
      apiUrl: "/api/attest",
      ...config,
    };

    this.publicClient = createPublicClient({
      chain: mantleSepoliaTestnet,
      transport: http(config.rpcUrl || MANTLE_SEPOLIA.rpcUrl),
    });
  }

  /**
   * Generate a proof for a specific module by calling the attestation API
   * @param moduleId The module ID (e.g., "zk-email")
   * @param githubAccessToken GitHub OAuth access token
   * @param userAddress The user's wallet address
   */
  async generateProof(
    moduleId: string,
    githubAccessToken: string,
    userAddress: Hex
  ): Promise<Proof> {
    if (moduleId !== "zk-email") {
      throw new Error(`Unsupported module: ${moduleId}`);
    }

    // Get current nonce from contract
    const nonce = await this.getNonce(userAddress);

    // Call attestation API
    const response = await fetch(this.config.apiUrl!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userAddress,
        githubAccessToken,
        nonce: Number(nonce),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to generate proof");
    }

    const data: AttestationResponse = await response.json();

    return {
      moduleType: data.attestation.moduleType as Hex,
      expiry: BigInt(data.attestation.expiry),
      signature: data.attestation.signature,
    };
  }

  /**
   * Submit a proof to the registry contract
   * @param proof The proof object from generateProof
   * @param walletClient The user's wallet client from Privy
   */
  async submitProof(
    proof: Proof,
    walletClient: WalletClient
  ): Promise<TransactionResult> {
    const account = walletClient.account;
    if (!account) {
      throw new Error("Wallet not connected");
    }

    const hash = await walletClient.writeContract({
      address: this.config.registryAddress,
      abi: REGISTRY_ABI,
      functionName: "submitSignedProof",
      args: [
        proof.moduleType,
        proof.expiry,
        proof.signature.v,
        proof.signature.r as Hex,
        proof.signature.s as Hex,
      ],
      chain: mantleSepoliaTestnet,
      account,
    });

    return {
      hash,
      wait: async () => {
        const receipt = await this.publicClient.waitForTransactionReceipt({
          hash,
        });
        return {
          status: receipt.status === "success" ? "success" : "reverted",
        };
      },
    };
  }

  /**
   * Check if a user has a specific attribute
   */
  async hasAttribute(address: Hex, moduleType: Hex): Promise<boolean> {
    const result = await this.publicClient.readContract({
      address: this.config.registryAddress,
      abi: REGISTRY_ABI,
      functionName: "hasAttribute",
      args: [address, moduleType],
    });
    return result as boolean;
  }

  /**
   * Check if user has email verification
   */
  async hasEmailVerification(address: Hex): Promise<boolean> {
    return this.hasAttribute(address, ZK_EMAIL);
  }

  /**
   * Get attestation details for a user
   */
  async getAttestation(
    address: Hex,
    moduleType: Hex
  ): Promise<Attestation | null> {
    const result = await this.publicClient.readContract({
      address: this.config.registryAddress,
      abi: REGISTRY_ABI,
      functionName: "getAttestation",
      args: [address, moduleType],
    });

    const attestation = result as {
      valid: boolean;
      timestamp: bigint;
      expiry: bigint;
      issuerHash: Hex;
    };

    if (!attestation.valid && attestation.timestamp === 0n) {
      return null;
    }

    return {
      valid: attestation.valid,
      timestamp: Number(attestation.timestamp),
      expiry: Number(attestation.expiry),
      issuerHash: attestation.issuerHash,
    };
  }

  /**
   * Get current nonce for a user
   */
  async getNonce(address: Hex): Promise<bigint> {
    const result = await this.publicClient.readContract({
      address: this.config.registryAddress,
      abi: REGISTRY_ABI,
      functionName: "getNonce",
      args: [address],
    });
    return result as bigint;
  }

  /**
   * Revoke an attestation
   */
  async revokeAttestation(
    moduleType: Hex,
    walletClient: WalletClient
  ): Promise<TransactionResult> {
    const account = walletClient.account;
    if (!account) {
      throw new Error("Wallet not connected");
    }

    const hash = await walletClient.writeContract({
      address: this.config.registryAddress,
      abi: REGISTRY_ABI,
      functionName: "revokeAttestation",
      args: [moduleType],
      chain: mantleSepoliaTestnet,
      account,
    });

    return {
      hash,
      wait: async () => {
        const receipt = await this.publicClient.waitForTransactionReceipt({
          hash,
        });
        return {
          status: receipt.status === "success" ? "success" : "reverted",
        };
      },
    };
  }
}

/**
 * Create a new Untraced client
 */
export function createClient(config: UntracedConfig): UntracedClient {
  return new UntracedClient(config);
}

// Re-export ZK_EMAIL for convenience
export { ZK_EMAIL as EMAIL_MODULE_TYPE };
