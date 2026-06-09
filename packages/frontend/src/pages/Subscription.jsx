import React, { useState } from "react";
import { ethers } from "ethers";

// IMPORTANT: Replace this with your actual newly deployed contract address!
const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; 

// Minimal ABI required for Subscription
const CONTRACT_ABI = [
  "function subscribePlatform() public",
  "function usdcToken() public view returns (address)",
  "function userRoles(address) public view returns (uint8)",
  "function registerAccount(address user, uint8 _role) public"
];

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function balanceOf(address account) public view returns (uint256)"
];

export default function Subscription() {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscribe = async (amountInUSDC) => {
    if (!window.ethereum) return alert("Please install MetaMask or Rabby!");
    
    setIsProcessing(true);
    try {
      // 1. Setup Ethers provider & signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      // 2. Connect to Royalty Contract
      const royaltyContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // (Optional Safety Check) Ensure user is registered as a LISTENER (Role 1)
      const currentRole = await royaltyContract.userRoles(userAddress);
      if (currentRole === 0n) {
        console.log("Registering as Listener first...");
        const regTx = await royaltyContract.registerAccount(userAddress, 1); // 1 = LISTENER
        await regTx.wait();
      }

      // 3. Find the Mock USDC Token Address from the contract
      const usdcAddress = await royaltyContract.usdcToken();
      const usdcContract = new ethers.Contract(usdcAddress, ERC20_ABI, signer);

      // 4. Approve USDC spending (5 USDC = 5 * 10^6 because USDC has 6 decimals)
      const amountToApprove = ethers.parseUnits(amountInUSDC.toString(), 6);
      
      console.log(`Approving ${amountInUSDC} USDC...`);
      const approveTx = await usdcContract.approve(CONTRACT_ADDRESS, amountToApprove);
      await approveTx.wait();

      // 5. Execute the Subscription
      console.log("Subscribing to platform...");
      const subscribeTx = await royaltyContract.subscribePlatform();
      await subscribeTx.wait();

      alert("🎉 Successfully subscribed to SoundChain!");

    } catch (error) {
      console.error(error);
      alert("Subscription failed: " + (error.reason || error.message));
    }
    setIsProcessing(false);
  };

  return (
    <div className="px-10 py-20">
      <h1 className="text-6xl font-black mb-12">Subscription Plans</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Basic Plan - Connected to the Smart Contract default fee */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <h2 className="text-3xl font-bold">Basic</h2>
          <p className="mt-4 text-5xl font-black text-[#ffcc00]">5 USDC</p>
          <button 
            onClick={() => handleSubscribe(5)}
            disabled={isProcessing}
            className="w-full mt-8 p-4 gradient text-black rounded-xl font-bold disabled:opacity-50"
          >
            {isProcessing ? "Processing..." : "Subscribe"}
          </button>
        </div>

        {/* Pro Plan - Visual Only for now */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 opacity-50">
          <h2 className="text-3xl font-bold">Pro</h2>
          <p className="mt-4 text-5xl font-black text-[#ffcc00]">10 USDC</p>
          <button disabled className="w-full mt-8 p-4 bg-white/10 text-white rounded-xl font-bold">
            Coming Soon
          </button>
        </div>

        {/* Enterprise Plan - Visual Only for now */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 opacity-50">
          <h2 className="text-3xl font-bold">Enterprise</h2>
          <p className="mt-4 text-5xl font-black text-[#ffcc00]">20 USDC</p>
          <button disabled className="w-full mt-8 p-4 bg-white/10 text-white rounded-xl font-bold">
            Coming Soon
          </button>
        </div>
      </div>
    </div>
  );
}