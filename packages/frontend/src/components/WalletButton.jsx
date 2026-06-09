import React, { useState, useEffect } from "react";

export default function WalletButton({ onAccountChange }) {
  const [account, setAccount] = useState("");

  // 1. Check connection status on initial render
  useEffect(() => {
    checkIfWalletIsConnected();
    setupWalletListeners();

    // Cleanup listeners on unmount
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  // Check if an account is already authorized (prevents asking to connect on every refresh)
  const checkIfWalletIsConnected = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          const currentAccount = accounts[0];
          setAccount(currentAccount);
          if (onAccountChange) onAccountChange(currentAccount); // Pass state up if needed
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    }
  };

  // 2. The manual Connect Function triggered by the button
  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        // Prompts MetaMask/Rabby to open and request connection
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const currentAccount = accounts[0];
        setAccount(currentAccount);
        if (onAccountChange) onAccountChange(currentAccount);
      } catch (error) {
        if (error.code === 4001) {
          console.log("User rejected the connection request.");
        } else {
          console.error("Connection error:", error);
        }
      }
    } else {
      alert("Please install MetaMask or Rabby Wallet to use this feature!");
    }
  };

  // 3. Listeners to handle when the user changes accounts or network dynamically
  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      setAccount("");
      if (onAccountChange) onAccountChange("");
    } else {
      // User switched to a different account
      setAccount(accounts[0]);
      if (onAccountChange) onAccountChange(accounts[0]);
    }
  };

  const handleChainChanged = () => {
    // Ethers.js strongly recommends reloading the page on chain changes
    window.location.reload();
  };

  const setupWalletListeners = () => {
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    }
  };

  // 4. Helper to truncate the address (e.g., 0x1234...ABCD)
  const formatAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <button 
      onClick={connectWallet}
      className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#ffcc00] to-[#ffaa00] text-black font-bold transition-transform hover:scale-105 active:scale-95"
    >
      {account ? `Connected: ${formatAddress(account)}` : "Connect Wallet"}
    </button>
  );
}