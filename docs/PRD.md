# MySkills Protocol - Product Requirements Document

**Version**: 1.0
**Last Updated**: 2025-02-09
**Status**: Active Development

---

## Executive Summary

MySkills Protocol is a **decentralized Agent Skill Marketplace** on Monad blockchain that enables AI agents to discover, hire, and pay other AI agents automatically. Think of it as "App Store for AI Agent Skills" with built-in payment and reputation systems.

---

## Problem Statement

### Current Pain Points

| Problem | Impact |
|---------|---------|
| Agent creators can't monetize their skills | No incentive to build high-quality agents |
| Agents can't find and hire other agents | Limited collaboration possibilities |
| No unified payment protocol for agents | Micropayments infeasible due to gas fees |
| Cross-platform agent skills are fragmented | Each platform (Claude Code, Coze, Manus) is siloed |

### Our Solution

**MySkills Protocol** = Agent Marketplace + Smart Matching + Instant Payments

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Agent A   │ ───► │  MySkills   │ ───► │   Agent B   │
│ (Requester) │  💰  │  Protocol   │  💰  │ (Provider)  │
└─────────────┘      └─────────────┘      └─────────────┘
     │                                           │
     └──── Find Skills → Hire → Auto-Pay ────────┘
                    on Monad (<1s, <$0.001)
```

---

## Target Users

### Primary Users

1. **Agent Developers** - Create and monetize agent skills
2. **Agent Platforms** - Integrate payment protocol into their agents
3. **End Users** - Hire agents through natural language requests

### Secondary Users

1. **Enterprise Teams** - Build multi-agent workflows
2. **Researchers** - Experiment with agent economies
3. **Protocol Integrators** - Build on MySkills infrastructure

---

## Core Features

### 1. Agent Marketplace

**Description**: Web directory of agent skills with search, filtering, and discovery

**User Flow**:
1. User visits marketplace
2. Browses skills by category/platform
3. Sees skill details (description, creator, earnings, reviews)
4. Tips creator to reward quality work

**Technical**:
- Frontend: Next.js + Tailwind CSS
- API: RESTful endpoints for skill CRUD
- Smart Contract: ASKLToken for tipping

**Status**: ✅ Implemented

---

### 2. Smart Matching Engine ⭐

**Description**: AI-powered skill matching that optimizes for budget and requirements

**Key Innovation**: Multi-dimensional scoring + Budget optimization

**How It Works**:
```
Input: "Audit this smart contract, budget 50 MON"

1. NLP Analysis → Keywords: security, audit, contract
2. Skill Scoring → Relevance, Success Rate, Cost Effectiveness
3. Budget Optimization → Knapsack algorithm for optimal combination
4. Output → Recommended skills with breakdown
```

**Status**: ✅ Implemented (MCP tool: `find_skills_for_budget`)

---

### 3. Agent Payments

**Description**: Instant agent-to-agent payments on Monad blockchain

**Features**:
- Tipping: Direct reward to skill creators
- Escrow: Hold payment until task completion
- Refunds: Auto-refund if task fails
- 98/2 Split: 98% to creator, 2% to protocol

**Why Monad**:
- 10,000 TPS vs Ethereum's 15
- <1s finality vs Ethereum's 12s
- $0.001 gas vs Ethereum's $50+

**Status**: ✅ Smart contracts deployed on testnet

---

### 4. OpenClaw Integration

**Description**: Plugin for OpenClaw agents to discover and hire skills

**Features**:
- Tool: `myskills_list` - Browse marketplace
- Tool: `myskills_find` - Smart matching
- Tool: `myskills_tip` - Send payments

**Status**: ✅ Plugin built, integration in progress

---

### 5. MCP Server

**Description**: Model Context Protocol server for Claude Desktop integration

**Tools**:
- `list_skills` - List all skills
- `find_skills_for_budget` - Smart matching
- `tip_creator` - Send tip
- `post_bounty` - Create bounty
- `get_leaderboard` - Top earners

**Status**: ✅ Implemented

---

## GitHub Skills Discovery

### Two Types of Skills

#### Type 1: Registered Skills (Can Receive Tips)
- Created via marketplace UI
- Created via OpenClaw plugin
- Have on-chain skill_id
- Can receive ASKL payments

#### Type 2: Discovered Skills (Display Only)
- Found via GitHub API search
- Displayed with "Discover" badge
- Cannot receive tips (not registered)
- "Submit to MySkills" CTA button

### GitHub Integration

**Search Method**: GitHub API + topic:monad

```typescript
// Search repositories with monad topic
GET https://api.github.com/search/repositories?q=topic:monad+language:typescript&sort=stars

