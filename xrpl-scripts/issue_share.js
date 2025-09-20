const xrpl = require("xrpl");
const fs = require("fs");
require("dotenv").config();

async function main() {
  console.log("🚁 SkyShare: Issuing SKY-SHARE tokens on XRPL Testnet...\n");

  // Connect to XRPL Testnet
  console.log("🔗 Connecting to XRPL Testnet...");
  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();
  console.log("✅ Connected to XRPL Testnet");

  // Create or load issuer wallet
  let issuerWallet;
  if (process.env.XRPL_ISSUER_SEED) {
    console.log("\n🔑 Loading issuer wallet from environment...");
    issuerWallet = xrpl.Wallet.fromSeed(process.env.XRPL_ISSUER_SEED);
  } else {
    console.log("\n🔑 Generating new issuer wallet...");
    issuerWallet = xrpl.Wallet.generate();
    console.log("⚠️  Save this seed to .env as XRPL_ISSUER_SEED:", issuerWallet.seed);
  }

  console.log("📍 Issuer Address:", issuerWallet.address);

  // Check issuer balance and fund if needed
  console.log("\n💰 Checking issuer balance...");
  try {
    const balance = await client.getXrpBalance(issuerWallet.address);
    console.log("Current balance:", balance, "XRP");
    
    if (parseFloat(balance) < 10) {
      console.log("⚠️  Low balance detected. Please fund the issuer account:");
      console.log("🚰 Testnet Faucet: https://xrpl.org/xrp-testnet-faucet.html");
      console.log("📍 Address to fund:", issuerWallet.address);
      console.log("\n⏸️  Waiting 30 seconds for manual funding...");
      
      // Wait for user to fund the account
      await new Promise(resolve => setTimeout(resolve, 30000));
      
      const newBalance = await client.getXrpBalance(issuerWallet.address);
      console.log("Updated balance:", newBalance, "XRP");
      
      if (parseFloat(newBalance) < 10) {
        throw new Error("Insufficient balance after funding attempt");
      }
    }
  } catch (error) {
    if (error.message.includes("Account not found")) {
      console.log("❌ Account not found. Please fund the issuer account first:");
      console.log("🚰 Testnet Faucet: https://xrpl.org/xrp-testnet-faucet.html");
      console.log("📍 Address to fund:", issuerWallet.address);
      process.exit(1);
    }
    throw error;
  }

  // Create customer wallet for demo
  console.log("\n👤 Creating customer wallet...");
  const customerWallet = xrpl.Wallet.generate();
  console.log("📍 Customer Address:", customerWallet.address);

  // Fund customer wallet
  console.log("\n💰 Funding customer wallet...");
  try {
    const fundResult = await client.fundWallet(customerWallet);
    console.log("✅ Customer funded with", fundResult.balance, "XRP");
  } catch (error) {
    console.log("⚠️  Auto-funding failed. Please fund manually:");
    console.log("📍 Customer Address:", customerWallet.address);
    console.log("⏸️  Waiting 20 seconds for manual funding...");
    await new Promise(resolve => setTimeout(resolve, 20000));
  }

  // Set up trust line from customer to issuer for SKY-SHARE
  console.log("\n🤝 Setting up trust line for SKY-SHARE...");
  const trustSet = {
    TransactionType: "TrustSet",
    Account: customerWallet.address,
    LimitAmount: {
      currency: "SKY",
      issuer: issuerWallet.address,
      value: "1000000" // 1M SKY-SHARE limit
    }
  };

  const trustTx = await client.submitAndWait(trustSet, { wallet: customerWallet });
  console.log("✅ Trust line established:", trustTx.result.hash);

  // Issue SKY-SHARE tokens to customer
  console.log("\n🪙 Issuing SKY-SHARE tokens...");
  const issueAmount = "1000"; // Issue 1000 SKY-SHARE tokens
  
  const payment = {
    TransactionType: "Payment",
    Account: issuerWallet.address,
    Destination: customerWallet.address,
    Amount: {
      currency: "SKY",
      issuer: issuerWallet.address,
      value: issueAmount
    }
  };

  const paymentTx = await client.submitAndWait(payment, { wallet: issuerWallet });
  console.log("✅ Issued", issueAmount, "SKY-SHARE tokens");
  console.log("📋 Transaction Hash:", paymentTx.result.hash);

  // Verify the issuance
  console.log("\n🔍 Verifying token balances...");
  const customerBalances = await client.request({
    command: "account_lines",
    account: customerWallet.address
  });

  const skyBalance = customerBalances.result.lines.find(line => 
    line.currency === "SKY" && line.account === issuerWallet.address
  );

  if (skyBalance) {
    console.log("✅ Customer SKY-SHARE balance:", skyBalance.balance);
  } else {
    console.log("❌ No SKY-SHARE balance found");
  }

  // Create sample attestation for bridge
  const attestation = {
    xrplTxHash: paymentTx.result.hash,
    amount: issueAmount,
    recipient: "0x" + "1".repeat(40), // Placeholder Flare address
    currency: "SKY",
    issuer: issuerWallet.address,
    customer: customerWallet.address,
    timestamp: new Date().toISOString(),
    network: "xrpl-testnet"
  };

  // Save attestation for bridge script
  fs.writeFileSync("sample-attestation.json", JSON.stringify(attestation, null, 2));
  console.log("\n📄 Sample attestation saved to sample-attestation.json");

  // Save wallet info for future use
  const walletInfo = {
    issuer: {
      address: issuerWallet.address,
      seed: issuerWallet.seed
    },
    customer: {
      address: customerWallet.address,
      seed: customerWallet.seed
    }
  };

  fs.writeFileSync("xrpl-wallets.json", JSON.stringify(walletInfo, null, 2));
  console.log("💾 Wallet info saved to xrpl-wallets.json");

  console.log("\n🎉 SKY-SHARE token issuance completed!");
  console.log("=".repeat(60));
  console.log("📊 Summary:");
  console.log("- Issuer:", issuerWallet.address);
  console.log("- Customer:", customerWallet.address);
  console.log("- Issued Amount:", issueAmount, "SKY-SHARE");
  console.log("- XRPL Tx Hash:", paymentTx.result.hash);
  console.log("=".repeat(60));

  console.log("\n📋 Next steps:");
  console.log("1. Run: node scripts/mint_by_bridge.js sample-attestation.json");
  console.log("2. The bridge will mint fSKY tokens on Flare network");

  await client.disconnect();
  return attestation;
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ XRPL issuance failed:", error);
      process.exit(1);
    });
}

module.exports = main;