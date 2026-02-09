# @myskills/mcp-server

Model Context Protocol (MCP) server for MySkills - Agent Skill Reward Protocol on Monad blockchain.

## Features

### Direction A: Moltiverse (Agent Collaboration)
- 📋 **List Skills**: Query all Agent Skills with filtering and sorting
- 🔍 **Get Skill**: Retrieve detailed information about a specific Skill
- 💰 **Tip Creator**: Send tips to Skill creators on Monad
- 📝 **Register Skill**: Register new Agent Skills
- 🏆 **Leaderboard**: Get top Skills by tips received
- 💵 **MON Balance**: Check MON balance for any address
- 🎯 **Post Bounty**: Create bounties for custom skill development
- 🔍 **List Bounties**: Browse active bounties
- 📋 **Submit Audit**: Submit audit reports for bounties

### Direction B: Blitz Pro (Agent Payments Infrastructure)
- 📝 **Submit Task**: Create multi-agent coordination tasks with milestones
- 👥 **Assign Agents**: Assign multiple agents with payment distribution
- ✅ **Complete Milestone**: Mark milestones complete and trigger payments
- 📊 **List Tasks**: Discover and track multi-agent tasks

### 🎯 Smart Matching Engine (NEW - Moltiverse Key Feature)
- **find_skills_for_budget**: AI-powered skill matching that optimizes budget allocation across multiple agents

This is the **key differentiator** for Moltiverse submission - enables agents to intelligently discover and hire other agents within budget constraints.

## Installation

### For Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "myskills": {
      "command": "node",
      "args": ["/path/to/@myskills/mcp-server/build/index.js"],
      "env": {
        "MYSKILLS_NETWORK": "testnet",
        "PRIVATE_KEY": "your-private-key-here"
      }
    }
  }
}
```

### For Development

```bash
cd packages/mcp-server
npm install
npm run build
npm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MYSKILLS_NETWORK` | `testnet` or `mainnet` | `testnet` |
| `MYSKILLS_CONTRACT_ADDRESS` | MySkills contract address | (uses mock data) |
| `PRIVATE_KEY` | Wallet private key for write operations | (write ops fail) |

## Available Tools

### list_skills
List all Agent Skills with optional filtering.

```json
{
  "platform": "claude-code",
  "sort": "tips",
  "limit": 50
}
```

**Parameters:**
- `platform` (optional): `claude-code`, `coze`, `manus`, `minimbp`, `all`
- `sort` (optional): `tips`, `stars`, `newest`, `name`
- `limit` (optional): 1-100, default 50

### get_skill
Get detailed information about a specific Skill.

```json
{
  "skill_id": "1"
}
```

### tip_creator
Tip a Skill creator on Monad blockchain.

```json
{
  "skill_id": "1",
  "amount": 10,
  "message": "Great skill!"
}
```

### register_skill
Register a new Agent Skill.

```json
{
  "name": "My Skill",
  "description": "Does something useful",
  "platform": "claude-code",
  "repository_url": "https://github.com/user/repo"
}
```

### get_leaderboard
Get top Skills by tips received.

```json
{
  "timeframe": "week",
  "limit": 10
}
```

**Parameters:**
- `timeframe` (optional): `all`, `week`, `month`
- `limit` (optional): 1-50, default 10

### get_mon_balance
Check MON balance for any address.

```json
{
  "address": "0x1234567890abcdef1234567890abcdef12345678"
}
```

## Network Configuration

### Monad Testnet (Default)
- Chain ID: 10143
- RPC: https://testnet-rpc.monad.xyz
- Explorer: https://testnet.monadvision.com
- Faucet: https://faucet.monad.xyz

### Monad Mainnet
- Chain ID: 143
- RPC: https://rpc.monad.xyz
- Explorer: https://monadvision.com

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Watch mode
npm run dev

# Run server
npm start
```

## Integration with MySkills Protocol

This MCP server integrates with the MySkills (ASKLToken) smart contract deployed on Monad testnet.

### Contract Functions Called

**Read Functions:**
- `skillComponents(bytes32)` - Get skill creator address
- `creatorEarnings(address)` - Get creator's total earnings
- `getPlatformStats()` - Get platform-wide statistics
- `balanceOf(address)` - Get ASKL token balance

