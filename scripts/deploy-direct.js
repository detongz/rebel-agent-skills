const { ethers } = require("ethers");
const dotenv = require("dotenv");

dotenv.config();

// Monad Testnet configuration
const MONAD_TESTNET = {
  chainId: 10143,
  name: "Monad Testnet",
  rpcUrl: "https://testnet-rpc.monad.xyz",
};

async function main() {
  console.log("Starting deployment to Monad Testnet...");

  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("PRIVATE_KEY not set in .env file");
  }

  // Create provider and wallet
  const provider = new ethers.JsonRpcProvider(MONAD_TESTNET.rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("Deploying contracts with account:", wallet.address);

  // Get balance
  const balance = await provider.getBalance(wallet.address);
  console.log("Account balance:", ethers.formatEther(balance), "MON");

  if (balance === 0n) {
    throw new Error("Insufficient balance. Please get testnet MON from faucet.");
  }

  // Contract bytecode and ABI
  const contractABI = [
    "constructor(address platformWallet)",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function creatorRewardBps() view returns (uint256)",
  ];

  // Read compiled contract
  const fs = require("fs");
  const contractPath = "./artifacts/contracts/MSKLToken.sol/ASKLToken.json";
  const contractData = JSON.parse(fs.readFileSync(contractPath, "utf8"));

  // Deploy contract
  console.log("\nDeploying ASKLToken...");
  const platformWallet = wallet.address;

  const factory = new ethers.ContractFactory(
    contractData.abi,
    contractData.bytecode,
    wallet
  );

  const contract = await factory.deploy(platformWallet);
  const address = await contract.getAddress();

  console.log("\n✅ ASKLToken deployed to:", address);
  console.log("Transaction hash:", contract.deploymentTransaction()?.hash);

  // Wait for confirmations
  console.log("\nWaiting for block confirmations...");
  await contract.deploymentTransaction()?.wait(3);

  console.log("\n=== Deployment Summary ===");
  console.log("Network: Monad Testnet (Chain ID: 10143)");
  console.log("ASKLToken Address:", address);
  console.log("Platform Wallet:", platformWallet);
  console.log("Explorer:", `https://testnet.monadvision.com/address/${address}`);

  // Verify contract
  console.log("\n=== Verifying Contract ===");
  const name = await contract.name();
  const symbol = await contract.symbol();
  const totalSupply = await contract.totalSupply();
  const creatorRewardBps = await contract.creatorRewardBps();

  console.log("Token Name:", name);
  console.log("Token Symbol:", symbol);
  console.log("Total Supply:", ethers.formatEther(totalSupply));
  console.log("Creator Reward BPS:", creatorRewardBps.toString());

  console.log("\n=== Environment Variables ===");
  console.log("Add this to your .env file:");
  console.log(`NEXT_PUBLIC_ASKL_TOKEN_ADDRESS=${address}`);
  console.log(`MYSKILLS_CONTRACT_ADDRESS=${address}`);

  // Update .env file
  const envPath = "/Users/zhangdetong/Documents/workspace/gzh/agent-reward-hub/.env";
  let envContent = fs.readFileSync(envPath, "utf8");
  envContent = envContent.replace(/NEXT_PUBLIC_ASKL_TOKEN_ADDRESS=.*/g, `NEXT_PUBLIC_ASKL_TOKEN_ADDRESS=${address}`);
  envContent = envContent.replace(/MYSKILLS_CONTRACT_ADDRESS=.*/g, `MYSKILLS_CONTRACT_ADDRESS=${address}`);
  fs.writeFileSync(envPath, envContent);

  console.log("\n✅ .env file updated!");
  console.log("\n✅ Deployment completed successfully!");

  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
