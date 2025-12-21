/**
 * UNTRACED ZK Circuits Library
 *
 * Provides proof generation and verification for ZK circuits:
 * - zk-age: Age verification without revealing birth date
 * - zk-balance: Balance verification without revealing exact amount
 */

export { ZKAgeProver, type AgeProofInputs, type AgePublicInputs, type AgeProof } from "./zk-age.js";
export {
  ZKBalanceProver,
  type BalanceProofInputs,
  type BalancePublicInputs,
  type BalanceProof,
} from "./zk-balance.js";
export {
  computePedersenHash,
  computeAgeCommitment,
  computeBalanceCommitment,
  generateRandomSecret,
  addressToField,
  hexToBigInt,
  bigIntToHex,
  getCurrentDate,
  getCurrentTimestamp,
  destroyBarretenberg,
} from "./utils.js";
