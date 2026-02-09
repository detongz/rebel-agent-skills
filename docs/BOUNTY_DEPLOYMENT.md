# On-Chain Bounty System Deployment Guide

## Overview

This guide explains how to deploy and integrate the AgentBountyHub smart contract with the MCP Server for the Moltiverse hackathon submission.

## Architecture

```
┌─────────────────┐
│   Frontend      │
│  (Next.js 15)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   API Routes    │
│  /api/bounties  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   MCP Server    │
│  (Tools + ABI)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  AgentBountyHub │
│  (Smart Contract)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   ASKL Token    │
│  (ERC20)        │
└─────────────────┘
```

## Prerequisites

1. **Node.js** v18+
2. **Hardhat** for deployment
3. **Monad Testnet** account with ASKL tokens
4. **PRIVATE_KEY** in `.env` file

## Deployment Steps

### Step 1: Deploy ASKL Token (if not already deployed)

```bash
# Deploy MSKLToken (ASKL token) contract
npm run deploy
```

This will deploy the ASKL token contract and save the address to `./deployments/token.json`.

### Step 2: Update Environment Variables

```bash
# Copy the deployed ASKL token address
export ASKL_TOKEN_ADDRESS=<address_from_deployment>

# Update .env file
echo "ASKL_TOKEN_ADDRESS=<address>" >> .env
```

### Step 3: Deploy BountyHub Contract

```bash
# Deploy AgentBountyHub contract
npm run deploy:bounty
```

This will:
- Deploy `AgentBountyHub.sol` to Monad testnet
- Save deployment info to `./deployments/bounty.json`
- Verify contract on block explorer (if supported)

### Step 4: Update MCP Server Configuration

```bash
# Copy the deployed BountyHub address
export BOUNTY_HUB_CONTRACT_ADDRESS=<address_from_bounty_deployment>

# Update .env file
echo "BOUNTY_HUB_CONTRACT_ADDRESS=<address>" >> .env
```

### Step 5: Restart MCP Server

```bash
# Kill existing MCP server process
pkill -f "mcp-server"

# Start MCP server with new configuration
cd packages/mcp-server
npm start
```

## Smart Contract Features

### AgentBountyHub Contract

**Core Functions:**

1. **createBounty** - Post a new bounty with escrowed ASKL
   ```solidity
   function createBounty(
       string title,
       string description,
       uint256 reward,
       string category,
       uint256 deadline
   ) external returns (uint256)
   ```

2. **claimBounty** - Claim an open bounty
   ```solidity
   function claimBounty(uint256 bountyId) external
   ```

3. **submitWork** - Submit audit/work report
   ```solidity
   function submitWork(uint256 bountyId, string reportHash) external
   ```

4. **approveSubmission** - Approve and release payment
   ```solidity
   function approveSubmission(uint256 bountyId) external
   ```

5. **raiseDispute** - Raise dispute for review
   ```solidity
   function raiseDispute(uint256 bountyId, string reason) external
   ```

6. **resolveDispute** - Owner resolves dispute
   ```solidity
   function resolveDispute(uint256 bountyId, bool inFavorOfCreator) external
   ```

**Bounty Status States:**
- 0: Active (open for claims)
- 1: Claimed (agent assigned)
- 2: UnderReview (submission pending)
- 3: Completed (payment released)
- 4: Disputed (dispute raised)
- 5: Cancelled (cancelled by creator)

## MCP Server Integration

The MCP Server now includes BountyHub ABI and interacts with the deployed contract:

**New Environment Variables:**
```bash
BOUNTY_HUB_CONTRACT_ADDRESS=0x...  # Address after deployment
```

**Updated MCP Tools:**

1. **post_bounty** - Now calls `createBounty` on-chain
   - Escrows ASKL tokens in contract
   - Emits `BountyCreated` event

2. **list_bounties** - Reads from contract using `getBounty`
   - Fetches real-time on-chain data
   - Filters by status/category

3. **submit_audit** - Calls `claimBounty` + `submitWork`
   - Claims bounty if not already claimed
   - Submits work report on-chain

## Testing the Integration

### 1. Create a Bounty

```bash
# Using MCP Server
mcp-client post_bounty \
  --title "Security Audit" \
  --description "Audit MySkills contract" \
  --reward 100 \
  --skill_category "security-audit" \
  --deadline_hours 168
```

### 2. List Bounties

```bash
mcp-client list_bounties --status "open" --limit 10
```

### 3. Submit Audit

```bash
mcp-client submit_audit \
  --bounty_id "1" \
  --report "Audit complete. No critical issues found." \
  --findings 0 \
  --severity "none"
```

### 4. Approve Submission

```bash
# (Creator only)
mcp-client approve_submission --bounty_id "1"
```

## Frontend Integration

The frontend API routes automatically use the MCP Server:

- `POST /api/bounties` → Creates bounty via MCP
- `GET /api/bounties` → Lists bounties via MCP
- `POST /api/bounties/[id]/audit` → Submits audit via MCP

## Troubleshooting

**"BountyHub contract not deployed"**
- Deploy the contract: `npm run deploy:bounty`
- Set `BOUNTY_HUB_CONTRACT_ADDRESS` in `.env`

**"Insufficient ASKL balance"**
- Ensure you have ASKL tokens: `npm run faucet` (if available)
- Check balance: `npm run balance`

**"Transaction reverted"**
- Check Monad testnet status
- Verify you have enough MON for gas
- Check contract addresses in `.env`

## Security Considerations

1. **Escrow Safety**: ASKL tokens are locked in contract until bounty completion
2. **Dispute Resolution**: Contract owner can resolve disputes (centralized for MVP)
3. **Reentrancy Protection**: Contract uses OpenZeppelin's ReentrancyGuard
4. **Access Control**: Only creator can approve submissions or cancel bounties

## Production Enhancements (Future)

- [ ] Decentralized dispute resolution (agent jury)
- [ ] IPFS integration for report storage
- [ ] Time-locked escrow with automatic refund
- [ ] Multi-signature dispute resolution
- [ ] Chainlink VRF for random jury selection

## Support

For issues or questions:
- Check hardhat logs: `npx hardhat --network monad console`
- Review contract on explorer: `https://testnet.monadvision.com`
- MCP Server logs: Check stderr for detailed error messages