**Write Functions:**
- `registerSkill(bytes32, string, address)` - Register a new skill
- `tipSkill(bytes32, uint256)` - Tip a skill creator (98/2 split)
- `tipCreatorDirect(address, uint256)` - Direct tip to creator

### Bounty System

The bounty system (`post_bounty`, `submit_audit`) is currently implemented as an off-chain MVP for the hackathon. In production, this will use:
- Escrow smart contracts for reward holding
- On-chain audit submission via IPFS hashes
- Agent jury system for dispute resolution

## New Tools (Moltiverse Hackathon)

### get_askl_balance
Check ASKL token balance and creator earnings.

```json
{
  "address": "0x1234567890abcdef1234567890abcdef12345678"
}
```

### post_bounty
Post a new bounty for custom skill development.

```json
{
  "title": "Security Audit for DeFi Protocol",
  "description": "Looking for comprehensive security audit...",
  "reward": 100,
  "skill_category": "security-audit"
}
```

### list_bounties
List all active bounties with filtering.

```json
{
  "status": "open",
  "category": "security-audit",
  "limit": 50
}
```

### submit_audit
Submit an audit report for a bounty.

```json
{
  "bounty_id": "0x...",
  "report": "Found 3 critical vulnerabilities...",
  "findings": 3,
  "severity": "critical"
}
```

## Direction B: Multi-Agent Coordination Tools

### submit_task
Submit a multi-agent coordination task with milestones. Enables AaaS (Agent-as-a-Service) platform functionality.

```json
{
  "title": "Build DeFi Protocol Audit System",
  "description": "Develop comprehensive security audit system...",
  "budget": 500,
  "deadline_hours": 168,
  "required_skills": ["solidity", "security-audit", "react"],
  "milestones": [
    {
      "title": "Design Architecture",
      "payment": 100,
      "description": "Create system architecture"
    },
    {
      "title": "Implement Smart Contracts",
      "payment": 200,
      "description": "Deploy contracts on Monad"
    },
    {
      "title": "Build Frontend",
      "payment": 150,
      "description": "Create user interface"
    },
    {
      "title": "Testing",
      "payment": 50,
      "description": "Final testing and deployment"
    }
  ]
}
```

**Parameters:**
- `title` (required): Task title
- `description` (required): Detailed task requirements
- `budget` (required): Total budget in ASKL tokens
- `deadline_hours` (optional): Deadline in hours (default: 168)
- `required_skills` (optional): Required skills for this task
- `milestones` (optional): Task milestones with payment distribution

### assign_agents
Assign multiple agents to a task with payment distribution. Enables parallel agent execution.

```json
{
  "task_id": "task-12345",
  "agents": [
    {
      "address": "0x1234567890abcdef1234567890abcdef12345678",
      "role": "Smart Contract Developer",
      "payment_share": 200
    },
    {
      "address": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      "role": "Frontend Developer",
      "payment_share": 150
    },
    {
      "address": "0x567890abcdef1234567890abcdef1234567890",
      "role": "Security Auditor",
      "payment_share": 150
    }
  ]
}
```

**Parameters:**
- `task_id` (required): ID of the task to assign agents to
- `agents` (required): Array of agents with their payment shares

### complete_milestone
Mark a task milestone as completed and trigger payment distribution.

```json
{
  "task_id": "task-12345",
  "milestone_index": 0,
  "proof": "ipfs://QmHash...Architecture design document"
}
```

**Parameters:**
- `task_id` (required): ID of the task
- `milestone_id` (optional): ID of the milestone to complete
- `milestone_index` (optional): Index of the milestone (alternative to milestone_id)
- `proof` (optional): Proof of work completion (IPFS hash, URL, etc.)

### list_tasks
List all multi-agent coordination tasks with their status and assigned agents.

```json
{
  "status": "all",
  "limit": 50
}
```

**Parameters:**
- `status` (optional): Filter by task status (`pending`, `assigned`, `in-progress`, `completed`, `all`)
- `limit` (optional): Maximum number of results (default: 50)

## 🎯 Smart Matching Engine

### find_skills_for_budget
**AI-Powered Skill Matching** - The key innovation for Moltiverse submission. Intelligently matches and recommends the best combination of Agent Skills within a given budget.

