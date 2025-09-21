const hre = require("hardhat");

async function main() {
  console.log("🧪 Testing BigInt handling for frontend...\n");

  // Load deployed contract addresses
  const deployedAddresses = require("../deployed-addresses.json");
  const distribution = await hre.ethers.getContractAt("Distribution", deployedAddresses.Distribution);

  // Test currentRound return type
  const currentRound = await distribution.currentRound();
  
  console.log("📊 Current round info:");
  console.log("Type:", typeof currentRound);
  console.log("Value:", currentRound.toString());
  console.log("Is BigInt:", typeof currentRound === 'bigint');
  
  // Test comparisons that frontend will use
  console.log("\n🔍 BigInt comparison tests:");
  console.log("currentRound === 0n:", currentRound === 0n);
  console.log("currentRound > 0n:", currentRound > 0n);
  console.log("Number(currentRound):", Number(currentRound));
  
  // Test other contract calls that return BigInt
  const fToken = await hre.ethers.getContractAt("FToken", deployedAddresses.FToken);
  const totalSupply = await fToken.totalSupply();
  
  console.log("\n📈 Total supply info:");
  console.log("Type:", typeof totalSupply);
  console.log("Value:", totalSupply.toString());
  console.log("Formatted:", hre.ethers.utils.formatEther(totalSupply));
  
  console.log("\n✅ BigInt handling verification complete!");
  console.log("Frontend should now handle these values correctly with === and > comparisons");
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Test failed:", error);
      process.exit(1);
    });
}

module.exports = main;