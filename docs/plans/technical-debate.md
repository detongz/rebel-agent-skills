# Technical Architecture Debate - MySkills Hackathon Submissions

**Date**: February 8, 2026
**Role**: Technical Architecture Team
**Context**: Preparing for Moltiverse (Feb 15) and Blitz Pro (Feb 28) hackathons

---

## Executive Summary

After analyzing existing documentation, code, and submission requirements, this document identifies critical technical contradictions and proposes a unified architecture that can serve BOTH hackathon submissions while minimizing code duplication and implementation time.

**Key Finding**: The current codebase shows THREE different architectural approaches that need reconciliation:
1. Original "Agent Reward Hub" (tipping protocol)
2. Direction A (Security audit + bounties)
3. Direction B (AaaS scheduling platform)

---

## Part 1: Current Technical Contradictions

### 1. Data Storage Conflict

#### Contradiction
- **Old docs (mvp-implementation.md)**: PostgreSQL + Redis + IPFS for off-chain data
- **New docs (direction-a/b-implementation.md)**: Mostly on-chain smart contracts
- **Current state**: MCP Server uses mock data, no database implemented

#### Analysis
| Approach | Pros | Cons | Time to Implement |
|----------|------|------|-------------------|
| **PostgreSQL + Redis** | Rich queries, fast lookups, scalable | Requires infrastructure, adds complexity | 2-3 days |
| **On-chain only** | Truly decentralized, no infra needed | Limited query capabilities, expensive storage | 0 days (already done) |
| **Hybrid (on-chain + MCP cache)** | Best of both worlds | More complex architecture | 1 day |

#### Recommendation for MVP
**Use on-chain + MCP memory cache for both hackathons**

**Rationale**:
- Monad's 10K TPS makes on-chain queries viable for MVP
- MCP Server can cache frequently accessed data in memory
- Eliminates database setup time and infrastructure complexity
- Sufficient for demo purposes (100s of skills, not millions)

**Implementation**:
```typescript
// Simple in-memory cache in MCP Server
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
}
```

**Post-MVP**: Add PostgreSQL for Blitz Pro if time permits (Feb 20+)

---

### 2. MCP vs CLI Conflict

#### Contradiction
- **README.md**: Emphasizes `npx myskills` CLI tool
- **New docs**: Focus on MCP Server for agent integration
- **Question**: Should we prioritize CLI or MCP?

#### Current State
| Component | Status | Usability |
|-----------|--------|-----------|
| MCP Server | Implemented with mock data | 70% complete, needs contract integration |
| CLI tool | package.json exists | **NOT IMPLEMENTED** - no source code found |

#### Time Analysis
| Task | Estimate | Deadline Impact |
|------|----------|-----------------|
| Complete MCP Server (contract integration) | 4-6 hours | **Critical for Moltiverse (Feb 15)** |
| Build CLI tool from scratch | 8-12 hours | Can be skipped for MVP |

#### Recommendation
**Prioritize MCP Server for both hackathons. Defer CLI tool.**

**Rationale**:
1. **Moltiverse (Agent Track)**: MCP is essential - shows agent-to-agent communication
2. **Blitz Pro (Agent Payments)**: MCP demonstrates agent-native payments
3. **CLI tool**: Nice-to-have for developers, but doesn't impress hackathon judges as much
4. **Time savings**: 8-12 hours can be used for demo video and polish

**Decision Matrix**:
```
                Moltiverse (Feb 15)    Blitz Pro (Feb 28)
MCP Server      ✅ CRITICAL             ✅ CRITICAL
CLI Tool        ❌ Skip                 ⚠️ Optional (Feb 25+)
```

**Implementation Priority**:
1. Week 1 (Feb 8-12): Complete MCP Server with real contract calls
2. Week 3 (Feb 25-28): Add CLI tool ONLY if MCP Server is polished and demo is ready

---

### 3. Smart Contract Scope

#### Contradiction
- **Simple**: ASKLToken.sol (280 lines, tipping + registration)
- **Complex**: SkillBounty.sol + DisputeResolution.sol + AgentScheduler.sol (not implemented)
- **Question**: What's minimum viable for each direction?

