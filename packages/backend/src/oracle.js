require('dotenv').config();
const express = require('express');
const { ethers } = require('ethers');
const { initDB, Track } = require('./db');

const app = express();
app.use(express.json());

const PORT = 3001;

// 1. Web3 / Hardhat Provider Setup
const LOCAL_RPC_URL = "http://127.0.0.1:8545";
// Hardhat Account #1 Private Key (used as our Oracle operator wallet)
const ORACLE_PRIVATE_KEY = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"; 

const provider = new ethers.JsonRpcProvider(LOCAL_RPC_URL);
const wallet = new ethers.Wallet(ORACLE_PRIVATE_KEY, provider);

// Load the compiled Smart Contract ABI
const ContractArtifact = require('../../contracts/artifacts/contracts/MilestoneRoyalty.sol/MilestoneRoyalty.json');
// NOTE: Change this address once your Smart Contract Engineer deploys the contract to Hardhat
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 

// 2. Oracle stream validation logic
async function triggerMilestoneUpdate(trackId) {
  try {
    const track = await Track.findByPk(trackId);
    if (!track) return { success: false, error: "Track not found" };

    console.log(`\n🔮 Oracle verifying stream metrics for: "${track.title}"`);
    console.log(`Off-chain streams counted: ${track.streamCount}`);

    // Create a live contract instance signed by our backend operator wallet
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ContractArtifact.abi, wallet);

    console.log("⚡ Broadcasting off-chain verification payload to the smart contract...");
    
    // Call the function on the smart contract directly!
    const tx = await contract.claimMilestonePayout(track.streamCount);
    await tx.wait(); // Wait for the transaction to block build on Hardhat

    // Update state database
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
app.get('/api/tracks', async (req, res) => {
  const tracks = await Track.findAll();
  res.json(tracks);
});

// Trigger an explicit Oracle sync loop
app.post('/api/sync/:id', async (req, res) => {
  const result = await triggerMilestoneUpdate(req.params.id);
  if (result.success) {
    res.json({ message: "Successfully executed contract milestone payout", txHash: result.txHash });
  } else {
    res.status(500).json({ error: result.error });
  }
});

// Start the Backend Node
async function startServer() {
  await initDB(); // Initialize local database storage
  app.listen(PORT, () => {
    console.log(`🚀 SoundChain Oracle API Server running on http://localhost:${PORT}`);
  });
}

startServer();