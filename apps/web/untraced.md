# UNTRACED - Zero-Knowledge Verification Suite

## Overview

UNTRACED is a privacy-preserving verification platform that enables developers to build ZK-powered KYC flows. Users can prove attributes (age, email, identity) without revealing underlying data.

## Dashboard Flow

### 1. Projects
Users land on the **Projects** dashboard where they can:
- View all created projects
- Search projects by name or client ID
- Create new projects
- Access project details

### 2. Create Project
- Enter project name and optional description
- Automatically generates:
  - **Client ID** (public) - `uk_live_...`
  - **Secret Key** (private) - `sk_live_...`
- Redirects to project detail view

### 3. Project Detail
Displays:
- Client ID (copyable, public)
- Secret Key (hidden by default, private)
- Security warning about secret key usage
- List of verification flows
- Quick start code snippet

### 4. Flow Builder
Create ZK verification flows with:
- **Module Selector** - Choose from available ZK modules:
  - zk-email (Email Verification)
  - zk-age (Age Verification)
  - zk-github (GitHub Verification)
  - zk-bank-balance (Bank Balance)
  - zk-country (Country Verification)
  - zk-aadhar (Aadhaar Verification)

- **Canvas View** - Drag & drop modules, configure thresholds
- **Preview View** - Live modal preview with:
  - Dark/Light theme toggle
  - Simulation controls
  - Step-by-step flow visualization
- **Code View** - Generated SDK, Solidity, and JSON code

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Font**: Poppins (Light 300, Normal 400, Medium 500)
- **Auth**: Privy (wallet + email + social)
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion
- **Drag & Drop**: dnd-kit

## File Structure

```
apps/web/
├── app/
│   ├── page.tsx          # Redirects to /dashboard
│   ├── dashboard/        # Dashboard page
│   ├── builder/          # Standalone builder (legacy)
│   ├── layout.tsx        # Root layout with Poppins font
│   └── globals.css       # Global styles
├── components/
│   ├── dashboard/
│   │   └── dashboard.tsx # Main dashboard component
│   ├── flow-builder/
│   │   ├── kyc-flow-builder.tsx
│   │   ├── steps/
│   │   │   ├── project-step.tsx
│   │   │   ├── api-keys-step.tsx
│   │   │   └── builder-step.tsx
│   │   ├── module-data.ts
│   │   ├── types.ts
│   │   └── code-generator.ts
│   ├── verification/
│   │   └── untraced-modal.tsx
│   ├── ui/               # Reusable UI components
│   └── providers/
│       └── privy-provider.tsx
└── lib/
    ├── use-wallet.ts     # Wallet state hook
    └── cn.ts             # Class name utility
```

## Environment Variables

```env
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
```

## Design System

### Colors
- Background: `#0a0a0a`
- Card: `#0f0f0f`
- Accent: `#a855f7` (Purple)
- Border: `rgba(255, 255, 255, 0.1)`

### Typography
- Headings: Poppins Normal (400)
- Body: Poppins Light (300)
- Labels: Poppins Normal (400)
- Code: System monospace

## Routes

| Route | Description |
|-------|-------------|
| `/` | Redirects to `/dashboard` |
| `/dashboard` | Main dashboard with projects |
| `/builder` | Standalone flow builder (legacy) |

## Wallet States

The app handles multiple Privy states:
- `ready: false` - Loading spinner
- `authenticated: false` - "Connect Wallet" button
- `authenticated: true` - User avatar + logout button

When Privy is not configured, mock wallet functions are used for development.