#### Current Contract Analysis
**ASKLToken.sol Features**:
```solidity
✅ IMPLEMENTED:
- ERC20 token with 98/2 tipping split
- Skill registration (on-chain)
- Batch operations
- Creator earnings tracking
- Platform stats

❌ NOT IMPLEMENTED:
- Bounty system (Direction A)
- Agent scheduling (Direction B)
- Dispute resolution
- x402 payment integration
```

#### Recommendation
**Use ASKLToken.sol as the foundation for BOTH submissions. Extend minimally.**

**For Moltiverse (Direction A - Security Audits)**:
```solidity
// Add to ASKLToken.sol (50 lines)
function postBounty(
    bytes32 skillId,
    uint256 reward,
    string calldata acceptanceCriteria
) external payable {
    // Simple bounty storage
    bounties[nextBountyId] = Bounty({
        skillId: skillId,
        reward: reward,
        criteria: acceptanceCriteria,
        status: BountyStatus.Open
    });
    nextBountyId++;
}

function submitAudit(uint256 bountyId, string calldata report) external {
    // Direct payout, no complex dispute resolution
    Bounty storage bounty = bounties[bountyId];
    require(bounty.status == BountyStatus.Open);

    // Simple auto-approval for MVP
    bounty.status = BountyStatus.Completed;
    _tipCreator(bounty.skillId, bounty.reward);
}
```

**For Blitz Pro (Direction B - AaaS Scheduling)**:
```solidity
// Add to ASKLToken.sol (80 lines)
struct Task {
    bytes32 taskId;
    address user;
    string requirement;
    uint256 budget;
    address[] assignedAgents;
    TaskStatus status;
}

function submitTask(string calldata requirement, uint256 budget)
    external payable
    returns (bytes32) {
    // Create task, return ID for "agent scheduler" to assign
}

function assignAgents(bytes32 taskId, address[] calldata agents)
    external {
    // Called by "scheduler agent" (can be automated off-chain for MVP)
}

function completeTask(bytes32 taskId) external {
    // Auto-distribute payment to assigned agents
}
```

**Implementation Strategy**:
1. **Week 1**: Deploy ASKLToken.sol to Monad testnet (already done)
2. **Week 1**: Add simple bounty functions (50 lines) for Direction A
3. **Week 2**: Add task management functions (80 lines) for Direction B
4. **Total contract complexity**: ~400 lines (manageable)

**What NOT to implement** (save for post-hackathon):
- Complex dispute resolution system
- On-chain agent reputation scoring
- Automated agent matching algorithms (do off-chain for MVP)

---

### 4. Frontend Scope

#### Contradiction
- **Old docs**: Basic pages (home, skills list, tip modal, create skill)
- **New docs**: Complex marketplaces with multiple flows
- **Question**: What pages are absolutely required?

#### Current Frontend State
**Existing** (from frontend/package.json):
- Next.js 16 + TypeScript
- RainbowKit (wallet connection)
- Tailwind CSS + shadcn/ui
- wagmi + viem (Web3)

**Pages Defined** (frontend-design.md):
```
✅ BASIC PAGES (Implemented?):
- / (Home with hero section)
- /skills (Directory with filtering)
- /skill/[id] (Detail page + tipping)
- /create-skill (Registration form)
- /my-tips (User history)

❌ ADVANCED PAGES (Not implemented):
- /bounties (Direction A)
- /verification (Direction A)
- /tasks (Direction B)
- /leaderboard (Both directions)
```

#### Recommendation
**Unified frontend that adapts to both directions via feature flags.**

**Required Pages for MVP** (Shared between directions):

```typescript
// app/page.tsx - Adaptive homepage
{direction === 'A' ? (
  <SecurityAuditLanding />
) : (
  <AgentSchedulingLanding />
)}

// app/skills/page.tsx - Shared skills directory
// app/skills/[id]/page.tsx - Detail page with conditional features

// app/activities/page.tsx - Unified "activities" page
{direction === 'A' ? <BountiesList /> : <TasksList />}
```

**Page Priority Matrix**:

