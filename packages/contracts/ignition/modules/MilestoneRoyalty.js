const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("MilestoneRoyaltyModule", (m) => {
  // Replace these with actual addresses or deploy a mock token first for testnets
  const initialOracleAddress = m.getParameter("oracleAddress", "0xYourOracleAddressHere");
  const usdcTokenAddress = m.getParameter("usdcAddress", "0xYourUSDCTokenAddressHere");

  const milestoneRoyalty = m.contract("MilestoneRoyalty", [
    initialOracleAddress,
    usdcTokenAddress,
  ]);

  return { milestoneRoyalty };
});