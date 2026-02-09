# MySkills - MVP Implementation Plan (7-Day Sprint)

**Last Updated**: February 8, 2026
**Status**: Aligned with UNIFIED_PLAN.md
**Timeline**: Feb 8-15, 2026 (Moltiverse Submission)

---

## Sprint Overview

**Goal**: Submit competitive Moltiverse hackathon entry by Feb 15
**Product**: MySkills - Agent Skill Marketplace
**Focus**: Agent-to-Agent coordination via MCP Server

---

## Day-by-Day Plan

### Day 1-2 (Feb 8-9): Foundation & MCP Server

**Priority**: CRITICAL

**Day 1 (Feb 8) - Planning** ✅ COMPLETED
- [x] Review all debate documents and create unified plan
- [ ] Set up project tracking system
- [ ] Identify and block development time for next 7 days
- [ ] Prepare development environment (testnet MON, wallet)
- [ ] Review Moltiverse submission requirements

**Day 2 (Feb 9) - MCP Server Core** 🎯 CRITICAL
- [ ] MCP Server: Integrate with deployed ASKLToken contract (4h)
  - [ ] Connect viem client to Monad testnet
  - [ ] Implement contract calls for list_skills, get_skill
  - [ ] Implement write operations: tip_creator, register_skill
  - [ ] Add error handling and transaction confirmation
- [ ] MCP Server: Add basic bounty tools (2h)
  - [ ] post_bounty (Direction A)
  - [ ] submit_audit (Direction A)
- [ ] Test MCP Server with Claude Code (1h)
- [ ] Document MCP Server installation (30min)

**Deliverable**: Working MCP Server with P0 tools

---

### Day 3-4 (Feb 10-11): Core Features

**Priority**: HIGH

**Day 3 (Feb 10) - Frontend Core** 🎯
- [ ] Complete P0 shared pages (4h)
  - [ ] Home page with adaptive hero (Direction A/B toggle)
  - [ ] Skills directory with filtering
  - [ ] Skill detail page with tipping
  - [ ] Create skill form
- [ ] Add Direction A specific UI (2h)
  - [ ] Bounties list page
  - [ ] Post bounty form
  - [ ] Submit audit interface
- [ ] Deploy frontend to Vercel (30min)

**Day 4 (Feb 11) - Integration & Polish** 🎯
- [ ] Frontend: Connect to MCP Server (2h)
  - [ ] Integrate with real contract calls
  - [ ] Add loading states
  - [ ] Add error handling
- [ ] End-to-end testing (2h)
  - [ ] Test skill registration flow
  - [ ] Test tipping flow
  - [ ] Test bounty creation flow
- [ ] Bug fixes and UI polish (2h)

**Deliverable**: Functional frontend with Direction A features

---

### Day 5 (Feb 12): Demo Video & Submission

**Priority**: CRITICAL

**Day 5 (Feb 12) - Demo Video** 🎥
- [ ] Record Moltiverse demo footage (2h)
  - [ ] Problem introduction (agent skill monetization)
  - [ ] Solution overview (MySkills marketplace)
  - [ ] MCP Server integration demo
  - [ ] Agent-to-agent bounty flow
  - [ ] Monad performance highlights
- [ ] Edit demo video (2h)
  - [ ] Add narration
  - [ ] Add subtitles
  - [ ] Add transitions
  - [ ] Export in 1080p
- [ ] Upload to YouTube (30min)

**Moltiverse Video Content (60-90s)**:
1. **Problem (10s)**: Agent skill creators can't earn across platforms
2. **Solution (15s)**: MySkills - cross-platform reward protocol
3. **Agent Demo (30s)**: Agent using skill → auto-tipping creator
4. **Monad Benefits (15s)**: 10K TPS, <1s confirmation, near-zero gas
5. **Call to Action (10s)**: GitHub + Demo URL

**Deliverable**: Moltiverse demo video (60-90s)