| Page | Moltiverse (A) | Blitz Pro (B) | Priority |
|------|----------------|---------------|----------|
| Home (Hero + value prop) | ✅ Required | ✅ Required | P0 |
| Skills Directory | ✅ Required | ✅ Required | P0 |
| Skill Detail + Tip | ✅ Required | ✅ Required | P0 |
| Create Skill | ✅ Required | ✅ Required | P0 |
| Leaderboard | ✅ Required | ✅ Required | P1 |
| Bounties (A) / Tasks (B) | ✅ Required | ✅ Required | P0 |
| Verification (A) | ⚠️ Optional | ❌ N/A | P2 |
| Agent Registration (B) | ❌ N/A | ⚠️ Optional | P2 |

**Implementation Strategy**:
1. **Week 1**: Build P0 pages (shared between A and B)
2. **Week 2**: Add P1 Leaderboard (shared data, different sorting)
3. **Week 3**: Add P2 pages only if core flows are solid

**Component Reuse Strategy**:
```typescript
// components/shared/SkillCard.tsx
export function SkillCard({ skill, direction }: Props) {
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

---

## Part 2: Proposed Unified Architecture

### Core Philosophy
**"On-First Protocol, Off-First Intelligence"**

- **On-chain**: Minimal but complete - tipping, registration, bounty storage
- **Off-chain**: Complex logic - agent matching, verification, scoring
- **MCP Server**: Bridge between agents and blockchain

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface Layer                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  Next.js   │  │  MCP Tools  │  │ CLI (future)│            │
│  │  Frontend   │  │ (for Agents)│  │             │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Business Logic Layer                       │
│  ┌────────────────────────────────────────────────────────┐    │
│  │            Unified Protocol Interface                  │    │
│  │  - Skills Registry (shared)                           │    │
│  │  - Tipping Protocol (shared)                         │    │
│  │  - Direction A: Bounty + Verification                │    │
│  │  - Direction B: Task + Scheduling                    │    │
│  └────────────────────────────────────────────────────────┘    │
│  ┌──────────────┐  ┌─────────���────┐  ┌──────────────┐         │
│  │  Agent A:   │  │  Agent B:    │  │  Agent C:    │         │
│  │  Security   │  │  Scheduler   │  │  Verifier    │         │
│  │  Auditor    │  │  Manager     │  │  Validator   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Blockchain Layer                           │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              ASKLToken.sol (Monad Testnet)             │    │
│  │  - Core: ERC20 + 98/2 tipping + registration          │    │
│  │  - Extension A: Bounty management (~50 lines)         │    │
│  │  - Extension B: Task management (~80 lines)           │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow Examples

#### Direction A (Security Audit):
```
User → Frontend → MCP Server → Smart Contract
              ↓         ↓
           Bounty → Security Agent → Audit Report
                           ↓
                    Verifier Agent → Contract → Payout
```

#### Direction B (Agent Scheduling):
```
User → Frontend → MCP Server → Smart Contract (Task)
                           ↓
                    Scheduler Agent → Contract (Assign)
                           ↓
                    Worker Agents → Contract (Complete)
                           ↓
                    Contract → Auto-distribute Payment
```

---

## Part 3: Exact Tech Stack for MVP

### Smart Contracts
```yaml
Language: Solidity ^0.8.20
Framework: Hardhat (already configured)
Chain: Monad Testnet (Chain ID: 41454)
Contracts:
  - ASKLToken.sol (280 lines, existing)
  - + BountyExtension.sol (50 lines, new)
  - + TaskExtension.sol (80 lines, new)
Total: ~410 lines
```

### MCP Server
```yaml
Package: @myskills/mcp-server
Runtime: Node.js 20+
Dependencies:
  - @modelcontextprotocol/sdk (installed)
  - viem (installed)
  - zod (installed)
Tools:
  - list_skills (existing, needs contract integration)
  - get_skill (existing, needs contract integration)
  - tip_creator (existing, needs contract integration)
  - register_skill (existing, needs contract integration)
  - post_bounty (new, Direction A)
  - submit_audit (new, Direction A)
  - submit_task (new, Direction B)
  - assign_agents (new, Direction B)
```

### Frontend
```yaml
Framework: Next.js 16 (App Router)
Language: TypeScript
Styling: Tailwind CSS 4
Web3: wagmi 3 + viem 2 + RainbowKit 2
State: TanStack Query 5
Hosting: Vercel
Pages:
  - / (Adaptive landing: A or B)
  - /skills (Shared directory)
  - /skills/[id] (Shared detail)
  - /create-skill (Shared form)
  - /activities (Bounties for A, Tasks for B)
  - /leaderboard (Shared, different sorting)
