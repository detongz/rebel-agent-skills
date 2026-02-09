# Dual Hackathon Branching Strategy

## Executive Summary

We have TWO hackathon opportunities with the SAME project (myskills):

| Hackathon | Deadline | Prize Pool | Key Focus |
|-----------|----------|------------|-----------|
| **Moltiverse.dev** | Feb 15, 2026 | $200K (up to 16×$10K + $40K liquidity) | Agent Track: MCP + OpenClaw + Agent Coordination |
| **Monad Blitz (ETHDenver)** | Feb 17, 2026 | $10K | x402 + Agent-native Payments + Performance |

### Recommendation: Same Core, Different Emphasis

**Strategy**: Submit the SAME codebase to BOTH, but customize:
1. **Project description/pitch** for each hackathon
2. **Demo emphasis** (different features highlighted)
3. **Documentation** (track-specific highlights)

**Why this works:**
- Moltiverse requires "substantially different" projects ONLY for submitting to BOTH tracks (Agent Track vs Agent+Token Track) of the SAME hackathon
- Different hackathons have different judging criteria
- Efficiency: maintain ONE codebase, TWO presentations

---

## Branch Strategy Overview

```
main (production)
├── hackathon/moltiverse (Feb 10 submission)
│   └── Emphasize: MCP + OpenClaw + Agent coordination
└── hackathon/blitz-pro (Feb 15 submission)
    └── Emphasize: x402 + Payments + Monad performance
```

### Branch Details

#### 1. `hackathon/moltiverse` Branch
**Purpose**: Moltiverse Hackathon submission (Agent Track)
**Target submission date**: Feb 10, 2026 (5 days before deadline)

**Key emphasis:**
- MCP Server integration (Model Context Protocol)
- OpenClaw Skill for ClawHub agents
- Agent-to-Agent coordination demos
- Cross-platform skill discovery
- Community building aspects

**Branch-specific changes:**
- Enhanced MCP server documentation
- OpenClaw skill markdown file
- Agent coordination demo scripts
- Moltiverse-specific README updates
- Pitch deck emphasizing Agent Track

#### 2. `hackathon/blitz-pro` Branch
**Purpose**: Monad Blitz ETHDenver submission
**Target submission date**: Feb 15, 2026

**Key emphasis:**
- x402 protected endpoints (if implemented)
- Agent-native payment protocol
- Monad performance benefits (10K TPS)
- Micro-tipping economics
- High-frequency transaction demos

**Branch-specific changes:**
- x402 integration (optional priority)
- Payment flow documentation
- Performance benchmarking
- Blitz-specific README updates
- Pitch deck emphasizing infrastructure/payments

---

## Hackathon Comparison

### Moltiverse.dev vs Monad Blitz

| Dimension | Moltiverse.dev | Monad Blitz (ETHDenver) |
|-----------|----------------|-------------------------|
| **Prize Pool** | $200K total | $10K total |
| **Deadline** | Feb 15, 2026 | Feb 17, 2026 |
| **Submission** | Via moltiverse.dev platform | Via ETHDenver/devpost |
| **Judging** | Rolling review (submit early!) | Peer-judged by participants |
| **Track Focus** | Agent Track (agents doing interesting things) | Open (but x402 emphasis expected) |
| **Key Criteria** | Weird & creative, Agent coordination | Working demos, Performance |
| **Token Required?** | Optional (separate Agent+Token track) | Not required |
| **Unique Aspect** | MCP + OpenClaw ecosystem | x402 integration |

---

## Substantial Differences Strategy

If hackathon rules require "substantially different" submissions, here's how we differentiate:

### Moltiverse Submission: "Agent Coordination Protocol"

**Narrative:**
> "MySkills enables Agent-to-Agent value transfer through a unified cross-platform skill registry. Agents can discover, evaluate, and reward each other's skills automatically, creating a self-sustaining agent economy."

**Key Features Highlighted:**
1. **MCP Server** - Any AI agent can query and tip skills
2. **OpenClaw Skill** - Drag-and-drop agent integration
3. **Agent Leaderboard** - Community-driven skill discovery
4. **Cross-Platform Registry** - Coze, Claude Code, Manus unified

**Demo Focus:**
- Agent A uses Agent B's skill → automatic tip
- Multi-agent workflow with value exchange
- Skill discovery via MCP

### Blitz Pro Submission: "High-Performance Agent Payment Layer"

**Narrative:**
> "MySkills is a high-frequency micro-tipping protocol built on Monad's 10,000 TPS infrastructure. It enables agent-native payments at scale, with sub-second confirmation and near-zero gas fees."

**Key Features Highlighted:**
1. **x402 Protected Endpoints** (if implemented) - Secure agent payments
2. **Payment Protocol** - Agent-callable tipping interface
3. **Monad Performance** - 10K TPS, <1s finality
4. **Micro-economics** - 98/2 split with automatic burn

**Demo Focus:**
- High-frequency tipping (100+ tips in demo)
- Transaction confirmation speed
- Gas cost comparison vs Ethereum
- Payment flow from agent perspective

---

## Implementation Plan

### Phase 1: Core Preparation (Feb 1-7)

**Tasks:**
- [x] Smart contracts deployed on Monad Testnet
- [x] Frontend functional (RainbowKit, tipping, leaderboard)
- [x] CLI tool working
- [ ] MCP Server implementation (Priority 1)
- [ ] OpenClaw Skill markdown (Priority 2)
- [ ] Agent coordination demos (Priority 3)

**Branch:** Work on `main` branch

### Phase 2: Moltiverse Branch (Feb 8-10)

**Tasks:**
- [ ] Create `hackathon/moltiverse` branch
- [ ] Complete MCP Server
- [ ] Create OpenClaw Skill file
- [ ] Record Agent coordination demo
- [ ] Update README for Agent Track
- [ ] Create Moltiverse pitch deck
- [ ] Submit to moltiverse.dev

**Branch:** `hackathon/moltiverse`

### Phase 3: Blitz Pro Branch (Feb 11-15)

**Tasks:**
- [ ] Create `hackathon/blitz-pro` branch from `main`
- [ ] Add x402 integration (if time permits)
- [ ] Create payment flow demos
- [ ] Benchmark performance (TPS, gas costs)
- [ ] Update README for infrastructure focus
- [ ] Create Blitz Pro pitch deck
- [ ] Submit to ETHDenver/devpost

**Branch:** `hackathon/blitz-pro`

### Phase 4: Merge & Cleanup (Feb 16-18)

**Tasks:**
- [ ] Merge improvements back to `main`
- [ ] Update documentation with learnings
- [ ] Prepare for judging/demos
- [ ] Community promotion (Moltbook, Discord)

---

## File Structure by Branch

### `main` branch (core implementation)

```
agent-reward-hub/
├── contracts/           # Smart contracts
├── scripts/             # Deployment scripts
├── src/
│   ├── frontend/        # Next.js app
│   └── backend/         # API routes
├── cli/                 # CLI tool
├── docs/
│   ├── architecture.md
│   ├── token-economics.md
│   └── frontend-design.md
└── README.md
```

### `hackathon/moltiverse` branch additions

```
agent-reward-hub/
├── mcp-server/          # NEW: MCP Server implementation
│   ├── src/
│   │   ├── tools.ts     # list_skills, tip_creator, etc.
│   │   └── server.ts    # MCP server setup
│   └── package.json
├── openclaw/            # NEW: OpenClaw Skill
│   └── myskills.md      # Skill definition
├── demos/
│   └── agent-coordination.md  # NEW: Agent demo scenarios
├── docs/
│   ├── moltiverse-pitch.md  # NEW: Pitch deck content
│   └── MCP-integration.md   # NEW: MCP docs
└── README.md           # UPDATED: Agent Track emphasis
```

### `hackathon/blitz-pro` branch additions

