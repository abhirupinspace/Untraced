# UNTRACED - Zero-Knowledge Verification Suite

A privacy-preserving verification protocol for Mantle blockchain that enables users to prove Web2 attributes without revealing underlying data.

## Overview

UNTRACED allows developers to build verification flows where users can prove:
- **Email ownership** without revealing the address
- **Age verification** without exposing date of birth
- **GitHub activity** (commits, repos) without linking identity
- **Twitter/X account** status without exposing username
- **Wallet balance** thresholds without revealing amounts

All verifications use zero-knowledge proofs and EIP-712 signed attestations.

## Architecture

```
UNTRACED (Monorepo)
├── apps/
│   ├── web/                 # Next.js Dashboard (Port 3000)
│   └── landing/             # Landing Page (Port 3001)
├── packages/
│   ├── sdk/                 # @untraced/sdk - Client library
│   ├── contracts/           # Solidity smart contracts (Foundry)
│   ├── circuits/            # Noir ZK circuits
│   └── config/              # Shared configurations
```

## Deployed Contracts (Mantle Sepolia)

| Contract | Address | Description |
|----------|---------|-------------|
| UntracedRegistry | `0xA5f2af132B0163f9333c67f5EfD4C35f037BbA60` | Central registry for attestations |
| EmailModule | `0x4242EA2cE78D219c0774290D98348dd8aFAfAAE5` | Email verification module |

**Chain:** Mantle Sepolia (Chain ID: 5003)  
**Explorer:** https://sepolia.mantlescan.xyz

## Verification Modules

### 1. Email Verification (zk-email)
Prove email ownership without revealing the address.
- **Endpoint:** `POST /api/attest/email`
- **Providers:** Gmail, Outlook, Any

### 2. Age Verification (zk-age)
Prove age meets minimum threshold (13-100 years).
- **Endpoint:** `POST /api/attest/age`
- Uses ZK circuits - never stores DOB

### 3. GitHub Verification (zk-github)
Verify GitHub activity with real OAuth.
- **Endpoint:** `POST /api/attest/github`
- **Metrics:** Commit count, repository count, account age

### 4. Twitter/X Verification (zk-twitter)
Verify Twitter account with OAuth PKCE flow.
- **Endpoint:** `POST /api/attest/twitter`
- **Types:** Account existence, follower count, verified badge

### 5. Balance Verification (zk-balance)
Prove wallet balance exceeds threshold without revealing amount.
- **Endpoint:** `POST /api/attest/balance`
- Uses ZK circuits for privacy

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/PATCH | `/api/auth/me` | Get/update current user |
| GET | `/api/auth/github` | Initiate GitHub OAuth |
| POST | `/api/auth/github/callback` | GitHub OAuth callback |
| GET | `/api/auth/twitter` | Initiate Twitter OAuth |
| POST | `/api/auth/twitter/callback` | Twitter OAuth callback |

### Projects & Flows
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/projects` | List/create projects |
| GET/PATCH/DELETE | `/api/projects/[id]` | Project operations |
| GET/POST | `/api/projects/[id]/flows` | Flow management |
| GET/PATCH/DELETE | `/api/projects/[id]/flows/[flowId]` | Flow operations |
| POST | `/api/projects/[id]/flows/[flowId]/deploy` | Deploy a flow |
| DELETE | `/api/projects/[id]/flows/[flowId]/deploy` | Undeploy a flow |

### Attestation
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/attest` | List available modules |
| POST | `/api/attest/email` | Email attestation |
| POST | `/api/attest/age` | Age attestation |
| POST | `/api/attest/github` | GitHub attestation |
| POST | `/api/attest/twitter` | Twitter attestation |
| POST | `/api/attest/balance` | Balance attestation |

### Verification
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/verify?address=0x...` | Check verification status |
| GET | `/api/verify/[id]` | Get specific verification |
| PATCH | `/api/verify/[id]/transaction` | Update with tx hash |

## Environment Variables

### apps/web/.env.local
```env
# Privy Authentication
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_secret

# Contract addresses (Mantle Sepolia)
NEXT_PUBLIC_REGISTRY_ADDRESS=0xA5f2af132B0163f9333c67f5EfD4C35f037BbA60
NEXT_PUBLIC_EMAIL_MODULE_ADDRESS=0x4242EA2cE78D219c0774290D98348dd8aFAfAAE5

# Chain
NEXT_PUBLIC_CHAIN_ID=5003

# MongoDB
MONGODB_URI=your_mongodb_uri

# Attestor (server-side signing key)
ATTESTOR_PRIVATE_KEY=0x...

# OAuth (optional - for GitHub/Twitter modules)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
```

### packages/contracts/.env
```env
MANTLE_SEPOLIA_RPC_URL=https://rpc.sepolia.mantle.xyz
DEPLOYER_PRIVATE_KEY=0x...
ATTESTOR_ADDRESS=0x...
```

## ZK-KYC Modal SDK

The Untraced SDK provides a drop-in verification modal similar to wallet connect. Integrate identity verification into your app with just a few lines of code.

### Installation
```bash
npm install @untraced/sdk
# or
bun add @untraced/sdk
```

### Quick Start
```tsx
import {
  UntracedProvider,
  UntracedModal,
  UntracedButton,
} from "@untraced/sdk";

