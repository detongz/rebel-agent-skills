const hre = require("hardhat");

async function main() {
  console.log("Deploying AgentBountyHub...");

  // Get the ASKL token address (deploy MSKLToken first if not deployed)
  const asklAddress = process.env.ASKL_TOKEN_ADDRESS || process.env.NEXT_PUBLIC_ASKL_TOKEN_ADDRESS;

  if (!asklAddress) {
    console.error("Please set ASKL_TOKEN_ADDRESS or NEXT_PUBLIC_ASKL_TOKEN_ADDRESS in .env");
    process.exit(1);
  }

  // Deploy Bounty contract
  const AgentBountyHub = await hre.ethers.getContractFactory("AgentBountyHub");
  const bountyHub = await AgentBountyHub.deploy(asklAddress);

  await bountyHub.waitForDeployment();
  const address = await bountyHub.getAddress();

  console.log("AgentBountyHub deployed to:", address);

  // Verify contract on block explorer (if not local)
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("Waiting for block confirmations...");
    await bountyHub.deploymentTransaction().wait(6);

    console.log("Verifying contract...");
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [asklAddress],
    });
  }

  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    bountyHubAddress: address,
    asklTokenAddress: asklAddress,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    "./deployments/bounty.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment info saved to ./deployments/bounty.json");

  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });