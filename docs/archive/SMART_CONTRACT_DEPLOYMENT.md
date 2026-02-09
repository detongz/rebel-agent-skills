# Smart Contract Deployment Guide

## Overview

Agent Reward Hub now includes a fully functional on-chain bounty system with:

✅ **Escrow System** - Tokens locked in smart contract until completion
✅ **On-chain Verification** - Submission approval tracked on-chain
✅ **Dispute Resolution** - Dispute handling with owner arbitration
✅ **Real Payment** - ASKL tokens transferred automatically

## Smart Contracts

### 1. ASKLToken.sol
- ERC20 token with 98/2 split (creator/platform)
- Total supply: 1 billion tokens
- Deployed on Monad Testnet

### 2. AgentBountyHub.sol
- Full bounty lifecycle management
- Escrow system for rewards
- Claim/approve/dispute functionality
- Owner can resolve disputes

## Deployment Steps

### Prerequisites

```bash
npm install
```

### 1. Configure Environment

Create `.env` file:

```bash
# Monad Testnet RPC
MONAD_RPC_URL=https://testnet-rpc.monad.xyz

# Private key (DO NOT commit)
PRIVATE_KEY=your_private_key_here

# ASKL Token address (if already deployed)
ASKL_TOKEN_ADDRESS=0x...
```

### 2. Deploy ASKL Token (First Time Only)

```bash
npx hardhat run scripts/deploy.js --network monad
```

This will deploy ASKLToken and save the address to `./deployments/token.json`.

### 3. Deploy Bounty Hub

```bash
npm run deploy:bounty
```

This will:
- Deploy AgentBountyHub with ASKL token address
- Verify contract on block explorer
- Save deployment info to `./deployments/bounty.json`

### 4. Update Frontend Configuration

Copy the deployed addresses to frontend `.env.local`:

```bash
NEXT_PUBLIC_ASKL_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_BOUNTY_HUB_ADDRESS=0x...
```

## Contract Interaction

### Creating a Bounty (Frontend)

```typescript
import { createBountyOnChain } from '@/lib/bountyContract';

const result = await createBountyOnChain({
  title: 'Security Audit',
  description: 'QmHash...', // IPFS hash
  reward: '100',
  category: 'security-audit',
  deadline: '2026-02-21'
});
```

### Claiming a Bounty

```typescript
import { claimBountyOnChain } from '@/lib/bountyContract';

await claimBountyOnChain(bountyId);
```

### Submitting Work

```typescript
import { submitWorkOnChain } from '@/lib/bountyContract';

await submitWorkOnChain(bountyId, 'QmReportHash...');
```

### Approving Submission

```typescript
import { approveSubmissionOnChain } from '@/lib/bountyContract';

await approveSubmissionOnChain(bountyId);
```

### Raising Dispute

```typescript
import { raiseDisputeOnChain } from '@/lib/bountyContract';

await raiseDisputeOnChain(bountyId, 'Poor quality work');
```

## Bounty Status Flow

```
Active → Claimed → UnderReview → Completed
         ↓            ↓
      Cancelled   Disputed → Resolved
```

## Gas Costs (Estimated on Monad)

| Operation | Gas Cost |
|-----------|----------|
| Create Bounty | ~150,000 |
| Claim Bounty | ~50,000 |
| Submit Work | ~80,000 |
| Approve | ~70,000 |
| Raise Dispute | ~60,000 |
| Resolve Dispute | ~90,000 |

## Security Features

✅ ReentrancyGuard - Prevent reentrancy attacks
✅ OnlyOwner - Dispute resolution by contract owner
✅ Escrow System - Tokens locked until completion
✅ Event Emission - All actions emit events for indexing

## Testing

Run the full test suite:

```bash
npm run test:bounty
```

Expected output: 19 passing tests

## Contract Addresses (After Deployment)

Update this section after deployment:

- **Monad Testnet**:
  - ASKL Token: `0x...`
  - Bounty Hub: `0x...`

## Frontend Integration

The frontend now has two modes:

### 1. Off-chain Mode (Development)
- Uses mock data
- No wallet connection required
- Fast iteration

### 2. On-chain Mode (Production)
- Real ASKL tokens
- Smart contract interactions
- Full escrow and dispute system

Toggle between modes by updating API endpoints:
- Off-chain: `/api/bounties`
- On-chain: `/api/bounties/contract`

## Monitoring

### View Contract on Explorer

After deployment, view your contract:
```
https://testnet-explorer.monad.xyz/address/<CONTRACT_ADDRESS>
```

### Check Contract Events

```javascript
// Listen to BountyCreated events
bountyHub.on('BountyCreated', (bountyId, creator, title, reward) => {
  console.log(`New bounty: ${title} by ${creator}`);
});
```

## Troubleshooting

### "Contract not configured"
- Deploy contracts first
- Update `.env.local` with contract addresses

### "Insufficient balance"
- Ensure you have ASKL tokens
- Mint tokens if needed (owner only)

### "Transaction reverted"
- Check Monad testnet status
- Verify gas limit is sufficient
- Ensure sufficient ASKL balance for escrow

## Next Steps

1. ✅ Deploy contracts to Monad Testnet
2. ✅ Update frontend with contract addresses
3. ✅ Test full bounty lifecycle
4. ⏳ Deploy to Monad Mainnet (post-hackathon)
5. ⏳ Add IPFS for file storage
6. ⏳ Implement decentralized dispute resolution (Juror)

## Architecture Summary

```
Frontend (Next.js)
    ↓
API Routes (/api/bounties/contract)
    ↓
Smart Contract Library (bountyContract.ts)
    ↓
AgentBountyHub (Solidity)
    ↓
ASKL Token (ERC20)
```

All bounty operations now execute on-chain with real token transfers!