```
agent-rewatch-hub/
├── x402/                # NEW: x402 integration
│   ├── protected-endpoints.ts
│   └── auth-middleware.ts
├── benchmarks/          # NEW: Performance tests
│   ├── tipping-performance.md
│   └── gas-comparison.md
├── demos/
│   └── payment-flow.md  # NEW: Payment demos
├── docs/
│   ├── blitz-pitch.md   # NEW: Pitch deck content
│   └── x402-guide.md    # NEW: x402 documentation
└── README.md           # UPDATED: Infrastructure emphasis
```

---

## Timeline & Milestones

### Week 1 (Feb 1-7): Foundation

| Day | Focus | Deliverable |
|-----|-------|-------------|
| Feb 1 | Planning | This document |
| Feb 2-3 | MCP Server | Working MCP with basic tools |
| Feb 4-5 | OpenClaw Skill | Skill markdown + testing |
| Feb 6-7 | Agent Demos | Multi-agent tipping scenarios |

### Week 2 (Feb 8-14): Submissions

| Day | Focus | Deliverable |
|-----|-------|-------------|
| Feb 8-9 | Moltiverse Branch | Complete Agent Track submission |
| Feb 10 | Moltiverse Submit | Submit to moltiverse.dev |
| Feb 11-13 | Blitz Pro Branch | x402 + payment focus |
| Feb 14 | Blitz Pro Submit | Submit to ETHDenver |
| Feb 15 | Buffer | Final polish for both |

### Week 3 (Feb 15-18): Judging

| Day | Focus | Deliverable |
|-----|-------|-------------|
| Feb 16-17 | Community | Moltbook posts, Discord sharing |
| Feb 18 | Results | Winners announced |

---

## Success Metrics

### Moltiverse Success Criteria
- [ ] MCP Server works with Claude Code
- [ ] OpenClaw Skill installable
- [ ] Agent-to-Agent tipping demo recorded
- [ ] Clear Agent Track narrative
- [ ] Submitted before Feb 15 deadline

### Blitz Pro Success Criteria
- [ ] x402 integration (or clear roadmap)
- [ ] Payment benchmarks documented
- [ ] Performance vs Ethereum comparison
- [ ] Clear infrastructure narrative
- [ ] Submitted before Feb 17 deadline

---

## Risk Mitigation

### Risk 1: "Substantially Different" Requirement
**Mitigation**: Focus on different features in each submission
- Moltiverse: Agent coordination (MCP, OpenClaw)
- Blitz Pro: Payment infrastructure (x402, performance)

### Risk 2: Time Constraints
**Mitigation**:
- Prioritize Moltiverse (earlier deadline, larger prize)
- Reuse demos across both submissions
- Branch strategy allows parallel work

### Risk 3: Judging Criteria Mismatch
**Mitigation**:
- Tailor pitch decks to each hackathon
- Emphasize track-specific features
- Different demo flows for each

---

## Commands

### Creating branches

```bash
# Create Moltiverse branch
git checkout -b hackathon/moltiverse

# Create Blitz Pro branch (later)
git checkout main
git checkout -b hackathon/blitz-pro
```

### Merging improvements

```bash
# Merge Moltiverse improvements to main
git checkout main
git merge hackathon/moltiverse

# Merge Blitz Pro improvements to main
git checkout main
git merge hackathon/blitz-pro
```

---

## Conclusion

**Recommended Strategy:**
1. **Same codebase**, different presentations
2. **Moltiverse first** (Feb 10) - larger prize, earlier deadline
3. **Blitz Pro second** (Feb 15) - leverage Moltiverse work
4. **Branch strategy** allows customization without fragmentation

**Key Success Factors:**
- MCP Server for Moltiverse (Agent Track)
- Clear Agent coordination narrative for Moltiverse
- x402 or payment focus for Blitz Pro
- High-quality demos for both
- Early submission to Moltiverse (rolling judging)

**Next Step:** Start MCP Server implementation immediately (highest priority for Moltiverse Agent Track).

---

*Last Updated: 2026-02-08*
*Author: branch-strategist agent*
