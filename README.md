# Untraced

**Verify everything. Reveal nothing.**

Untraced enables applications to verify user credentials while maintaining complete privacy through zero-knowledge proofs and EIP-712 signatures. Verify users without ever seeing their data.

## Documentation

For detailed documentation, visit our [GitBook](https://untraced.gitbook.io/untraced-docs/).

## Features

- **Client-Side Proofs** - Data never leaves the user's device. Proofs generate locally.
- **Instant Verification** - Optimized circuits with millisecond proof generation.
- **Zero Data Exposure** - Cryptographic certainty through ZK proofs. No assumptions required.
- **Cross-Chain Support** - Portable attestations across EVM networks.
- **Simple Integration** - Ship in hours with minimal code changes.
- **Selective Disclosure** - Prove what matters. Hide everything else.

## Available Modules

| Module | Code | Description | Status |
|--------|------|-------------|--------|
| Email | `zk-email` | Prove ownership without revealing the address | Live |
| Age | `zk-age` | Prove age requirements. DOB stays private | Live |
| Balance | `zk-balance` | Prove wallet balance thresholds. Exact amount hidden | Live |
| GitHub | `zk-github` | Prove account ownership and contribution history | Live |
| Residency | `zk-country` | Prove allowed regions. Location stays private | Coming Soon |
| Aadhaar | `zk-aadhar` | Indian identity verification. Zero data exposure | Coming Soon |

## Tech Stack

- **Circuits**: Noir
- **Proofs**: Client-side ZK proofs
- **Attestations**: On-chain via EIP-712 signatures
- **Blockchain**: Mantle (with cross-chain EVM support)

## Contract Addresses

### Mantle Sepolia Testnet (Chain ID: 5003)

| Contract | Address |
|----------|---------|
| UntracedRegistry | [`0xA5f2af132B0163f9333c67f5EfD4C35f037BbA60`](https://sepolia.mantlescan.xyz/address/0xA5f2af132B0163f9333c67f5EfD4C35f037BbA60) |
| EmailModule | [`0x4242EA2cE78D219c0774290D98348dd8aFAfAAE5`](https://sepolia.mantlescan.xyz/address/0x4242EA2cE78D219c0774290D98348dd8aFAfAAE5) |

## Project Structure

```
untraced/
├── apps/
│   ├── web/          # Main web application
│   └── landing/      # Landing page
├── packages/
│   ├── sdk/          # @untraced/sdk - Core SDK
│   ├── circuits/     # ZK circuits
│   ├── contracts/    # Smart contracts
│   └── config/       # Shared configuration
└── docs/             # Documentation
```

## Installation

```bash
npm install @untraced/sdk
# or
yarn add @untraced/sdk
# or
bun add @untraced/sdk
```

## Quick Start

```tsx
import { UntracedProvider, UntracedModal, UntracedButton } from '@untraced/sdk';

function App() {
  return (
    <UntracedProvider>
      <UntracedModal />
      <UntracedButton />
    </UntracedProvider>
  );
}
```

The smart contract receives only a boolean confirmation - never raw personal information.

## Development

```bash
# Install dependencies
bun install

# Run web app
bun run dev

# Run landing page
bun run dev:landing

# Run all apps
bun run dev:all

# Build all packages
bun run build

# Lint
bun run lint
```

## Links

- [Documentation](https://untraced.gitbook.io/untraced-docs/)
- [Web App](https://untraced-web.vercel.app)
- [Website](https://untraced.io)

## License

MIT
