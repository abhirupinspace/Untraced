# UNTRACED

## A Modular Zero-Knowledge Verification Suite + Flow Builder

UNTRACED provides developers with a toolbox of **ZK verification modules**, each representing a Web2 → ZK → On-chain attribute attestation. Built on **Mantle**.

---

## Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Open http://localhost:3000
```

### Environment Setup

Copy the example env file and configure:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Required variables:
- `NEXT_PUBLIC_PRIVY_APP_ID` - Your Privy App ID for wallet connection
- `NEXT_PUBLIC_CHAIN_ID` - Chain ID (5003 for Mantle Sepolia)

---

## Project Structure

```
untraced/
├── apps/
│   └── web/                      # Next.js 15 frontend
│       ├── app/
│       │   ├── page.tsx          # Landing page
│       │   ├── builder/          # Flow Builder UI
│       │   └── layout.tsx        # Root layout with providers
│       ├── components/
│       │   ├── landing/          # Landing page components
│       │   │   ├── header.tsx
│       │   │   ├── hero.tsx
│       │   │   ├── modules-section.tsx
│       │   │   ├── how-it-works.tsx
│       │   │   └── footer.tsx
│       │   ├── flow-builder/     # Flow builder components
│       │   │   ├── kyc-flow-builder.tsx  # Main KYC flow builder (3-step)
│       │   │   ├── flow-builder.tsx      # Legacy flow builder
│       │   │   ├── flow-dashboard.tsx    # Dashboard layout
│       │   │   ├── flow-canvas.tsx       # Visual flow canvas
│       │   │   ├── flow-preview.tsx      # Live modal preview
│       │   │   ├── flow-stats.tsx        # Flow statistics panel
│       │   │   ├── module-selector.tsx   # Module selection sidebar
│       │   │   ├── module-card.tsx
│       │   │   ├── code-preview.tsx
│       │   │   ├── code-generator.ts
│       │   │   ├── module-data.ts
│       │   │   ├── types.ts
│       │   │   └── steps/                # KYC flow builder steps
│       │   │       ├── project-step.tsx      # Step 1: Create project
│       │   │       ├── api-keys-step.tsx     # Step 2: API keys
│       │   │       └── builder-step.tsx      # Step 3: Canvas/Preview/Code
│       │   ├── providers/        # React providers
│       │   │   └── privy-provider.tsx
│       │   ├── ui/               # Reusable UI components
│       │   │   ├── button.tsx        # CVA-based button with variants
│       │   │   ├── card.tsx          # Card with glass/glow variants
│       │   │   ├── badge.tsx         # Status badges
│       │   │   ├── dialog.tsx        # Radix dialog wrapper
│       │   │   ├── animated-border.tsx # Magic UI components
│       │   │   ├── icons.tsx         # Custom SVG icons
│       │   │   └── index.ts          # Barrel exports
│       │   └── verification/     # Embeddable components
│       │       └── untraced-modal.tsx # Customer integration modal
│       ├── public/
│       │   └── icon.png          # UNTRACED logo
│       └── lib/
│           ├── cn.ts             # Classname utility
│           └── use-wallet.ts     # Wallet hook wrapper
│
├── packages/
│   ├── sdk/                      # @untraced/sdk
│   │   └── src/
│   │       ├── index.ts          # Package exports
│   │       ├── client.ts         # UntracedClient class
│   │       ├── hooks.ts          # React hooks (useUntraced, useUntracedFlow)
│   │       └── types.ts          # TypeScript types
│   │
│   ├── contracts/                # @untraced/contracts (Foundry)
│   │   └── src/
│   │       ├── UntracedRegistry.sol    # Central registry
│   │       ├── FlowFactory.sol         # Flow deployment factory
│   │       ├── interfaces/
│   │       │   ├── IUntracedModule.sol
│   │       │   └── IUntracedRegistry.sol
│   │       └── modules/
│   │           ├── MockEmailModule.sol
│   │           └── MockAgeModule.sol
│   │
│   └── config/                   # Shared configurations
│       ├── tailwind.config.js
│       └── tsconfig.base.json
│
├── package.json                  # Bun workspaces root
└── untraced.md                   # This file
```

---

## Available Modules

| Module | Description | Status |
|--------|-------------|--------|
| **zk-email** | Prove Gmail/Outlook ownership without revealing email | Active |
| **zk-age** | Prove age > threshold without revealing DOB | Active |
| **zk-github** | Prove commits > N, verified status | Active |
| **zk-aadhar** | Prove Aadhaar validity & age > 18 | Coming Soon |
| **zk-bank-balance** | Prove balance > X | Coming Soon |
| **zk-amazon** | Prove purchase history / Prime status | Coming Soon |
| **zk-country** | Prove user belongs to allowed region | Coming Soon |
| **zk-kyc** | Prove KYC passed with provider X | Coming Soon |

Each module produces a standardized **attribute proof**:

```json
{
  "attributeType": "email_verified",
  "proof": "<zk-proof-bytes>",
  "issuer": "gmail.com",
  "expiry": 3600
}
```

---

## Architecture

### Layer A — Verification Modules (Building Blocks)

Each module includes:

**Off-chain components:**
- zkTLS transcript extractor
- ZK circuits for attribute logic
- Proof generator

**On-chain verifier:**

```solidity
interface IUntracedModule {
    function verify(bytes calldata proof) external view returns (bool);
    function attributeType() external pure returns (bytes32);
    function moduleName() external pure returns (string memory);
}
```

### Layer B — UNTRACED Registry (Hub Contract)

Central contract that stores attributes, manages providers, and handles expiration.

```solidity
contract UntracedRegistry {
    // user => moduleType => Attestation
    mapping(address => mapping(bytes32 => Attestation)) public attestations;

    function submitProof(bytes32 moduleType, bytes calldata proof) external;
    function hasAttribute(address user, bytes32 moduleType) external view returns (bool);
}
```

### Layer C — Flow Builder (Rules Engine)

Developers combine modules into custom verification flows:

```json
{
  "flowName": "rwa_access",
  "requirements": [
    { "module": "zk-email", "config": "Gmail" },
    { "module": "zk-age", "config": 18 },
    { "module": "zk-country", "config": "US" }
  ]
}
```

This compiles into a **Solidity Rule Contract**:

```solidity
contract RwaAccessFlow {
    function verifyFlow(address user) external view returns (bool) {
        return registry.hasAttribute(user, ZK_EMAIL)
            && registry.hasAttribute(user, ZK_AGE)
            && registry.hasAttribute(user, ZK_COUNTRY);
    }
}
```

### Layer D — JavaScript SDK

```typescript
import { createClient, useUntraced, useUntracedFlow } from "@untraced/sdk";

