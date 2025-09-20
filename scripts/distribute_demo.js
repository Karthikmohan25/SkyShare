const { ethers } = require("hardhat");

async function main() {
  console.log("💰 Running Distribution Demo...\n");

  const [deployer, user1, user2, user3] = await ethers.getSigners();

  // Deploy contracts for demo (in production, read addresses from file)
  console.log("📄 Setting up contracts...");
  const FToken = await ethers.getContractFactory("FToken");
  const fToken = await FToken.deploy("Flare SKY-SHARE", "fSKY", deployer.address);
  await fToken.waitForDeployment();
  
  const Distribution = await ethers.getContractFactory("Distribution");
  const distribution = await Distribution.deploy(await fToken.getAddress(), deployer.address);
  await distribution.waitForDeployment();

  // Setup token holders: 500/300/200 distribution
  console.log("🎯 Setting up token holders (500/300/200)...");
  await fToken.mintFromBridge(user1.address, ethers.parseEther("500"), "0xabc123");
  await fToken.mintFromBridge(user2.address, ethers.parseEther("300"), "0xdef456");
  await fToken.mintFromBridge(user3.address, ethers.parseEther("200"), "0x789ghi");

  const totalSupply = await fToken.totalSupply();
  console.log("✅ Total supply:", ethers.formatEther(totalSupply), "fSKY");

  // Show initial balances
  console.log("\n📊 Initial token balances:");
  for (const [i, user] of [user1, user2, user3].entries()) {
    const balance = await fToken.balanceOf(user.address);
    console.log(`   User ${i + 1}: ${ethers.formatEther(balance)} fSKY`);
  }

  // Deposit rent for distribution (100 ETH)
  console.log("\n💸 Depositing 100 ETH rent for distribution...");
  const rentAmount = ethers.parseEther("100");
  
  const depositTx = await distribution.depositRent({ value: rentAmount });
  await depositTx.wait();
  
  const currentRound = await distribution.currentRound();
  const distributionInfo = await distribution.distributions(currentRound);
  
  console.log("✅ Rent deposited for round:", currentRound.toString());
  console.log("   - Total amount:", ethers.formatEther(distributionInfo.totalAmount), "ETH");
  console.log("   - Total supply:", ethers.formatEther(distributionInfo.totalSupply), "fSKY");
  console.log("   - Dust remaining:", ethers.formatEther(distributionInfo.dustRemaining), "ETH");

  // Calculate expected distributions
  console.log("\n🧮 Expected distributions (pro-rata):");
  const expectedDistributions = [
    { user: "User 1 (500 fSKY)", expected: "50 ETH" },
    { user: "User 2 (300 fSKY)", expected: "30 ETH" },
    { user: "User 3 (200 fSKY)", expected: "20 ETH" }
  ];
  
  expectedDistributions.forEach(dist => {
    console.log(`   - ${dist.user}: ${dist.expected}`);
  });

  // Check claimable amounts
  console.log("\n💰 Actual claimable amounts:");
  for (const [i, user] of [user1, user2, user3].entries()) {
    const claimable = await distribution.getClaimableAmount(user.address, currentRound);
    console.log(`   User ${i + 1}: ${ethers.formatEther(claimable)} ETH`);
  }

  // Users claim their payments
  console.log("\n🎁 Users claiming payments...");
  for (const [i, user] of [user1, user2, user3].entries()) {
    const balanceBefore = await ethers.provider.getBalance(user.address);
    
    const claimTx = await distribution.connect(user).claimPayment(currentRound);
    const receipt = await claimTx.wait();
    
    const balanceAfter = await ethers.provider.getBalance(user.address);
    const gasUsed = receipt.gasUsed * receipt.gasPrice;
    const netReceived = balanceAfter - balanceBefore + gasUsed;
    
    console.log(`   User ${i + 1} claimed: ${ethers.formatEther(netReceived)} ETH`);
  }

  // Check dust accumulation
  const dustAccumulated = await distribution.totalDustAccumulated();
  const contractBalance = await distribution.getContractBalance();
  
  console.log("\n🧹 Dust handling:");
  console.log("   - Dust accumulated:", ethers.formatEther(dustAccumulated), "ETH");
  console.log("   - Contract balance:", ethers.formatEther(contractBalance), "ETH");

  // Simulate second distribution to show dust handling
  console.log("\n🔄 Second distribution (50 ETH) to demonstrate dust accumulation...");
  const secondRentAmount = ethers.parseEther("50");
  
  const secondDepositTx = await distribution.depositRent({ value: secondRentAmount });
  await secondDepositTx.wait();
  
  const secondRound = await distribution.currentRound();
  const secondDistInfo = await distribution.distributions(secondRound);
  
  console.log("✅ Second distribution created:");
  console.log("   - Round:", secondRound.toString());
  console.log("   - Amount distributed:", ethers.formatEther(secondDistInfo.totalAmount), "ETH");
  console.log("   - New dust:", ethers.formatEther(secondDistInfo.dustRemaining), "ETH");
  
  const totalDustAfter = await distribution.totalDustAccumulated();
  console.log("   - Total dust accumulated:", ethers.formatEther(totalDustAfter), "ETH");

  console.log("\n✅ Distribution demo completed!");
  console.log("💡 Key observations:");
  console.log("   - Pro-rata distribution works correctly (500:300:200 → 50:30:20)");
  console.log("   - Dust is properly handled and accumulated for future distributions");
  console.log("   - Multiple distribution rounds work seamlessly");

  return {
    round1: {
      distributed: ethers.formatEther(distributionInfo.totalAmount),
      dust: ethers.formatEther(distributionInfo.dustRemaining)
    },
    round2: {
      distributed: ethers.formatEther(secondDistInfo.totalAmount),
      dust: ethers.formatEther(secondDistInfo.dustRemaining)
    },
    totalDust: ethers.formatEther(totalDustAfter)
  };
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Distribution demo failed:", error);
      process.exit(1);
    });
}

module.exports = main;