// Client
export { UntracedClient, createClient, ZK_EMAIL, EMAIL_MODULE_TYPE } from "./client";

// Hooks (legacy)
export { useUntraced } from "./hooks";

// Modal Components (new KYC modal)
export {
  UntracedProvider,
  UntracedModal,
  UntracedButton,
  useUntracedModal,
  useUntracedContext,
  AVAILABLE_MODULES,
} from "./modal";

export type {
  UntracedConfig as ModalConfig,
  UntracedContextValue,
  VerificationModule,
  VerificationStatus,
  VerificationResult,
  ModuleConfig,
  UseUntracedModalReturn,
} from "./modal";

// Types (legacy client types)
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
