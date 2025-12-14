/**
 * Test Script for ZK Module Smart Contracts
 *
 * This script tests the smart contract modules using viem and the Mantle Sepolia testnet.
 *
 * Usage:
 *   bun run scripts/test-contract-modules.ts
 *
 * Prerequisites:
 *   1. Contracts deployed to Mantle Sepolia
 *   2. Environment variables set:
 *      - NEXT_PUBLIC_REGISTRY_ADDRESS: Deployed registry contract
 *      - ATTESTOR_PRIVATE_KEY: Attestor wallet private key
 *      - TEST_WALLET_PRIVATE_KEY: Test wallet private key (for submitting proofs)
 */

import {
  createPublicClient,
  createWalletClient,
  http,
  keccak256,
  toHex,
  type Hex,
  parseAbi,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mantleSepoliaTestnet } from "viem/chains";

// Contract ABIs (minimal for testing)
const REGISTRY_ABI = parseAbi([
  "function hasAttribute(address user, bytes32 moduleType) external view returns (bool)",
  "function getAttestation(address user, bytes32 moduleType) external view returns (tuple(bool valid, uint256 timestamp, uint256 expiry, bytes32 issuerHash))",
  "function getNonce(address user) external view returns (uint256)",
  "function submitSignedProof(bytes32 moduleType, uint256 expiry, uint8 v, bytes32 r, bytes32 s) external",
  "function attestor() external view returns (address)",
  "function modules(bytes32) external view returns (address)",
]);

const MODULE_ABI = parseAbi([
  "function attributeType() external pure returns (bytes32)",
  "function moduleName() external pure returns (string memory)",
  "function verify(bytes calldata proof) external view returns (bool)",
]);

// Module types
const MODULE_TYPES = {
  ZK_EMAIL: keccak256(toHex("ZK_EMAIL")),
  ZK_AGE: keccak256(toHex("ZK_AGE")),
  ZK_GITHUB: keccak256(toHex("ZK_GITHUB")),
  ZK_TWITTER: keccak256(toHex("ZK_TWITTER")),
};

// Configuration
const REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_REGISTRY_ADDRESS as Hex;

interface TestResult {
  test: string;
  success: boolean;
  message: string;
  data?: unknown;
}

const results: TestResult[] = [];

