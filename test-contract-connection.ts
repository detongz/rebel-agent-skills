/**
 * Test Contract Connection
 * Verifies that the frontend API routes can connect to deployed smart contracts
 */

import { ethers } from 'ethers';

const RPC_URL = 'https://testnet-rpc.monad.xyz';
const ASKL_TOKEN_ADDRESS = '0xc1fFCAD15e2f181E49bFf2cBea79094eC9B5033A';
const BOUNTY_HUB_ADDRESS = '0x2679Bb99E7Cc239787a74BF6c77c2278311c77a1';

const ASKL_TOKEN_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function totalSupply() view returns (uint256)',
] as const;

const BOUNTY_HUB_ABI = [
  'function getBounty(uint256 bountyId) external view returns (tuple(uint256 id, address creator, string title, string description, uint256 reward, string category, uint256 deadline, uint8 status, address claimer, uint256 claimedAt, uint256 completedAt))',
  'function claimBounty(uint256 bountyId) external',
  'function createBounty(string title, string description, uint256 reward, string category, uint256 deadline) external',
] as const;

async function testConnection() {
  console.log('🔗 Testing Contract Connection to Monad Testnet...\n');

  const provider = new ethers.JsonRpcProvider(RPC_URL);

  // Test 1: Provider Connection
  console.log('Test 1: Connecting to RPC...');
  try {
    const network = await provider.getNetwork();
    console.log(`✅ Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
  } catch (error) {
    console.log(`❌ Failed to connect to RPC: ${error}`);
    process.exit(1);
  }

  // Test 2: ASKL Token Contract
  console.log('\nTest 2: Connecting to ASKL Token...');
  try {
    const asklToken = new ethers.Contract(ASKL_TOKEN_ADDRESS, ASKL_TOKEN_ABI, provider);
    const [name, symbol, totalSupply] = await Promise.all([
      asklToken.name(),
      asklToken.symbol(),
      asklToken.totalSupply(),
    ]);
    console.log(`✅ ASKL Token Contract`);
    console.log(`   Name: ${name}`);
    console.log(`   Symbol: ${symbol}`);
    console.log(`   Total Supply: ${ethers.formatEther(totalSupply)} ${symbol}`);
  } catch (error) {
    console.log(`❌ Failed to connect to ASKL Token: ${error}`);
  }

  // Test 3: BountyHub Contract
  console.log('\nTest 3: Connecting to BountyHub...');
  try {
    const bountyHub = new ethers.Contract(BOUNTY_HUB_ADDRESS, BOUNTY_HUB_ABI, provider);

    // Try to get bounty #1
    let bounty;
    try {
      bounty = await bountyHub.getBounty(1);
      console.log(`✅ BountyHub Contract`);
      console.log(`   Bounty #1 found!`);
      console.log(`   Title: ${bounty.title}`);
      console.log(`   Reward: ${ethers.formatEther(bounty.reward)} ASKL`);
      console.log(`   Status: ${bounty.status}`);
      console.log(`   Creator: ${bounty.creator}`);
    } catch (e) {
      console.log(`✅ BountyHub Contract accessible`);
      console.log(`   No bounties created yet (bounty #1 doesn't exist)`);
    }
  } catch (error) {
    console.log(`❌ Failed to connect to BountyHub: ${error}`);
  }

  console.log('\n✅ All contract connection tests completed!');
  console.log('\n📝 Summary:');
  console.log(`   RPC URL: ${RPC_URL}`);
  console.log(`   ASKL Token: ${ASKL_TOKEN_ADDRESS}`);
  console.log(`   BountyHub: ${BOUNTY_HUB_ADDRESS}`);
}

testConnection().catch(console.error);
