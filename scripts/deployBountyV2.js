const hre = require("hardhat");
const { upgrades } = require("@openzeppelin/hardhat-upgrades");
const fs = require("fs");

async function main() {
  console.log("\n🚀 Deploying AgentBountyHubV2 with Agent Jury System...\n");

  // Get the ASKL token address
  const asklAddress = process.env.ASKL_TOKEN_ADDRESS ||
                      process.env.NEXT_PUBLIC_ASKL_TOKEN_ADDRESS ||
                      "0xc1fFCAD15e2f181E49bFf2cBea79094eC9B5033A"; // Default to deployed address

  if (!asklAddress) {
    console.error("❌ Please set ASKL_TOKEN_ADDRESS in .env");
    process.exit(1);
  }

  console.log("📋 ASKL Token Address:", asklAddress);

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deployer Address:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account Balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Check if upgrading existing deployment
  const existingDeployment = "./deployments/bounty.json";
  let existingAddress = null;

  if (fs.existsSync(existingDeployment)) {
    const deploymentData = JSON.parse(fs.readFileSync(existingDeployment, "utf8"));
    existingAddress = deploymentData.bountyHubAddress;
    console.log("📦 Existing Bounty Hub Address:", existingAddress);
  }

  // Deploy BountyV2 as UUPS upgradeable contract
  console.log("⏳ Deploying AgentBountyHubV2...");

  const AgentBountyHubV2 = await hre.ethers.getContractFactory("AgentBountyHubV2");

  let proxyAddress;

  if (existingAddress) {
    // Upgrade existing proxy
    console.log("🔄 Upgrading existing proxy to V2...");

    try {
      const proxy = await upgrades.upgradeProxy(
        existingAddress,
        AgentBountyHubV2,
        {
          callFn: "initialize",
          callArgs: [asklAddress, deployer.address],
        }
      );

      proxyAddress = await proxy.getAddress();
      console.log("✅ Proxy upgraded to V2 at:", proxyAddress);

    } catch (error) {
      console.log("⚠️  Upgrade failed, deploying new proxy instead...");
      console.log("   Error:", error.message);

      // Deploy new proxy
      const proxy = await upgrades.deployProxy(
        AgentBountyHubV2,
        [asklAddress, deployer.address],
        { kind: "uups", initializer: "initialize" }
      );

      await proxy.waitForDeployment();
      proxyAddress = await proxy.getAddress();
      console.log("✅ New proxy deployed at:", proxyAddress);
    }
  } else {
    // Deploy new proxy
    console.log("🆕 Deploying new proxy...");

    const proxy = await upgrades.deployProxy(
      AgentBountyHubV2,
      [asklAddress, deployer.address],
      { kind: "uups", initializer: "initialize" }
    );

    await proxy.waitForDeployment();
    proxyAddress = await proxy.getAddress();
    console.log("✅ Proxy deployed at:", proxyAddress);
  }

  // Get implementation address
  const implAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log("📍 Implementation Address:", implAddress);

  // Verify contract initialization
  const bountyHub = AgentBountyHubV2.attach(proxyAddress);

  console.log("\n📊 Contract Info:");
  console.log("  - Version:", await bountyHub.version());
  console.log("  - ASKL Token:", await bountyHub.getAskLToken());
  console.log("  - Owner:", await bountyHub.owner());
  console.log("  - Total Bounties:", (await bountyHub.getTotalBounties()).toString());
  console.log("  - Total Jurors:", (await bountyHub.getTotalJurors()).toString());

  // Verify on block explorer
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("\n⏳ Waiting for block confirmations...");
    await bountyHub.deploymentTransaction().wait(6);

    console.log("🔍 Verifying implementation contract...");
    try {
      await hre.run("verify:verify", {
        address: implAddress,
        constructorArguments: [asklAddress],
      });
      console.log("✅ Implementation verified!");
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log("✅ Contract already verified");
      } else {
        console.log("⚠️  Verification failed:", error.message);
      }
    }
  }

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId,
    proxyAddress: proxyAddress,
    implementationAddress: implAddress,
    asklTokenAddress: asklAddress,
    deployer: deployer.address,
    version: "V2-AgentJury",
    deployedAt: new Date().toISOString(),
    features: [
      "Jury Staking Mechanism (min 1000 ASKL)",
      "Random Jury Selection (3-7 jurors)",
      "Token-Weighted Voting",
      "Dispute Resolution (3-day voting period)",
      "Jury Incentives (5% reward pool)"
    ]
  };

  const deploymentFile = "./deployments/bountyV2.json";
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n💾 Deployment info saved to", deploymentFile);

  // Output integration info
  console.log("\n" + "=".repeat(60));
  console.log("📋 Frontend Integration Configuration:");
  console.log("=".repeat(60));
  console.log(`NEXT_PUBLIC_BOUNTY_HUB_ADDRESS=${proxyAddress}`);
  console.log(`NEXT_PUBLIC_CONTRACT_VERSION=V2-AgentJury`);
  console.log(`NEXT_PUBLIC_CHAIN_ID=${deploymentInfo.chainId}`);
  console.log("=".repeat(60) + "\n");

  console.log("🎉 Deployment completed successfully!\n");

  return {
    proxyAddress,
    implementationAddress: implAddress,
    deploymentInfo
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
