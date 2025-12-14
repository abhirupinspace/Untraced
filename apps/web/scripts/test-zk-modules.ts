/**
 * Test Script for ZK Verification Modules
 *
 * This script tests each ZK module's API endpoint to verify functionality.
 *
 * Usage:
 *   bun run scripts/test-zk-modules.ts
 *
 * Prerequisites:
 *   1. Server running: bun run dev
 *   2. Environment variables set in .env.local:
 *      - ATTESTOR_PRIVATE_KEY: Private key of the attestor wallet
 *      - NEXT_PUBLIC_REGISTRY_ADDRESS: Deployed registry contract address
 *   3. For real OAuth tests, you'll need valid access tokens
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

// Test wallet address (use any valid Ethereum address)
const TEST_WALLET = "0x742d35Cc6634C0532925a3b844Bc9e7595f8fE00";

interface TestResult {
  module: string;
  endpoint: string;
  success: boolean;
  statusCode: number;
  message: string;
  response?: unknown;
}

const results: TestResult[] = [];

/**
 * Test the main attestation index endpoint
 */
async function testAttestIndex() {
  console.log("\n📋 Testing GET /api/attest (Module Index)...");

  const response = await fetch(`${BASE_URL}/api/attest`);
  const data = await response.json();

  results.push({
    module: "index",
    endpoint: "GET /api/attest",
    success: response.ok,
    statusCode: response.status,
    message: response.ok ? "Module index retrieved successfully" : data.error,
    response: data,
  });

  if (response.ok) {
    console.log("✅ Module index OK");
    console.log(`   Attestor: ${data.attestor || "Not configured"}`);
    console.log(`   Modules available: ${data.modules?.length || 0}`);
  } else {
    console.log("❌ Module index failed:", data.error);
  }
}

/**
 * Test zk-email module health check
 */
async function testEmailHealthCheck() {
  console.log("\n📧 Testing GET /api/attest/email (Health Check)...");

  const response = await fetch(`${BASE_URL}/api/attest/email`);
  const data = await response.json();

  results.push({
    module: "zk-email",
    endpoint: "GET /api/attest/email",
    success: response.ok,
    statusCode: response.status,
    message: response.ok ? "Health check passed" : data.error,
    response: data,
  });

  if (response.ok) {
    console.log("✅ zk-email health check OK");
    console.log(`   Status: ${data.status}`);
    console.log(`   Attestor configured: ${data.attestorConfigured}`);
  } else {
    console.log("❌ zk-email health check failed");
  }
}

/**
 * Test zk-age module
 */
async function testAgeModule() {
  console.log("\n🎂 Testing POST /api/attest/age...");

  // Test with valid age (adult)
  const validResponse = await fetch(`${BASE_URL}/api/attest/age`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userAddress: TEST_WALLET,
      birthDate: "1990-05-15", // 34 years old
      minAge: 18,
      nonce: 0,
    }),
  });
  const validData = await validResponse.json();

  results.push({
    module: "zk-age",
    endpoint: "POST /api/attest/age (valid)",
    success: validResponse.ok,
    statusCode: validResponse.status,
    message: validResponse.ok
      ? "Age verification successful"
      : validData.error,
    response: validData,
  });

  if (validResponse.ok) {
    console.log("✅ Age verification (adult) OK");
    console.log(`   Min age verified: ${validData.meta?.minAgeVerified}`);
    console.log(`   Attestation expiry: ${validData.attestation?.expiry}`);
  } else {
    console.log("❌ Age verification failed:", validData.error);
  }

  // Test with underage
  const invalidResponse = await fetch(`${BASE_URL}/api/attest/age`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userAddress: TEST_WALLET,
      birthDate: "2015-01-01", // 9 years old
      minAge: 18,
      nonce: 1,
    }),
  });
  const invalidData = await invalidResponse.json();

  results.push({
    module: "zk-age",
    endpoint: "POST /api/attest/age (underage)",
    success: !invalidResponse.ok, // We expect this to fail
    statusCode: invalidResponse.status,
    message: !invalidResponse.ok
      ? "Correctly rejected underage"
      : "Incorrectly accepted underage",
    response: invalidData,
  });

  if (!invalidResponse.ok) {
    console.log("✅ Age verification correctly rejected underage");
  } else {
    console.log("❌ Age verification incorrectly accepted underage");
  }
}

