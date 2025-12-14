/**
 * Utility functions for ZK circuits
 */

import { BarretenbergBackend } from "@noir-lang/backend_barretenberg";
import { Noir } from "@noir-lang/noir_js";

/**
 * Compute Pedersen hash (matches the circuit implementation)
 * Note: This is a placeholder - actual implementation uses Barretenberg
 */
export async function computePedersenHash(inputs: bigint[]): Promise<bigint> {
  // In a real implementation, this would use the same Pedersen hash
  // as the circuit. For now, we compute it via proof generation.
  // The actual commitment should be computed client-side before proof generation.
  throw new Error("Use the prover classes to compute commitments");
}

/**
 * Convert hex string to bigint
 */
export function hexToBigInt(hex: string): bigint {
  if (hex.startsWith("0x")) {
    return BigInt(hex);
  }
  return BigInt("0x" + hex);
}

/**
 * Convert bigint to hex string (0x prefixed)
 */
export function bigIntToHex(n: bigint): string {
  return "0x" + n.toString(16);
}

/**
 * Get current timestamp in seconds
 */
export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Get current date components
 */
export function getCurrentDate(): { year: number; month: number; day: number } {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1, // JavaScript months are 0-indexed
    day: now.getDate(),
  };
}

/**
 * Generate a cryptographically secure random field element
 */
export function generateRandomSecret(): bigint {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  // Reduce to fit in field (BN254 scalar field)
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return BigInt("0x" + hex) % BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");
}

/**
 * Load a compiled Noir circuit
 */
export async function loadCircuit(circuitPath: string): Promise<{ circuit: unknown }> {
  // This would load the compiled circuit JSON from the target directory
  // For bundled usage, circuits should be imported directly
  const circuit = await import(circuitPath);
  return { circuit: circuit.default };
}
