const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MilestoneRoyalty - Oracle Supported Features", function () {
  let MilestoneRoyalty, milestoneRoyalty;
  let MockUSDC, mockUSDC;
  let owner, oracle, artist, listener, externalUser;

  const subscriptionFee = ethers.parseUnits("5", 6); // 5 USDC
  const payoutPerMilestone = ethers.parseUnits("10", 6); // 10 USDC

  beforeEach(async function () {
    [owner, oracle, artist, listener, externalUser] = await ethers.getSigners();

    MockUSDC = await ethers.getContractFactory("MockERC20"); 
    mockUSDC = await MockUSDC.deploy("Mock USDC", "USDC", 6);

    MilestoneRoyalty = await ethers.getContractFactory("MilestoneRoyalty");
    milestoneRoyalty = await MilestoneRoyalty.deploy(oracle.address, mockUSDC.target);

    // Mint USDC
    await mockUSDC.mint(milestoneRoyalty.target, ethers.parseUnits("1000", 6));
    await mockUSDC.mint(listener.address, ethers.parseUnits("100", 6));
  });

  // ==========================================
  // FEATURE 1: ROLE REGISTRATION
  // ==========================================
  describe("Role Registration", function () {
    it("1. Should successfully register a user as an Artist", async function () {
      // Disesuaikan: Menambahkan artist.address sebagai argumen pertama
      await expect(milestoneRoyalty.connect(artist).registerAccount(artist.address, 2))
        .to.emit(milestoneRoyalty, "UserRegistered")
        .withArgs(artist.address, 2);

      expect(await milestoneRoyalty.userRoles(artist.address)).to.equal(2);
    });

    it("2. Should successfully register a user as a Listener", async function () {
      await expect(milestoneRoyalty.connect(listener).registerAccount(listener.address, 1))
        .to.emit(milestoneRoyalty, "UserRegistered")
        .withArgs(listener.address, 1);
    });

    it("3. Should prevent double registration", async function () {
      await milestoneRoyalty.connect(listener).registerAccount(listener.address, 1);
      
      await expect(
        milestoneRoyalty.connect(listener).registerAccount(listener.address, 2)
      ).to.be.revertedWith("Akun sudah terdaftar");
    });
  });

  // ==========================================
  // FEATURE 2: PLATFORM SUBSCRIPTION
  // ==========================================
  describe("Platform Subscription", function () {
    beforeEach(async function () {
      await milestoneRoyalty.connect(listener).registerAccount(listener.address, 1);
    });

    it("1. Should allow a Listener to subscribe and transfer USDC to Contract Treasury", async function () {
      await mockUSDC.connect(listener).approve(milestoneRoyalty.target, subscriptionFee);

      await expect(milestoneRoyalty.connect(listener).subscribePlatform())
        .to.emit(milestoneRoyalty, "Subscribed")
        .withArgs(listener.address, subscriptionFee);

      expect(await milestoneRoyalty.isSubscribed(listener.address)).to.be.true;
      
      // Disesuaikan: Mengecek saldo milestoneRoyalty.target (address(this)), BUKAN owner.address
      expect(await mockUSDC.balanceOf(milestoneRoyalty.target)).to.equal(ethers.parseUnits("1005", 6));
    });

    it("2. Should revert if an Unregistered User attempts to subscribe", async function () {
      // Disesuaikan: Karena Artist sekarang boleh subscribe, kita tes pakai externalUser (NONE)
      await expect(
        milestoneRoyalty.connect(externalUser).subscribePlatform()
      ).to.be.revertedWith("Must be a registered user");
    });
  });

  // ==========================================
  // FEATURE 3 & 4: RESTRICTED UPLOADS & EDITING
  // ==========================================
  describe("Song Registration & Editing", function () {
    beforeEach(async function () {
      await milestoneRoyalty.connect(artist).registerAccount(artist.address, 2);
      await milestoneRoyalty.connect(listener).registerAccount(listener.address, 1);
    });

    it("1. Should allow an Artist to upload a song", async function () {
      // Disesuaikan: Menambahkan artist.address sebagai argumen pertama
      await expect(
        milestoneRoyalty.connect(artist).registerSong(artist.address, "song1", "ipfsHashA", [artist.address], [100])
      ).to.emit(milestoneRoyalty, "SongRegistered")
       .withArgs("song1", artist.address, [artist.address]);
    });

    it("2. Should revert if a Listener attempts to upload a song", async function () {
      // Disesuaikan: Pesan error baru dari kontrak
      await expect(
        milestoneRoyalty.connect(listener).registerSong(listener.address, "song1", "ipfsHashA", [listener.address], [100])
      ).to.be.revertedWith("Creator must be an Artist");
    });

    it("3. Should allow the original Creator to edit their song", async function () {
      await milestoneRoyalty.connect(artist).registerSong(artist.address, "song1", "ipfsHashA", [artist.address], [100]);

      await expect(
        milestoneRoyalty.connect(artist).editSong("song1", "ipfsHashB", [artist.address, listener.address], [60, 40])
      ).to.emit(milestoneRoyalty, "SongEdited")
       .withArgs("song1", "ipfsHashB", [artist.address, listener.address], [60, 40]);

      const details = await milestoneRoyalty.getSongDetails("song1");
      expect(details[1]).to.equal("ipfsHashB");
    });

    it("4. Should revert if a non-creator attempts to edit the song", async function () {
      await milestoneRoyalty.connect(artist).registerSong(artist.address, "song1", "ipfsHashA", [artist.address], [100]);

      await expect(
        milestoneRoyalty.connect(externalUser).editSong("song1", "ipfsHashB", [externalUser.address], [100])
      ).to.be.revertedWith("Not authorized");
    });
  });
});