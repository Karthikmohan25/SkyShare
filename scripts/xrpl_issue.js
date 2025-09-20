const xrpl = require("xrpl");
require("dotenv").config();

async function main() {
  console.log("🌐 Issuing SKY-SHARE token on XRPL Testnet...\n");

  // Connect to XRPL Testnet
  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();
  console.log("✅ Connected to XRPL Testnet");

  // Create or use existing wallet
  let wallet;
  if (process.env.XRPL_WALLET_SEED) {
    wallet = xrpl.Wallet.fromSeed(process.env.XRPL_WALLET_SEED);
    console.log("📱 Using existing wallet:", wallet.address);
  } else {
    wallet = (await client.fundWallet()).wallet;
    console.log("📱 Created new wallet:", wallet.address);
    console.log("🔑 Seed (save this!):", wallet.seed);
    console.log("💡 Add this to your .env file: XRPL_WALLET_SEED=" + wallet.seed);
  }

  // Check wallet balance
  try {
    const balance = await client.getXrpBalance(wallet.address);
    console.log("💰 Wallet balance:", balance, "XRP");
  } catch (error) {
    console.log("⚠️  Could not fetch balance, wallet might be new");
  }

  // Issue SKY-SHARE token
  console.log("\n🏗️  Issuing SKY-SHARE token...");
  
  const currency = "SKY";  // 3-character currency code
  const issueAmount = "1000000";  // 1 million SKY-SHARE tokens
  
  // Create trust line transaction (self-trust for issuing)
  const trustSetTx = {
    TransactionType: "TrustSet",
    Account: wallet.address,
    LimitAmount: {
      currency: currency,
      issuer: wallet.address,
      value: issueAmount
    }
  };

  try {
    console.log("📝 Creating trust line...");
    const trustResult = await client.submitAndWait(trustSetTx, { wallet });
    console.log("✅ Trust line created:", trustResult.result.hash);
  } catch (error) {
    console.log("⚠️  Trust line creation failed (might already exist):", error.message);
  }

  // Create payment to self to issue tokens
  const issueTx = {
    TransactionType: "Payment",
    Account: wallet.address,
    Destination: wallet.address,
    Amount: {
      currency: currency,
      issuer: wallet.address,
      value: issueAmount
    }
  };

  try {
    console.log("💸 Issuing tokens...");
    const issueResult = await client.submitAndWait(issueTx, { wallet });
    console.log("✅ SKY-SHARE tokens issued!");
    console.log("   - Transaction hash:", issueResult.result.hash);
    console.log("   - Amount:", issueAmount, currency);
    console.log("   - Issuer:", wallet.address);
  } catch (error) {
    console.error("❌ Token issuance failed:", error.message);
    await client.disconnect();
    return;
  }

  // Verify token balance
  console.log("\n🔍 Verifying token issuance...");
  try {
    const accountLines = await client.request({
      command: "account_lines",
      account: wallet.address
    });
    
    const skyShareLine = accountLines.result.lines.find(line => 
      line.currency === currency && line.account === wallet.address
    );
    
    if (skyShareLine) {
      console.log("✅ Token verification successful:");
      console.log("   - Balance:", skyShareLine.balance, currency);
      console.log("   - Currency:", skyShareLine.currency);
      console.log("   - Issuer:", skyShareLine.account);
    } else {
      console.log("⚠️  Token not found in account lines");
    }
  } catch (error) {
    console.log("⚠️  Could not verify token balance:", error.message);
  }

  // Create sample attestation for bridge
  const attestation = {
    xrplTxHash: issueResult?.result?.hash || "0x" + "sample".padEnd(60, "0"),
    xrplIssuer: wallet.address,
    currency: currency,
    amount: "1000",  // Amount to bridge to Flare
    recipient: "0x" + "1".repeat(40),  // Placeholder Flare address
    timestamp: new Date().toISOString(),
    network: "testnet"
  };

  // Save attestation for bridge script
  const fs = require("fs");
  fs.writeFileSync("sample-attestation.json", JSON.stringify(attestation, null, 2));
  console.log("\n📄 Sample attestation saved to sample-attestation.json");

  console.log("\n🎯 XRPL Setup Complete!");
  console.log("=".repeat(50));
  console.log("Issuer Address:", wallet.address);
  console.log("Currency Code:", currency);
  console.log("Total Supply:", issueAmount);
  console.log("Network: XRPL Testnet");
  console.log("=".repeat(50));

  await client.disconnect();
  console.log("✅ Disconnected from XRPL");

  return {
    issuer: wallet.address,
    currency: currency,
    totalSupply: issueAmount,
    txHash: issueResult?.result?.hash
  };
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