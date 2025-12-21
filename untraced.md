# UNTRACED

## Zero-Knowledge Verification Protocol for Mantle

UNTRACED enables developers to build privacy-preserving verification flows. Users prove Web2 attributes (email, age, GitHub activity, Twitter account) without revealing underlying data. Built on **Mantle**.

---

## Quick Start

```bash
# Install dependencies
bun install

# Start dashboard (port 3000)
bun run dev

# Start landing page (port 3001)
bun run dev:landing

# Start both apps
bun run dev:all

# Open:
# - Landing: http://localhost:3001
# - Dashboard: http://localhost:3000
```

### Environment Setup

```bash
cp apps/web/.env.example apps/web/.env.local
```

Required variables:
```env
# Privy Authentication
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id

# Smart Contracts
NEXT_PUBLIC_REGISTRY_ADDRESS=0x...  # After deployment
ATTESTOR_PRIVATE_KEY=0x...          # Server-side signing key

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Twitter/X OAuth
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret

# Optional
NEXT_PUBLIC_URL=http://localhost:3000
```

---

## How It Works

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   OAuth     │────▶│  Backend    │────▶│  Registry   │────▶│  Your dApp  │
│  (GitHub/X) │     │  Attestor   │     │  Contract   │     │   Gating    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      │                    │                   │                   │
  User logs in      Signs attestation    Stores boolean      Checks access
  via OAuth         GITHUB_VERIFIED=true on Mantle           with hasAttribute()
