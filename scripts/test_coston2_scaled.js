const hre = require("hardhat");

async function main() {
  console.log("🧪 Testing scaled distribution on Coston2...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Using account:", deployer.address);

  // Load deployed contract addresses
  const deployedAddresses = require("../deployed-addresses.json");
  const fTokenAddress = deployedAddresses.FToken;
  const distributionAddress = deployedAddresses.Distribution;
  
  console.log("FToken address:", fTokenAddress);
  console.log("Distribution address:", distributionAddress);

  // Get contract instances
  const fToken = await hre.ethers.getContractAt("FToken", fTokenAddress);
  const distribution = await hre.ethers.getContractAt("Distribution", distributionAddress);

  // Check current state
  const totalSupply = await fToken.totalSupply();
  const deployerBalance = await fToken.balanceOf(deployer.address);
  
  console.log("\n📊 Current state:");
  console.log("Total Supply:", hre.ethers.utils.formatEther(totalSupply), "fSKY");
  console.log("Deployer Balance:", hre.ethers.utils.formatEther(deployerBalance), "fSKY");

  // If no tokens, mint some first
  if (totalSupply.eq(0)) {
    console.log("\n💰 Minting tokens for testing...");
    const tx = await fToken.mint(deployer.address, hre.ethers.utils.parseEther("2000"), "0xTEST_SCALED");
    await tx.wait();
    console.log("✅ Minted 2000 fSKY tokens");
  }

  // Test small rent deposit (this would previously result in zero claimable)
  console.log("\n🏠 Depositing small rent (1 C2FLR)...");
  const rentTx = await distribution.depositRent({ value: hre.ethers.utils.parseEther("1") });
  const rentReceipt = await rentTx.wait();
  
  console.log("✅ Rent deposited, tx hash:", rentReceipt.transactionHash);

  const round = await distribution.currentRound();
  const distInfo = await distribution.distributions(round);
  
  console.log("\n📋 Distribution info:");
  console.log("Round:", round.toString());
  console.log("Total Amount:", hre.ethers.utils.formatEther(distInfo.totalAmount), "C2FLR");
  console.log("Total Supply:", hre.ethers.utils.formatEther(distInfo.totalSupply), "fSKY");
  console.log("Dust Remaining:", hre.ethers.utils.formatEther(distInfo.dustRemaining), "C2FLR");
  console.log("Per Share Scaled:", distInfo.perShareScaled.toString());

  // Check claimable amount
  const claimable = await distribution.getClaimableAmount(deployer.address, round);
  console.log("\n💎 Claimable amount:", hre.ethers.utils.formatEther(claimable), "C2FLR");

  if (claimable.gt(0)) {
    console.log("✅ SUCCESS: Small rent deposit produces non-zero claimable amount!");
    console.log("🎯 Scaled per-share math is working correctly!");
  } else {
    console.log("❌ ISSUE: Claimable amount is still zero");
  }

  // Test claiming
  if (claimable.gt(0)) {
    console.log("\n💸 Testing claim...");
    const claimTx = await distribution.claimPayment(round);
    const claimReceipt = await claimTx.wait();
    console.log("✅ Claim successful, tx hash:", claimReceipt.transactionHash);
  }

  console.log("\n🔗 Explorer links:");
  console.log("FToken:", `https://coston2-explorer.flare.network/address/${fTokenAddress}`);
  console.log("Distribution:", `https://coston2-explorer.flare.network/address/${distributionAddress}`);
  if (rentReceipt) {
    console.log("Rent Deposit:", `https://coston2-explorer.flare.network/tx/${rentReceipt.transactionHash}`);
  }
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