import { Flow, GeneratedCode } from "./types";

export function generateCode(flow: Flow): GeneratedCode {
  const moduleIds = flow.modules.map((m) => m.id.toUpperCase().replace(/-/g, "_"));

  // Generate Solidity
  const solidityChecks = flow.modules
    .map((m) => {
      const moduleId = m.id.toUpperCase().replace(/-/g, "_");
      return `        registry.hasAttribute(user, ${moduleId})`;
    })
    .join("\n        && ");

  const solidity = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IUntracedRegistry.sol";

contract ${toPascalCase(flow.name)}Flow {
    IUntracedRegistry public immutable registry;

    // Module type constants
${moduleIds.map((id) => `    bytes32 public constant ${id} = keccak256("${id}");`).join("\n")}

    constructor(address _registry) {
        registry = IUntracedRegistry(_registry);
    }

    function verifyFlow(address user) external view returns (bool) {
        return ${solidityChecks};
    }

    function getRequiredModules() external pure returns (bytes32[] memory) {
        bytes32[] memory modules = new bytes32[](${flow.modules.length});
${flow.modules.map((m, i) => `        modules[${i}] = ${m.id.toUpperCase().replace(/-/g, "_")};`).join("\n")}
        return modules;
    }
}`;

  // Generate SDK code
  const sdk = `import { untraced } from "@untraced/sdk";

// Initialize the client
const client = untraced.createClient({
  chainId: 5003, // Mantle Sepolia
});

// Generate proof for "${flow.name}" flow
async function verify${toPascalCase(flow.name)}() {
  // Generate proofs for all required modules
  const proof = await client.generateFlowProof("${flow.name}");

  // Submit to chain
  const tx = await client.submitFlowProof("${flow.name}", proof);
  await tx.wait();

  console.log("Verification complete!");
}

// React Hook usage
function MyComponent() {
  const { verified, loading, verify } = useUntracedFlow("${flow.name}");

  if (loading) return <div>Loading...</div>;
  if (verified) return <div>Access Granted</div>;

  return (
    <button onClick={verify}>
      Verify Identity
    </button>
  );
}`;

  // Generate JSON
  const json = JSON.stringify(
    {
      flowName: flow.name,
      description: flow.description || "",
      requirements: flow.modules.map((m) => ({
        module: m.id,
        config: m.configValue ?? m.config?.default,
      })),
      version: "1.0.0",
    },
    null,
    2
  );

  return { solidity, sdk, json };
}

function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}