// Client usage
const client = createClient({ chainId: 5003 });
const proof = await client.generateProof("zk-email");
await client.submitProof(proof);

// React hooks
const { verified, loading, verify } = useUntraced("zk-email");
const { allowed, verify } = useUntracedFlow("rwa_access");
```

---

## Embeddable UntracedModal

For customers who want to integrate UNTRACED verification into their apps, we provide a ready-to-use modal component:

```tsx
import { UntracedModal, UntracedVerifyButton } from "@/components/verification/untraced-modal";

// Option 1: Full control with modal
function App() {
  const [open, setOpen] = useState(false);

  return (
    <UntracedModal
      open={open}
      onOpenChange={setOpen}
      flowName="kyc_verification"
      modules={["zk-email", "zk-age", "zk-github"]}
      onComplete={(results) => console.log("Verified:", results)}
      onStepComplete={(moduleId, success) => console.log(moduleId, success)}
      title="Verify Your Identity"
      description="Complete verification to access the platform"
    />
  );
}

// Option 2: Simple button that opens modal
function App() {
  return (
    <UntracedVerifyButton
      flowName="kyc_verification"
      modules={["zk-email", "zk-age"]}
      onComplete={(results) => console.log("Done:", results)}
    >
      Verify with UNTRACED
    </UntracedVerifyButton>
  );
}
```

**Modal Features:**
- Multi-step verification flow with progress indicator
- Module-specific icons and descriptions
- Loading states and error handling
- Success/failure animations
- Customizable title and description
- Callback hooks for each step and completion

---

## KYC Flow Builder

The KYC Flow Builder provides a streamlined 3-step workflow for creating verification flows:

### Step 1: Create Project

- Enter project name and description
- Minimal, focused UI
- Automatic flow name generation

### Step 2: API Keys

- Auto-generated API key (public) and Secret key (private)
- Copy-to-clipboard functionality
- Show/hide secret key toggle
- Security warnings and best practices
- Quick start code snippet

```typescript
import { createClient } from "@untraced/sdk";