async function main() {
  console.log("🔗 UNTRACED Smart Contract Test Suite");
  console.log("=".repeat(60));
  console.log(`Chain: Mantle Sepolia (5003)`);
  console.log(`Registry: ${REGISTRY_ADDRESS || "NOT SET"}`);
  console.log("=".repeat(60));

  if (!REGISTRY_ADDRESS) {
    console.error("\n❌ NEXT_PUBLIC_REGISTRY_ADDRESS not set!");
    console.log("Please deploy contracts first and set the environment variable.");
    process.exit(1);
  }

  // Create clients
  const publicClient = createPublicClient({
    chain: mantleSepoliaTestnet,
    transport: http(),
  });

  // Test 1: Check registry is accessible
  console.log("\n📝 Test 1: Registry Contract Access");
  try {
    const attestor = await publicClient.readContract({
      address: REGISTRY_ADDRESS,
      abi: REGISTRY_ABI,
      functionName: "attestor",
    });

    results.push({
      test: "Registry Access",
      success: true,
      message: `Registry accessible, attestor: ${attestor}`,
      data: { attestor },
    });
    console.log(`✅ Registry accessible`);
    console.log(`   Attestor: ${attestor}`);
  } catch (error) {
    results.push({
      test: "Registry Access",
      success: false,
      message: `Failed to access registry: ${error}`,
    });
    console.log(`❌ Registry not accessible`);
  }

  // Test 2: Check registered modules
  console.log("\n📝 Test 2: Registered Modules");
  for (const [name, typeHash] of Object.entries(MODULE_TYPES)) {
    try {
      const moduleAddress = await publicClient.readContract({
        address: REGISTRY_ADDRESS,
        abi: REGISTRY_ABI,
        functionName: "modules",
        args: [typeHash as Hex],
      });

      const isRegistered =
        moduleAddress !== "0x0000000000000000000000000000000000000000";

      results.push({
        test: `Module ${name}`,
        success: true,
        message: isRegistered
          ? `Registered at ${moduleAddress}`
          : "Not registered",
        data: { moduleAddress, typeHash },
      });

      console.log(
        `   ${name}: ${isRegistered ? `✅ ${moduleAddress}` : "⏳ Not registered"}`
      );

      // If registered, verify the module contract
      if (isRegistered) {
        const moduleName = await publicClient.readContract({
          address: moduleAddress as Hex,
          abi: MODULE_ABI,
          functionName: "moduleName",
        });
        console.log(`      Module name: ${moduleName}`);
      }
    } catch (error) {
      results.push({
        test: `Module ${name}`,
        success: false,
        message: `Error checking module: ${error}`,
      });
      console.log(`   ${name}: ❌ Error`);
    }
  }

  // Test 3: Check nonce for test address
  console.log("\n📝 Test 3: Nonce Check");
  const testAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f8fE00";
  try {
    const nonce = await publicClient.readContract({
      address: REGISTRY_ADDRESS,
      abi: REGISTRY_ABI,
      functionName: "getNonce",
      args: [testAddress as Hex],
    });

    results.push({
      test: "Nonce Check",
      success: true,
      message: `Nonce for ${testAddress}: ${nonce}`,
      data: { nonce },
    });
    console.log(`✅ Nonce for test address: ${nonce}`);
  } catch (error) {
    results.push({
      test: "Nonce Check",
      success: false,
      message: `Error getting nonce: ${error}`,
    });
    console.log(`❌ Error getting nonce`);
  }

  // Test 4: Check attestation status
  console.log("\n📝 Test 4: Attestation Status Check");
  for (const [name, typeHash] of Object.entries(MODULE_TYPES)) {
    try {
      const hasAttr = await publicClient.readContract({
        address: REGISTRY_ADDRESS,
        abi: REGISTRY_ABI,
        functionName: "hasAttribute",
        args: [testAddress as Hex, typeHash as Hex],
      });

      console.log(`   ${name}: ${hasAttr ? "✅ Has attestation" : "⚪ No attestation"}`);

      if (hasAttr) {
        const attestation = await publicClient.readContract({
          address: REGISTRY_ADDRESS,
          abi: REGISTRY_ABI,
          functionName: "getAttestation",
          args: [testAddress as Hex, typeHash as Hex],
        });
        console.log(`      Valid: ${attestation.valid}`);
        console.log(`      Expiry: ${new Date(Number(attestation.expiry) * 1000).toISOString()}`);
      }
    } catch (error) {
      console.log(`   ${name}: ❌ Error checking`);
    }
  }

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 TEST SUMMARY");
  console.log("=".repeat(60));

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log(`\nTotal tests: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);

  // Usage instructions
  console.log("\n" + "=".repeat(60));
  console.log("📖 FULL INTEGRATION TEST FLOW");
  console.log("=".repeat(60));
  console.log(`
To test the full attestation flow:

1. Start the dev server:
   bun run dev

2. Get an attestation from the API:
   curl -X POST http://localhost:3000/api/attest/age \\
     -H "Content-Type: application/json" \\
     -d '{"userAddress": "${testAddress}", "birthDate": "1990-01-01", "minAge": 18, "nonce": 0}'

3. Submit the attestation on-chain using the returned signature:
   - Use the v, r, s values from the API response
   - Call registry.submitSignedProof(moduleType, expiry, v, r, s)

4. Verify the attestation:
   - Call registry.hasAttribute(userAddress, moduleType)
`);

  console.log("=".repeat(60));
}

main().catch(console.error);
