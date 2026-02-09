#!/bin/bash

# Agent Reward Hub - Smart Contract Quick Deploy Script
# This script deploys both ASKL Token and Bounty Hub contracts

set -e

echo "🚀 Agent Reward Hub - Smart Contract Deployment"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    echo "Please create .env file with:"
    echo "  MONAD_RPC_URL=https://testnet-rpc.monad.xyz"
    echo "  PRIVATE_KEY=your_private_key_here"
    exit 1
fi

# Load environment variables
source .env

# Check required variables
if [ -z "$PRIVATE_KEY" ]; then
    echo -e "${RED}Error: PRIVATE_KEY not set in .env${NC}"
    exit 1
fi

# Create deployments directory
mkdir -p deployments

echo -e "${YELLOW}Step 1: Compiling contracts...${NC}"
npm run compile

echo ""
echo -e "${YELLOW}Step 2: Deploying ASKL Token...${NC}"
npx hardhat run scripts/deploy.js --network monad

if [ -f deployments/token.json ]; then
    ASKL_ADDRESS=$(cat deployments/token.json | grep -o '"tokenAddress":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✅ ASKL Token deployed: $ASKL_ADDRESS${NC}"

    # Update .env with token address
    echo "ASKL_TOKEN_ADDRESS=$ASKL_ADDRESS" >> .env
else
    echo -e "${RED}❌ Token deployment failed${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 3: Deploying Bounty Hub...${NC}"
npm run deploy:bounty

if [ -f deployments/bounty.json ]; then
    BOUNTY_ADDRESS=$(cat deployments/bounty.json | grep -o '"bountyHubAddress":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Bounty Hub deployed: $BOUNTY_ADDRESS${NC}"
else
    echo -e "${RED}❌ Bounty Hub deployment failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Deployment Successful!${NC}"
echo ""
echo "Contract Addresses:"
echo "  ASKL Token:  $ASKL_ADDRESS"
echo "  Bounty Hub:   $BOUNTY_ADDRESS"
echo ""
echo "Next steps:"
echo "  1. Add these to frontend/.env.local:"
echo "     NEXT_PUBLIC_ASKL_TOKEN_ADDRESS=$ASKL_ADDRESS"
echo "     NEXT_PUBLIC_BOUNTY_HUB_ADDRESS=$BOUNTY_ADDRESS"
echo ""
echo "  2. View on explorer:"
echo "     https://testnet-explorer.monad.xyz/address/$ASKL_ADDRESS"
echo "     https://testnet-explorer.monad.xyz/address/$BOUNTY_ADDRESS"
echo ""
echo "  3. Run tests:"
echo "     npm run test:bounty"
echo ""
echo -e "${YELLOW}⚠️  Save your deployment addresses!${NC}"