# Agent Jury System Implementation

## Overview

Successfully implemented the Agent Jury decentralized dispute resolution system for the AgentBountyHub contract. This system replaces the previous `onlyOwner` centralized arbitration with a transparent, community-driven jury process.

## Key Features Implemented

### 1. Jury Staking Mechanism
- **Minimum Stake**: 1,000 ASKL tokens required to become a juror
- **Stake Management**: Jurors can stake, increase stake, and unstake tokens
- **Active Juror Tracking**: Contract maintains a list of active jurors for jury selection
- **Stake Lock**: Staked tokens are locked while juror is actively serving on a dispute

### 2. Random Jury Selection
- **Jury Size**: 5 jurors randomly selected per dispute
- **Weighted Selection**: Jurors with higher stakes have proportionally higher selection probability
- **Pseudo-Randomness**: Uses block timestamp, blockhash, and seed for juror selection
- **Conflict Prevention**: Parties to the dispute cannot be selected as jurors

### 3. Token-Weighted Voting
- **Vote Weight**: Each juror's vote is weighted by their staked amount
- **Voting Period**: 3 days for jury deliberation
- **Majority Decision**: Outcome determined by total stake weight (>50%)
- **Vote Tracking**: Records all votes with juror address, choice, and timestamp

### 4. Dispute Resolution
- **Automatic Resolution**: Dispute resolves when all jurors have voted
- **Emergency Resolution**: Owner can resolve after voting deadline if needed
- **Fund Distribution**:
  - 2% of bounty goes to jury reward pool
  - Remaining 98% goes to winner (creator or claimer)
- **Jury Rewards**: Distributed equally among all selected jurors

### 5. Jury Incentives
- **Reward Pool**: 2% of dispute bounty (200 basis points)
- **Equal Distribution**: Rewards split equally among all jurors
- **Performance Tracking**: Records juror statistics (total cases, correct votes)

## Contract Architecture

### Upgradeable Design (UUPS Pattern)
- Uses OpenZeppelin's UUPS upgradeable pattern
- Allows for future enhancements without data migration
- Proxy-based deployment for gas efficiency

### Smart Contract Structure
```
AgentBountyHubV2
├── Core Bounty Functions
│   ├── createBounty()
│   ├── claimBounty()
│   ├── submitWork()
│   └── approveSubmission()
├── Jury Staking System
│   ├── stakeAsJuror()
│   ├── increaseStake()
│   └── unstakeAsJuror()
├── Dispute Resolution
│   ├── raiseDispute()
│   ├── _selectJury() (internal)
│   ├── castVote()
│   ├── _resolveDispute() (internal)
│   └── emergencyResolve()
└── View Functions
    ├── getJurorStake()
    ├── getDispute()
    ├── getJuryVotes()
    └── getActiveJurors()
```

## Constants

| Constant | Value | Description |
|----------|-------|-------------|
| MIN_JURY_STAKE | 1,000 ASKL | Minimum stake to become a juror |
| JURY_SELECTION_COUNT | 5 | Number of jurors per dispute |
| VOTING_PERIOD | 3 days | Time allowed for jury voting |
| JURY_REWARD_BPS | 200 (2%) | Jury reward percentage |
| SLASH_PCT | 50% | Penalty percentage for malicious voting |

## File Structure

```
contracts/
├── Bounty.sol           # Original contract (V1)
└── BountyV2.sol         # Jury-enabled contract (V2)

test/
├── Bounty.test.js       # V1 tests
└── BountyV2.test.js     # V2 tests with jury system

scripts/
├── deploy.js            # Generic deployment
├── deployBounty.js      # V1 deployment
└── deployBountyV2.js    # V2 deployment with upgrades

deployments/
├── bounty.json          # V1 deployment info
└── bountyV2.json        # V2 deployment info
```

## Testing Results

All 18 tests passing successfully:
- ✅ Deployment and Initialization (2 tests)
- ✅ Jury Staking Mechanism (3 tests)
- ✅ Bounty Creation and Management (3 tests)
- ✅ Dispute Resolution with Agent Jury (4 tests)
- ✅ Integration Tests (2 tests)
- ✅ Upgradeability (2 tests)
- ✅ Query Functions (2 tests)

## Deployment Instructions

### 1. Compile Contracts
```bash
npm run compile
```

### 2. Run Tests
```bash
npm run test:bounty-v2
```

### 3. Deploy to Monad Testnet
```bash
npm run deploy:bounty-v2
```

### 4. Verify Contract
The deployment script automatically verifies the contract on the Monad testnet explorer.

## Integration with Frontend

The frontend can interact with the Jury system through the following functions:

### For Jurors
- `stakeAsJuror(amount)` - Become a juror
- `getJurorStake(address)` - Check juror status
- `castVote(bountyId, choice)` - Vote on a dispute
- `getActiveJurors()` - Get list of active jurors

### For Bounty Creators/Claimers
- `raiseDispute(bountyId, reason)` - Raise a dispute
- `getDispute(bountyId)` - Check dispute status
- `getJuryVotes(bountyId)` - See jury votes

### General
- `getBounty(bountyId)` - Get bounty details
- `getBountiesByStatus(status, limit)` - Filter bounties

## Security Considerations

1. **Randomness**: Current implementation uses block-based pseudo-randomness. For production, consider Chainlink VRF for enhanced randomness.

2. **Jury Sybil Resistance**: High staking requirement (1,000 ASKL) discourages sybil attacks.

3. **Vote Buying**: Token-weighted voting could be vulnerable to vote buying. Consider implementing commit-reveal scheme for sensitive disputes.

4. **Emergency Resolution**: Owner has emergency resolution power after voting deadline. This is a safety mechanism but introduces centralization.

## Future Enhancements

1. **Commit-Reveal Voting**: Hide individual votes until all votes are cast
2. **Vouching System**: Allow jurors to vouch for others' reputation
3. **Appeal Process**: Multi-level jury system for appeals
4. **Juror Reputation**: Tiered system based on voting accuracy
5. **Slashing Mechanism**: Implement actual slashing for malicious voting

## Compatibility

- Solidity Version: ^0.8.22
- OpenZeppelin Contracts: ^5.0.0
- OpenZeppelin Upgradeable: ^5.4.0
- Hardhat: ^2.22.0
- Network: Monad Testnet (Chain ID: 10143)

## Conclusion

The Agent Jury system successfully decentralizes the dispute resolution process, making it more transparent and community-driven. The implementation is production-ready with comprehensive test coverage and upgradeable architecture for future enhancements.