```

### Data Storage
```yaml
Primary: On-chain (Monad Testnet)
Cache: In-memory (MCP Server)
Fallback: Mock data (development only)
Post-MVP: PostgreSQL + Redis (optional, Week 3)
```

### Development Tools
```yaml
Git: Branch strategy (see below)
CI: GitHub Actions (lint, test)
Testing: Playwright (E2E)
Deployment:
  - Contracts: Hardhat deploy script
  - Frontend: Vercel (auto-deploy on push)
  - MCP: npm package (manual publish)
```

---

## Part 4: Implementation Timeline

### Week 1: Moltiverse Focus (Feb 8-15)

**Day 1-2 (Feb 8-9)**:
- ✅ MCP Server: Integrate with deployed ASKLToken contract
- ✅ MCP Server: Add bounty tools (post_bounty, submit_audit)
- ✅ Smart Contract: Add BountyExtension (50 lines)

**Day 3-4 (Feb 10-11)**:
- ✅ Frontend: Complete P0 pages (Home, Skills, Detail, Create)
- ✅ Frontend: Add Direction A-specific UI (bounties)
- ✅ Frontend: Deploy to Vercel

**Day 5 (Feb 12)**:
- ✅ Demo: Record Direction A demo video (60-90s)
- ✅ Docs: Update README with MCP Server instructions

**Day 6-7 (Feb 13-14)**:
- ✅ Testing: End-to-end flow testing
- ✅ Polish: Bug fixes, UI improvements
- ✅ Buffer: Handle unexpected issues

**Feb 15**: Submit to Moltiverse

### Week 2: Blitz Pro Focus (Feb 16-22)

**Day 8-10 (Feb 16-18)**:
- ✅ Smart Contract: Add TaskExtension (80 lines)
- ✅ MCP Server: Add task tools (submit_task, assign_agents)
- ✅ Frontend: Add Direction B UI (tasks, agent registration)

**Day 11-12 (Feb 19-20)**:
- ✅ Feature: Multi-agent coordination demo
- ✅ Feature: Enhanced leaderboard with task metrics

**Day 13-14 (Feb 21-22)**:
- ✅ Demo: Record Direction B demo video (120-150s)
- ✅ Polish: Advanced features, optimization

### Week 3: Final Polish (Feb 23-28)

**Day 15-17 (Feb 23-25)**:
- ✅ Testing: Comprehensive testing of both directions
- ✅ Docs: API documentation, integration guides
- ✅ Optional: Add CLI tool if time permits

**Feb 26-27**: Prepare Blitz Pro submission
**Feb 28**: Submit to Blitz Pro

---

## Part 5: Code Sharing Strategy

### Shared Code (Both Directions)
```typescript
// packages/shared/
├── contracts/
│   └── ASKLToken.sol (core + extensions)
├── types/
│   └── skill.ts (unified Skill interface)
├── utils/
│   ├── blockchain.ts (viem clients)
│   ├── validation.ts (zod schemas)
│   └── formatting.ts (display helpers)
└── constants/
    └── networks.ts (Monad config)
```

### Direction-Specific Code
```typescript
// apps/direction-a/
├── frontend/
│   └── app/(A)/
│       ├── page.tsx (security landing)
│       └── bounties/page.tsx
└── mcp-tools/
    └── bounty-tools.ts

// apps/direction-b/
├── frontend/
│   └── app/(B)/
│       ├── page.tsx (scheduling landing)
│       └── tasks/page.tsx
└── mcp-tools/
    └── task-tools.ts
```

### Monorepo Structure
```
agent-reward-hub/
├── packages/
│   ├── shared/ (contracts, types, utils)
│   ├── mcp-server/ (unified MCP with direction flag)
│   └── frontend/ (unified Next.js app)
├── apps/
│   ├── direction-a/ (Moltiverse submission)
│   └── direction-b/ (Blitz Pro submission)
└── docs/
    ├── moltiverse/ (Direction A specific)
    └── blitz-pro/ (Direction B specific)