function App() {
  return (
    <UntracedProvider
      config={{
        clientId: "your-project-client-id",
        onSuccess: (result) => {
          console.log("Verified:", result);
        },
      }}
    >
      <UntracedModal />
      <UntracedButton />
    </UntracedProvider>
  );
}
```

### Configuration Options

```tsx
<UntracedProvider
  config={{
    // Required
    clientId: "your-project-client-id",

    // Optional - API & Chain
    apiUrl: "/api",
    chainId: 5003,
    registryAddress: "0xA5f2af132B0163f9333c67f5EfD4C35f037BbA60",

    // Optional - UI Customization
    theme: "dark",           // "light" | "dark" | "auto"
    accentColor: "#a855f7",  // Your brand color

    // Optional - Limit modules
    modules: ["zk-email", "zk-github", "zk-twitter"],

    // Callbacks
    onSuccess: (result) => { /* handle success */ },
    onError: (error) => { /* handle error */ },
    onClose: () => { /* modal closed */ },
  }}
>
```

### Using the Hook

```tsx
import { useUntracedModal } from "@untraced/sdk";

function CustomButton() {
  const {
    open,
    close,
    verify,
    isConnected,
    status,
    verificationResult,
    error,
  } = useUntracedModal();

  return (
    <button onClick={() => open()}>
      {verificationResult ? "✓ Verified" : "Verify Identity"}
    </button>
  );
}
```

### Pre-select a Module

```tsx
// Open modal with a specific module pre-selected
<UntracedButton module="zk-github">
  Verify GitHub
</UntracedButton>

// Or programmatically
const { open } = useUntracedModal();
open("zk-twitter");
```

### Programmatic Verification

```tsx
const { verify } = useUntracedModal();

// Verify with custom options
const result = await verify("zk-age", { minAge: 21 });

// Verify GitHub with commit threshold
const result = await verify("zk-github", { minCommits: 100 });
```

### Button Variants

```tsx
<UntracedButton variant="primary" />
<UntracedButton variant="secondary" />
<UntracedButton variant="outline" />
<UntracedButton variant="ghost" />
<UntracedButton size="sm" />
<UntracedButton size="md" />
<UntracedButton size="lg" />
```

### Verification Result

```typescript
interface VerificationResult {
  moduleId: "zk-email" | "zk-age" | "zk-github" | "zk-twitter" | "zk-balance";
  userAddress: string;
  attestation: {
    moduleType: string;
    expiry: string;
    signature: { v: number; r: string; s: string; full: string };
  };
  transactionHash?: string;
  verificationId: string;
  verified: boolean;
}
```

## Low-Level SDK Client

For advanced usage, you can use the low-level client directly:

```typescript
import { createClient, MANTLE_SEPOLIA } from "@untraced/sdk";

const client = createClient({
  registryAddress: "0xA5f2af132B0163f9333c67f5EfD4C35f037BbA60",
  chainId: MANTLE_SEPOLIA.id,
});

// Check if user has email verification
const hasEmail = await client.hasEmailVerification(userAddress);

// Get attestation details
const attestation = await client.getAttestation(userAddress, ZK_EMAIL);

// Submit proof on-chain
const result = await client.submitProof(proof, walletClient);
await result.wait();
```

### Legacy React Hook
```typescript
import { useUntraced } from "@untraced/sdk";

function VerificationButton() {
  const { verified, loading, verify, revoke } = useUntraced();

  if (loading) return <Spinner />;
  if (verified) return <button onClick={revoke}>Revoke</button>;
  return <button onClick={verify}>Verify Email</button>;
}
```

## Development

### Prerequisites
- Node.js 18+
- Bun package manager
- Foundry (for contracts)
- Nargo (for ZK circuits)

### Setup
```bash
# Install dependencies
bun install

# Start development server
bun dev

# Build all packages
bun run build
```

### Contract Development
```bash
cd packages/contracts

# Compile contracts
forge build

# Run tests
forge test

# Deploy to Mantle Sepolia
source .env && forge script script/Deploy.s.sol:Deploy \
  --rpc-url $MANTLE_SEPOLIA_RPC_URL \
  --broadcast
```

### Circuit Development
```bash
cd packages/circuits

# Compile circuits
nargo compile

# Run tests
nargo test
```

## Security

### Attestor
The attestor wallet signs all attestations using EIP-712 typed data signatures. This wallet:
- Should be kept secure (server-side only)
- Does not require funds for signing
- Is registered in the UntracedRegistry contract

**Current Attestor:** `0x0FE3C2E7Ed753cC3cbe25e916EE928FCfd943b0e`

### Authentication
- Uses Privy for wallet authentication
- Server-side JWT verification with `@privy-io/server-auth`
- API middleware validates authentication headers

### Privacy
- Zero-knowledge proofs ensure data is never exposed
- Attestations prove attributes without revealing values
- On-chain storage only contains hashed module types and expiry times

## Flow Builder

The dashboard includes a visual flow builder for creating verification flows:

1. **Create Project** - Set up a new verification project
2. **Add Modules** - Drag-and-drop verification modules
3. **Configure** - Set thresholds and requirements
4. **Deploy** - Activate the flow for users
5. **Monitor** - Track verification analytics

## Playground

Test verification modules in real-time:
- Connect wallet via Privy
- Select a verification module
- Complete OAuth (GitHub/Twitter)
- Generate attestation
- Submit to blockchain (optional)

## License

MIT
