# @untraced/sdk

Official SDK for integrating UNTRACED zero-knowledge verification into your dApp.

> **Latest:** The SDK now includes a pre-built verification modal with support for 5 verification modules (Email, Age, GitHub, Twitter, Balance) with OAuth integration!

## Features

- **Zero-Knowledge Proofs** - Verify without revealing data
- **Pre-built UI Modal** - Beautiful, customizable verification modal
- **Easy Integration** - 3 lines of code to get started
- **Multiple Verification Modules** - Email, age, GitHub, Twitter, wallet balance
- **On-chain Attestations** - EIP-712 signed attestations on Mantle
- **TypeScript First** - Full type safety and autocomplete
- **OAuth Support** - Automatic handling of GitHub and Twitter OAuth flows

## Installation

```bash
npm install @untraced/sdk
# or
yarn add @untraced/sdk
# or
bun add @untraced/sdk
```

## Quick Start (Verification Modal)

### 1. Wrap your app with UntracedProvider

```tsx
import { UntracedProvider, UntracedModal } from '@untraced/sdk';

function App() {
  return (
    <UntracedProvider
      config={{
        clientId: "your-client-id", // Get from dashboard.untraced.io
        apiUrl: "https://untraced-web.vercel.app/api",
        theme: "dark", // "light" | "dark" | "auto"
        onSuccess: (result) => {
          console.log('Verification successful!', result);
        },
      }}
    >
      <YourApp />
      {/* Add modal component at root level */}
      <UntracedModal />
    </UntracedProvider>
  );
}
```

### 2. Trigger verification from anywhere

```tsx
import { useUntracedModal } from '@untraced/sdk';

function MyComponent() {
  const { open } = useUntracedModal();

  return (
    <div>
      <button onClick={() => open('zk-email')}>Verify Email</button>
      <button onClick={() => open('zk-github')}>Verify GitHub</button>
      <button onClick={() => open('zk-twitter')}>Verify Twitter</button>
    </div>
  );
}
```

### 3. Or use the pre-styled button

```tsx
import { UntracedButton } from '@untraced/sdk';

function MyComponent() {
  return (
    <UntracedButton module="zk-email" variant="primary" size="lg">
      Verify Your Email
    </UntracedButton>
  );
}
```

## Available Verification Modules

| Module ID | Description | OAuth Required | Config Options |
|-----------|-------------|----------------|----------------|
| `zk-email` | Verify email ownership | No | `provider` (any/gmail/outlook) |
| `zk-age` | Prove age threshold | No | `minAge` (13-100) |
| `zk-github` | Verify GitHub activity | Yes | `minCommits` (0-10000) |
| `zk-twitter` | Verify Twitter/X account | Yes | `verificationType` (account/followers/verified) |
| `zk-balance` | Prove wallet balance | No | `minBalance` (ETH) |

## Modal Configuration

### UntracedProvider Config

```typescript
interface UntracedConfig {
  clientId: string;                    // Required: Your project client ID
  apiUrl?: string;                     // Optional: API endpoint (default: "/api")
  chainId?: number;                    // Optional: Chain ID (default: 5003 - Mantle Sepolia)
  registryAddress?: Hex;               // Optional: Custom registry contract
  theme?: "light" | "dark" | "auto";   // Optional: Theme mode (default: "dark")
  accentColor?: string;                // Optional: Brand color (default: "#a855f7")
  modules?: VerificationModule[];      // Optional: Limit available modules
  onSuccess?: (result: VerificationResult) => void;  // Success callback
  onError?: (error: Error) => void;                  // Error callback
  onClose?: () => void;                              // Modal close callback
}
```

### Advanced Modal Usage

#### Programmatic Verification

```tsx
import { useUntracedModal } from '@untraced/sdk';

function MyComponent() {
  const { verify, status, verificationResult } = useUntracedModal();

  const handleVerify = async () => {
    try {
      const result = await verify('zk-age', { minAge: 21 });
      console.log('Verified!', result);
    } catch (error) {
      console.error('Verification failed:', error);
    }
  };

  return (
    <div>
      <button onClick={handleVerify} disabled={status === 'verifying'}>
        {status === 'verifying' ? 'Verifying...' : 'Verify Age 21+'}
      </button>
      {verificationResult && (
        <div>✓ Verified! Transaction: {verificationResult.transactionHash}</div>
      )}
    </div>
  );
}
```

#### Custom Module Configuration

```tsx
const { open } = useUntracedModal();

// Email with specific provider
open('zk-email', { provider: 'gmail' });

// Age with custom threshold
open('zk-age', { minAge: 21 });

// GitHub with commit requirement
open('zk-github', { minCommits: 100 });

// Twitter verification
open('zk-twitter', { verificationType: 'followers', minFollowers: 1000 });

// Wallet balance threshold
open('zk-balance', { minBalance: 0.1 });
```

#### Limit Available Modules

```tsx
<UntracedProvider
  config={{
    clientId: "your-client-id",
    modules: ['zk-email', 'zk-github'], // Only show these modules
  }}
>
  <YourApp />
  <UntracedModal />
</UntracedProvider>
```

### OAuth Verification Flow

For modules that require OAuth (GitHub, Twitter), the SDK automatically:

1. Opens an OAuth popup window
2. Handles the authentication flow
3. Securely passes the access token to the attestation API
4. Returns the verification result

No additional configuration needed - OAuth is handled transparently!

## Legacy API Reference

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
