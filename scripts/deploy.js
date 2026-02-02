const hre = require("hardhat");

async function main() {
  console.log("\n🚀 开始部署 $ASKL 代币合约到 Monad 测试网...\n");

  // 获取部署者账户
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 部署账户地址:", deployer.address);

  // 获取账户余额
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 账户余额:", hre.ethers.formatEther(balance), "ETH\n");

  // 部署合约
  console.log("⏳ 正在部署 ASKLToken 合约...");
  const ASKLToken = await hre.ethers.getContractFactory("ASKLToken");

  // platformWallet 设置为部署者地址（测试网期间）
  const platformWallet = deployer.address;

  const token = await ASKLToken.deploy(platformWallet);
  await token.waitForDeployment();

  const tokenAddress = await token.getAddress();
  console.log("✅ 合约部署成功!");
  console.log("📍 合约地址:", tokenAddress);
  console.log("📋 合约 Etherscan (如果支持):", `https://testnet-explorer.monad.xyz/address/${tokenAddress}\n`);

  // 验证初始参数
  console.log("📊 合约初始参数:");
  console.log("  - 代币名称:", await token.name());
  console.log("  - 代币符号:", await token.symbol());
  console.log("  - 初始总量:", hre.ethers.formatEther(await token.totalSupply()), "ASKL");
  console.log("  - 平台钱包:", await token.platformWallet());
  console.log("  - 创作者奖励比例:", (await token.creatorRewardBps()).toString(), "bps (", (await token.creatorRewardBps()) / 100, "%)\n");

  // 注册示例 Skill（测试用）
  console.log("🎯 注册示例 Skill...");
  const skillId = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("claude-code-copilot-v1"));
  await token.registerSkill(skillId, "Claude Code Copilot", deployer.address);
  console.log("✅ Skill 已注册:", skillId.slice(0, 10) + "...");

  const creator = await token.getSkillCreator(skillId);
  console.log("  - 创作者地址:", creator);

  console.log("\n🎉 部署完成!\n");

  // 输出部署信息（用于前端集成）
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("📋 前端集成配置:");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${tokenAddress}`);
  console.log(`NEXT_PUBLIC_CHAIN_ID=41454`);
  console.log(`NEXT_PUBLIC_RPC_URL=https://testnet-rpc.monad.xyz`);
  console.log(`NEXT_PUBLIC_EXPLORER_URL=https://testnet-explorer.monad.xyz`);
  console.log("═══════════════════════════════════════════════════════════════\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
