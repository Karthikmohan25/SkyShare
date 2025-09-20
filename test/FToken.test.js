const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FToken", function () {
  let fToken;
  let owner, bridge, user1, user2;

  beforeEach(async function () {
    [owner, bridge, user1, user2] = await ethers.getSigners();
    
    const FToken = await ethers.getContractFactory("FToken");
    fToken = await FToken.deploy();
    await fToken.deployed();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await fToken.name()).to.equal("Fractional Sky Share");
      expect(await fToken.symbol()).to.equal("fSKY");
    });

    it("Should grant admin and bridge roles to deployer", async function () {
      const adminRole = await fToken.DEFAULT_ADMIN_ROLE();
      const bridgeRole = await fToken.BRIDGE_ROLE();
      
      expect(await fToken.hasRole(adminRole, owner.address)).to.be.true;
      expect(await fToken.hasRole(bridgeRole, owner.address)).to.be.true;
    });

    it("Should start with zero total supply", async function () {
      expect(await fToken.totalSupply()).to.equal(0);
    });
  });

  describe("Bridge Operations", function () {
    it("Should allow bridge to mint tokens", async function () {
      const amount = ethers.utils.parseEther("1000");
      const xrplTxHash = "0xabcdef123456";

      await expect(fToken.mint(user1.address, amount, xrplTxHash))
        .to.emit(fToken, "TokensMinted")
        .withArgs(user1.address, amount, xrplTxHash);

      expect(await fToken.balanceOf(user1.address)).to.equal(amount);
      expect(await fToken.totalSupply()).to.equal(amount);
    });

    it("Should allow bridge to burn tokens", async function () {
      const amount = ethers.utils.parseEther("1000");
      const xrplAddress = "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH";

      // First mint tokens
      await fToken.mint(user1.address, amount, "0xmint123");
      
      // Then burn them (connect as user1 who has the tokens)
      await expect(fToken.connect(user1).burn(amount, xrplAddress))
        .to.emit(fToken, "TokensBurned")
        .withArgs(user1.address, amount, xrplAddress);

      expect(await fToken.balanceOf(user1.address)).to.equal(0);
      expect(await fToken.totalSupply()).to.equal(0);
    });

    it("Should reject mint from non-bridge address", async function () {
      const amount = ethers.utils.parseEther("1000");
      
      await expect(
        fToken.connect(user1).mint(user2.address, amount, "0xtest")
      ).to.be.reverted;
    });

    it("Should reject burn from non-bridge address", async function () {
      const amount = ethers.utils.parseEther("1000");
      
      await expect(
        fToken.connect(user1).burn(amount, "rTest")
      ).to.be.reverted;
    });
  });

  describe("Role Management", function () {
    it("Should allow admin to add bridge operator", async function () {
      await fToken.addBridgeOperator(bridge.address);
      
      const bridgeRole = await fToken.BRIDGE_ROLE();
      expect(await fToken.hasRole(bridgeRole, bridge.address)).to.be.true;
    });

    it("Should allow admin to remove bridge operator", async function () {
      await fToken.addBridgeOperator(bridge.address);
      await fToken.removeBridgeOperator(bridge.address);
      
      const bridgeRole = await fToken.BRIDGE_ROLE();
      expect(await fToken.hasRole(bridgeRole, bridge.address)).to.be.false;
    });

    it("Should reject role changes from non-admin", async function () {
      await expect(
        fToken.connect(user1).addBridgeOperator(bridge.address)
      ).to.be.reverted;
      
      await expect(
        fToken.connect(user1).removeBridgeOperator(owner.address)
      ).to.be.reverted;
    });

    it("Should allow new bridge operator to mint", async function () {
      await fToken.addBridgeOperator(bridge.address);
      
      const amount = ethers.utils.parseEther("500");
      await expect(
        fToken.connect(bridge).mint(user1.address, amount, "0xtest")
      ).to.emit(fToken, "TokensMinted");
      
      expect(await fToken.balanceOf(user1.address)).to.equal(amount);
    });
  });
});