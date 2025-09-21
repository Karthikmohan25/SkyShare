const hre = require("hardhat");

async function main() {
  console.log("🧪 Testing mint function...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Using account:", deployer.address);

  // Load deployed contract addresses
  const deployedAddresses = require("../deployed-addresses.json");
  const fTokenAddress = deployedAddresses.FToken;
  
  console.log("FToken address:", fTokenAddress);

  // Get contract instance
  const fToken = await hre.ethers.getContractAt("FToken", fTokenAddress);

  // Check current balance
  const balanceBefore = await fToken.balanceOf(deployer.address);
  console.log("Balance before:", hre.ethers.utils.formatEther(balanceBefore), "fSKY");

  // Try to mint
  const amount = hre.ethers.utils.parseEther("1");
  const xrplTxHash = "0x" + Math.random().toString(16).substr(2, 64);
  
  console.log("Minting 1 fSKY...");
  console.log("XRPL Tx Hash:", xrplTxHash);

  try {
    const tx = await fToken.mint(deployer.address, amount, xrplTxHash);
    console.log("Transaction hash:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("✅ Mint successful! Gas used:", receipt.gasUsed.toString());
    
    // Check new balance
    const balanceAfter = await fToken.balanceOf(deployer.address);
    console.log("Balance after:", hre.ethers.utils.formatEther(balanceAfter), "fSKY");
    
  } catch (error) {
    console.error("❌ Mint failed:", error.message);
    
    // Try to get more details
    if (error.reason) {
      console.error("Reason:", error.reason);
    }
    if (error.code) {
      console.error("Code:", error.code);
    }
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