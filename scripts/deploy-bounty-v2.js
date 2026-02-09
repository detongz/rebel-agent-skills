const { ethers } = require('ethers');

async function deployBountyV2() {
  // Configuration
  const PRIVATE_KEY = '0x6ce0593a58a3a3d84c4b8a978a80ccba8448c258e6f9cbffb53c2284cde51004';
  const RPC_URL = 'https://testnet-rpc.monad.xyz';
  const ASKL_TOKEN_ADDRESS = '0xc1fFCAD15e2f181E49bFf2cBea79094eC9B5033A';

  console.log('🚀 Deploying AgentBountyHubV2 with Agent Jury to Monad Testnet...\n');

  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log('Deployer address:', wallet.address);

  // Load contract artifact
  const contractData = require('../artifacts/contracts/BountyV2.sol/AgentBountyHubV2.json');
  const abi = contractData.abi;
  const bytecode = contractData.bytecode;

  // Deploy contract (UUPS pattern)
  console.log('\nDeploying AgentBountyHubV2...');
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy(ASKL_TOKEN_ADDRESS);

  // Wait for deployment
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log('\n✅ AgentBountyHubV2 deployed successfully!');
  console.log('Contract address:', address);
  console.log('Transaction hash:', contract.deploymentTransaction().hash);

  // Initialize the contract
  console.log('\nInitializing contract...');
  const initTx = await contract.initialize(wallet.address);
  await initTx.wait();
  console.log('✅ Contract initialized');

  // Verify contract
  console.log('\nVerifying deployment...');
  const code = await provider.getCode(address);
  if (code === '0x') {
    console.log('⚠️  Warning: No contract code at address!');
  } else {
    console.log('✅ Contract code verified at address');
  }

  // Test key functions
  console.log('\n🧪 Testing contract functions...');

  const minStake = await contract.getMinJuryStake();
  console.log('  Minimum jury stake:', ethers.formatEther(minStake), 'ASKL');

  const juryCount = await contract.getJurySelectionCount();
  console.log('  Jurors per dispute:', juryCount.toString());

  const votingPeriod = await contract.getVotingPeriod();
  console.log('  Voting period:', (votingPeriod / 86400).toString(), 'days');

  const rewardBps = await contract.getJuryRewardBps();
  console.log('  Jury reward:', (rewardBps / 100).toString(), '%');

  // Output configuration
  console.log('\n📝 Add this to your .env file:');
  console.log(`BOUNTY_HUB_V2_ADDRESS=${address}`);

  return address;
}

deployBountyV2()
  .then((address) => {
    console.log('\n🎉 Deployment complete!');
    console.log('BountyHub V2 address:', address);
  })
  .catch((error) => {
    console.error('\n❌ Deployment failed:', error);
    process.exit(1);
  });
