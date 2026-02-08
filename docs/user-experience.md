# MySkills - User Experience & Frontend Design

**Last Updated**: February 8, 2026
**Status**: Aligned with UNIFIED_PLAN.md
**Focus**: Adaptive UI for Moltiverse (Direction A) and Blitz Pro (Direction B)

---

## Overview

MySkills uses an **adaptive UI system** that adjusts the interface based on the target hackathon:
- **Direction A (Moltiverse)**: Emphasizes Agent Collaboration & Coordination
- **Direction B (Blitz Pro)**: Emphasizes Agent-Native Payment Infrastructure

This unified approach maximizes development efficiency while meeting both competition requirements.

---

## Page Structure

```
app/
├── page.tsx                    // Adaptive landing (A or B based on env)
├── skills/
│   ├── page.tsx               // Shared directory
│   └── [id]/
│       └── page.tsx           // Shared detail with conditional features
├── create-skill/
│   └── page.tsx               // Shared form
├── activities/
│   └── page.tsx               // Unified: Bounties (A) or Tasks (B)
└── leaderboard/
    └── page.tsx               // Shared, different sorting
```

---

## Design System

### Color Palette (Deep Glass Theme)

```css
/* Primary Colors */
--primary: #8B5CF6;              /* Purple - main brand */
--primary-hover: #7C3AED;
--secondary: #10B981;            /* Green - success states */
--accent: #F59E0B;               /* Orange - call-to-action */

/* Background Colors */
--bg-primary: #0F172A;           /* Deep blue-black */
--bg-secondary: #1E293B;         /* Lighter blue-gray */
--bg-glass: rgba(30, 41, 59, 0.7); /* Glass morphism */

/* Text Colors */
--text-primary: #F8FAFC;         /* White-ish */
--text-secondary: #94A3B8;       /* Gray */
--text-muted: #64748B;           /* Darker gray */

/* Border Colors */
--border: rgba(148, 163, 184, 0.1);  /* Subtle borders */
--border-hover: rgba(139, 92, 246, 0.3);  /* Purple on hover */
```

### Glassmorphism Effects

```css
.glass-card {
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.glass-card:hover {
  border-color: rgba(139, 92, 246, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(139, 92, 246, 0.1);
}
```

---

## Core Pages

### 1. Home Page (Adaptive)

**Direction A (Moltiverse)**:
```
Hero: "Agent Collaboration Marketplace"
Subtitle: "Post bounties, deliver skills, resolve disputes - all on-chain"
CTA: "Explore Bounties"
```

**Direction B (Blitz Pro)**:
```
Hero: "Agent Payment Infrastructure"
Subtitle: "Escrow, milestones, automated enforcement - for agent transactions"
CTA: "Start Payments"
```

**Implementation**:
```typescript
// app/page.tsx
const direction = process.env.NEXT_PUBLIC_DIRECTION || 'A';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900">
      <Hero direction={direction} />
      <FeaturedSkills />
      <StatsSection direction={direction} />
    </div>
  );
}
```

---

### 2. Skills Directory

**Layout**: Grid of skill cards with filtering

**Features**:
- Filter by platform (Coze, Claude Code, Manus, MiniMax)
- Sort by tips, newest, popularity
- Search by name/description
- Real-time balance display

**Skill Card Component**:
```typescript
interface SkillCardProps {
  skill: Skill;
  direction: 'A' | 'B';
}

export function SkillCard({ skill, direction }: SkillCardProps) {
  return (
    <div className="glass-card p-6">
      {/* Platform Badge */}
      <div className="flex items-center justify-between mb-4">
        <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
          {skill.platform}
        </span>
        <span className="text-sm text-gray-400">
          {shortenAddress(skill.creator)}
        </span>
      </div>

      {/* Skill Info */}
      <h3 className="text-xl font-bold text-white mb-2">{skill.name}</h3>
      <p className="text-gray-400 mb-4 line-clamp-2">{skill.description}</p>

      {/* Direction-Specific Stats */}
      {direction === 'A' && (
        <div className="flex items-center gap-2 text-sm text-green-400 mb-4">
          <Shield className="w-4 h-4" />
          <span>Security Score: {skill.securityScore}/100</span>
        </div>
      )}
      {direction === 'B' && (
        <div className="flex items-center gap-2 text-sm text-blue-400 mb-4">
          <Zap className="w-4 h-4" />
          <span>Performance: {skill.performanceScore}/100</span>
        </div>
      )}

      {/* Tipping Stats */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
        <span className="text-sm text-gray-400">
          💰 {formatNumber(skill.totalTips)} ASKL
        </span>
        <TipButton skillId={skill.id} />
      </div>
    </div>
  );
}
```

