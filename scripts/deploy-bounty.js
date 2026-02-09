const { ethers } = require('ethers');
const contractData = require('../artifacts/contracts/Bounty.sol/AgentBountyHub.json');

const PRIVATE_KEY = '0x6ce0593a58a3a3d84c4b8a978a80ccba8448c258e6f9cbffb53c2284cde51004';
const RPC = 'https://testnet-rpc.monad.xyz';
const ASKL_TOKEN = '0xc1fFCAD15e2f181E49bFf2cBea79094eC9B5033A';

async function deploy() {
  console.log('🚀 Deploying AgentBountyHub to Monad testnet...\n');
  
  const provider = new ethers.JsonRpcProvider(RPC);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log('Deployer address:', wallet.address);
  console.log('ASKL Token address:', ASKL_TOKEN);
  
  const factory = new ethers.ContractFactory(contractData.abi, contractData.bytecode, wallet);
  const contract = await factory.deploy(ASKL_TOKEN);
  
  console.log('\n⏳ Waiting for deployment confirmation...');
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  console.log('\n✅ AgentBountyHub deployed to:', address);
  
  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    network: 'monadTestnet',
    chainId: 10143,
    bountyHubAddress: address,
    asklTokenAddress: ASKL_TOKEN,
    deployer: wallet.address,
    deployedAt: new Date().toISOString(),
    transactionHash: contract.deploymentTransaction().hash
  };
  
  fs.writeFileSync('./deployments/bounty.json', JSON.stringify(deploymentInfo, null, 2));
  console.log('\n📄 Deployment info saved to ./deployments/bounty.json');
  console.log('\n🎉 Deployment complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Add to .env: BOUNTY_HUB_CONTRACT_ADDRESS=' + address);
  console.log('2. Update MCP Server with new contract address');
  console.log('3. Test contract functions');
}

deploy().catch(console.error);