/**
 * Test zk-github module health check
 */
async function testGitHubHealthCheck() {
  console.log("\n🐙 Testing GET /api/attest/github (Health Check)...");

  const response = await fetch(`${BASE_URL}/api/attest/github`);
  const data = await response.json();

  results.push({
    module: "zk-github",
    endpoint: "GET /api/attest/github",
    success: response.ok,
    statusCode: response.status,
    message: response.ok ? "Health check passed" : data.error,
    response: data,
  });

  if (response.ok) {
    console.log("✅ zk-github health check OK");
    console.log(`   Status: ${data.status}`);
    console.log(`   Commit range: ${data.commitRange?.min}-${data.commitRange?.max}`);
  } else {
    console.log("❌ zk-github health check failed");
  }
}

/**
 * Test zk-twitter module health check
 */
async function testTwitterHealthCheck() {
  console.log("\n🐦 Testing GET /api/attest/twitter (Health Check)...");

  const response = await fetch(`${BASE_URL}/api/attest/twitter`);
  const data = await response.json();

  results.push({
    module: "zk-twitter",
    endpoint: "GET /api/attest/twitter",
    success: response.ok,
    statusCode: response.status,
    message: response.ok ? "Health check passed" : data.error,
    response: data,
  });

  if (response.ok) {
    console.log("✅ zk-twitter health check OK");
    console.log(`   Status: ${data.status}`);
    console.log(`   Verification types: ${data.verificationTypes?.join(", ")}`);
  } else {
    console.log("❌ zk-twitter health check failed");
  }
}

/**
 * Test input validation
 */
async function testInputValidation() {
  console.log("\n🔒 Testing Input Validation...");

  // Test missing fields
  const missingFieldsResponse = await fetch(`${BASE_URL}/api/attest/age`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userAddress: TEST_WALLET,
      // Missing birthDate and minAge
      nonce: 0,
    }),
  });
  const missingFieldsData = await missingFieldsResponse.json();

  results.push({
    module: "validation",
    endpoint: "POST /api/attest/age (missing fields)",
    success: !missingFieldsResponse.ok,
    statusCode: missingFieldsResponse.status,
    message: !missingFieldsResponse.ok
      ? "Correctly rejected missing fields"
      : "Incorrectly accepted missing fields",
    response: missingFieldsData,
  });

  if (!missingFieldsResponse.ok) {
    console.log("✅ Correctly rejected request with missing fields");
  } else {
    console.log("❌ Incorrectly accepted request with missing fields");
  }

  // Test invalid date format
  const invalidDateResponse = await fetch(`${BASE_URL}/api/attest/age`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userAddress: TEST_WALLET,
      birthDate: "invalid-date",
      minAge: 18,
      nonce: 0,
    }),
  });
  const invalidDateData = await invalidDateResponse.json();

  results.push({
    module: "validation",
    endpoint: "POST /api/attest/age (invalid date)",
    success: !invalidDateResponse.ok,
    statusCode: invalidDateResponse.status,
    message: !invalidDateResponse.ok
      ? "Correctly rejected invalid date"
      : "Incorrectly accepted invalid date",
    response: invalidDateData,
  });

  if (!invalidDateResponse.ok) {
    console.log("✅ Correctly rejected invalid date format");
  } else {
    console.log("❌ Incorrectly accepted invalid date format");
  }
}

/**
 * Print test summary
 */
function printSummary() {
  console.log("\n" + "=".repeat(60));
  console.log("📊 TEST SUMMARY");
  console.log("=".repeat(60));

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log(`\nTotal tests: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);

  if (failed > 0) {
    console.log("\n❌ Failed tests:");
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`   - ${r.module}: ${r.endpoint}`);
        console.log(`     Message: ${r.message}`);
      });
  }

  console.log("\n" + "=".repeat(60));
}

/**
 * Main test runner
 */
async function main() {
  console.log("🧪 UNTRACED ZK Module Test Suite");
  console.log("=".repeat(60));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Test Wallet: ${TEST_WALLET}`);

  try {
    await testAttestIndex();
    await testEmailHealthCheck();
    await testAgeModule();
    await testGitHubHealthCheck();
    await testTwitterHealthCheck();
    await testInputValidation();
  } catch (error) {
    console.error("\n❌ Test suite error:", error);
  }

  printSummary();
}

// Run tests
main().catch(console.error);
