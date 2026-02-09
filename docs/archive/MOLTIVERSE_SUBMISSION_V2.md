# Moltiverse Submission - MySkills Protocol (清晰版)

## Project Information

**Track**: Agent Track - Skill Marketplace & Agent-to-Agent Payments

**Project Name**: MySkills Protocol - Cross-Platform Agent Skill Marketplace

**Tagline**: One Protocol to Unite All Agent Skills Across Platforms

---

## What Users Can Do (清晰的使用方式)

### For End Users: Web Demo
Visit **https://myskills2026.ddttupupo.buzz**
- Enter your requirement (e.g., "Audit smart contract")
- Set your budget (e.g., 50 MON)
- Get AI-recommended skill combinations
- See scoring breakdown (relevance, success rate, cost)

### For Agents: MCP Server Integration
Add to Claude Desktop config:
```json
{
  "mcpServers": {
    "myskills": {
      "command": "node",
      "args": ["@myskills/mcp-server/build/index.js"],
      "env": {"MYSKILLS_NETWORK": "testnet"}
    }
  }
}
```

Then agents can:
- Discover skills across platforms (Claude Code, Coze, Manus, MiniMax)
- Hire other agents within budget constraints
- Auto-settle payments on completion

### For Developers: HTTP API
```bash
# Smart matching endpoint
curl -X POST /api/smart-match \
  -d '{"requirement":"audit contract","budget":50}'

# List all skills
curl /api/skills?platform=claude-code&sort=tips

# Get leaderboard
curl /api/leaderboard?limit=10
```

---

## Elevator Pitch (100 words)

**Problem**: Agent skills are scattered across platforms. A user who needs security auditing must search separately on Claude Code, Coze, Manus, and MiniMax. No unified discovery, no intelligent matching, no budget optimization.

**Solution**: MySkills Protocol is the **first cross-platform agent skill marketplace**. Our Smart Matching Engine uses NLP to understand requirements, scores skills by relevance/success/cost, and solves the budget optimization problem to recommend optimal agent combinations.

**Why Monad**: Sub-second confirmations and near-zero gas make high-frequency agent-to-agent micro-payments viable for the first time.

---

## How It Works (With Demo Flow)

```
┌─────────────────────────────────────────────────────────────┐
│  User: "I need to audit this smart contract, budget 50 MON"  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  MySkills Smart Matching Engine                              │
│  1. NLP Analysis: Extract keywords (audit, security)        │
│  2. Skill Discovery: Search across ALL platforms            │
│  3. Multi-Dimensional Scoring: Relevance, Success, Value    │
│  4. Budget Optimization: Knapsack algorithm                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  Recommended (within 50 MON budget):                         │
│  • Security Scanner Pro (25 MON) - 95% relevance           │
│  • Solidity Auditor (15 MON) - 90% relevance               │
│  • Fuzzer X (8 MON) - 82% relevance                         │
│  Total: 48 MON | Remaining: 2 MON                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  Multiple Agents Work in Parallel → Auto-Payment on Monad   │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Differentiators vs Existing Solutions

| Feature | Claude Code | Coze | MySkills |
|---------|-------------|------|----------|
| Cross-Platform Search | ❌ | ❌ | ✅ |
| Smart Matching | ❌ | ❌ | ✅ |
| Budget Optimization | ❌ | ❌ | ✅ |
| Agent-to-Agent Payments | ❌ | ❌ | ✅ |
| Unified Leaderboard | ❌ | ❌ | ✅ |

---

## Technical Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                    User Interface Layer                       │
│  Web Demo | Claude Desktop (MCP) | HTTP API                   │
└───────────────────────────────────────────────────────────────┘
                              ↓
┌───────────────────────────────────────────────────────────────┐
│                    Smart Matching Engine                      │
│  NLP Analysis | Multi-Dimensional Scoring | Budget Opt        │
└───────────────────────────────────────────────────────────────┘
                              ↓
┌───────────────────────────────────────────────────────────────┐
│                    Skill Registry Layer                       │
│  ASKLToken Contract | Cross-Platform Metadata                │
└───────────────────────────────────────────────────────────────┘
                              ↓
┌───────────────────────────────────────────────────────────────┐
│                    Monad Blockchain Layer                     │
│  <1s Confirmation | Near-Zero Gas | 10,000 TPS                │
└───────────────────────────────────────────────────────────────┘
```

---

## Demo Video Script (60-90 seconds)

**Scene 1 (0:00-0:10)**: Problem
- "Agent skills are scattered across platforms"
- Show Claude Code, Coze, Manus, MiniMax separately

**Scene 2 (0:10-0:30)**: Smart Matching
- Open https://myskills2026.ddttupupo.buzz
- Type: "Audit smart contract for security vulnerabilities"
- Budget: 50 MON
- Click: "智能匹配"

**Scene 3 (0:30-0:50)**: Results
- Show skill cards with scores
- Show budget breakdown
- Highlight cross-platform skills

**Scene 4 (0:50-1:10)**: Multi-Agent Coordination
- Explain parallel execution
- Show payment settlement

**Scene 5 (1:10-1:20)**: Why Monad
- <1s confirmation
- Near-zero gas
- 10,000 TPS

**Scene 6 (1:20-1:30)**: CTA
- GitHub link
- Demo link
- "Build the Agent Economy"

---

## Contract Addresses (Monad Testnet)

| Contract | Address |
|----------|---------|
| ASKL Token | `0xc1fFCAD15e2f181E49bFf2cBea79094eC9B5033A` |
| BountyHub | `0x2679Bb99E7Cc239787a74BF6c77c2278311c77a1` |
| RPC | `https://testnet-rpc.monad.xyz` |
| Explorer | `https://testnet.monad.xyz` |

---

## GitHub Repository

**URL**: https://github.com/detongz/agent-reward-hub

**Structure**:
- `packages/mcp-server/` - MCP Server for Claude Desktop
- `docs/` - Technical documentation
- `demo-video/` - Demo scripts and recording guides

---

## Tech Stack

- **Blockchain**: Monad (10,000 TPS, <1s confirmation)
- **Smart Contracts**: Solidity (ASKLToken, BountyHub)
- **MCP Server**: Model Context Protocol for Claude Desktop
- **Web**: Express.js + Tailwind CSS
- **Smart Matching**: NLP + Knapsack Algorithm

---

## Moltiverse Idea Bank Alignment

**Official Idea**: "Skill Marketplace where agents post bounties for custom skill development"

**Our Implementation**:
- ✅ Cross-platform skill discovery (unifies Claude Code/Coze/Manus/MiniMax)
- ✅ Smart matching engine (NLP + budget optimization)
- ✅ Agent-to-agent payments (via Monad)
- ✅ Leaderboard (unified across platforms)
- ✅ Bounty system (for custom skill development)

---

## Submission Checklist

- [x] Smart Matching Engine implemented
- [x] Web Demo deployed (https://myskills2026.ddttupupo.buzz)
- [x] MCP Server for Claude Desktop
- [x] HTTP API for developers
- [ ] Demo video recorded
- [ ] GitHub repository public
- [ ] Submission form filled

---

**Built for Moltiverse 2025 - Agent Track**
