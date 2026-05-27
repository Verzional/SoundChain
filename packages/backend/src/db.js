const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Initialize a local SQLite database file
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../soundchain.sqlite'),
  logging: false, // Keep logs clean
});

// Define the off-chain Track model to store streams and IPFS CID hashes
const Track = sequelize.define('Track', {
  title: { type: DataTypes.STRING, allowNull: false },
  artistAddress: { type: DataTypes.STRING, allowNull: false },
  streamCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  ipfsHash: { type: DataTypes.STRING, allowNull: true }, // Media storage tracking
  lastValidatedMilestone: { type: DataTypes.INTEGER, defaultValue: 0 }
});

async function initDB() {
  await sequelize.sync({ force: true }); // Wipe and rebuild database on start for local dev testing
  
  // Seed a sample track for testing
  await Track.create({
    title: "Milestone Track",
    artistAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // Hardhat Account #0
    streamCount: 150000, // Pre-loaded with streams ready to hit a milestone
    ipfsHash: "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco" 
  });
  
  console.log("💾 SQLite Database initialized and seeded locally!");
}

module.exports = { sequelize, Track, initDB };