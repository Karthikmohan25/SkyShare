const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🌉 Simulating Bridge Mint Operation...\n");

  const [deployer, user1, user2, user3] = await hre.ethers.getSigners();
  
  // Load sample attestation
  let attestation;
  try {
    attestation = JSON.parse(fs.readFileSync("sample-attestation.json", "utf8"));
    console.log("📄 Loaded attestation:", attestation.xrplTxHash);
  } catch (error) {
    console.log("⚠️  No sample-attestation.json found, using default values");
    attestation = {
      xrplTxHash: "0x" + "a".repeat(64),
      amount: "1000",
      recipient: user1.address
    };
  }

  // Load deployed contract addresses
  console.log("🔍 Loading deployed contract addresses...");
  
  let deployedAddresses;
  try {
    deployedAddresses = JSON.parse(fs.readFileSync("deployed-addresses.json", "utf8"));
    console.log("📄 Loaded deployed addresses from deployed-addresses.json");
  } catch (error) {
    console.error("❌ Could not load deployed-addresses.json. Please run deployment first.");
    return;
  }
  
  const fTokenAddress = deployedAddresses.FToken;
  const distributionAddress = deployedAddresses.Distribution;
  
  console.log("✅ FToken address:", fTokenAddress);
  console.log("✅ Distribution address:", distributionAddress);

  // Get contract instances
  const fToken = await hre.ethers.getContractAt("FToken", fTokenAddress);
  const distribution = await hre.ethers.getContractAt("Distribution", distributionAddress);

  console.log("\n🎯 Simulating XRPL → Flare Bridge Process:");
  console.log("=".repeat(60));

  // Step 1: Simulate XRPL SKY-SHARE lock (this would happen on XRPL)
  console.log("1️⃣  XRPL: SKY-SHARE tokens locked (simulated)");
  console.log("   - XRPL Tx Hash:", attestation.xrplTxHash);
  console.log("   - Amount:", attestation.amount, "SKY-SHARE");
  console.log("   - Recipient:", attestation.recipient);

  // Step 2: Bridge operator mints fSKY on Flare
  console.log("\n2️⃣  Flare: Minting fSKY tokens...");
  const mintAmount = hre.ethers.utils.parseEther(attestation.amount);
  
  try {
    const mintTx = await fToken.mint(
      attestation.recipient,
      mintAmount,
      attestation.xrplTxHash
    );
    await mintTx.wait();
    console.log("   ✅ Minted", attestation.amount, "fSKY to", attestation.recipient);
  } catch (error) {
    console.error("   ❌ Mint failed:", error.message);
    return;
  }

  // Step 3: Verify balances
  console.log("\n3️⃣  Verifying balances...");
  const balance = await fToken.balanceOf(attestation.recipient);
  const totalSupply = await fToken.totalSupply();
  
  console.log("   - Recipient balance:", hre.ethers.utils.formatEther(balance), "fSKY");
  console.log("   - Total supply:", hre.ethers.utils.formatEther(totalSupply), "fSKY");

  // Step 4: Simulate additional mints for demo
  console.log("\n4️⃣  Creating additional holders for distribution demo...");
  
  const holders = [
    { address: user2.address, amount: "300" },
    { address: user3.address, amount: "200" }
  ];

  for (const holder of holders) {
    const amount = hre.ethers.utils.parseEther(holder.amount);
    const tx = await fToken.mint(
      holder.address,
      amount,
      "0x" + Math.random().toString(16).substr(2, 64)
    );
    await tx.wait();
    console.log("   ✅ Minted", holder.amount, "fSKY to", holder.address);
  }

  // Step 5: Show final state
  console.log("\n5️⃣  Final token distribution:");
  const finalSupply = await fToken.totalSupply();
  console.log("   - Total Supply:", hre.ethers.utils.formatEther(finalSupply), "fSKY");
  
  for (const signer of [user1, user2, user3]) {
    const balance = await fToken.balanceOf(signer.address);
    if (balance.gt(0)) {
      console.log(`   - ${signer.address}: ${hre.ethers.utils.formatEther(balance)} fSKY`);
    }
  }

  console.log("\n✅ Bridge mint simulation completed!");
  console.log("💡 Next steps: Run distribution demo with 'npx hardhat run scripts/distribute_demo.js'");

  return {
    fTokenAddress,
    distributionAddress,
    holders: [
      { address: user1.address, balance: hre.ethers.utils.formatEther(await fToken.balanceOf(user1.address)) },
      { address: user2.address, balance: hre.ethers.utils.formatEther(await fToken.balanceOf(user2.address)) },
      { address: user3.address, balance: hre.ethers.utils.formatEther(await fToken.balanceOf(user3.address)) }
    ]
  };
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Bridge mint failed:", error);
      process.exit(1);
    });
}

module.exports = main;