---

### Day 6-7 (Feb 13-14): Polish & Buffer

**Priority**: MEDIUM

**Day 6-7 (Feb 13-14)** 🔧
- [ ] Final testing (2h)
  - [ ] Test all flows on fresh wallet
  - [ ] Test MCP Server with different agents
  - [ ] Check for edge cases
- [ ] Documentation (2h)
  - [ ] Update README with quick start
  - [ ] Document MCP Server usage
  - [ ] Add architecture diagrams
- [ ] Buffer time (4h)
  - [ ] Handle unexpected issues
  - [ ] Additional polish
  - [ ] Rest before submission

**Deliverable**: Polished product ready for submission

---

### Day 7 (Feb 15): Submission Day

**Priority**: CRITICAL

**Moltiverse Submission Tasks** 📝
- [ ] Create Moltiverse.dev account (15min)
- [ ] Fill submission form (30min)
  - [ ] Project name: "MySkills - Agent Skill Marketplace"
  - [ ] Description emphasizing Agent Track
  - [ ] Demo video URL
  - [ ] GitHub repository
  - [ ] Live demo URL
  - [ ] MCP Server documentation
- [ ] Submit to Agent Track (15min)
- [ ] Confirm submission received (15min)
- [ ] Share on Moltiverse community (30min)

**Deliverable**: Successful Moltiverse submission by Feb 15 23:59 ET

---

## Technical Implementation Details

### MCP Server Implementation

**Package Structure**:
```
packages/mcp-server/
├── src/
│   ├── index.ts              # Main entry point
│   ├── tools/
│   │   ├── list-skills.ts    # P0: List all skills
│   │   ├── get-skill.ts      # P0: Get skill by ID
│   │   ├── tip-creator.ts    # P0: Send tip
│   │   ├── register-skill.ts # P0: Register skill
│   │   ├── post-bounty.ts    # P1: Post bounty (Direction A)
│   │   └── submit-audit.ts   # P1: Submit audit (Direction A)
│   ├── contract.ts           # ASKLToken contract integration
│   ├── cache.ts              # In-memory cache
│   └── types.ts              # TypeScript types
├── package.json
├── tsconfig.json
└── README.md
```

**Implementation Example**:
```typescript
// packages/mcp-server/src/tools/tip-creator.ts
import { ASKLToken } from '@/contract';
import { publicClient, walletClient } from '@/clients';

export const tipCreator = {
  name: 'tip_creator',
  description: 'Send a tip to a skill creator',
  parameters: {
    type: 'object',
    properties: {
      skillId: { type: 'string', description: 'Skill ID to tip' },
      amount: { type: 'number', description: 'Amount in ASKL' },
    },
    required: ['skillId', 'amount'],
  },
  handler: async ({ skillId, amount }: { skillId: string; amount: number }) => {
    try {
      // Check balance
      const balance = await publicClient.readContract({
        ...ASKLToken,
        functionName: 'balanceOf',
        args: [walletClient.account.address],
      });

      if (balance < amount) {
        throw new Error('Insufficient balance');
      }

      // Send tip
      const hash = await walletClient.writeContract({
        ...ASKLToken,
        functionName: 'tipSkill',
        args: [skillId, amount],
      });

      // Wait for confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      return {
        success: true,
        txHash: hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      throw new Error(`Tip failed: ${error.message}`);
    }
  },
};
```

---

### Frontend Implementation

**Tech Stack**:
- Next.js 16 (App Router)
- TypeScript 5+
- Tailwind CSS 4
- wagmi 3 + viem 2 + RainbowKit 2
- TanStack Query 5

**Key Components**:

**1. Wallet Connection**:
```typescript
// components/WalletConnection.tsx
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export function WalletConnection() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <div>
      {isConnected ? (
        <button onClick={() => disconnect()}>
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </button>
      ) : (
        <button onClick={() => connect({ connector: injected() })}>
          Connect Wallet
        </button>
      )}
    </div>
  );
}
```

**2. Tipping Interface**:
```typescript
// components/TipModal.tsx
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ASKL_TOKEN_ABI, ASKL_TOKEN_ADDRESS } from '@/contracts';

export function TipModal({ skillId, onClose }: TipModalProps) {
  const [amount, setAmount] = useState(50);
  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
  });

  const handleTip = () => {
    writeContract({
      address: ASKL_TOKEN_ADDRESS,
      abi: ASKL_TOKEN_ABI,
      functionName: 'tipSkill',
      args: [skillId, parseUnits(amount.toString(), 18)],
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm">
      <div className="glass-card p-6">
        <h2>Tip Skill Creator</h2>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <button
          onClick={handleTip}
          disabled={isPending || isConfirming}
        >
          {isPending || isConfirming ? 'Confirming...' : 'Confirm Tip'}
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
```

**3. Skills Directory**:
```typescript
// app/skills/page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { SkillCard } from '@/components/SkillCard';

export default function SkillsPage() {
  const { data: skills, isLoading } = useQuery({
    queryKey: ['skills'],
    queryFn: async () => {
      const response = await fetch('/api/skills');
      return response.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {skills?.map((skill) => (
        <SkillCard key={skill.id} skill={skill} />
      ))}
    </div>
  );
}
```

---

### Smart Contract Extensions

**Direction A (Moltiverse)** - Add ~50 lines to ASKLToken.sol:

```solidity
// Add to existing ASKLToken.sol contract

struct Bounty {
    uint256 id;
    bytes32 skillId;
    uint256 reward;
    string criteria;
    address poster;
    bool isActive;
    address winner;
}

uint256 public bountyCounter;
mapping(uint256 => Bounty) public bounties;

function postBounty(
    bytes32 skillId,
    uint256 reward,
    string calldata criteria
) external payable returns (uint256 bountyId) {
    require(msg.value >= reward, "Insufficient reward");
    bountyCounter++;
    bounties[bountyCounter] = Bounty({
        id: bountyCounter,
        skillId: skillId,
        reward: reward,
        criteria: criteria,
        poster: msg.sender,
        isActive: true,
        winner: address(0)
    });
    emit BountyPosted(bountyCounter, skillId, reward, msg.sender);
    return bountyCounter;
}

function submitAudit(
    uint256 bountyId,
    string calldata report
) external {
    Bounty storage bounty = bounties[bountyId];
    require(bounty.isActive, "Bounty not active");
    // Simple approval for MVP
    bounty.winner = msg.sender;
    bounty.isActive = false;
    _transfer(address(this), bounty.winner, bounty.reward);
    emit BountyCompleted(bountyId, bounty.winner);
}
```

---

## Success Criteria

### Moltiverse Success Criteria (Feb 15)

**Must-Have** (Critical Path):
- [ ] MCP Server working with Claude Code
  - [ ] list_skills returns real data from contract
  - [ ] tip_creator executes transaction successfully
  - [ ] register_skill creates new skill entry
- [ ] Smart contracts deployed on Monad testnet
  - [ ] ASKLToken contract accessible
  - [ ] Bounty functions working
  - [ ] Test transactions successful
- [ ] Frontend functional
  - [ ] All P0 pages working
  - [ ] Wallet connection successful
  - [ ] Real transactions execute
- [ ] Demo video (60-90s)
  - [ ] Clear problem statement
  - [ ] Working demo of agent flows
  - [ ] Monad benefits highlighted
- [ ] Submission complete
  - [ ] Form filled correctly
  - [ ] All required links provided
  - [ ] Submitted before deadline

**Nice-to-Have** (If Time Permits):
- [ ] OpenClaw Skill integration
- [ ] Advanced MCP features (filters, sorting)
- [ ] Enhanced UI/UX polish
- [ ] Comprehensive documentation

**Success Indicators**:
- Demo video shows end-to-end agent flow
- MCP Server integrates with real contracts
- Transactions complete in <5s on Monad
- Submission emphasizes Agent Track criteria

---

## Risk Mitigation

### If MCP Server Fails (Feb 9)
- [ ] Fall back to mock data for demo
- [ ] Submit with detailed MCP design document
- [ ] Emphasize CLI and frontend functionality

### If Demo Video Quality Poor (Feb 10)
- [ ] Use screen recording with clear narration
- [ ] Create animated slides with voiceover
- [ ] Focus on clarity over production value

### If Frontend Issues Persist (Feb 11)
- [ ] Document known issues
- [ ] Provide alternative demo method
- [ ] Emphasize backend/MCP functionality

### If Time Runs Short (Any Day)
- [ ] Prioritize Moltiverse submission first
- [ ] Cut P2 features immediately
- [ ] Focus on core flows only
- [ ] Accept "good enough" over "perfect"

---

## Testing Checklist

### MCP Server Testing
- [ ] list_skills returns all registered skills
- [ ] get_skill returns correct skill by ID
- [ ] tip_creator sends 98/2 split correctly
- [ ] register_skill creates new skill entry
- [ ] post_bounty creates bounty with correct reward
- [ ] submit_audit completes bounty and distributes payment

### Frontend Testing
- [ ] Wallet connection works (MetaMask + WalletConnect)
- [ ] Auto-prompt to switch to Monad testnet
- [ ] Balance display updates correctly
- [ ] Tipping flow completes successfully
- [ ] Skill registration flow works
- [ ] Bounty posting flow works
- [ ] All pages load without errors

### End-to-End Testing
- [ ] New user can claim faucet tokens
- [ ] User can browse and discover skills
- [ ] User can tip skill creators
- [ ] Creator can register new skill
- [ ] User can post bounty for custom skill
- [ ] Agent can accept and complete bounty

---

## Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| MCP Server response time | <1s | ⏳ To test |
| Frontend page load | <2s | ⏳ To test |
| Transaction confirmation | <5s on Monad | ⏳ To test |
| Gas cost per tip | <$0.01 | ⏳ To test |
| Lighthouse score | >90 | ⏳ To test |

---

## Team Responsibilities

### Frontend Developer
- Build P0 pages (Home, Skills, Detail, Create)
- Implement tipping interface
- Connect to MCP Server
- Handle wallet connection
- Deploy to Vercel

### Smart Contract Developer
- Extend ASKLToken with bounty functions
- Test on Monad testnet
- Verify 98/2 split works
- Document contract interface

### MCP Server Developer
- Implement P0 tools
- Add Direction A tools
- Test with Claude Code
- Write documentation

### All Team Members
- Test end-to-end flows
- Report bugs promptly
- Help with demo video
- Assist with submission

---

## Daily Standup Questions

1. **What did you complete yesterday?**
2. **What will you work on today?**
3. **Are there any blockers?**
4. **Are we on track for Feb 15 submission?**

---

## Communication Channels

- **Discord**: #myskills-dev for daily sync
- **GitHub**: Issues for bug tracking
- **Notion**: Shared planning doc
- **Zoom**: Daily standup at 9AM PT

---

## Post-Submission Plan (Feb 16-28)

After Moltiverse submission, prepare for Blitz Pro:

**Feb 16-20**: Direction B Features
- Implement multi-agent coordination
- Add task scheduling UI
- Enhance payment infrastructure

**Feb 21-27**: Blitz Pro Polish
- Create longer demo video (120-150s)
- Add developer documentation
- Performance optimization

**Feb 28**: Blitz Pro Submission

---

**Document Status**: ✅ Ready for Execution
**Sprint Start**: February 8, 2026
**Submission Deadline**: February 15, 2026 (Moltiverse)
**Next Review**: Daily standup (Feb 9-15)
