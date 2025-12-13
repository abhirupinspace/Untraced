# UNTRACED

## Zero-Knowledge Verification Protocol for Mantle

UNTRACED enables developers to build privacy-preserving verification flows. Users prove Web2 attributes (email, age, identity) without revealing underlying data. Built on **Mantle**.

---

## Quick Start

```bash
# Install dependencies
bun install

# Start development server
cd apps/web && bun run dev

# Open http://localhost:3000
```

### Environment Setup

```bash
cp apps/web/.env.example apps/web/.env.local
```

Required variables:
```env
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_REGISTRY_ADDRESS=0x...  # After deployment
ATTESTOR_PRIVATE_KEY=0x...          # Server-side signing key
```

---

## How It Works

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   GitHub    │────▶│  Backend    │────▶│  Registry   │────▶│  Your dApp  │
│   OAuth     │     │  Attestor   │     │  Contract   │     │   Gating    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      │                    │                   │                   │
  User logs in      Signs attestation    Stores boolean      Checks access
  via Privy         EMAIL_VERIFIED=true  on Mantle           with hasAttribute()
```

**Privacy Guarantee:** The smart contract only ever knows `EMAIL_VERIFIED == true` — nothing else.

---

## Project Structure

```
untraced/
├── apps/
│   └── web/                          # Next.js 15 frontend
│       ├── app/
│       │   ├── page.tsx              # Landing → redirects to /dashboard
│       │   ├── dashboard/            # Project management
│       │   ├── builder/              # Flow Builder UI
│       │   └── api/
│       │       └── attest/route.ts   # Attestation API endpoint
│       ├── components/
│       │   ├── dashboard/            # Dashboard components
│       │   ├── flow-builder/         # Flow builder components
│       │   ├── verification/
│       │   │   └── untraced-modal.tsx # Embeddable verification modal
│       │   ├── landing/              # Landing page components
│       │   ├── providers/            # React providers (Privy)
│       │   └── ui/                   # Reusable UI components
│       └── lib/
│           ├── cn.ts                 # Classname utility
│           └── use-wallet.ts         # Wallet hook wrapper
│
├── packages/
│   ├── sdk/                          # @untraced/sdk
│   │   ├── src/
│   │   │   ├── index.ts              # Package exports
│   │   │   ├── client.ts             # UntracedClient class
│   │   │   ├── hooks.ts              # useUntraced React hook
│   │   │   ├── types.ts              # TypeScript types
│   │   │   └── abi/
│   │   │       └── registry.ts       # Registry contract ABI
│   │   └── README.md                 # SDK documentation
│   │
│   ├── contracts/                    # Solidity contracts (Foundry)
│   │   ├── src/
│   │   │   ├── UntracedRegistry.sol  # Central registry with EIP-712 signatures
│   │   │   ├── FlowFactory.sol       # Flow deployment factory
│   │   │   ├── interfaces/
│   │   │   │   ├── IUntracedModule.sol
│   │   │   │   └── IUntracedRegistry.sol
│   │   │   └── modules/
│   │   │       ├── EmailModule.sol       # Production email module
│   │   │       └── MockEmailModule.sol   # Testing mock
│   │   └── script/
│   │       └── Deploy.s.sol          # Foundry deployment script
│   │
│   └── config/                       # Shared configurations
│
├── package.json                      # Bun workspaces root
└── untraced.md                       # This file
```

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
import { createClient, ZK_EMAIL } from "@untraced/sdk";

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
    bytes32 constant ZK_EMAIL = keccak256("ZK_EMAIL");

    function gatedAction() external {
        require(
            registry.hasAttribute(msg.sender, ZK_EMAIL),
            "Email verification required"
        );
        // Your logic here
    }
}
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
# EmailModule deployed at: 0x...
```

### Update Environment

After deployment, add to `apps/web/.env.local`:

```env
NEXT_PUBLIC_REGISTRY_ADDRESS=0x...
```

---

## Embeddable Modal

For customer-facing verification:

