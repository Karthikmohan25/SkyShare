# 🚁 SkyShare - Fractional Private Jet Ownership

**Cross-Chain Finance & Real-World Assets on XRPL + Flare**

SkyShare enables fractional ownership of private jets through tokenization on XRPL with programmable rental income distribution on Flare Network.

**Contributors:** [[Karthik Mohan](https://github.com/Karthikmohan25) • [Anish Kanade](https://github.com/AnishKanade) • [Tariqul Islam](https://github.com/nickelburger)]

## 🎯 Hackathon Track: Cross-Chain Finance & Real-World Assets

- **XRPL**: Issue SKY-SHARE tokens representing jet ownership
- **Flare**: Bridge to fSKY tokens with smart contract programmability
- **Real-World Assets**: Private jets with automated rental income distribution

## 🏗️ Architecture

```
XRPL Ledger          Bridge (MVP)           Flare Network
┌─────────────┐      ┌─────────────┐       ┌─────────────────┐
│ SKY-SHARE   │ ──── │ Custodial   │ ────► │ fSKY Token      │
│ Tokens      │      │ Bridge      │       │ (ERC-20)        │
│             │      │ (Admin Mint)│       │                 │
└─────────────┘      └─────────────┘       │ Distribution    │
                                           │ Contract        │
                                           │ (Pro-rata)      │
                                           └─────────────────┘
```

## 🚀 Quick Start (3 Minutes)

### Prerequisites
- Node.js 18+
- npm or yarn
- MetaMask browser extension

### Installation & Demo

```bash
# 1. Install dependencies
npm install
cd frontend && npm install && cd ..

# 2. Run complete demo
bash demo_script.sh
```

The demo script will:
1. ✅ Compile and test smart contracts
2. 🚀 Deploy to local Hardhat network
3. 🌐 Issue SKY-SHARE on XRPL Testnet
4. 🌉 Simulate bridge minting
5. 💸 Demonstrate rental distribution
6. 🎨 Launch frontend at http://localhost:3000

### Manual Step-by-Step

```bash
# Install packages
npm install
npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers typescript ts-node @types/node @types/mocha
npm install --save-dev @nomicfoundation/hardhat-toolbox
npm install @openzeppelin/contracts
npm install xrpl
npm install @flarenetwork/flare-periphery-contracts
npm install axios dotenv

# Frontend dependencies
cd frontend
npm install react react-dom ethers
cd ..

# Compile & test
npx hardhat compile
npx hardhat test

# Start local network
npx hardhat node

# Deploy contracts (in new terminal)
node scripts/deploy.js

# Issue XRPL tokens
node xrpl-scripts/issue_share.js

# Bridge mint
node scripts/mint_by_bridge.js sample-attestation.json

# Start frontend
npm run frontend:start
```

## 📋 Package Scripts

```json
{
  "start": "npx hardhat node",
  "deploy": "node scripts/deploy.js", 
  "test": "npx hardhat test",
  "xrpl:issue": "node xrpl-scripts/issue_share.js",
  "bridge:mint": "node scripts/mint_by_bridge.js sample-attestation.json",
  "frontend:start": "cd frontend && npm start",
  "demo": "bash demo_script.sh"
}
```

## 🔧 Smart Contracts

### FToken.sol (fSKY)
- **ERC-20** token representing fractional jet ownership
- **Bridge minting** from XRPL SKY-SHARE attestations
- **Access control** for authorized bridge operators
- **Max supply** of 1M tokens with duplicate transaction protection

### Distribution.sol
- **Pro-rata distribution** of rental income to fSKY holders
- **Dust handling** - remainders accumulated for next round
- **Multi-round claiming** with gas-efficient batch operations
- **Rental deposits** from property management oracles

## 🌐 XRPL Integration

### Token Issuance
```javascript
// Issue SKY-SHARE tokens on XRPL Testnet
node xrpl-scripts/issue_share.js
```

Creates:
- Issuer wallet on XRPL Testnet
- Customer wallet with trust line
- Issues 1000 SKY-SHARE tokens
- Generates attestation for bridge

### Bridge Process (MVP)
1. **XRPL**: Lock SKY-SHARE tokens with issuer
2. **Attestation**: Generate proof of XRPL transaction
3. **Flare**: Admin mints equivalent fSKY tokens
4. **V1 Upgrade**: Replace with FAssets trustless bridge

## 💸 Distribution Math

**Example**: 100 ETH rental income, token holders 500/300/200 fSKY

```
Total Supply: 1000 fSKY
Rental Income: 100 ETH

Distribution:
- Holder 1 (500 fSKY): 50 ETH (50%)
- Holder 2 (300 fSKY): 30 ETH (30%) 
- Holder 3 (200 fSKY): 20 ETH (20%)

Dust Handling:
- 101 ETH → 100 ETH distributed, 1 ETH dust
- Next round: Previous dust + new income
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Test specific contracts
npx hardhat test test/FToken.test.js
npx hardhat test test/Distribution.test.js
```

**Test Coverage**:
- ✅ Pro-rata distribution (500:300:200 → 50:30:20)
- ✅ Dust accumulation and handling
- ✅ Multi-round claiming
- ✅ Access control and security
- ✅ Edge cases and error conditions

## 🌐 Frontend Features

**React Dashboard** (http://localhost:3000):
- 🔗 MetaMask wallet connection
- 💰 fSKY balance and ownership percentage
- 💸 Claimable rental income
- 🎯 One-click rent claiming
- 📊 Distribution round tracking
- 🔄 Real-time balance updates

## 🔐 Security & Production Notes

### MVP (24h Hackathon)
- ✅ Custodial bridge with admin minting
- ✅ Basic access control and reentrancy protection
- ✅ Dust handling and pro-rata math
- ✅ XRPL Testnet integration

### V1 Production Upgrades
- 🔄 **FAssets Integration**: Replace custodial bridge with trustless FAssets protocol
- 🔄 **State Connector**: Automated XRPL attestation verification
- 🔄 **Oracle Integration**: Real-time rental income from property management
- 🔄 **Governance**: Decentralized parameter management
- 🔄 **KYC/Compliance**: Identity verification for regulatory compliance

## 📁 Project Structure

```
skyshare-fractional-jets/
├── contracts/
│   ├── FToken.sol              # Fractional Sky Share ERC-20
│   └── Distribution.sol        # Rental income distribution
├── scripts/
│   ├── deploy.js              # Contract deployment
│   └── mint_by_bridge.js      # Bridge minting simulation
├── xrpl-scripts/
│   └── issue_share.js         # XRPL token issuance
├── test/
│   ├── FToken.test.js         # Token contract tests
│   └── Distribution.test.js   # Distribution math tests
├── frontend/
│   ├── src/App.js            # React dashboard
│   └── package.json          # Frontend dependencies
├── hardhat.config.ts         # Flare network configuration
├── package.json              # Project dependencies
├── demo_script.sh           # Complete demo automation
└── README.md               # This file
```

## 🌍 Network Configuration

### Supported Networks
- **Local**: Hardhat development network
- **Coston**: Flare testnet
- **Coston2**: Flare testnet v2  
- **Songbird**: Flare canary network
- **Flare**: Flare mainnet

### Environment Setup
```bash
# Copy and configure environment
cp .env.example .env
# Edit .env with your private keys and RPC URLs
```

## 🚨 Important Notes

1. **Demo Purpose**: This is a hackathon MVP demonstrating core concepts
2. **Testnet Only**: Uses XRPL Testnet and local Hardhat network
3. **No Real Assets**: Simulated rental income and jet ownership
4. **Security**: Never use demo private keys in production
5. **Compliance**: Real implementation requires regulatory compliance

## 🤝 Contributing

This is a hackathon project demonstrating cross-chain RWA tokenization. For production use:

1. Integrate with Flare's FAssets protocol
2. Add proper KYC/AML compliance
3. Implement real property oracles
4. Add governance mechanisms
5. Conduct security audits

## 📄 License

MIT License - See LICENSE file for details

## 🔗 Links

- **Flare Network**: https://flare.network/
- **XRPL**: https://xrpl.org/
- **FAssets**: https://docs.flare.network/tech/fassets/
- **State Connector**: https://docs.flare.network/tech/state-connector/

---

**Built for Cross-Chain Finance & Real-World Assets Track**  
*Connecting XRPL issuance with Flare programmability for fractional asset ownership*
