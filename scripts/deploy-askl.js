const hre = require("hardhat");

async function main() {
  console.log("Starting deployment to Monad Testnet...");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Get balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "MON");

  // Deploy ASKLToken contract
  console.log("\nDeploying ASKLToken...");
  const platformWallet = deployer.address; // Use deployer as platform wallet initially

  const ASKLToken = await hre.ethers.getContractFactory("ASKLToken");
  const token = await ASKLToken.deploy(platformWallet);

  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();

  console.log("\n✅ ASKLToken deployed to:", tokenAddress);
  console.log("Transaction hash:", token.deploymentTransaction()?.hash);

  // Wait for a few block confirmations
  console.log("\nWaiting for block confirmations...");
  await token.deploymentTransaction()?.wait(5);

  console.log("\n=== Deployment Summary ===");
  console.log("Network: Monad Testnet (Chain ID: 10143)");
  console.log("ASKLToken Address:", tokenAddress);
  console.log("Platform Wallet:", platformWallet);
  console.log("Explorer:", `https://testnet.monadvision.com/address/${tokenAddress}`);

  // Verify contract functionality
  console.log("\n=== Verifying Contract ===");
  const name = await token.name();
  const symbol = await token.symbol();
  const totalSupply = await token.totalSupply();
  const creatorRewardBps = await token.creatorRewardBps();

  console.log("Token Name:", name);
  console.log("Token Symbol:", symbol);
  console.log("Total Supply:", hre.ethers.formatEther(totalSupply));
  console.log("Creator Reward BPS:", creatorRewardBps.toString());

  console.log("\n=== Environment Variables ===");
  console.log("Add this to your .env file:");
  console.log(`NEXT_PUBLIC_ASKL_TOKEN_ADDRESS=${tokenAddress}`);
  console.log(`MYSKILLS_CONTRACT_ADDRESS=${tokenAddress}`);

  return tokenAddress;
}

main()
  .then((address) => {
    console.log("\n✅ Deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