```

**Privacy Guarantee:** The smart contract only ever knows `VERIFIED == true` — nothing else.

---

## Features

### Dashboard
- **Projects** - Create and manage verification flows
- **Playground** - Test ZK modules in real-time with actual OAuth
- **Analytics** - View verification metrics and success rates (Beta)
- **Settings** - Configure account, notifications, security, and API keys

### Verification Modules
- **Email** - Prove email ownership without revealing the address
- **Age** - Prove age meets requirements using ZK proofs
- **GitHub** - Verify GitHub account with real OAuth, check commit counts
- **Twitter/X** - Verify Twitter account ownership, follower counts
- **Balance** - Prove wallet balance threshold without revealing amount

---

## Project Structure

```
untraced/
├── apps/
│   ├── landing/                          # Marketing landing page (port 3001)
│   │   ├── app/
│   │   │   ├── page.tsx                  # Landing page with all sections
│   │   │   ├── layout.tsx                # Root layout
│   │   │   └── globals.css               # Brand colors & styles
│   │   └── components/
│   │       ├── PortfolioNavbar.tsx       # Navigation with CTA buttons
│   │       ├── ProductTeaserCard.tsx     # Hero section
│   │       ├── BankingScaleHero.tsx      # How it works section
│   │       ├── ModulesSection.tsx        # Verification modules grid
│   │       ├── UseCasesSection.tsx       # Use cases showcase
│   │       ├── PricingSection.tsx        # Pricing plans
│   │       ├── FAQSection.tsx            # FAQ accordion
│   │       └── Footer.tsx                # Footer with links
│   │
│   └── web/                              # Next.js 15 dashboard (port 3000)
│       ├── app/
│       │   ├── page.tsx                  # Landing → redirects to /dashboard
│       │   ├── dashboard/
│       │   │   ├── layout.tsx            # Dashboard layout with sidebar
│       │   │   ├── page.tsx              # Projects list
│       │   │   ├── playground/
│       │   │   │   └── page.tsx          # Interactive module testing
│       │   │   ├── analytics/
│       │   │   │   └── page.tsx          # Verification analytics
│       │   │   └── settings/
│       │   │       └── page.tsx          # Account settings
│       │   ├── builder/                  # Flow Builder UI
│       │   └── api/
│       │       ├── attest/
│       │       │   ├── route.ts          # Email attestation
│       │       │   ├── age/route.ts      # Age verification
│       │       │   ├── github/route.ts   # GitHub attestation (real OAuth)
│       │       │   └── twitter/route.ts  # Twitter attestation (real OAuth)
│       │       └── auth/
│       │           ├── me/route.ts       # Current user
│       │           ├── tokens/route.ts   # OAuth token management
│       │           ├── github/
│       │           │   ├── route.ts      # GitHub OAuth initiation
│       │           │   └── callback/route.ts
│       │           └── twitter/
│       │               ├── route.ts      # Twitter OAuth initiation (PKCE)
│       │               └── callback/route.ts
│       ├── components/
│       │   ├── app-sidebar.tsx           # Animated sidebar navigation
│       │   ├── dashboard/                # Dashboard components
│       │   ├── flow-builder/             # Flow builder components
│       │   ├── verification/
│       │   │   └── untraced-modal.tsx    # Embeddable verification modal
│       │   ├── landing/                  # Landing page components
│       │   ├── providers/                # React providers (Privy)
│       │   └── ui/                       # Reusable UI components
│       │       ├── sidebar.tsx           # Base sidebar with animations
│       │       ├── tabs.tsx              # Tab navigation
│       │       ├── input.tsx             # Form inputs
│       │       ├── switch.tsx            # Toggle switch
│       │       ├── number-ticker.tsx     # Animated number counter
│       │       ├── progress.tsx          # Progress bar
│       │       └── ...                   # Other UI primitives
│       └── lib/
│           ├── cn.ts                     # Classname utility
│           ├── use-wallet.ts             # Wallet hook wrapper
│           └── db/                       # Database utilities
│
├── packages/
│   ├── sdk/                              # @untraced/sdk
│   │   ├── src/
│   │   │   ├── index.ts                  # Package exports
│   │   │   ├── client.ts                 # UntracedClient class
│   │   │   ├── hooks.ts                  # useUntraced React hook
│   │   │   ├── types.ts                  # TypeScript types
│   │   │   └── abi/
│   │   │       └── registry.ts           # Registry contract ABI
│   │   └── README.md                     # SDK documentation
│   │
│   ├── contracts/                        # Solidity contracts (Foundry)
│   │   ├── src/
│   │   │   ├── UntracedRegistry.sol      # Central registry with EIP-712 signatures
│   │   │   ├── FlowFactory.sol           # Flow deployment factory
│   │   │   ├── interfaces/
│   │   │   │   ├── IUntracedModule.sol
│   │   │   │   └── IUntracedRegistry.sol
│   │   │   └── modules/
│   │   │       ├── AgeModule.sol         # Age verification module
│   │   │       ├── GitHubModule.sol      # GitHub verification module
│   │   │       ├── TwitterModule.sol     # Twitter verification module
│   │   │       ├── ZKAgeVerifier.sol     # ZK age proof verifier
│   │   │       └── ZKBalanceVerifier.sol # ZK balance proof verifier
│   │   └── script/
│   │       └── Deploy.s.sol              # Foundry deployment script
│   │
│   ├── circuits/                         # Noir ZK circuits
│   │
│   └── config/                           # Shared configurations
│
├── package.json                          # Bun workspaces root
└── untraced.md                           # This file
```

---

## OAuth Integration

### GitHub OAuth Setup

1. Go to **GitHub Settings** → **Developer Settings** → **OAuth Apps** → **New OAuth App**
2. Set callback URL: `http://localhost:3000/api/auth/github/callback`
3. Copy Client ID and Client Secret to `.env.local`

### Twitter/X OAuth Setup

1. Go to **Twitter Developer Portal** → **Create App**
2. Enable **OAuth 2.0** with **User authentication settings**
3. Set callback URL: `http://localhost:3000/api/auth/twitter/callback`
4. Enable scopes: `tweet.read`, `users.read`, `offline.access`
5. Copy Client ID and Client Secret to `.env.local`

---

## Playground

The Playground allows testing all ZK modules in real-time:

- **Email/Age/Balance** - Simulated verification with input validation
- **GitHub** - Real OAuth connection, fetches actual commit counts
- **Twitter** - Real OAuth connection, fetches actual follower data

Access at `/dashboard/playground`

---

## SDK Integration

### Installation

```bash
npm install @untraced/sdk
# or
bun add @untraced/sdk
```

### React Hook (Recommended)

```tsx
import { useUntraced } from "@untraced/sdk";

function VerifyButton() {
  const { verified, loading, error, expiresAt, verify, revoke } = useUntraced();

  if (verified) {
    return (
      <div>
        <p>Email verified until {expiresAt?.toLocaleDateString()}</p>
        <button onClick={revoke}>Revoke</button>
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

### Client API (Advanced)

```ts
import { createClient, ZK_EMAIL, ZK_GITHUB, ZK_TWITTER } from "@untraced/sdk";

