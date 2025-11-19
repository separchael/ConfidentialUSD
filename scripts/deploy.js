const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying ShadowStablecoinMint contract to Sepolia...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Deploy contract
  const ShadowStablecoinMint = await hre.ethers.getContractFactory("ShadowStablecoinMint");
  const contract = await ShadowStablecoinMint.deploy();

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("✅ ShadowStablecoinMint deployed to:", contractAddress);

  // Read contract state
  const name = await contract.name();
  const symbol = await contract.symbol();
  const decimals = await contract.decimals();
  const owner = await contract.owner();
  const faucetAmount = await contract.faucetAmount();
  const faucetCooldown = await contract.faucetCooldown();

  console.log("\n📊 Contract Details:");
  console.log("  Name:", name);
  console.log("  Symbol:", symbol);
  console.log("  Decimals:", decimals);
  console.log("  Owner:", owner);
  console.log("  Faucet Amount:", hre.ethers.formatUnits(faucetAmount, decimals), symbol);
  console.log("  Faucet Cooldown:", Number(faucetCooldown) / 3600, "hours");

  console.log("\n📋 Deployment Summary:");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", (await hre.ethers.provider.getNetwork()).chainId);

  console.log("\n🔧 Update frontend/src/constants/contracts.ts:");
  console.log(`export const STABLECOIN_ADDRESS: Address = "${contractAddress}";`);

  console.log("\n✅ Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