```tsx
import { UntracedModal } from "@/components/verification/untraced-modal";
import { useUntraced } from "@untraced/sdk";

function App() {
  const [open, setOpen] = useState(false);
  const { verified, expiresAt, verify, error } = useUntraced();

  return (
    <>
      <button onClick={() => setOpen(true)}>
        {verified ? "Verified" : "Verify Email"}
      </button>

      <UntracedModal
        open={open}
        onOpenChange={setOpen}
        onVerify={verify}
        verified={verified}
        expiresAt={expiresAt}
        error={error}
      />
    </>
  );
}
```

**Modal Features:**
- Privacy messaging (what is/isn't revealed)
- Progress states: idle → generating → submitting → success
- "Running zero-knowledge proof locally..." UX
- Validity duration display (30 days)
- Error handling with retry

---

## Available Modules

| Module | Description | Status |
|--------|-------------|--------|
| **zk-email** | Prove email ownership via GitHub OAuth | **Active** |
| **zk-age** | Prove age > threshold without revealing DOB | Coming Soon |
| **zk-github** | Prove commits > N, verified status | Coming Soon |
| **zk-bank-balance** | Prove balance > X | Coming Soon |
| **zk-country** | Prove user belongs to allowed region | Coming Soon |
| **zk-aadhar** | Prove Aadhaar validity & age > 18 | Coming Soon |

---

## Architecture

### Attestation Flow

1. **User** connects wallet + GitHub via Privy
2. **Frontend** calls `POST /api/attest` with GitHub access token
3. **Backend** fetches GitHub emails, verifies at least one is verified
4. **Backend** signs EIP-712 attestation: `{user, moduleType, expiry, nonce}`
5. **Frontend** calls `registry.submitSignedProof()` on Mantle
6. **Contract** verifies signature, stores attestation
7. **Any dApp** can now call `registry.hasAttribute(user, ZK_EMAIL)`

### Privacy Model

| Layer | What it knows |
|-------|---------------|
| GitHub | User's email (existing relationship) |
| Backend | Email is verified (boolean only, no storage) |
| Contract | `EMAIL_VERIFIED == true` (no email, no identity) |
| Other dApps | User has verified email attribute |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15, React 18, Tailwind CSS |
| **Wallet/Auth** | Privy (wallet + GitHub OAuth) |
| **Blockchain** | Mantle Sepolia (chain ID: 5003) |
| **Contracts** | Solidity 0.8.20, Foundry |
| **Signing** | EIP-712 typed data signatures |
| **Web3** | viem |
| **Animations** | Framer Motion |
| **UI** | Radix UI, CVA |
| **Package Manager** | Bun |
| **Monorepo** | Bun Workspaces |

---

## Development

### Commands

```bash
# Install all dependencies
bun install

# Start web app
cd apps/web && bun run dev

# Type check
bun run tsc --noEmit

# Build contracts
cd packages/contracts && forge build

# Run contract tests
forge test
```

### API Endpoint

The attestation API is at `apps/web/app/api/attest/route.ts`:

```
POST /api/attest
Body: { userAddress, githubAccessToken, nonce }
Response: { attestation: { moduleType, expiry, signature: { v, r, s } } }
```

---

## Roadmap

### Phase 1 — MVP ✅
- [x] Monorepo setup with Bun
- [x] Landing page with animations
- [x] Dashboard with project management
- [x] Flow Builder UI
- [x] Privy wallet + GitHub OAuth integration
- [x] UntracedRegistry with EIP-712 signatures
- [x] EmailModule implementation
- [x] Backend attestation API
- [x] SDK with `useUntraced` hook
- [x] Embeddable verification modal
- [x] Foundry deployment scripts

### Phase 2 — Production
- [ ] Deploy to Mantle Sepolia
- [ ] End-to-end testing
- [ ] Additional modules (zk-age, zk-github)
- [ ] Analytics dashboard
- [ ] Security audit

### Phase 3 — Scale
- [ ] Mantle mainnet deployment
- [ ] Multi-chain support
- [ ] Third-party module registry
- [ ] Enterprise features

---

## Why UNTRACED?

| Benefit | Description |
|---------|-------------|
| **Privacy-first** | Only boolean attributes stored on-chain |
| **Simple DX** | 3-line SDK integration |
| **Modular** | Add new verification modules anytime |
| **Composable** | Combine modules into custom flows |
| **User-controlled** | Users can revoke attestations |

---

## License

MIT

---

Built for **Mantle Hackathon 2025**