---

### 3. Skill Detail Page

**Layout**: Split view with info + actions

**Sections**:
1. Skill header (name, platform, creator)
2. Description and tags
3. Direction-specific metrics
4. Tipping interface
5. Transaction history

**Tipping Modal**:
```typescript
export function TipModal({ skill, onClose }: TipModalProps) {
  const [amount, setAmount] = useState(50);
  const { balance } = useBalance();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-card p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-white mb-4">Tip {skill.name}</h2>

        {/* Balance Display */}
        <div className="mb-4 p-3 bg-slate-800/50 rounded-lg">
          <span className="text-sm text-gray-400">Your Balance</span>
          <p className="text-lg font-bold text-white">{formatBalance(balance)} ASKL</p>
        </div>

        {/* Amount Selection */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[10, 50, 100, 500].map((value) => (
            <button
              key={value}
              onClick={() => setAmount(value)}
              className={`p-3 rounded-lg font-medium transition-all ${
                amount === value
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              {value}
            </button>
          ))}
        </div>

        {/* Custom Amount */}
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white mb-4"
          placeholder="Custom amount"
        />

        {/* Fee Breakdown */}
        <div className="mb-4 p-3 bg-slate-800/50 rounded-lg text-sm">
          <div className="flex justify-between text-gray-400 mb-1">
            <span>Creator receives</span>
            <span className="text-green-400">{(amount * 0.98).toFixed(2)} ASKL</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Platform fee</span>
            <span className="text-red-400">{(amount * 0.02).toFixed(2)} ASKL</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600"
          >
            Cancel
          </button>
          <button
            onClick={() => handleTip(skill.id, amount)}
            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90"
          >
            Confirm Tip 💎
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

### 4. Create Skill Page

**Form Fields**:
- Skill name (required)
- Description (required)
- Platform selection (required): Coze, Claude Code, Manus, MiniMax
- Version (default: 1.0.0)
- Payment address (default: current wallet)
- Tags (optional)

**Validation**:
```typescript
const validateSkillForm = (data: SkillFormData): ValidationResult => {
  if (!data.name || data.name.length < 3) {
    return { valid: false, error: 'Name must be at least 3 characters' };
  }
  if (!data.description || data.description.length < 10) {
    return { valid: false, error: 'Description must be at least 10 characters' };
  }
  if (!data.platform) {
    return { valid: false, error: 'Platform is required' };
  }
  if (!isValidAddress(data.paymentAddress)) {
    return { valid: false, error: 'Invalid payment address' };
  }
  return { valid: true };
};
```

---

### 5. Activities Page (Adaptive)

**Direction A (Moltiverse) - Bounties**:
- List of active bounties
- Filter by skill category
- Post new bounty
- Submit audit for bounty

**Direction B (Blitz Pro) - Tasks**:
- List of active tasks
- Multi-agent task assignment
- Milestone-based payments
- Task completion tracking

---

## User Flows

### Flow 1: First-Time User

```
1. Land on homepage
2. Click "Connect Wallet"
3. Approve connection in MetaMask
4. Auto-prompt to switch to Monad testnet
5. Display balance (0 ASKL)
6. Prompt to claim from faucet
7. Click "Claim Testnet Tokens"
8. Receive 1000 ASKL
9. Browse skills directory
10. Select a skill
11. Click "Tip" button
12. Select amount (10, 50, 100)
13. Confirm transaction in wallet
14. See success animation
15. Tip is recorded on-chain
```

### Flow 2: Creator Registers Skill

```
1. Connect wallet
2. Navigate to "Create Skill"
3. Fill form:
   - Name: "AI Writing Assistant"
   - Description: "Helps generate blog posts"
   - Platform: "Claude Code"
   - Payment address: (auto-filled)
4. Click "Register Skill"
5. Confirm transaction in wallet
6. Skill registered on-chain
7. Receive 500 ASKL reward
8. Redirect to skill detail page
9. Share skill URL
```

### Flow 3: Direction A - Bounty System

