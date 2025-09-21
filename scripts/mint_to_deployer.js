const hre = require("hardhat");

async function main() {
  console.log("💰 Minting tokens to deployer for testing...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  // Load deployed contract addresses
  const deployedAddresses = require("../deployed-addresses.json");
  const fToken = await hre.ethers.getContractAt("FToken", deployedAddresses.FToken);

  // Mint tokens to deployer
  const amount = hre.ethers.utils.parseEther("2000");
  const xrplTxHash = "0xTEST_DEPLOYER_MINT_" + Date.now();
  
  console.log("Minting 2000 fSKY to deployer...");
  const tx = await fToken.mint(deployer.address, amount, xrplTxHash);
  await tx.wait();
  
  const balance = await fToken.balanceOf(deployer.address);
  console.log("✅ Deployer balance:", hre.ethers.utils.formatEther(balance), "fSKY");
  
  const totalSupply = await fToken.totalSupply();
  console.log("📊 Total supply:", hre.ethers.utils.formatEther(totalSupply), "fSKY");
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