const untraced = createClient({
  apiKey: "uk_live_...",
});
```

### Step 3: Flow Builder

Three-tab interface:

| Tab | Description |
|-----|-------------|
| **Canvas** | Visual flow editor with drag-and-drop modules, Start/End nodes, AND connectors |
| **Preview** | Live phone-frame preview with simulation capability |
| **Code** | Generated SDK, Solidity, and JSON code |

**Canvas Features:**
- Minimal sidebar with module selection
- Drag-and-drop reordering
- Inline configuration (thresholds, selections)
- Visual flow with Start → Modules → End

**Preview Features:**
- Real-time modal preview
- Phone frame for realistic view
- Simulate button to test entire flow
- Reset functionality

### Generated Output

For each flow, the builder generates:

| Output | Description |
|--------|-------------|
| **Solidity Contract** | Deployable flow verifier contract |
| **SDK Code** | Ready-to-use JavaScript integration |
| **JSON Config** | Flow definition for backend systems |

---

## Smart Contracts

### UntracedRegistry.sol

The central hub that:
- Registers verification modules
- Stores user attestations
- Manages expiration (default: 30 days)
- Allows users to revoke their own attestations

### FlowFactory.sol

Factory contract that:
- Deploys custom FlowVerifier contracts
- Stores flow configurations
- Provides lookup by flow name

### FlowVerifier.sol

Generated per-flow contract that:
- Checks all required attributes
- Returns boolean pass/fail
- Lists missing modules for a user

---

## Design System

**Colors:**

| Context | Color |
|---------|-------|
| Background (Builder) | `#fafafa` |
| Background (Landing) | `#f8f8f6` |
| Primary Dark | `#3d0040` |
| Dark Hover | `#5a0060` |
| Light Hover | `#efefed` |
| Gray Scale | Tailwind gray-100 to gray-900 |

**Fonts:**
- Primary: Poppins (weights: 300-700)
- Mono: System monospace

**Design Principles:**
- Minimal, focused interfaces
- Gray-scale aesthetic for builder
- Step-by-step progressive disclosure
- Phone-frame previews for realistic UX

**UI Components:**

| Component | Description |
|-----------|-------------|
| `Button` | CVA-based with variants: default, secondary, outline, ghost, link, glow |
| `Card` | Variants: default, bordered, elevated, glass, glow |
| `Badge` | Status indicators with default, secondary, outline, destructive variants |
| `Dialog` | Radix-based modal with UNTRACED styling |
| `AnimatedBorder` | Magic UI gradient border animation |
| `GlowCard` | Card with animated glow effect |
| `ShimmerButton` | Button with shimmer animation |

**Custom Icons:**
- `GithubIcon`, `GoogleIcon`, `EmailIcon`
- `AmazonIcon`, `BankIcon`, `IdCardIcon`
- `GlobeIcon`, `ShieldCheckIcon`, `UserIcon`
- `MantleIcon`, `SparklesIcon`, `LoaderIcon`, `CheckCircleIcon`

**Assets:**
- `icon.png` — UNTRACED logo used in header and builder

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15, React 18, Tailwind CSS |
| **Wallet** | Privy |
| **Drag & Drop** | @dnd-kit/core, @dnd-kit/sortable |
| **Animations** | Framer Motion |
| **UI Primitives** | Radix UI (Dialog, Slot, Tooltip) |
| **Component Styling** | Class Variance Authority (CVA), tailwind-merge |
| **Smart Contracts** | Solidity 0.8.20, Foundry |
| **Package Manager** | Bun |
| **Monorepo** | Bun Workspaces |

---

## Development

### Commands

```bash
# Install all dependencies
bun install

# Start web app in dev mode
bun run dev

# Build all packages
bun run build

# Lint all packages
bun run lint

# Clean all node_modules
bun run clean
```

### Contracts (Foundry)

```bash
cd packages/contracts

# Build contracts
forge build

# Run tests
forge test

# Deploy to Mantle Sepolia
forge script script/Deploy.s.sol --rpc-url $MANTLE_SEPOLIA_RPC_URL --broadcast
```

---

## Roadmap

### Phase 1 — MVP (Current)
- [x] Monorepo setup with Bun
- [x] Landing page with animations
- [x] Flow Builder UI with drag-drop
- [x] Code generation (Solidity, SDK, JSON)
- [x] Privy wallet integration
- [x] SDK skeleton with hooks
- [x] Core smart contracts
- [x] Poppins font integration
- [x] Custom brand icons (GitHub, Email, Bank, etc.)
- [x] shadcn/magic-ui inspired components
- [x] Embeddable UntracedModal for customers
- [x] Polished UX with animations & gradients
- [x] KYC Flow Builder with 3-step workflow
- [x] Project creation & API key management
- [x] Live phone-frame modal preview
- [x] Flow simulation capability
- [x] Minimal, focused UI design

### Phase 2 — zkTLS Integration
- [ ] Integrate Reclaim Protocol / vlayer for zkTLS
- [ ] Implement zk-email module end-to-end
- [ ] Implement zk-age module with ID verification
- [ ] Deploy contracts to Mantle testnet

### Phase 3 — Production
- [ ] Security audit
- [ ] More verification modules
- [ ] Analytics dashboard
- [ ] Multi-chain support

---

## Why UNTRACED?

| Benefit | Description |
|---------|-------------|
| **Infinite extensibility** | Add new modules anytime |
| **Customizable compliance** | Craft flows for specific DApp needs |
| **Modular protocol** | Anyone can build third-party modules |
| **Simple DX** | Abstract away zkTLS + circuit complexity |
| **Strict privacy** | Only boolean attributes leave the client |

---

## License

MIT

---

Built for **Mantle Hackathon 2025**
