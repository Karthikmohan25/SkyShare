const hre = require("hardhat");

async function main() {
  console.log("🧪 Testing Simple Jet Token Contract");
  console.log("=" .repeat(40));

  const [user] = await hre.ethers.getSigners();
  console.log("User:", user.address);
  
  const balance = await user.getBalance();
  console.log("C2FLR Balance:", hre.ethers.utils.formatEther(balance));

  // Connect to the simple contract
  const contractAddress = "0x0B784d9443D703237Ede20388C1497b71a30137d";
  const jetToken = await hre.ethers.getContractAt("SimpleJetToken", contractAddress);
  
  console.log("Contract Address:", contractAddress);

  try {
    // Test basic functions
    const name = await jetToken.name();
    const symbol = await jetToken.symbol();
    const price = await jetToken.tokenPriceWei();
    const totalSupply = await jetToken.totalSupply();
    
    console.log("\n📋 Contract Info:");
    console.log("Name:", name);
    console.log("Symbol:", symbol);
    console.log("Price:", hre.ethers.utils.formatEther(price), "C2FLR");
    console.log("Total Supply:", hre.ethers.utils.formatEther(totalSupply));
    
    // Test balance
    const userBalance = await jetToken.balanceOf(user.address);
    console.log("User Token Balance:", hre.ethers.utils.formatEther(userBalance));
    
    // Test buying tokens
    console.log("\n🛒 Testing Token Purchase...");
    const ethToSpend = hre.ethers.utils.parseEther("0.05"); // 0.05 C2FLR
    console.log("Spending:", hre.ethers.utils.formatEther(ethToSpend), "C2FLR");
    
    const expectedTokens = await jetToken.calculateTokens(ethToSpend);
    console.log("Expected tokens:", hre.ethers.utils.formatEther(expectedTokens));
    
    const tx = await jetToken.buyTokens({ value: ethToSpend });
    console.log("Transaction Hash:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("✅ Purchase successful!");
    console.log("Gas used:", receipt.gasUsed.toString());
    
    // Check new balance
    const newBalance = await jetToken.balanceOf(user.address);
    console.log("New Token Balance:", hre.ethers.utils.formatEther(newBalance));
    
    console.log("\n🎉 Contract is working perfectly!");
    
  } catch (error) {
    console.error("❌ Contract test failed:", error.message);
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Test failed:", error);
      process.exit(1);
    });
}

module.exports = main;