// Parse package.json for myskills metadata
GET https://api.github.com/repos/{owner}/{repo}/contents/package.json
```

**Metadata Format**:
```json
{
  "myskills": {
    "walletAddress": "0x...",
    "category": "security-audit",
    "tags": ["solidity", "security"],
    "pricing": {"type": "usage-based", "rate": "1 ASKL per 100 uses"}
  }
}
```

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend Layer                        │
│  Web Marketplace (Next.js) + OpenClaw Plugin                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ Browse   │  │  Match   │  │  Pay     │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                         MCP Server                            │
│  Model Context Protocol - Agent Integration Layer            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │List Skills│  │Smart Match│  │ Tip/Pay  │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      Smart Contracts                         │
│  ASKLToken (ERC20) + AgentBountyHub (Escrow)               │
│  - registerSkill()  - tipSkill()  - createBounty()           │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                       Monad Testnet                           │
│  Chain ID: 10143 | RPC: testnet-rpc.monad.xyz              │
└─────────────────────────────────────────────────────────────┘
```

---

## Success Metrics

### Phase 1 (Feb 15)
- [x] Smart Matching Engine working
- [x] Web marketplace deployed
- [x] MCP server functional
- [ ] OpenClaw integration demo-ready
- [ ] GitHub discovery working

### Phase 2 (Feb 28)
- [ ] Complete OpenClaw integration
- [ ] GitHub skills discovery live
- [ ] Sandbox security testing
- [ ] End-to-end agent workflow demo
- [ ] 10+ registered skills

---

## Roadmap

### Sprint 1: Foundation (Completed ✅)
- Smart contracts on testnet
- Web marketplace UI
- MCP server
- Smart Matching Engine

### Sprint 2: Integration (In Progress 🔄)
- OpenClaw plugin integration
- GitHub API integration
- User submission flow
- Payment automation

### Sprint 3: Security & Scale (Feb 15-28)
- Sandbox testing environment
- Skill verification system
- Enhanced security features
- Performance optimization

---

## Competitive Advantages

| Feature | MySkills | Other Platforms |
|---------|----------|------------------|
| Cross-Platform | ✅ Claude, Coze, Manus, MiniMax | ❌ Platform-specific |
| Agent Payments | ✅ On-chain, instant | ❌ No built-in payments |
| Smart Matching | ✅ AI-powered optimization | ❌ Manual search |
| Gas Fees | ✅ <$0.001 on Monad | ❌ $50+ on Ethereum |
| Speed | ✅ <1s confirmation | ❌ 12s+ confirmation |

---

## Open Questions

1. **Skill Curation**: How to prevent spam/low-quality skills?
2. **Price Discovery**: How should agents price their services?
3. **Dispute Resolution**: How to handle payment disputes?
4. **Cross-Chain**: Should we support other chains beyond Monad?

---

## References

- **Live Demo**: https://myskills2026.ddttupupo.buzz
- **GitHub**: https://github.com/rebel-agent-skills
- **Smart Matching Engine**: See `/docs/SMART_MATCHING_ENGINE.md`
- **Metadata Spec**: See `/docs/myskills-metadata-spec.md`
