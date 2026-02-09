# MySkills Metadata Specification

## Package.json Extension

Add `myskills` field to your `package.json` to enable auto-rewards:

```json
{
  "name": "@myagents/solidity-auditor",
  "version": "1.0.0",
  "description": "AI-powered Solidity smart contract auditor",
  "author": "Your Name <you@email.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-org/solidity-auditor.git"
  },
  "myskills": {
    "walletAddress": "0xYourMonadWalletAddress",
    "category": "security-audit",
    "tags": ["solidity", "security", "auditing"],
    "pricing": {
      "type": "usage-based",
      "rate": "1 ASKL per 100 uses"
    }
  },
  "keywords": ["agent", "solidity", "audit", "myskills"]
}
```

## GitHub README Format

Add this section to your README.md to enable auto-discovery:

```markdown
## MySkills Integration

This skill participates in the MySkills reward protocol.

**Creator**: 0xYourMonadWalletAddress
**Category**: security-audit
**License**: MIT

Usage is tracked automatically and rewards are distributed based on download/install counts.
```

## How It Works

1. **Discovery**: MySkills scans GitHub and npm for packages with `myskills` metadata
2. **Auto-Registration**: Skills are automatically registered without manual submission
3. **Usage Tracking**: Each npm install or GitHub clone counts as "usage"
4. **Reward Distribution**: Weekly rewards distributed based on usage statistics

## Usage Tracking Methods

### Method 1: npm Install Hook
```bash
npm install @myagents/solidity-auditor
# Automatically tracked and rewards allocated to creator
```

### Method 2: GitHub Clone Counter
```bash
git clone https://github.com/your-org/solidity-auditor.git
# Clone count contributes to usage statistics
```

### Method 3: MCP Server Call
```typescript
// When agent uses the skill
await mcpClient.call({
  method: "use_skill",
  params: { packageId: "@myagents/solidity-auditor" }
});
// Automatically tracked and rewarded
```

## Reward Formula

```
Reward = (Usage_Count × Reward_Rate) × Creator_Share

Where:
- Usage_Count = Downloads + Clones + MCP_Calls
- Reward_Rate = Platform-configured (default: 1 ASKL per 100 uses)
- Creator_Share = 98% (2% platform fee)
```

## Example

**Package**: `@myagents/solidity-auditor`
- Week 1: 10,000 npm installs, 5,000 GitHub clones
- Total Usage: 15,000
- Reward Calculation: (15,000 / 100) × 1 ASKL × 98% = 147 ASKL
- Creator receives: 147 ASKL automatically

## Implementation Status

- ✅ Metadata parsing implemented
- ⏳ npm install hook integration (pending)
- ⏳ GitHub webhook for clone tracking (pending)
- ⏳ Automatic reward distribution (pending)
- ⏳ The Graph integration for query (pending)

For MVP, manual registration still works, but auto-registration is the target state.

