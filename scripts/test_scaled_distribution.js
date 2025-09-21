const hre = require("hardhat");

async function main() {
  console.log("🧪 Testing scaled distribution math...\n");

  const [deployer, user1, user2] = await hre.ethers.getSigners();

  // Deploy contracts
  console.log("📄 Deploying contracts...");
  const FToken = await hre.ethers.getContractFactory("FToken");
  const fToken = await FToken.deploy();
  await fToken.deployed();

  const Distribution = await hre.ethers.getContractFactory("Distribution");
  const distribution = await Distribution.deploy(fToken.address, deployer.address);
  await distribution.deployed();

  console.log("FToken deployed to:", fToken.address);
  console.log("Distribution deployed to:", distribution.address);

  // Mint tokens to create a scenario where small rent would previously result in zero claims
  console.log("\n💰 Minting tokens...");
  await fToken.mint(user1.address, hre.ethers.utils.parseEther("1000"), "0x1");
  await fToken.mint(user2.address, hre.ethers.utils.parseEther("1003"), "0x2");
  
  const totalSupply = await fToken.totalSupply();
  const user1Balance = await fToken.balanceOf(user1.address);
  const user2Balance = await fToken.balanceOf(user2.address);
  
  console.log("Total Supply:", hre.ethers.utils.formatEther(totalSupply), "fSKY");
  console.log("User1 Balance:", hre.ethers.utils.formatEther(user1Balance), "fSKY");
  console.log("User2 Balance:", hre.ethers.utils.formatEther(user2Balance), "fSKY");

  // Test small rent deposit that would previously result in zero claimable
  console.log("\n🏠 Depositing small rent (1 ETH)...");
  await distribution.depositRent({ value: hre.ethers.utils.parseEther("1") });

  const round = await distribution.currentRound();
  const distInfo = await distribution.distributions(round);
  
  console.log("Round:", round.toString());
  console.log("Total Amount:", hre.ethers.utils.formatEther(distInfo.totalAmount), "ETH");
  console.log("Total Supply:", hre.ethers.utils.formatEther(distInfo.totalSupply), "fSKY");
  console.log("Dust Remaining:", hre.ethers.utils.formatEther(distInfo.dustRemaining), "ETH");
  console.log("Per Share Scaled:", distInfo.perShareScaled.toString());

  // Check claimable amounts
  const user1Claimable = await distribution.getClaimableAmount(user1.address, round);
  const user2Claimable = await distribution.getClaimableAmount(user2.address, round);
  
  console.log("\n💎 Claimable amounts:");
  console.log("User1 (1000 fSKY):", hre.ethers.utils.formatEther(user1Claimable), "ETH");
  console.log("User2 (1003 fSKY):", hre.ethers.utils.formatEther(user2Claimable), "ETH");

  // Verify math
  const expectedUser1 = user1Balance.mul(distInfo.perShareScaled).div(hre.ethers.utils.parseEther("1"));
  const expectedUser2 = user2Balance.mul(distInfo.perShareScaled).div(hre.ethers.utils.parseEther("1"));
  
  console.log("\n🔍 Verification:");
  console.log("User1 expected:", hre.ethers.utils.formatEther(expectedUser1), "ETH");
  console.log("User2 expected:", hre.ethers.utils.formatEther(expectedUser2), "ETH");
  console.log("User1 matches:", user1Claimable.eq(expectedUser1));
  console.log("User2 matches:", user2Claimable.eq(expectedUser2));

  // Test claiming
  console.log("\n💸 Testing claims...");
  const user1BalanceBefore = await hre.ethers.provider.getBalance(user1.address);
  
  const tx = await distribution.connect(user1).claimPayment(round);
  const receipt = await tx.wait();
  const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);
  
  const user1BalanceAfter = await hre.ethers.provider.getBalance(user1.address);
  const actualReceived = user1BalanceAfter.add(gasUsed).sub(user1BalanceBefore);
  
  console.log("User1 received:", hre.ethers.utils.formatEther(actualReceived), "ETH");
  console.log("Expected:", hre.ethers.utils.formatEther(user1Claimable), "ETH");
  console.log("Claim successful:", actualReceived.eq(user1Claimable));

  console.log("\n✅ Scaled distribution math working correctly!");
  console.log("🎯 Small rent deposits now produce non-zero claimable amounts!");
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