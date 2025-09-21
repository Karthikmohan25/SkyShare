const hre = require("hardhat");

async function main() {
  console.log("🔍 Checking contract state on Coston2...\n");

  try {
    // Load deployed contract addresses
    const deployedAddresses = require("../deployed-addresses.json");
    
    const fToken = await hre.ethers.getContractAt('FToken', deployedAddresses.FToken);
    const totalSupply = await fToken.totalSupply();
    console.log('📊 FToken totalSupply:', hre.ethers.utils.formatEther(totalSupply), 'fSKY');
    
    const distribution = await hre.ethers.getContractAt('Distribution', deployedAddresses.Distribution);
    const currentRound = await distribution.currentRound();
    console.log('🔄 Distribution currentRound:', currentRound.toString());
    
    // Check deployer balance
    const [deployer] = await hre.ethers.getSigners();
    const deployerBalance = await fToken.balanceOf(deployer.address);
    console.log('💰 Deployer balance:', hre.ethers.utils.formatEther(deployerBalance), 'fSKY');
    
    console.log('\n✅ Contracts are accessible and functional!');
  } catch (error) {
    console.error('❌ Error checking contracts:', error.message);
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