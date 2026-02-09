# MySkills - System Architecture

**Last Updated**: February 8, 2026
**Status**: Aligned with UNIFIED_PLAN.md
**Focus**: 7-Day Sprint for Moltiverse Hackathon

---

## Overview

MySkills is a **unified Agent Skill Marketplace** with three core modules:
1. **Skill Marketplace** - Browse and purchase agent skills
2. **Bounty System** - Custom skill development (Direction A - Moltiverse)
3. **Dispute Resolution** - Trust in agent transactions (Direction A - Moltiverse)

For **Blitz Pro (Feb 28)**, we emphasize payment infrastructure with additional features.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                           │
│  ┌──────────────────────────────────────────────────────────┐  │
││              Next.js 16 (App Router) + TypeScript           │  │
││  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │  │
││  │   Home   │  │ Skills   │  │Bounties/ │  │ Leader   │   │  │
││  │ (Adaptive│  │Directory │  │  Tasks   │  │  Board   │   │  │
││  │  A/B)    │  │          │  │          │  │          │   │  │
││  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │  │
│└──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
││           Web3 Integration (wagmi 3 + viem 2)               │  │
││                    RainbowKit 2                             │  │
│└──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Integration Layer                          │
│  ┌──────────────────────────────────────────────────────────┐  │
││                   Next.js API Routes                        │  │
││  - Simple proxy for MCP Server                              │  │
││  - Faucet rate limiting                                     │  │
││  - Basic caching (optional)                                 │  │
│└──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
││              MCP Server (@myskills/mcp-server)              │  │
││  - list_skills, get_skill                                   │  │
││  - tip_creator, register_skill                              │  │
││  - post_bounty, submit_audit (Direction A)                  │  │
││  - submit_task, assign_agents (Direction B)                │  │
││  - In-memory cache (1-minute TTL)                          │  │
│└──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Blockchain Layer                             │
│  ┌──────────────────────────────────────────────────────────┐  │
││           ASKLToken.sol (Monad Testnet)                     │  │
││  - ERC20 token (98/2 split)                                 │  │
││  - Skill registration (skillId => creator)                  │  │
││  - Tipping with automatic distribution                      │  │
││  - Bounty posting (Direction A)                             │  │
││  - Task submission (Direction B)                            │  │
│└──────────────────────────────────────────────────────────┘  │
│                                                              │
│  Monad Testnet: 10K TPS, <1s confirmation, <$0.01 gas       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Storage Strategy

### MVP Approach (Aligned with UNIFIED_PLAN.md)

**Decision**: On-chain + MCP in-memory cache

**Rationale**:
- Monad's 10K TPS makes on-chain queries viable for MVP
- Eliminates 2-3 days of database setup work
- MCP Server can cache frequently accessed data in memory
- Sufficient for demo purposes (100s of skills, not millions)

```typescript
// Simple in-memory cache (sufficient for MVP)
class SkillCache {
  private cache = new Map<string, Skill>();
  private lastUpdate = 0;
  private TTL = 60000; // 1 minute

  async get(skillId: string): Promise<Skill | null> {
    if (Date.now() - this.lastUpdate > this.TTL) {
      await this.refreshFromChain();
    }
    return this.cache.get(skillId) || null;
  }

  private async refreshFromChain(): Promise<void> {
    // Fetch from ASKLToken contract
    const skills = await contract.getRegisteredSkills();
    skills.forEach(skill => this.cache.set(skill.id, skill));
    this.lastUpdate = Date.now();
  }
}
```

**Post-MVP** (if time permits Feb 20+):
- Add PostgreSQL for Blitz Pro if needed
- Add Redis for enhanced caching
- Implement proper indexing for larger datasets

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16 | React framework (App Router) |
| **TypeScript** | 5+ | Type safety |
| **Tailwind CSS** | 4 | Styling |
| **wagmi** | 3 | Ethereum React Hooks |
| **viem** | 2 | Ethereum client library |
| **RainbowKit** | 2 | Wallet connection UI |
| **TanStack Query** | 5 | Data caching and state |

### Backend/Integration

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js API Routes** | 16 | Simple serverless API |
| **MCP Server** | - | Agent integration layer |
| **Node.js** | 20+ | MCP runtime |

### Blockchain

| Technology | Version | Purpose |
|------------|---------|---------|
| **Solidity** | 0.8.20+ | Smart contracts |
| **Hardhat** | 2+ | Development framework |
| **OpenZeppelin** | 5+ | Security libraries |
| **Monad Testnet** | latest | Deployment target |

---

## Smart Contract Architecture

### Current Contract (Deployed)

**ASKLToken.sol** (~280 lines):
- ERC20 token implementation
- 98/2 tipping split (creator/platform)
- Skill registration mapping
- Earnings tracking per creator

### Planned Extensions

**Direction A (Moltiverse)** - Add ~50 lines:
```solidity
function postBounty(skillId, reward, criteria) external payable;
function submitAudit(bountyId, report) external;
function verifyAudit(bountyId, approved, reason) external;
```

**Direction B (Blitz Pro)** - Add ~80 lines:
```solidity
function submitTask(requirement, budget, goal) external payable returns (taskId);
function assignAgents(taskId, agents, payments) external;
function completeTask(taskId) external;
```

**Total Complexity**: ~410 lines (manageable, focused on MVP)

---

## MCP Server Architecture

### Package Structure

```yaml
Package: @myskills/mcp-server
Runtime: Node.js 20+
Priority: CRITICAL for both hackathons

Tools (Priority Order):
P0 (Must have by Feb 10):
  - list_skills - Get all skills from contract
  - get_skill - Get skill by ID
  - tip_creator - Send tip to skill creator
  - register_skill - Register new skill on chain

P1 (Add by Feb 12 for Moltiverse):
  - post_bounty - Post bounty for custom skill
  - submit_audit - Submit audit report

P2 (Add by Feb 18 for Blitz Pro):
  - submit_task - Submit task for multi-agent coordination
  - assign_agents - Assign agents to task
```

### Implementation Priority

```typescript
// MCP Server Tools - Implementation Order
const MCP_TOOLS = [
  // P0: Core functionality (Feb 9)
  'list_skills',
  'get_skill',
  'tip_creator',
  'register_skill',

  // P1: Direction A - Moltiverse (Feb 10)
  'post_bounty',
  'submit_audit',

  // P2: Direction B - Blitz Pro (Feb 16)
  'submit_task',
  'assign_agents',
];
```

---

## Frontend Architecture

### Adaptive UI System

```typescript
// Direction-aware component rendering
interface SkillCardProps {
  skill: Skill;
  direction: 'A' | 'B'; // A=Moltiverse, B=Blitz Pro
}

export function SkillCard({ skill, direction }: SkillCardProps) {
  return (
    <Card>
      <SkillHeader skill={skill} />
      {direction === 'A' && <SecurityStats skill={skill} />}
      {direction === 'B' && <PerformanceStats skill={skill} />}
      <TipButton skill={skill} />
    </Card>
  );
}
```

### Page Structure

```
app/
├── page.tsx                    // Adaptive landing (A or B)
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

## Data Flow

### 1. Skill Registration Flow

```
Creator                    Frontend                MCP Server              Contract
  │                          │                         │                      │
  ├── 1. Fill form ────────►│                         │                      │
  │                          │                         │                      │
  │                          ├── 2. Generate skillId ─►│                      │
  │                          │   keccak256(name+ver)   │                      │
  │                          │                         │                      │
  │                          ├── 3. Call contract ──────────────────────────►│
  │                          │                         │                      │
  │                          │                         │                      ├── 4. Store mapping
  │                          │                         │                      │ skillId=>creator
  │                          │                         │                      │
  │                          │◄──────────────────────── 5. Tx confirmed ──────┤
  │                          │                         │                      │
  │                          ├── 6. Cache in MCP ─────►│                      │
  │                          │                         │                      │
  │◄─ 7. Show success ───────┤                         │                      │
```

### 2. Tipping Flow

```
User                       Frontend                Contract
 │                           │                        │
 ├── 1. Click tip ────────►│                        │
 │                           │                        │
 │                           ├── 2. Check balance ───►│
 │                           │                        │
 │                           │◄── 3. Return balance ──┤
 │                           │                        │
 │◄─ 4. Show modal ─────────┤                        │
 │   [10] [50] [100]        │                        │
 │                           │                        │
 │◄─ 5. Select amount ───────┤                        │
 │                           │                        │
 │◄─ 6. Confirm ─────────────┤                        │
 │                           │                        │
 │                           ├── 7. Sign tx ─────────►│
 │                           │                        │
 │                           │                        ├── 8. Execute split
 │                           │                        │    - 98% creator
 │                           │                        │    - 2% burn
 │                           │                        │
 │                           │◄── 9. Tx confirmed ────┤
 │                           │                        │
 │◄─ 10. Show success ───────┤                        │
```

---

## Security Considerations

### Frontend Security
- Wallet connection: Monad testnet only
- Transaction signing: All write operations require user confirmation
- Input validation: All user inputs validated and sanitized
- Network check: Auto-prompt to switch to correct chain (41454)

### Smart Contract Security
- OpenZeppelin audited contracts (ERC20, Ownable, ReentrancyGuard)
- 98/2 split logic prevents value extraction attacks
- Skill registration prevents overwrites (creator check)
- Amount validation (no zero tips, no overflow)

### MCP Server Security
- Rate limiting on faucet endpoints
- Input validation on all MCP tools
- Error handling without exposing sensitive data
- Cache invalidation after 1 minute

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Users                                 │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Vercel (CDN)                              │
│           Frontend static + Serverless functions             │
│                                                               │
│  - main: myskills.monad.xyz                                 │
│  - moltiverse: moltiverse.myskills.monad.xyz                │
│  - blitz: blitz.myskills.monad.xyz                          │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                 Monad Testnet RPC                            │
│                  Smart Contracts                             │
│                                                               │
│  ASKLToken.sol: 0x... (deployed)                            │
│  - 98/2 tipping                                              │
│  - Skill registry                                            │
│  - Bounty system (extending)                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## MVP Scope (7-Day Sprint)

### P0 - Must Have (Feb 8-11)
- [x] ASKLToken contract deployed on Monad testnet
- [ ] MCP Server with P0 tools (list_skills, get_skill, tip_creator, register_skill)
- [ ] Frontend P0 pages (Home, Skills, Skill Detail, Create Skill)
- [ ] Wallet connection (MetaMask + WalletConnect)
- [ ] Tipping functionality (full flow)

### P1 - Direction A (Feb 10-12)
- [ ] MCP Server P1 tools (post_bounty, submit_audit)
- [ ] Bounties list page
- [ ] Post bounty form
- [ ] Submit audit interface

### P2 - Direction B (Feb 16-20)
- [ ] MCP Server P2 tools (submit_task, assign_agents)
- [ ] Task scheduling interface
- [ ] Multi-agent coordination demo

### NOT Building (Scope Reductions)
- ❌ CLI tool (deferred post-hackathon, saves 8-12 hours)
- ❌ PostgreSQL/Redis (use on-chain + MCP cache, saves 2-3 days)
- ❌ npm/GitHub API integration (manual entry for MVP, saves 1 day)
- ❌ Complex dispute resolution (simple approval for MVP, saves 3-4 days)
- ❌ On-chain reputation (off-chain calculation for MVP, saves 2 days)
- ❌ x402 integration (optional, only if time permits Feb 20+)

---

## Performance Considerations

### Monad Benefits for MySkills

| Feature | Benefit | Impact |
|---------|---------|--------|
| **10K TPS** | High transaction throughput | Support 1000s of concurrent tips |
| **<1s confirmation** | Fast finality | Near-instant payment feedback |
| **<$0.01 gas** | Low transaction cost | Micro-tipping economically viable |
| **EVM compatible** | Easy integration | Use existing Web3 tooling |

### Optimizations

- **Batch operations**: Register multiple skills in one transaction
- **Cache strategy**: MCP Server caches for 1 minute
- **Lazy loading**: Skills loaded on-demand, not upfront
- **Pagination**: Skills list paginated (20 per page)

---

## Monitoring & Analytics

### MVP Monitoring (Simple)

- Contract event logs for all transactions
- Frontend error tracking (console + user feedback)
- MCP Server logging (tool calls, responses)

### Post-MVP (Enhanced)

- Analytics dashboard (DAU, transaction volume)
- Skill performance tracking
- Creator earnings reports
- Gas cost optimization analysis

---

## Next Steps

1. **Day 1-2 (Feb 8-9)**: MCP Server Core
   - Integrate with deployed ASKLToken contract
   - Implement P0 tools
   - Test with Claude Code

2. **Day 3-4 (Feb 10-11)**: Frontend Core
   - Complete P0 shared pages
   - Add Direction A specific UI
   - Deploy to Vercel

3. **Day 5 (Feb 12)**: Demo Video
   - Record Moltiverse demo footage
   - Edit and upload to YouTube

4. **Day 6-7 (Feb 13-14)**: Polish & Buffer
   - Final testing
   - Documentation
   - Handle unexpected issues

---

**Document Status**: ✅ Aligned with UNIFIED_PLAN.md
**Last Updated**: February 8, 2026
**Next Review**: Daily standup (Feb 9-15)
