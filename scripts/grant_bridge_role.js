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

  // Get the address from environment variable or use the one from .env
  const YOUR_METAMASK_ADDRESS = process.env.GRANT_TO || "0xB40B1D95058857Da46f8498659b422EE9965CEb6"; // Default to deployer
  
  if (!YOUR_METAMASK_ADDRESS || YOUR_METAMASK_ADDRESS === "0xB616...38Bb") {
    console.error("❌ Please set GRANT_TO environment variable with your MetaMask address");
    console.error("Example: export GRANT_TO=0xYourMetaMaskAddress");
    process.exit(1);
  }
  
  console.log("Granting BRIDGE_ROLE to:", YOUR_METAMASK_ADDRESS);
  console.log("FToken contract:", deployedAddresses.FToken);

  // Get BRIDGE_ROLE constant
  const BRIDGE_ROLE = await fToken.BRIDGE_ROLE();
  console.log("BRIDGE_ROLE:", BRIDGE_ROLE);

  // Grant the role
  const tx = await fToken.grantRole(BRIDGE_ROLE, YOUR_METAMASK_ADDRESS);
  console.log("Transaction sent:", tx.hash);
  
  await tx.wait();
  console.log("✅ BRIDGE_ROLE granted successfully!");
  
  // Verify the role was granted
  const hasRole = await fToken.hasRole(BRIDGE_ROLE, YOUR_METAMASK_ADDRESS);
  console.log("Verification - Has BRIDGE_ROLE:", hasRole);
  
  console.log("🔗 Explorer:", `https://coston2-explorer.flare.network/tx/${tx.hash}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });