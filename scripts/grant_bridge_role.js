const hre = require("hardhat");

async function main() {
  console.log("🔑 Checking and granting bridge role...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Using account:", deployer.address);

  // Load deployed contract addresses
  const deployedAddresses = require("../deployed-addresses.json");
  const fTokenAddress = deployedAddresses.FToken;
  
  console.log("FToken address:", fTokenAddress);

  // Get contract instance
  const fToken = await hre.ethers.getContractAt("FToken", fTokenAddress);

  // Check current roles
  const adminRole = await fToken.DEFAULT_ADMIN_ROLE();
  const bridgeRole = await fToken.BRIDGE_ROLE();
  
  const hasAdminRole = await fToken.hasRole(adminRole, deployer.address);
  const hasBridgeRole = await fToken.hasRole(bridgeRole, deployer.address);
  
  console.log("Admin role:", hasAdminRole);
  console.log("Bridge role:", hasBridgeRole);

  if (!hasBridgeRole) {
    console.log("\n🔧 Granting bridge role to deployer...");
    const tx = await fToken.addBridgeOperator(deployer.address);
    await tx.wait();
    console.log("✅ Bridge role granted!");
    
    // Verify
    const newBridgeRole = await fToken.hasRole(bridgeRole, deployer.address);
    console.log("Bridge role after grant:", newBridgeRole);
  } else {
    console.log("✅ Already has bridge role!");
  }

  console.log("\n🎯 Ready to mint tokens!");
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Failed:", error);
      process.exit(1);
    });
}

module.exports = main;