```

---

## Part 6: Risk Mitigation

### Technical Risks

| Risk | Impact | Mitigation | Contingency |
|------|--------|------------|-------------|
| MCP Server contract integration fails | HIGH | Use testnet first, thorough testing | Fall back to mock data for demo |
| Smart contract gas costs too high | MEDIUM | Optimize with batch operations | Use Monad testnet, unlimited gas |
| Frontend complexity explodes | HIGH | Strict page prioritization (P0 only) | Use shared components, defer features |
| Direction A/B code diverges too much | MEDIUM | Shared contracts, unified MCP | Accept some divergence for demo purposes |

### Timeline Risks

| Risk | Impact | Mitigation | Contingency |
|------|--------|------------|-------------|
| Can't finish both directions | HIGH | Prioritize Moltiverse (Feb 15) | Skip Blitz Pro or submit minimal version |
| Demo video quality poor | MEDIUM | Script and rehearse first | Use screen recording with voiceover |
| Contract deployment issues | HIGH | Deploy early (Feb 9), test thoroughly | Use existing deployment if issues |

### Resource Risks

| Risk | Impact | Mitigation | Contingency |
|------|--------|------------|-------------|
| Solo developer burnout | HIGH | Strict scoping, buffer days | Reduce scope, focus on one direction |
| MCP Server complexity underestimated | MEDIUM | Start with basic tools only | Cut advanced tools (filters, sorting) |

---

## Part 7: Success Metrics

### Moltiverse (Direction A)
- [ ] MCP Server with 4+ tools working (list, get, tip, bounty)
- [ ] Smart contract handles bounties on-chain
- [ ] Frontend shows security scores and audit workflows
- [ ] Demo video shows agent-to-agent bounty flow
- [ ] Submitted by Feb 15 deadline

### Blitz Pro (Direction B)
- [ ] MCP Server with 2+ additional tools (task, assign)
- [ ] Smart contract handles task scheduling on-chain
- [ ] Frontend shows multi-agent coordination
- [ ] Demo video shows agent economy in action
- [ ] Submitted by Feb 28 deadline

### Technical Excellence
- [ ] Smart contract gas optimized (<100K per transaction)
- [ ] MCP Server response time <1s
- [ ] Frontend Lighthouse score >90
- [ ] End-to-end tests passing
- [ ] Zero critical bugs in demo flows

---

## Part 8: Decision Summary

### Data Storage
**Decision**: On-chain + MCP memory cache for MVP
**When**: Immediately (Week 1)
**Post-MVP**: Add PostgreSQL only if Blitz Pro needs advanced queries

### MCP vs CLI
**Decision**: Prioritize MCP Server, skip CLI for MVP
**When**: MCP completion by Feb 12
**Post-MVP**: Add CLI only if demo video is ready early

### Smart Contract Scope
**Decision**: ASKLToken.sol + minimal extensions (130 additional lines)
**When**: Core (ready), Extension A (Feb 9), Extension B (Feb 16)
**Scope**: Keep under 500 lines total

### Frontend Scope
**Decision**: 5 P0 pages + adaptive UI for directions
**When**: P0 pages by Feb 11, Direction A/B UI by respective deadlines
**Strategy**: Shared components with feature flags

---

## Appendix A: Open Questions for Team

1. **Contract Deployment**: Do we have testnet MON for deployment and testing?
2. **MCP Testing**: Has anyone tested MCP Server with Claude Code?
3. **Demo Video**: Who is recording/editing? Equipment available?
4. **Direction Priority**: If we can only finish one, which is preferred?
5. **x402 Integration**: Is this required for Blitz Pro or optional?

---

## Appendix B: Next Actions (Immediate)

**Today (Feb 8)**:
1. [ ] Review this document with team
2. [ ] Decide on Direction A vs B priority
3. [ ] Set up monorepo structure (if approved)
4. [ ] Deploy ASKLToken.sol to Monad testnet
5. [ ] Test MCP Server with deployed contract

**Tomorrow (Feb 9)**:
1. [ ] Implement BountyExtension.sol
2. [ ] Add bounty tools to MCP Server
3. [ ] Start Direction A frontend pages
4. [ ] Begin demo video script

---

**Document Status**: Ready for Review
**Next Review**: After team discussion (Feb 8 evening)
**Owner**: Technical Architecture Team
