const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Distribution", function () {
  let fToken, distribution;
  let owner, user1, user2, user3;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();
    
    // Deploy FToken
    const FToken = await ethers.getContractFactory("FToken");
    fToken = await FToken.deploy();
    await fToken.deployed();
    
    // Deploy Distribution
    const Distribution = await ethers.getContractFactory("Distribution");
    distribution = await Distribution.deploy(fToken.address, owner.address);
    await distribution.deployed();
  });

  describe("Deployment", function () {
    it("Should set the correct token and owner", async function () {
      expect(await distribution.fSkyToken()).to.equal(fToken.address);
      expect(await distribution.owner()).to.equal(owner.address);
    });

    it("Should start with zero rounds", async function () {
      expect(await distribution.currentRound()).to.equal(0);
    });
  });

  describe("Distribution Math", function () {
    beforeEach(async function () {
      // Setup token holders: 500/300/200 (total 1000)
      await fToken.mint(user1.address, ethers.utils.parseEther("500"), "0x1");
      await fToken.mint(user2.address, ethers.utils.parseEther("300"), "0x2");
      await fToken.mint(user3.address, ethers.utils.parseEther("200"), "0x3");
    });

    it("Should distribute 2000 ETH correctly (1000/600/400)", async function () {
      const rentAmount = ethers.utils.parseEther("2000");
      
      // Deposit rent
      await distribution.depositRent({ value: rentAmount });
      
      const round = await distribution.currentRound();
      expect(round).to.equal(1);
      
      // Check claimable amounts
      const claimable1 = await distribution.getClaimableAmount(user1.address, round);
      const claimable2 = await distribution.getClaimableAmount(user2.address, round);
      const claimable3 = await distribution.getClaimableAmount(user3.address, round);
      
      expect(claimable1.toString()).to.equal(ethers.utils.parseEther("1000").toString());
      expect(claimable2.toString()).to.equal(ethers.utils.parseEther("600").toString());
      expect(claimable3.toString()).to.equal(ethers.utils.parseEther("400").toString());
    });

    it("Should handle dust correctly", async function () {
      // Use amount that creates dust: 101 ETH / 1000 tokens = 0.101 per token
      // Integer division: 101000000000000000000 / 1000000000000000000000 = 0 per token
      // All becomes dust
      const rentAmount = ethers.utils.parseEther("101");
      
      await distribution.depositRent({ value: rentAmount });
      
      const round = await distribution.currentRound();
      const distInfo = await distribution.distributions(round);
      
      // With 1000 total supply and 101 ETH:
      // 101 ETH = 101000000000000000000 wei
      // 1000 fSKY = 1000000000000000000000 wei
      // Per token: 101000000000000000000 / 1000000000000000000000 = 0.101 ETH per token
      // Integer division: 101000000000000000000 / 1000000000000000000000 = 0 (with remainder)
      
      expect(distInfo.dustRemaining).to.equal(ethers.utils.parseEther("101"));
      expect(await distribution.totalDustAccumulated()).to.equal(ethers.utils.parseEther("101"));
    });

    it("Should accumulate dust across rounds", async function () {
      // First round with dust
      await distribution.depositRent({ value: ethers.utils.parseEther("1001") });
      
      // Second round should include previous dust
      await distribution.depositRent({ value: ethers.utils.parseEther("1999") });
      
      const round2 = await distribution.currentRound();
      const distInfo2 = await distribution.distributions(round2);
      
      // First round: 1001 ETH → 1000 ETH distributed, 1 ETH dust
      // Second round: 1999 ETH + 1 ETH dust = 2000 ETH → 2000 ETH distributed, 0 dust
      expect(distInfo2.totalAmount.toString()).to.equal(ethers.utils.parseEther("2000").toString());
      expect(distInfo2.dustRemaining).to.equal(0);
    });

    it("Should prevent double claiming", async function () {
      await distribution.depositRent({ value: ethers.utils.parseEther("2000") });
      
      const round = await distribution.currentRound();
      
      // First claim should succeed
      await distribution.connect(user1).claimPayment(round);
      
      // Second claim should fail
      await expect(
        distribution.connect(user1).claimPayment(round)
      ).to.be.revertedWith("Already claimed");
    });

    it("Should handle zero balance holders", async function () {
      // Create holder with zero balance
      const [, , , , zeroUser] = await ethers.getSigners();
      
      await distribution.depositRent({ value: ethers.utils.parseEther("2000") });
      
      const round = await distribution.currentRound();
      const claimable = await distribution.getClaimableAmount(zeroUser.address, round);
      
      expect(claimable).to.equal(0);
    });
  });

  describe("Claiming", function () {
    beforeEach(async function () {
      // Setup and distribute
      await fToken.mint(user1.address, ethers.utils.parseEther("50"), "0x1");
      await fToken.mint(user2.address, ethers.utils.parseEther("30"), "0x2");
      await fToken.mint(user3.address, ethers.utils.parseEther("20"), "0x3");
      
      await distribution.depositRent({ value: ethers.utils.parseEther("200") });
    });

    it("Should transfer correct amount on claim", async function () {
      const round = await distribution.currentRound();
      const balanceBefore = await ethers.provider.getBalance(user1.address);
      
      const tx = await distribution.connect(user1).claimPayment(round);
      const receipt = await tx.wait();
      
      const balanceAfter = await ethers.provider.getBalance(user1.address);
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      const netReceived = balanceAfter - balanceBefore + gasUsed;
      
      expect(netReceived).to.equal(ethers.utils.parseEther("100"));
    });

    it("Should emit PaymentClaimed event", async function () {
      const round = await distribution.currentRound();
      
      await expect(distribution.connect(user1).claimPayment(round))
        .to.emit(distribution, "PaymentClaimed")
        .withArgs(user1.address, round, ethers.utils.parseEther("100"));
    });

    it("Should handle multiple round claims", async function () {
      // Create second round
      await distribution.depositRent({ value: ethers.utils.parseEther("100") });
      
      const rounds = [1, 2];
      await distribution.connect(user1).claimMultipleRounds(rounds);
      
      // Check both rounds are claimed
      expect(await distribution.claimed(user1.address, 1)).to.be.true;
      expect(await distribution.claimed(user1.address, 2)).to.be.true;
    });

    it("Should return unclaimed rounds correctly", async function () {
      // Create multiple rounds
      await distribution.depositRent({ value: ethers.utils.parseEther("100") });
      await distribution.depositRent({ value: ethers.utils.parseEther("100") });
      
      // Claim only round 1
      await distribution.connect(user1).claimPayment(1);
      
      const unclaimed = await distribution.getUnclaimedRounds(user1.address);
      expect(unclaimed.length).to.equal(2);
      expect(unclaimed[0]).to.equal(2);
      expect(unclaimed[1]).to.equal(3);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to withdraw dust", async function () {
      // Create dust
      await fToken.mint(user1.address, ethers.utils.parseEther("1000"), "0x1");
      await distribution.depositRent({ value: ethers.utils.parseEther("501") });
      
      const dustBefore = await distribution.totalDustAccumulated();
      expect(dustBefore).to.be.gt(0);
      
      await distribution.withdrawDust();
      
      const dustAfter = await distribution.totalDustAccumulated();
      expect(dustAfter).to.equal(0);
    });

    it("Should reject dust withdrawal from non-owner", async function () {
      await expect(
        distribution.connect(user1).withdrawDust()
      ).to.be.reverted;
    });

    it("Should reject rent deposit with zero value", async function () {
      await expect(
        distribution.depositRent({ value: 0 })
      ).to.be.revertedWith("No rent to distribute");
    });

    it("Should reject rent deposit with no token holders", async function () {
      const emptyDistribution = await (await ethers.getContractFactory("Distribution"))
        .deploy(fToken.address, owner.address);
      
      await expect(
        emptyDistribution.depositRent({ value: ethers.utils.parseEther("100") })
      ).to.be.reverted;
    });
  });
});