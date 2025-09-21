const hre = require("hardhat");

async function main() {
  console.log("🔑 Granting BRIDGE_ROLE to Current User");
  console.log("=" .repeat(40));

  const [currentUser] = await hre.ethers.getSigners();
  console.log("Current User:", currentUser.address);
  
  // Connect to deployed FToken
  const fTokenAddress = "0x3D75d086a1236adb8FD0Ab962AafB9547c23201E";
  const fToken = await hre.ethers.getContractAt("FToken", fTokenAddress);
  
  console.log("FToken Contract:", fTokenAddress);

  // Check roles
  const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
  const BRIDGE_ROLE = hre.ethers.utils.keccak256(hre.ethers.utils.toUtf8Bytes("BRIDGE_ROLE"));

  console.log("\n🔍 Checking Current Roles:");
  const hasAdminRole = await fToken.hasRole(DEFAULT_ADMIN_ROLE, currentUser.address);
  const hasBridgeRole = await fToken.hasRole(BRIDGE_ROLE, currentUser.address);
  
  console.log("Has ADMIN_ROLE:", hasAdminRole);
  console.log("Has BRIDGE_ROLE:", hasBridgeRole);

  if (hasBridgeRole) {
    console.log("\n✅ You already have BRIDGE_ROLE!");
    return;
  }

  if (!hasAdminRole) {
    console.log("\n❌ You don't have ADMIN_ROLE. Cannot grant BRIDGE_ROLE.");
    console.log("The contract deployer needs to grant you BRIDGE_ROLE.");
    return;
  }

  console.log("\n🚀 Granting BRIDGE_ROLE...");
  try {
    const tx = await fToken.grantRole(BRIDGE_ROLE, currentUser.address);
    console.log("Transaction Hash:", tx.hash);
    await tx.wait();
    
    console.log("✅ BRIDGE_ROLE granted successfully!");
    
    // Verify
    const newHasBridgeRole = await fToken.hasRole(BRIDGE_ROLE, currentUser.address);
    console.log("Verification - Has BRIDGE_ROLE:", newHasBridgeRole);
    
  } catch (error) {
    console.error("❌ Failed to grant BRIDGE_ROLE:", error.message);
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Script failed:", error);
      process.exit(1);
    });
}

module.exports = main;