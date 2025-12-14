import {
  createWalletClient,
  http,
  keccak256,
  toHex,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mantleSepoliaTestnet } from "viem/chains";

// Module type constants
export const MODULE_TYPES = {
  ZK_EMAIL: keccak256(toHex("ZK_EMAIL")),
  ZK_AGE: keccak256(toHex("ZK_AGE")),
  ZK_GITHUB: keccak256(toHex("ZK_GITHUB")),
  ZK_TWITTER: keccak256(toHex("ZK_TWITTER")),
  ZK_BANK_BALANCE: keccak256(toHex("ZK_BANK_BALANCE")),
  ZK_COUNTRY: keccak256(toHex("ZK_COUNTRY")),
  ZK_AADHAR: keccak256(toHex("ZK_AADHAR")),
  ZK_KYC: keccak256(toHex("ZK_KYC")),
} as const;

export type ModuleTypeKey = keyof typeof MODULE_TYPES;

// Default attestation validity (30 days)
export const ATTESTATION_VALIDITY = 30 * 24 * 60 * 60;

// EIP-712 Domain
export const getEIP712Domain = () => ({
  name: "UntracedRegistry",
  version: "1",
  chainId: 5003, // Mantle Sepolia
  verifyingContract: process.env.NEXT_PUBLIC_REGISTRY_ADDRESS as Hex,
});

// EIP-712 Types for attestation
export const ATTESTATION_TYPES = {
  Attestation: [
    { name: "user", type: "address" },
    { name: "moduleType", type: "bytes32" },
    { name: "expiry", type: "uint256" },
    { name: "nonce", type: "uint256" },
  ],
} as const;

export interface AttestationSignature {
  v: number;
  r: Hex;
  s: Hex;
  full: Hex;
}

export interface SignedAttestation {
  moduleType: Hex;
  expiry: string;
  signature: AttestationSignature;
}

/**
 * Sign an attestation using EIP-712 typed data
 */
export async function signAttestation(
  userAddress: Hex,
  moduleType: Hex,
  nonce: bigint,
  validitySeconds: number = ATTESTATION_VALIDITY
): Promise<SignedAttestation> {
  const attestorPrivateKey = process.env.ATTESTOR_PRIVATE_KEY;
  if (!attestorPrivateKey) {
    throw new Error("ATTESTOR_PRIVATE_KEY not configured");
  }

  // Calculate expiry
  const expiry = BigInt(Math.floor(Date.now() / 1000) + validitySeconds);

  // Create attestor account
  const attestorAccount = privateKeyToAccount(attestorPrivateKey as Hex);

  // Create wallet client
  const walletClient = createWalletClient({
    account: attestorAccount,
    chain: mantleSepoliaTestnet,
    transport: http(),
  });

  // Sign the attestation
  const signature = await walletClient.signTypedData({
    domain: getEIP712Domain(),
    types: ATTESTATION_TYPES,
    primaryType: "Attestation",
    message: {
      user: userAddress,
      moduleType: moduleType,
      expiry: expiry,
      nonce: nonce,
    },
  });

  // Parse signature components
  const r = signature.slice(0, 66) as Hex;
  const s = ("0x" + signature.slice(66, 130)) as Hex;
  const v = parseInt(signature.slice(130, 132), 16);

  return {
    moduleType,
    expiry: expiry.toString(),
    signature: {
      v,
      r,
      s,
      full: signature,
    },
  };
}

/**
 * Get the attestor address
 */
export function getAttestorAddress(): Hex | null {
  const attestorPrivateKey = process.env.ATTESTOR_PRIVATE_KEY;
  if (!attestorPrivateKey) return null;

  const attestorAccount = privateKeyToAccount(attestorPrivateKey as Hex);
  return attestorAccount.address;
}

/**
 * Validate a user address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}
