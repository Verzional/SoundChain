require("dotenv").config();
const express = require("express");
const cors = require("cors"); // 1. Add this import
const { ethers } = require("ethers");
const { initDB, Track } = require("./db");

const app = express();
app.use(cors()); // 2. Add this line to enable cross-origin requests!
app.use(express.json());

const PORT = 3001;
// ... rest of your code

// 1. Web3 / Hardhat Provider Setup
const LOCAL_RPC_URL = "http://127.0.0.1:8545";
const ORACLE_PRIVATE_KEY =
  "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

const provider = new ethers.JsonRpcProvider(LOCAL_RPC_URL);
const wallet = new ethers.Wallet(ORACLE_PRIVATE_KEY, provider);

const ContractArtifact = require("../../contracts/artifacts/contracts/MilestoneRoyalty.sol/MilestoneRoyalty.json");
const CONTRACT_ADDRESS = "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512"; // Update after deployment

// 2. Oracle stream validation logic
async function triggerMilestoneUpdate(trackId) {
  try {
    const track = await Track.findByPk(trackId);
    if (!track) return { success: false, error: "Track not found" };

    console.log(`\n🔮 Oracle verifying stream metrics for: "${track.title}"`);
    console.log(`Off-chain streams counted: ${track.streamCount}`);

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      ContractArtifact.abi,
      wallet,
    );

    console.log(
      "⚡ Broadcasting off-chain verification payload to the smart contract...",
    );

    // MATCHED WITH SMART CONTRACT: updateStreamCount(string songId, uint256 newTotalStreams)
    const tx = await contract.updateStreamCount(
      track.id.toString(),
      track.streamCount,
    );
    await tx.wait();

    track.lastValidatedMilestone = track.streamCount;
    await track.save();

    return { success: true, txHash: tx.hash };
  } catch (error) {
    console.error("❌ Oracle transaction failed:", error.message);
    return { success: false, error: error.message };
  }
}

// 3. API Endpoints for Frontend Interaction

// View all off-chain stats
app.get("/api/tracks", async (req, res) => {
  const tracks = await Track.findAll();
  res.json(tracks);
});

// SIMULATE STREAMING: Frontend calls this when a user plays a song
app.post("/api/play/:id", async (req, res) => {
  try {
    const track = await Track.findByPk(req.params.id);
    if (!track) return res.status(404).json({ error: "Track not found" });

    track.streamCount += 1;
    await track.save();

    res.json({
      message: "Stream recorded successfully",
      streamCount: track.streamCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// TRIGGER ORACLE: Push the off-chain streams to the blockchain
app.post("/api/sync/:id", async (req, res) => {
  const result = await triggerMilestoneUpdate(req.params.id);
  if (result.success) {
    res.json({
      message: "Successfully executed contract milestone payout",
      txHash: result.txHash,
    });
  } else {
    res.status(500).json({ error: result.error });
  }
});

// REGISTER SONG (Optional helper): Registers the song on-chain so the Oracle doesn't revert
app.post("/api/register/:id", async (req, res) => {
  try {
    const track = await Track.findByPk(req.params.id);
    if (!track) return res.status(404).json({ error: "Track not found" });

    // Ensure CONTRACT_ADDRESS is passed here, NOT a hardcoded string!
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      ContractArtifact.abi,
      wallet,
    );

    const tx = await contract.registerSong(
      track.id.toString(),
      track.ipfsHash || "QmDefaultHash",
      [track.artistAddress],
      [100],
    );
    await tx.wait();

    res.json({ message: "Track registered on-chain", txHash: tx.hash });
  } catch (error) {
    console.error("Registration error details:", error); // Log the real error to backend terminal
    res.status(500).json({ error: error.message });
  }
});

// HELPER TO MINT FREE MOCK USDC TO THE ROYALTY CONTRACT FOR TESTING
app.post('/api/fund-contract', async (req, res) => {
  try {
    // 1. Get the Mock ERC20 Token Address from the MilestoneRoyalty contract
    const royaltyContract = new ethers.Contract(CONTRACT_ADDRESS, ContractArtifact.abi, wallet);
    const tokenAddress = await royaltyContract.usdcToken();

    // 2. Load the Mock ERC20 ABI to call its mint function
    // We can use a minimal inline ABI for minting
    const mockErc20Abi = [
      "function mint(address to, uint256 amount) public",
      "function balanceOf(address account) public view returns (uint256)"
    ];
    const tokenContract = new ethers.Contract(tokenAddress, mockErc20Abi, wallet);

    // 3. Mint 1,000,000 USDC (6 decimals) directly to the MilestoneRoyalty contract address
    const amountToMint = ethers.parseUnits("1000000", 6);
    console.log(`🪙 Minting testing liquidity to royalty contract at: ${CONTRACT_ADDRESS}...`);
    
    const tx = await tokenContract.mint(CONTRACT_ADDRESS, amountToMint);
    await tx.wait();

    const newBalance = await tokenContract.balanceOf(CONTRACT_ADDRESS);
    res.json({ 
      success: true, 
      message: "Contract successfully funded with testing USDC!", 
      contractBalance: ethers.formatUnits(newBalance, 6) 
    });
  } catch (error) {
    console.error("Funding failed:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// CREATE A NEW OFF-CHAIN TRACK AND REGISTER IT ON-CHAIN
app.post('/api/tracks/upload', async (req, res) => {
  try {
    const { title, ipfsHash, artistAddress } = req.body;

    if (!title || !artistAddress) {
      return res.status(400).json({ error: "Missing title or artistAddress" });
    }

    // 1. Save track to the SQLite off-chain database first
    const newTrack = await Track.create({
      title: title,
      artistAddress: artistAddress,
      streamCount: 0,
      ipfsHash: ipfsHash || "QmDefaultHash",
      lastValidatedMilestone: 0
    });

    // 2. Instantiate smart contract to bind it on the blockchain
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ContractArtifact.abi, wallet);
    
    console.log(`⛓️ Registering newly created Track #${newTrack.id} on the blockchain...`);
    const tx = await contract.registerSong(
        newTrack.id.toString(), 
        newTrack.ipfsHash, 
        [newTrack.artistAddress], 
        [100] // 100% payout share to the artist
    );
    await tx.wait();

    res.json({ 
      success: true, 
      message: "Track saved to database and registered on-chain!", 
      trackId: newTrack.id,
      txHash: tx.hash 
    });
  } catch (error) {
    console.error("Upload workflow failed:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// BULK INCREMENT OFF-CHAIN STREAMS (Perfect for testing milestones)
app.post('/api/play-bulk/:id', async (req, res) => {
  try {
    const amount = parseInt(req.body.amount) || 500; // Default to 500 if not specified
    const track = await Track.findByPk(req.params.id);
    
    if (!track) return res.status(404).json({ error: "Track not found" });

    track.streamCount += amount;
    await track.save();

    res.json({ 
      message: `Successfully simulated ${amount} streams`, 
      newStreamCount: track.streamCount 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the Backend Node
async function startServer() {
  await initDB();
  app.listen(PORT, () => {
    console.log(
      `🚀 SoundChain Oracle API Server running on http://localhost:${PORT}`,
    );
  });
}

startServer();