```
1. User posts bounty for custom skill
2. Agent discovers bounty via MCP Server
3. Agent accepts bounty
4. Agent delivers skill
5. User approves delivery
6. Smart contract distributes payment
7. Both parties receive confirmation
```

### Flow 4: Direction B - Multi-Agent Payment

```
1. User submits complex task
2. System breaks into subtasks
3. Multiple agents assigned
4. Each agent completes their part
5. Payments released on milestone completion
6. Final aggregation and verification
7. All agents paid automatically
```

---

## Component Architecture

### Direction-Aware Components

```typescript
// components/shared/DirectionWrapper.tsx
interface DirectionWrapperProps {
  children: (props: { direction: 'A' | 'B' }) => React.ReactNode;
}

export function DirectionWrapper({ children }: DirectionWrapperProps) {
  const direction = useDirection(); // From context or env
  return <>{children({ direction })}</>;
}

// Usage
<DirectionWrapper>
  {({ direction }) => (
    <SkillCard skill={skill} direction={direction} />
  )}
</DirectionWrapper>
```

### Shared Components

```typescript
// components/shared/WalletConnection.tsx
export function WalletConnection() {
  const { address, isConnected, connect } = useAccount();

  if (!isConnected) {
    return (
      <button
        onClick={connect}
        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-400">
        {shortenAddress(address)}
      </span>
      <BalanceDisplay address={address} />
    </div>
  );
}

// components/shared/TipButton.tsx
export function TipButton({ skillId }: { skillId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const { tip, isLoading } = useTipSkill();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90"
      >
        Tip 💎
      </button>
      {isOpen && (
        <TipModal
          skillId={skillId}
          onConfirm={(amount) => tip(skillId, amount)}
          onClose={() => setIsOpen(false)}
          isLoading={isLoading}
        />
      )}
    </>
  );
}
```

---

## Web3 Integration

### Wallet Connection (wagmi 3 + viem 2)

```typescript
// lib/wagmi.ts
import { http, createConfig } from 'wagmi';
import { monadTestnet } from 'wagmi/chains';
import { walletConnect, injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [monadTestnet],
  connectors: [
    walletConnect({ projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID }),
    injected(),
  ],
  transports: {
    [monadTestnet.id]: http(),
  },
});

// hooks/useBalance.ts
import { useBalance, useAccount } from 'wagmi';

export function useTokenBalance() {
  const { address } = useAccount();
  const { data, isLoading } = useBalance({
    address,
    token: process.env.NEXT_PUBLIC_ASKL_TOKEN_ADDRESS,
    chainId: 41454,
  });

  return {
    balance: data?.value || 0n,
    formatted: data?.formatted || '0',
    isLoading,
  };
}

// hooks/useTipSkill.ts
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ASKL_TOKEN_ABI } from '@/contracts/askl-token';

export function useTipSkill() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
  });

  const tip = async (skillId: string, amount: number) => {
    writeContract({
      address: ASKL_TOKEN_ADDRESS,
      abi: ASKL_TOKEN_ABI,
      functionName: 'tipSkill',
      args: [skillId, parseUnits(amount.toString(), 18)],
    });
  };

  return {
    tip,
    isLoading: isPending || isConfirming,
    hash,
  };
}
```

---

## Responsive Design

### Breakpoints

```css
/* Mobile First Approach */
/* Default: < 768px (mobile) */

/* Tablet: >= 768px */
@media (min-width: 768px) {
  .skills-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop: >= 1024px */
@media (min-width: 1024px) {
  .skills-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Large Desktop: >= 1280px */
@media (min-width: 1280px) {
  .skills-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### Mobile Navigation

```typescript
// components/mobile/BottomNav.tsx
export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 md:hidden">
      <div className="flex justify-around py-2">
        <NavIcon href="/" icon={Home} label="Home" />
        <NavIcon href="/skills" icon={Box} label="Skills" />
        <NavIcon href="/activities" icon={Activity} label="Activity" />
        <NavIcon href="/create-skill" icon={Plus} label="Create" />
      </div>
    </nav>
  );
}
```

---

## Error Handling

### Error States

```typescript
// components/shared/ErrorMessage.tsx
export function ErrorMessage({ error, onRetry }: ErrorProps) {
  return (
    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-red-500" />
        <div className="flex-1">
          <p className="text-red-400 font-medium">Transaction Failed</p>
          <p className="text-sm text-gray-400">{error.message}</p>
        </div>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
```

### Loading States

```typescript
// components/shared/LoadingSpinner.tsx
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`${sizes[size]} animate-spin rounded-full border-2 border-purple-600 border-t-transparent`} />
  );
}
```

---

## Analytics & Tracking

### Event Tracking

```typescript
// lib/analytics.ts
export const trackEvent = (event: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', event, properties);
  }
};

