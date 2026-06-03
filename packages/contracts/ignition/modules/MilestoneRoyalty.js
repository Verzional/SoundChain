const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("MilestoneRoyaltyModule", (m) => {
  // Hardhat Account #1 address (this matches the ORACLE_PRIVATE_KEY used in your oracle.js backend)
  const defaultOracleAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  const initialOracleAddress = m.getParameter(
    "oracleAddress",
    defaultOracleAddress,
  );

  // 1. Automatically deploy the Mock ERC20 Token first for local testing
  // Constructor arguments: Name ("Mock USDC"), Symbol ("USDC"), Decimals (6)
  const mockUSDC = m.contract("MockERC20", ["Mock USDC", "USDC", 6]);

  // 2. Deploy MilestoneRoyalty and pass the freshly deployed mockUSDC contract reference as an argument
  const milestoneRoyalty = m.contract("MilestoneRoyalty", [
    initialOracleAddress,
    mockUSDC, // Ignition automatically resolves this to the deployed token's address
  ]);

  return { mockUSDC, milestoneRoyalty };
});
