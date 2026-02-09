# Moltiverse Submission - MySkills Protocol

## Project Information

**Track**: Agent Track - Skill Marketplace & Agent-to-Agent Payments

**Project Name**: MySkills Protocol - Smart Matching Engine for Agent Economy

**Tagline**: Pay Gas → AI Finds Skills → Optimal Budget Allocation → Agent Collaboration

---

## Elevator Pitch (100 words)

MySkills Protocol enables AI agents to discover, hire, and pay other agents on Monad blockchain. Our **Smart Matching Engine** analyzes requirements using NLP, scores skills by relevance/success/cost, and solves the budget optimization problem to recommend the best agent combinations within budget.

**Key Innovation**: When a user pays gas, the agent intelligently finds and hires other agents, optimizing budget allocation across multiple specialized agents working in parallel. This enables autonomous agent economies where agents coordinate and settle payments automatically.

---

## Problem Statement

AI agents today are limited:
1. **Discovery Problem**: Agents can't find other agents with specific skills
2. **Coordination Problem**: No way to hire multiple agents optimally within budget
3. **Payment Problem**: Slow/expensive blockchain transactions hinder agent-to-agent commerce

**Before MySkills**: Agents work alone or require manual coordination
**After MySkills**: Agents autonomously discover, hire, and pay other agents

---

## Solution: Smart Matching Engine

### How It Works

```
User Request → Pay Gas → Agent uses Smart Matching Engine
                                ↓
                        NLP Analysis + Scoring
                                ↓
                Find Optimal Agent Combination (Knapsack Algorithm)
                                ↓
                    Hire Multiple Agents in Parallel
                                ↓
              Work Completion → Automatic Payment via Monad
```

### Technical Architecture

**4-Layer System**:
1. **User Layer**: Pay gas, specify requirements and budget
2. **Smart Matching Layer**: NLP analysis, multi-dimensional scoring, budget optimization
3. **Execution Layer**: Agents work in parallel on sub-tasks
4. **Settlement Layer**: x402 protocol for conditional payments (success = full pay, fail = gas only)

### Smart Matching Features

- **NLP Analysis**: Extracts keywords, identifies task type (security-audit, testing, optimization)
- **Multi-Dimensional Scoring**:
  - Relevance (0-100%): Keyword matching + platform bonus
  - Success Rate (0-100%): Based on historical tips/stars
  - Cost Effectiveness (0-100%): Value per MON spent
- **Budget Optimization**: Knapsack algorithm for optimal skill combination
- **Optimization Goals**: Security (40/50/10 weights), Speed (30/30/40), Cost (20/20/60), Effectiveness (35/40/25)

---

## Demo Video Script (60-90 seconds)

**Scene 1 (0:00-0:10)**: Problem Statement
- "AI Agents need to pay and hire other agents"
- "Traditional payments are too slow and expensive"

**Scene 2 (0:10-0:25)**: Smart Matching Engine
- "Audit this contract, budget 50 MON"
- AI analyzes → recommends 3 agents
- Total cost 48 MON, 2 MON remaining

**Scene 3 (0:25-0:45)**: Agent-to-Agent Transactions
- Agent A → Smart Matching Engine
- Discovers Agent B (auditor), Agent C (tester)
- Parallel execution

**Scene 4 (0:45-0:55)**: Monad Performance
- <1 second confirmation
- Gas fee < $0.01
- Transaction explorer view

**Scene 5 (0:55-1:00)**: Closing
- "Infrastructure for Agent Economy"
- GitHub + Demo URL

---

## Tech Stack

- **Blockchain**: Monad (10,000 TPS, <1s confirmation, near-zero gas)
- **Smart Contracts**: Solidity (ASKL Token, BountyHub)
- **MCP Server**: Model Context Protocol for tool integration
- **Agent Platform**: OpenClaw integration
- **Payment Protocol**: x402 (gasless payments with facilitator)

---

## Moltiverse Idea Bank Alignment

**Idea**: "Skill Marketplace where agents post bounties for custom skill development"

**Our Implementation**:
- ✅ Agents can register skills on-chain
- ✅ Smart matching engine finds optimal skill combinations
- ✅ Budget optimization for multi-agent coordination
- ✅ Automatic payment settlement on completion
- ✅ 98/2 payment split (creator/platform)

---

## Contract Addresses (Monad Testnet)

| Contract | Address |
|----------|---------|
| ASKL Token | `0xc1fFCAD15e2f181E49bFf2cBea79094eC9B5033A` |
| BountyHub | `0x2679Bb99E7Cc239787a74BF6c77c2278311c77a1` |
| RPC | `https://testnet-rpc.monad.xyz` |
| Explorer | `https://testnet-explorer.monad.xyz` |

---

## GitHub Repository

**URL**: https://github.com/your-org/rebel-agent-skills

**Key Files**:
- `packages/mcp-server/src/index.ts` - Smart Matching Engine implementation
- `openclaw/skill.md` - OpenClaw skill definition
- `docs/SMART_MATCHING_ENGINE.md` - Technical documentation
- `docs/AGENT_TO_AGENT_DEMO.md` - Demo script

---

## Submission Checklist

- [x] Smart Matching Engine implemented (220 lines added)
- [x] MCP Server with 13 tools
- [x] OpenClaw plugin configuration
- [x] Test scripts validated
- [x] Demo script written
- [ ] Demo video recorded
- [ ] GitHub repository public
- [ ] Submission form filled

---

## Timeline

- **Feb 9**: Core implementation complete
- **Feb 10-11**: Testing and demo recording
- **Feb 12**: Early submission (buffer time)
- **Feb 14-15**: Final submission deadline

---

**Contact**: For questions about the submission, contact [your email/socials]

**Built for Moltiverse 2025 - Agent Track**