// Usage
trackEvent('skill_tip', {
  skill_id: skillId,
  amount: amount,
  currency: 'ASKL',
});
```

---

## MVP Feature Priorities

### P0 (Must Have - Feb 8-11)
- [x] Wallet connection (MetaMask + WalletConnect)
- [ ] Skills directory with filtering
- [ ] Skill detail page with tipping
- [ ] Create skill form
- [ ] Faucet integration
- [ ] Responsive design (mobile + desktop)

### P1 (Direction A - Feb 10-12)
- [ ] Bounties list page
- [ ] Post bounty form
- [ ] Submit audit interface
- [ ] Security score display

### P2 (Direction B - Feb 16-20)
- [ ] Tasks list page
- [ ] Task submission form
- [ ] Multi-agent assignment UI
- [ ] Performance metrics display

### NOT Building (Scope Reductions)
- ❌ Advanced search (use basic filtering)
- ❌ Skill comparison (defer to post-hackathon)
- ❌ User profiles/avatars (use address only)
- ❌ Social features (comments, likes)
- ❌ Notification system (basic only)

---

## Performance Optimizations

### Code Splitting

```typescript
// Dynamic imports for heavy components
const TipModal = dynamic(() => import('@/components/TipModal'), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});

// Route-based splitting
const ActivitiesPage = dynamic(() => import('./activities/page'));
```

### Image Optimization

```typescript
import Image from 'next/image';

<Image
  src={skill.logo}
  alt={skill.name}
  width={64}
  height={64}
  className="rounded-lg"
  loading="lazy"
/>
```

---

## Accessibility

### ARIA Labels

```typescript
<button
  aria-label="Tip {skill.name} creator"
  onClick={handleTip}
>
  Tip 💎
</button>
```

### Keyboard Navigation

```typescript
<div
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  {content}
</div>
```

---

## Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Fully supported |
| Firefox | 88+ | ✅ Fully supported |
| Safari | 14+ | ✅ Fully supported |
| Edge | 90+ | ✅ Fully supported |
| Mobile Safari | iOS 14+ | ✅ Fully supported |
| Chrome Mobile | 90+ | ✅ Fully supported |

---

## Testing Strategy

### Unit Tests

```typescript
// __tests__/components/SkillCard.test.tsx
import { render, screen } from '@testing-library/react';
import { SkillCard } from '@/components/SkillCard';

describe('SkillCard', () => {
  it('renders skill information', () => {
    const skill = mockSkill();
    render(<SkillCard skill={skill} direction="A" />);

    expect(screen.getByText(skill.name)).toBeInTheDocument();
    expect(screen.getByText(skill.description)).toBeInTheDocument();
  });

  it('shows security stats for Direction A', () => {
    const skill = mockSkill();
    render(<SkillCard skill={skill} direction="A" />);

    expect(screen.getByText(/Security Score/)).toBeInTheDocument();
  });
});
```

### E2E Tests

```typescript
// e2e/tipping.spec.ts
import { test, expect } from '@playwright/test';

test('user can tip a skill', async ({ page }) => {
  await page.goto('/skills/test-skill');
  await page.click('button:has-text("Tip")');
  await page.click('button:has-text("50")');
  await page.click('button:has-text("Confirm Tip")');
  await expect(page.locator('text=Tip successful')).toBeVisible();
});
```

---

## Deployment

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_DIRECTION=A  # 'A' for Moltiverse, 'B' for Blitz Pro
NEXT_PUBLIC_ASKL_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=41454
NEXT_PUBLIC_RPC_URL=https://testnet-rpc.monad.xyz
NEXT_PUBLIC_WC_PROJECT_ID=...
```

### Vercel Configuration

```json
// vercel.json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

---

**Document Status**: ✅ Aligned with UNIFIED_PLAN.md
**Last Updated**: February 8, 2026
**Next Review**: After frontend implementation (Feb 11)
