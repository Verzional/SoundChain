import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

// IMPORTANT: Remember to update this after you redeploy!
const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; 

const CONTRACT_ABI = [
  "function subscribePlatform() public",
  "function usdcToken() public view returns (address)",
  "function userRoles(address) public view returns (uint8)",
  "function registerAccount(address user, uint8 _role) public",
  "function isSubscribed(address) public view returns (bool)",
  "function subscriptionFee() public view returns (uint256)"
];

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function balanceOf(address account) public view returns (uint256)",
  "function allowance(address owner, address spender) public view returns (uint256)"
];

export default function Subscription() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [account, setAccount] = useState("");

  // Check Subscription Status on Page Load
  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();
        setAccount(userAddress);

        const royaltyContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        const status = await royaltyContract.isSubscribed(userAddress);
        setHasActiveSubscription(status);
      } catch (error) {
        console.log("Not connected or error fetching status.");
      }
    }
  };

  const handleSubscribe = async (amountInUSDC) => {
    if (!window.ethereum) return alert("Please install MetaMask!");
    setIsProcessing(true);
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      const royaltyContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const currentRole = await royaltyContract.userRoles(userAddress);
      if (currentRole === 0n) {
        console.log("Registering user role...");
        const regTx = await royaltyContract.registerAccount(userAddress, 1);
        await regTx.wait();
      }

      const usdcAddress = await royaltyContract.usdcToken();
      const usdcContract = new ethers.Contract(usdcAddress, ERC20_ABI, signer);
      const requiredFee = await royaltyContract.subscriptionFee();
      const userBalance = await usdcContract.balanceOf(userAddress);
      
      if (userBalance < requiredFee) {
          alert(`❌ INSUFFICIENT BALANCE:\n\nRequires: ${requiredFee.toString()} wei\nYou have: ${userBalance.toString()} wei.`);
          setIsProcessing(false);
          return;
      }

      console.log("Approving USDC...");
      const approveTx = await usdcContract.approve(CONTRACT_ADDRESS, ethers.MaxUint256);
      await approveTx.wait();

      console.log("Executing Subscription...");
      const subscribeTx = await royaltyContract.subscribePlatform();
      await subscribeTx.wait();

      alert("🎉 Successfully subscribed to SoundChain!");
      
      // Instantly update the UI without needing to refresh
      setHasActiveSubscription(true);

    } catch (error) {
      const explicitError = error.reason || error.shortMessage || error.message;
      alert(`❌ BLOCKCHAIN REJECTED TX:\n\n${explicitError}`);
    }
    setIsProcessing(false);
  };

  return (
    <div className="px-10 py-20">
      <h1 className="text-6xl font-black mb-12">Subscription Plans</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Basic Plan */}
        <div className={`border rounded-3xl p-8 transition-all ${
            hasActiveSubscription 
            ? "bg-green-500/10 border-green-500/50" // Green highlight when active
            : "bg-white/5 border-white/10"
        }`}>
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold">Basic</h2>
            {hasActiveSubscription && (
              <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm font-bold rounded-full">
                ACTIVE
              </span>
            )}
          </div>
          <p className="mt-4 text-5xl font-black text-[#ffcc00]">5 USDC</p>
          
          <button 
            onClick={() => handleSubscribe(5)}
            disabled={isProcessing || hasActiveSubscription}
            className={`w-full mt-8 p-4 rounded-xl font-bold transition-all ${
              hasActiveSubscription 
              ? "bg-white/10 text-white/50 cursor-not-allowed" // Disabled look
              : "gradient text-black"
            }`}
          >
            {isProcessing ? "Processing..." : hasActiveSubscription ? "Currently Subscribed" : "Subscribe"}
          </button>
        </div>

        {/* Pro Plan */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 opacity-50">
          <h2 className="text-3xl font-bold">Pro</h2>
          <p className="mt-4 text-5xl font-black text-[#ffcc00]">10 USDC</p>
          <button disabled className="w-full mt-8 p-4 bg-white/10 text-white rounded-xl font-bold">
            Coming Soon
          </button>
        </div>

        {/* Enterprise Plan */}
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