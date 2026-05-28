const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MilestoneRoyalty", function () {
  let MilestoneRoyalty, milestoneRoyalty;
  let MockUSDC, mockUSDC;
  let owner, oracle, artist1, artist2, externalUser;

  const payoutPerMilestone = ethers.parseUnits("10", 6); // 10 USDC

  beforeEach(async function () {
    [owner, oracle, artist1, artist2, externalUser] = await ethers.getSigners();

    // Deploy Mock USDC (Requires a basic MockERC20 contract in your contracts folder)
    MockUSDC = await ethers.getContractFactory("MockERC20"); 
    mockUSDC = await MockUSDC.deploy("Mock USDC", "USDC", 6);

    // Deploy Milestone Royalty Contract
    MilestoneRoyalty = await ethers.getContractFactory("MilestoneRoyalty");
    milestoneRoyalty = await MilestoneRoyalty.deploy(oracle.address, mockUSDC.target);

    // Mint USDC to the royalty contract to simulate available liquidity
    await mockUSDC.mint(milestoneRoyalty.target, ethers.parseUnits("1000", 6));
  });

  // ==========================================
  // POSITIVE TEST CASES (3 Cases)
  // ==========================================
  describe("Positive Test Cases", function () {
    it("1. Should successfully register a song with valid shares", async function () {
      await expect(
        milestoneRoyalty.registerSong("song1", "ipfsHash123", [artist1.address, artist2.address], [60, 40])
      ).to.emit(milestoneRoyalty, "SongRegistered")
       .withArgs("song1", [artist1.address, artist2.address]);

      const details = await milestoneRoyalty.getSongDetails("song1");
      expect(details[0]).to.equal("ipfsHash123");
      expect(details[1]).to.equal(0);
      expect(details[2]).to.equal(1000);
    });

    it("2. Should update stream count without triggering payout if milestone is not reached", async function () {
      await milestoneRoyalty.registerSong("song1", "ipfsHash123", [artist1.address, artist2.address], [60, 40]);
      
      await expect(
        milestoneRoyalty.connect(oracle).updateStreamCount("song1", 500)
      ).to.emit(milestoneRoyalty, "StreamsUpdated")
       .withArgs("song1", 500)
       .and.to.not.emit(milestoneRoyalty, "MilestoneReached");
    });

    it("3. Should reach milestone, transfer stablecoins, and emit RoyaltyPaid events", async function () {
      await milestoneRoyalty.registerSong("song1", "ipfsHash123", [artist1.address, artist2.address], [60, 40]);

      // Trigger streams to exactly 1000
      await expect(milestoneRoyalty.connect(oracle).updateStreamCount("song1", 1000))
        .to.emit(milestoneRoyalty, "MilestoneReached").withArgs("song1", 1000)
        .and.to.emit(milestoneRoyalty, "RoyaltyPaid").withArgs("song1", artist1.address, ethers.parseUnits("6", 6))
        .and.to.emit(milestoneRoyalty, "RoyaltyPaid").withArgs("song1", artist2.address, ethers.parseUnits("4", 6));

      // Verify balances transferred properly
      expect(await mockUSDC.balanceOf(artist1.address)).to.equal(ethers.parseUnits("6", 6));
      expect(await mockUSDC.balanceOf(artist2.address)).to.equal(ethers.parseUnits("4", 6));
    });
  });

  // ==========================================
  // NEGATIVE TEST CASES (3 Cases)
  // ==========================================
  describe("Negative Test Cases", function () {
    it("1. Should revert when a non-owner attempts to set a new oracle", async function () {
      await expect(
        milestoneRoyalty.connect(externalUser).setOracle(externalUser.address)
      ).to.be.revertedWith("Hanya owner yang diizinkan");
    });

    it("2. Should revert when registering a song with shares not totaling 100", async function () {
      await expect(
        milestoneRoyalty.registerSong("song1", "ipfsHash123", [artist1.address, artist2.address], [50, 40])
      ).to.be.revertedWith("Total persentase harus 100");
    });

    it("3. Should revert when a non-oracle attempts to update the stream count", async function () {
      await milestoneRoyalty.registerSong("song1", "ipfsHash123", [artist1.address, artist2.address], [60, 40]);
      
      await expect(
        milestoneRoyalty.connect(externalUser).updateStreamCount("song1", 500)
      ).to.be.revertedWith("Hanya oracle yang diizinkan");
    });
  });
});