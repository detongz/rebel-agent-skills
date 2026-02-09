import { ethers } from "hardhat";

async function main() {
  console.log("=== Creating New Wallet for Monad Testnet ===\n");

  // Generate a random wallet
  const wallet = ethers.Wallet.createRandom();

  console.log("✅ New wallet created!");
  console.log("\n📝 SAVE THIS INFORMATION SECURELY:");
  console.log("=".repeat(50));
  console.log("Address:", wallet.address);
  console.log("Private Key:", wallet.privateKey);
  console.log("Mnemonic:", wallet.mnemonic?.phrase);
  console.log("=".repeat(50));

  console.log("\n=== Next Steps ===");
  console.log("1. Add this to your .env file:");
  console.log(`   PRIVATE_KEY=${wallet.privateKey}`);
  console.log("\n2. Get testnet MON from:");
  console.log("   https://faucet.monad.xyz/");
  console.log(`   Or: https://testnet.monadvision.com/address/${wallet.address}`);
  console.log("\n3. After receiving tokens, run:");
  console.log("   npm run deploy");

  return wallet;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
