# @untraced/sdk

Official SDK for integrating UNTRACED zero-knowledge verification into your dApp.

## Installation

```bash
npm install @untraced/sdk
# or
bun add @untraced/sdk
```

## Quick Start

```tsx
import { useUntraced } from "@untraced/sdk";

function VerifyButton() {
  const { verified, loading, verify } = useUntraced();

  return (
    <button onClick={verify} disabled={loading || verified}>
      {verified ? "Verified" : "Verify Email"}
    </button>
  );
}
```

## Configuration

Set environment variables in your Next.js app:

```env
NEXT_PUBLIC_REGISTRY_ADDRESS=0x...  # UntracedRegistry contract address
```

## API Reference

### Hooks

#### `useUntraced(config?)`

React hook for email verification.

```tsx
const {
  verified,    // boolean - whether user has valid attestation
  loading,     // boolean - operation in progress
  error,       // Error | null - last error
  attestation, // Attestation | null - full attestation details
  expiresAt,   // Date | null - when attestation expires
  verify,      // () => Promise<void> - trigger verification
  revoke,      // () => Promise<void> - revoke attestation
} = useUntraced();
```

**Example:**

```tsx
import { useUntraced } from "@untraced/sdk";

function EmailVerification() {
  const { verified, loading, error, expiresAt, verify } = useUntraced();

  if (verified) {
    return (
      <div>
        <p>Email verified!</p>
        <p>Valid until: {expiresAt?.toLocaleDateString()}</p>
      </div>
    );
  }

  return (
    <button onClick={verify} disabled={loading}>
      {loading ? "Verifying..." : "Verify Email"}
    </button>
  );
}
```

---

### Client

For non-React environments or advanced usage:

#### `createClient(config)`

Create an SDK client instance.

```ts
import { createClient } from "@untraced/sdk";

const client = createClient({
  chainId: 5003,                    // Mantle Sepolia
  registryAddress: "0x...",         // Registry contract
  rpcUrl: "https://rpc.sepolia.mantle.xyz",
  apiUrl: "/api/attest",            // Attestation API endpoint
});
```

---

#### `client.generateProof(moduleId, accessToken, userAddress)`

Generate a signed attestation proof.

```ts
const proof = await client.generateProof(
  "zk-email",           // Module ID
  githubAccessToken,    // OAuth token
  userAddress           // User's wallet address
);

// Returns:
// {
//   moduleType: "0x...",
//   expiry: 1234567890n,
//   signature: { v, r, s, full }
// }
```

---

#### `client.submitProof(proof, walletClient)`

Submit proof to the registry contract.

```ts
import { createWalletClient, custom } from "viem";

const walletClient = createWalletClient({
  chain: mantleSepoliaTestnet,
  transport: custom(window.ethereum),
  account: userAddress,
});

const result = await client.submitProof(proof, walletClient);
await result.wait(); // Wait for confirmation
```

---

#### `client.hasAttribute(address, moduleType)`

Check if user has a valid attestation.

```ts
import { ZK_EMAIL } from "@untraced/sdk";

const hasEmail = await client.hasAttribute(userAddress, ZK_EMAIL);
// Returns: boolean
```

---

#### `client.hasEmailVerification(address)`

Shorthand for checking email verification.

```ts
const verified = await client.hasEmailVerification(userAddress);
```

---

#### `client.getAttestation(address, moduleType)`

Get full attestation details.

```ts
const attestation = await client.getAttestation(userAddress, ZK_EMAIL);

// Returns:
// {
//   valid: true,
//   timestamp: 1700000000,
//   expiry: 1702592000,
//   issuerHash: "0x..."
// }
```

---

#### `client.revokeAttestation(moduleType, walletClient)`

Revoke your own attestation.

```ts
const result = await client.revokeAttestation(ZK_EMAIL, walletClient);
await result.wait();
```

---

## Types

```ts
interface UntracedConfig {
  chainId: number;
  registryAddress: Hex;
  rpcUrl?: string;
  apiUrl?: string;
}

interface Proof {
  moduleType: Hex;
  expiry: bigint;
  signature: {
    v: number;
    r: Hex;
    s: Hex;
    full: Hex;
  };
}

interface Attestation {
  valid: boolean;
  timestamp: number;
  expiry: number;
  issuerHash: Hex;
}
```

---

## Constants

```ts
import { ZK_EMAIL, MANTLE_SEPOLIA } from "@untraced/sdk";

// ZK_EMAIL = keccak256("ZK_EMAIL") - Module type hash
// MANTLE_SEPOLIA = { id: 5003, rpcUrl: "...", ... }
```

---

## Contract ABI

For direct contract interaction:

```ts
import { REGISTRY_ABI } from "@untraced/sdk";
```

---

## Integration with Privy

The SDK is designed to work seamlessly with Privy authentication:

```tsx
import { PrivyProvider } from "@privy-io/react-auth";
import { useUntraced } from "@untraced/sdk";

function App() {
  return (
    <PrivyProvider appId="your-app-id">
      <YourApp />
    </PrivyProvider>
  );
}

function YourApp() {
  const { verified, verify } = useUntraced();
  // SDK automatically uses Privy's wallet and auth
}
```

---

## Smart Contract Gating

Use the registry in your own contracts:

```solidity
import "./interfaces/IUntracedRegistry.sol";

contract YourContract {
    IUntracedRegistry public registry;
    bytes32 constant ZK_EMAIL = keccak256("ZK_EMAIL");

    function gatedAction() external {
        require(
            registry.hasAttribute(msg.sender, ZK_EMAIL),
            "Email verification required"
        );
        // ... your logic
    }
}
```

---

## Privacy Guarantee

The UNTRACED SDK ensures:

| What is proven | What is revealed |
|----------------|------------------|
| Email is verified | Nothing |
| User owns the attestation | Wallet address only |
| Attestation is not expired | Expiry timestamp |

**The smart contract only ever knows `EMAIL_VERIFIED == true`.**

---

## Network Support

| Network | Chain ID | Status |
|---------|----------|--------|
| Mantle Sepolia | 5003 | Supported |
| Mantle Mainnet | 5000 | Coming soon |

---

## License

MIT
