const { ethers } = require("hardhat");

async function main() {
  // Load deployed addresses
  const deployedAddresses = require("../deployed-addresses.json");
  
  if (!deployedAddresses.FToken) {
    throw new Error("FToken address not found in deployed-addresses.json");
  }

  // Get the FToken contract
  const FToken = await ethers.getContractFactory("FToken");
  const fToken = FToken.attach(deployedAddresses.FToken);

  console.log("FToken contract:", deployedAddresses.FToken);
  
  // Get current signer
  const [signer] = await ethers.getSigners();
  console.log("Current signer:", signer.address);

  // Get role constants
  const DEFAULT_ADMIN_ROLE = await fToken.DEFAULT_ADMIN_ROLE();
  const BRIDGE_ROLE = await fToken.BRIDGE_ROLE();
  
  console.log("DEFAULT_ADMIN_ROLE:", DEFAULT_ADMIN_ROLE);
  console.log("BRIDGE_ROLE:", BRIDGE_ROLE);

  // Check if current signer has admin role
  const hasAdminRole = await fToken.hasRole(DEFAULT_ADMIN_ROLE, signer.address);
  console.log("Current signer has DEFAULT_ADMIN_ROLE:", hasAdminRole);

  // Check if current signer has bridge role
  const hasBridgeRole = await fToken.hasRole(BRIDGE_ROLE, signer.address);
  console.log("Current signer has BRIDGE_ROLE:", hasBridgeRole);

  // Check the target address
  const targetAddress = process.env.GRANT_TO || "0xB40B1D95058857Da46f8498659b422EE9965CEb6";
  const targetHasBridgeRole = await fToken.hasRole(BRIDGE_ROLE, targetAddress);
  console.log(`Target ${targetAddress} has BRIDGE_ROLE:`, targetHasBridgeRole);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });