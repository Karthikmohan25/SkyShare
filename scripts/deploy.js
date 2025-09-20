const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying SKY-SHARE Bridge Contracts...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", hre.ethers.utils.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy FToken (fSKY)
  console.log("📄 Deploying FToken (fSKY)...");
  const FToken = await hre.ethers.getContractFactory("FToken");
  const fToken = await FToken.deploy();
  await fToken.deployed();
  const fTokenAddress = fToken.address;
  console.log("✅ FToken deployed to:", fTokenAddress);

  // Deploy Distribution contract
  console.log("\n📄 Deploying Distribution contract...");
  const Distribution = await hre.ethers.getContractFactory("Distribution");
  const distribution = await Distribution.deploy(fTokenAddress, deployer.address);
  await distribution.deployed();
  const distributionAddress = distribution.address;
  console.log("✅ Distribution deployed to:", distributionAddress);

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    contracts: {
      FToken: fTokenAddress,
      Distribution: distributionAddress
    },
    timestamp: new Date().toISOString()
  };

  console.log("\n📋 Deployment Summary:");
  console.log("=".repeat(50));
  console.log("Network:", deploymentInfo.network);
  console.log("Deployer:", deploymentInfo.deployer);
  console.log("FToken (fSKY):", deploymentInfo.contracts.FToken);
  console.log("Distribution:", deploymentInfo.contracts.Distribution);
  console.log("=".repeat(50));

  // Verify contracts are working
  console.log("\n🔍 Verifying deployments...");
  
  const tokenName = await fToken.name();
  const tokenSymbol = await fToken.symbol();
  const hasAdminRole = await fToken.hasRole(await fToken.DEFAULT_ADMIN_ROLE(), deployer.address);
  const hasBridgeRole = await fToken.hasRole(await fToken.BRIDGE_ROLE(), deployer.address);
  
  console.log("Token name:", tokenName);
  console.log("Token symbol:", tokenSymbol);
  console.log("Deployer has admin role:", hasAdminRole);
  console.log("Deployer has bridge role:", hasBridgeRole);
  
  const distributionOwner = await distribution.owner();
  const linkedToken = await distribution.fSkyToken();
  
  console.log("Distribution owner:", distributionOwner);
  console.log("Linked token:", linkedToken);
  console.log("Addresses match:", linkedToken === fTokenAddress);

  // Write deployment addresses to file
  const fs = require('fs');
  const deployedAddresses = {
    FToken: fTokenAddress,
    Distribution: distributionAddress,
    network: hre.network.name,
    deployer: deployer.address
  };
  
  fs.writeFileSync('deployed-addresses.json', JSON.stringify(deployedAddresses, null, 2));
  console.log("\n📄 Deployed addresses saved to deployed-addresses.json");

  console.log("\n✅ All contracts deployed and verified successfully!");
  
  return deploymentInfo;
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