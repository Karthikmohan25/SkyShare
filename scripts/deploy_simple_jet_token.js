const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Simple Jet Token (No Bridge Role Required!)");
  console.log("=" .repeat(55));

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  
  const balance = await deployer.getBalance();
  console.log("Balance:", hre.ethers.utils.formatEther(balance), "C2FLR");

  // Deploy SimpleJetToken
  console.log("\n📦 Deploying SimpleJetToken...");
  const SimpleJetToken = await hre.ethers.getContractFactory("SimpleJetToken");
  const jetToken = await SimpleJetToken.deploy();
  await jetToken.deployed();
  
  console.log("✅ SimpleJetToken deployed to:", jetToken.address);
  
  // Check initial state
  const name = await jetToken.name();
  const symbol = await jetToken.symbol();
  const price = await jetToken.tokenPriceWei();
  const owner = await jetToken.owner();
  
  console.log("\n📋 Contract Details:");
  console.log("Name:", name);
  console.log("Symbol:", symbol);
  console.log("Price per token:", hre.ethers.utils.formatEther(price), "C2FLR");
  console.log("Owner:", owner);
  
  // Test calculation
  const oneEthWorth = await jetToken.calculateTokens(hre.ethers.utils.parseEther("1"));
  console.log("1 C2FLR buys:", hre.ethers.utils.formatEther(oneEthWorth), "JET tokens");

  // Save deployment info for frontend
  const deploymentInfo = {
    SimpleJetToken: jetToken.address,
    network: "coston2",
    deployer: deployer.address,
    tokenPriceEth: hre.ethers.utils.formatEther(price),
    deployedAt: new Date().toISOString()
  };

  const fs = require('fs');
  
  // Update the frontend's deployed addresses
  const frontendDeployment = {
    FToken: jetToken.address, // Use SimpleJetToken as FToken
    Distribution: "0x2FA7fE6ADC5df89F69ba29251517f4b6BaA592be", // Keep existing distribution
    network: "coston2",
    deployer: deployer.address
  };
  
  fs.writeFileSync('simple-jet-deployment.json', JSON.stringify(deploymentInfo, null, 2));
  fs.writeFileSync('skyshare_frontend/public/deployed-addresses.json', JSON.stringify(frontendDeployment, null, 2));
  
  console.log("\n💾 Deployment saved to simple-jet-deployment.json");
  console.log("💾 Frontend addresses updated");
  console.log("\n🔗 Explorer:");
  console.log(`https://coston2-explorer.flare.network/address/${jetToken.address}`);
  
  console.log("\n🎉 Ready for demo - NO BRIDGE_ROLE REQUIRED!");
  console.log("Users can now buy tokens directly with ETH!");
  
  return jetToken.address;
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Deployment failed:", error);
      process.exit(1);
    });
}

module.exports = main;