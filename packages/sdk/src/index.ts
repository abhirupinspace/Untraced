// Client
export { UntracedClient, createClient, ZK_EMAIL, EMAIL_MODULE_TYPE } from "./client";

// Hooks
export { useUntraced } from "./hooks";

// Types
export type {
  UntracedConfig,
  Module,
  Flow,
  Proof,
  Attestation,
  TransactionResult,
  AttestationResponse,
  SignedAttestation,
} from "./types";

export { MANTLE_SEPOLIA } from "./types";

// ABI (for advanced usage)
export { REGISTRY_ABI } from "./abi/registry";