const client = createClient({
  chainId: 5003,
  registryAddress: "0x...",
});

// Generate proof (calls backend API)
const proof = await client.generateProof("zk-email", accessToken, userAddress);

// Submit to chain
const result = await client.submitProof(proof, walletClient);
await result.wait();

// Check verification status
const isVerified = await client.hasEmailVerification(userAddress);

// Get attestation details
const attestation = await client.getAttestation(userAddress, ZK_EMAIL);
// { valid: true, timestamp: 1700000000, expiry: 1702592000, issuerHash: "0x..." }

// Revoke attestation
await client.revokeAttestation(ZK_EMAIL, walletClient);
```

---

## Smart Contracts

### UntracedRegistry.sol

Central registry with EIP-712 signature verification:

```solidity
contract UntracedRegistry {
    // Trusted attestor for signing proofs
    address public attestor;

    // User => ModuleType => Attestation
    mapping(address => mapping(bytes32 => Attestation)) public attestations;

    // Submit signed attestation
    function submitSignedProof(
        bytes32 moduleType,
        uint256 expiry,
        uint8 v, bytes32 r, bytes32 s
    ) external;

    // Check if user has valid attribute
    function hasAttribute(address user, bytes32 moduleType)
        external view returns (bool);

    // User can revoke their own attestation
    function revokeAttestation(bytes32 moduleType) external;
}
```

### Using in Your Contracts

```solidity
import "./interfaces/IUntracedRegistry.sol";

contract YourDApp {
    IUntracedRegistry public registry;
    bytes32 constant ZK_GITHUB = keccak256("ZK_GITHUB");

    function gatedAction() external {
        require(
            registry.hasAttribute(msg.sender, ZK_GITHUB),
            "GitHub verification required"
        );
        // Your logic here
    }
}
```

---

## API Endpoints

### Attestation APIs

```
POST /api/attest/email
Body: { userAddress, githubAccessToken, nonce }
Response: { attestation: { moduleType, expiry, signature: { v, r, s } } }

POST /api/attest/age
Body: { userAddress, birthDate, minAge, nonce }
Response: { attestation: { moduleType, expiry, signature, proofData }, meta: { age, verified } }

POST /api/attest/github
Body: { userAddress, githubAccessToken, minCommits, nonce }
Response: { attestation: { ... }, meta: { githubUsername, actualCommits, totalRepos, accountAgeDays } }

POST /api/attest/twitter
Body: { userAddress, twitterAccessToken, verificationType, minFollowers?, nonce }
Response: { attestation: { ... }, meta: { twitterUsername, followers, tweets, isVerified } }
```

### OAuth APIs

```
GET /api/auth/github?returnUrl=/dashboard/playground
→ Redirects to GitHub OAuth

GET /api/auth/twitter?returnUrl=/dashboard/playground
→ Redirects to Twitter OAuth (PKCE)

GET /api/auth/tokens
→ { github: { connected, token }, twitter: { connected, token } }

DELETE /api/auth/tokens
Body: { provider: "github" | "twitter" | "all" }
→ Disconnects OAuth session
```

---

## Deployment

### Prerequisites

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Install OpenZeppelin
cd packages/contracts
forge install OpenZeppelin/openzeppelin-contracts --no-commit
```

### Deploy to Mantle Sepolia

```bash
cd packages/contracts

# Set environment variables
export DEPLOYER_PRIVATE_KEY=0x...
export ATTESTOR_ADDRESS=0x...
export MANTLE_SEPOLIA_RPC_URL=https://rpc.sepolia.mantle.xyz

# Deploy
forge script script/Deploy.s.sol:Deploy \
  --rpc-url $MANTLE_SEPOLIA_RPC_URL \
  --broadcast

# Output:
# UntracedRegistry deployed at: 0x...
# Modules deployed at: 0x...
```

### Update Environment

After deployment, add to `apps/web/.env.local`:

```env
NEXT_PUBLIC_REGISTRY_ADDRESS=0x...
```

---

## Available Modules

