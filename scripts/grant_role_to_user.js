const { ethers } = require("hardhat");

async function main() {
  // Load deployed addresses
  const deployedAddresses = require("../deployed-addresses.json");
  
  if (!deployedAddresses.FToken) {
    throw new Error("FToken address not found in deployed-addresses.json");
  }

  // Your MetaMask address
  const YOUR_METAMASK_ADDRESS = "0xB61665F9336dd4E9FFb60F3d2a0010F4a7b938Bb";
  
  console.log("Granting BRIDGE_ROLE to your MetaMask:", YOUR_METAMASK_ADDRESS);
  console.log("FToken contract:", deployedAddresses.FToken);
  console.log("Deployer (admin):", deployedAddresses.deployer);

  // Create a provider and signer using the deployer's private key
  const provider = new ethers.providers.JsonRpcProvider(process.env.COSTON2_RPC_URL);
  const deployerSigner = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log("Using deployer account:", deployerSigner.address);
  
  // Get the FToken contract with the deployer signer
  const FToken = await ethers.getContractFactory("FToken");
  const fToken = FToken.attach(deployedAddresses.FToken).connect(deployerSigner);

  // Get BRIDGE_ROLE constant
  const BRIDGE_ROLE = await fToken.BRIDGE_ROLE();
  console.log("BRIDGE_ROLE:", BRIDGE_ROLE);

  // Check if deployer has admin role
  const DEFAULT_ADMIN_ROLE = await fToken.DEFAULT_ADMIN_ROLE();
  const hasAdminRole = await fToken.hasRole(DEFAULT_ADMIN_ROLE, deployerSigner.address);
  console.log("Deployer has admin role:", hasAdminRole);

  // Check if your address already has the role
  const alreadyHasRole = await fToken.hasRole(BRIDGE_ROLE, YOUR_METAMASK_ADDRESS);
  console.log("Your address already has BRIDGE_ROLE:", alreadyHasRole);

  if (alreadyHasRole) {
    console.log("✅ Your address already has BRIDGE_ROLE! You should be able to mint tokens.");
    return;
  }

  // Grant the role
  console.log("Granting BRIDGE_ROLE...");
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