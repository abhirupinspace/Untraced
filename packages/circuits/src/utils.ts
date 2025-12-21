/**
 * Utility functions for ZK circuits
 */

import { Barretenberg, Fr } from "@aztec/bb.js";

// BN254 scalar field modulus
const FIELD_MODULUS = BigInt(
  "21888242871839275222246405745257275088548364400416034343698204186575808495617"
);

// Singleton Barretenberg instance for Pedersen hashing
let barretenbergInstance: Barretenberg | null = null;

/**
 * Get or initialize the Barretenberg instance
 */
async function getBarretenberg(): Promise<Barretenberg> {
  if (!barretenbergInstance) {
    barretenbergInstance = await Barretenberg.new({ threads: 1 });
  }
  return barretenbergInstance;
}

/**
 * Convert a value to a bigint, reducing to field size if needed
 */
function toBigIntField(value: number | bigint | string): bigint {
  let bigIntValue: bigint;

  if (typeof value === "string") {
    bigIntValue = value.startsWith("0x") ? BigInt(value) : BigInt("0x" + value);
  } else {
    bigIntValue = BigInt(value);
  }

  // Reduce to field size
  bigIntValue = bigIntValue % FIELD_MODULUS;
  if (bigIntValue < 0n) {
    bigIntValue += FIELD_MODULUS;
  }

  return bigIntValue;
}

/**
 * Convert a value to a Fr field element
 */
function toFr(value: number | bigint | string): Fr {
  return new Fr(toBigIntField(value));
}

/**
 * Compute Pedersen hash matching Noir's std::hash::pedersen_hash
 *
 * This uses Barretenberg's native Pedersen hash implementation which is
 * identical to what Noir circuits use internally.
 *
 * @param inputs - Array of field elements to hash
 * @returns The Pedersen hash as a bigint
 */
export async function computePedersenHash(inputs: (bigint | number)[]): Promise<bigint> {
  const bb = await getBarretenberg();

  // Convert inputs to Fr elements
  const fieldElements = inputs.map((v) => toFr(v));

  // Compute Pedersen hash using Barretenberg
  // hashIndex = 0 matches Noir's default pedersen_hash behavior
  const result = await bb.pedersenHash(fieldElements, 0);

  // Convert result buffer to bigint
  const buffer = result.toBuffer();
  let value = 0n;
  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8n) | BigInt(buffer[i]);
  }

  return value;
}

/**
 * Compute commitment for age verification
 * commitment = pedersen_hash([birth_year, birth_month, birth_day, secret, user_address])
 */
export async function computeAgeCommitment(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  secret: bigint,
  userAddress: bigint
): Promise<bigint> {
  return computePedersenHash([
    BigInt(birthYear),
    BigInt(birthMonth),
    BigInt(birthDay),
    secret,
    userAddress,
  ]);
}

/**
 * Compute commitment for balance verification
 * commitment = pedersen_hash([balance, secret, salt, user_address])
 */
export async function computeBalanceCommitment(
  balance: bigint,
  secret: bigint,
  salt: bigint,
  userAddress: bigint
): Promise<bigint> {
  return computePedersenHash([balance, secret, salt, userAddress]);
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
  return BigInt("0x" + hex) % FIELD_MODULUS;
}

/**
 * Convert Ethereum address to field element
 */
export function addressToField(address: string): bigint {
  // Remove 0x prefix if present and pad to 40 chars
  const cleanAddress = address.replace("0x", "").toLowerCase();
  return BigInt("0x" + cleanAddress);
}

/**
 * Cleanup Barretenberg instance (call when done with proofs)
 */
export async function destroyBarretenberg(): Promise<void> {
  if (barretenbergInstance) {
    await barretenbergInstance.destroy();
    barretenbergInstance = null;
  }
}