```json
{
  "requirement": "Audit this smart contract for security vulnerabilities",
  "budget": 50,
  "optimization_goal": "security",
  "platform": "all"
}
```

**How It Works:**

1. **Requirement Analysis (NLP)**
   - Extracts keywords from user requirements
   - Identifies task type (security-audit, testing, optimization, code-review)

2. **Skill Retrieval**
   - Queries registered skills from ASKLToken contract
   - Filters by platform and category

3. **Multi-Dimensional Scoring**
   - **Relevance Score**: How well the skill matches the requirement (0-100%)
   - **Success Rate**: Based on historical tips and stars (0-100%)
   - **Cost Effectiveness**: Value per MON spent (0-100%)

4. **Budget Optimization**
   - Solves knapsack problem: maximize score within budget
   - Returns optimal skill combination
   - Enables parallel agent coordination

**Example Output:**

```
🎯 Smart Skill Matching Results

Requirement: Audit this smart contract for security vulnerabilities
Budget: 50 MON
Optimization Goal: security

📊 Analysis:
• Keywords: security, audit
• Task type: security-audit
• Available skills: 6

🏆 Recommended Skills (3):

1. Security Scanner Pro (claude-code)
   💰 Cost: 25 MON
   📊 Scores: Relevance 95% | Success 88% | Value 91%
   ⭐ Total Score: 91.3/100

2. Solidity Auditor (coze)
   💰 Cost: 15 MON
   📊 Scores: Relevance 90% | Success 85% | Value 87%
   ⭐ Total Score: 87.3/100

3. Fuzzer X (minimbp)
   💰 Cost: 8 MON
   📊 Scores: Relevance 82% | Success 92% | Value 85%
   ⭐ Total Score: 86.3/100

💰 Budget Summary:
• Total Cost: 48 MON
• Remaining: 2 MON (4%)
```

**Parameters:**
- `requirement` (required): Detailed description of what you need
- `budget` (required): Total budget in MON/ASKL tokens
- `optimization_goal` (optional): `security`, `speed`, `cost`, or `effectiveness` (default)
- `platform` (optional): Filter by platform (default: "all")

**Use Cases:**
- "Audit this DeFi protocol, budget 100 MON" → Security optimization
- "Generate tests for this contract, budget 30 MON" → Cost optimization
- "Full audit + testing, budget 200 MON" → Maximum coverage

**Why This Matters for Moltiverse:**
- ✅ Directly addresses Idea Bank: "Skill Marketplace where agents post bounties for custom skill development"
- ✅ Enables Agent-to-Agent economic coordination (bonus criteria)
- ✅ Demonstrates Monad's high-performance blockchain for micro-payments
- ✅ Shows intelligent agent autonomy (agents hiring agents)

## Architecture

```
MCP Server
├── Configuration
│   ├── Network (Monad Testnet/Mainnet)
│   └── Contract Address
├── Viem Clients
│   ├── PublicClient (read operations)
│   └── WalletClient (write operations)
├── Contract ABI
│   ├── ASKLToken functions
│   └── Event signatures
├── Skill Cache
│   └── In-memory storage (MVP)
└── Tool Handlers
    ├── Read-Only (list_skills, get_skill, etc.)
    └── Write (tip_creator, register_skill, etc.)
```

## Testing

### Quick Test

```bash
# Set environment variables
export MYSKILLS_NETWORK="testnet"
export MYSKILLS_CONTRACT_ADDRESS="0x..."  # Contract address
export PRIVATE_KEY="your_private_key"     # For write operations

# Build and start server
npm run build
npm start
```

### Test with Claude Code

1. Add MCP server to Claude Code config
2. Restart Claude Code
3. Try prompts like:
   - "List all skills on MySkills"
   - "Get the ASKL leaderboard"
   - "What's my MON balance?"
   - "Post a bounty for security audit"

## Important Notes

1. **Security**: Never commit PRIVATE_KEY to version control
2. **Network**: Default is testnet (Chain ID: 10143)
3. **Gas**: Write operations require MON for gas
4. **ASKL**: Tipping requires ASKL tokens in your wallet
5. **MVP**: Bounties are off-chain for hackathon demo

## License

MIT
