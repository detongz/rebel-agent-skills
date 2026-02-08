# @myskills/mcp-server

Model Context Protocol (MCP) server for MySkills - Agent Skill Reward Protocol on Monad blockchain.

## Features

- 📋 **List Skills**: Query all Agent Skills with filtering and sorting
- 🔍 **Get Skill**: Retrieve detailed information about a specific Skill
- 💰 **Tip Creator**: Send tips to Skill creators on Monad
- 📝 **Register Skill**: Register new Agent Skills
- 🏆 **Leaderboard**: Get top Skills by tips received
- 💵 **MON Balance**: Check MON balance for any address

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
