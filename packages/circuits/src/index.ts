/**
 * UNTRACED ZK Circuits Library
 *
 * Provides proof generation and verification for ZK circuits:
 * - zk-age: Age verification without revealing birth date
 * - zk-balance: Balance verification without revealing exact amount
 */

export { ZKAgeProver, type AgeProofInputs, type AgePublicInputs } from "./zk-age";
export { ZKBalanceProver, type BalanceProofInputs, type BalancePublicInputs } from "./zk-balance";
export { computePedersenHash } from "./utils";