| Module | Description | Status |
|--------|-------------|--------|
| **zk-email** | Prove email ownership via GitHub OAuth | Active |
| **zk-age** | Prove age > threshold without revealing DOB | Active |
| **zk-github** | Prove commits > N, verify account with real OAuth | Active |
| **zk-twitter** | Prove account ownership, follower count, verified status | Active |
| **zk-balance** | Prove balance > X without revealing amount | Active |
| **zk-country** | Prove user belongs to allowed region | Coming Soon |
| **zk-aadhar** | Prove Aadhaar validity & age > 18 | Coming Soon |

---

## Architecture

### Attestation Flow

1. **User** connects wallet via Privy
2. **User** authenticates with OAuth (GitHub/Twitter) or provides inputs
3. **Frontend** calls attestation API with OAuth token or user data
4. **Backend** verifies data via third-party API (GitHub API, Twitter API)
5. **Backend** signs EIP-712 attestation: `{user, moduleType, expiry, nonce}`
6. **Frontend** calls `registry.submitSignedProof()` on Mantle
7. **Contract** verifies signature, stores attestation
8. **Any dApp** can now call `registry.hasAttribute(user, MODULE_TYPE)`

### Privacy Model

| Layer | What it knows |
|-------|---------------|
| OAuth Provider | User's account (existing relationship) |
| Backend | Verification result (boolean, no storage) |
| Contract | `VERIFIED == true` (no PII, no identity) |
| Other dApps | User has verified attribute |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15, React 19, Tailwind CSS |
| **Wallet/Auth** | Privy (wallet + social OAuth) |
| **Blockchain** | Mantle Sepolia (chain ID: 5003) |
| **Contracts** | Solidity 0.8.20, Foundry |
| **Signing** | EIP-712 typed data signatures |
| **Web3** | viem |
| **Animations** | Framer Motion |
| **UI** | Radix UI, CVA, Lucide Icons |
| **Package Manager** | Bun |
| **Monorepo** | Bun Workspaces |

---

## Development

### Commands

```bash
# Install all dependencies
bun install

# Start dashboard (port 3000)
bun run dev

# Start landing page (port 3001)
bun run dev:landing

# Start both apps simultaneously
bun run dev:all

# Build all apps
bun run build

# Type check
bun run tsc --noEmit

# Build contracts
cd packages/contracts && forge build

# Run contract tests
forge test

# Compile Noir circuits
cd packages/circuits && nargo compile
```

---

## Roadmap

### Phase 1 — MVP ✅
- [x] Monorepo setup with Bun
- [x] Landing page with animations
- [x] Dashboard with project management
- [x] Animated sidebar navigation
- [x] Flow Builder UI
- [x] Privy wallet integration
- [x] UntracedRegistry with EIP-712 signatures
- [x] Email, Age, Balance module implementations
- [x] Backend attestation APIs
- [x] SDK with `useUntraced` hook
- [x] Embeddable verification modal
- [x] Foundry deployment scripts

### Phase 2 — OAuth Integration ✅
- [x] GitHub OAuth flow (real authentication)
- [x] Twitter/X OAuth flow (OAuth 2.0 with PKCE)
- [x] GitHub attestation with real commit data
- [x] Twitter attestation with real follower data
- [x] Interactive Playground page
- [x] Analytics dashboard (Beta)
- [x] Settings page with tabs

### Phase 3 — Production
- [ ] Deploy to Mantle Sepolia
- [ ] End-to-end testing
- [ ] Database integration for projects
- [ ] API key management
- [ ] Security audit

### Phase 4 — Scale
- [ ] Mantle mainnet deployment
- [ ] Multi-chain support
- [ ] Third-party module registry
- [ ] Enterprise features
- [ ] Additional modules (zk-country, zk-aadhar)

---

## Why UNTRACED?

| Benefit | Description |
|---------|-------------|
| **Privacy-first** | Only boolean attributes stored on-chain |
| **Real OAuth** | GitHub and Twitter use actual OAuth, not simulations |
| **Simple DX** | 3-line SDK integration |
| **Modular** | Add new verification modules anytime |
| **Composable** | Combine modules into custom flows |
| **User-controlled** | Users can revoke attestations anytime |

---

## License

MIT

---

Built for **Mantle Hackathon 2025**
