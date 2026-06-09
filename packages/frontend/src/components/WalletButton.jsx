import React, { useState, useEffect } from "react";

export default function WalletButton({ onAccountChange }) {
  const [account, setAccount] = useState("");

  useEffect(() => {
    checkIfWalletIsConnected();
    setupWalletListeners();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  const checkIfWalletIsConnected = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          const currentAccount = accounts[0];
          setAccount(currentAccount);
          if (onAccountChange) onAccountChange(currentAccount);
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const currentAccount = accounts[0];
        setAccount(currentAccount);
        if (onAccountChange) onAccountChange(currentAccount);
      } catch (error) {
        console.error("Connection error:", error);
      }
    } else {
      alert("Please install MetaMask or Rabby Wallet!");
    }
  };

  const disconnectWallet = () => {
    // Clear the local React state
    setAccount("");
    if (onAccountChange) onAccountChange("");
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      setAccount("");
      if (onAccountChange) onAccountChange("");
    } else {
      setAccount(accounts[0]);
      if (onAccountChange) onAccountChange(accounts[0]);
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  // THIS WAS THE MISSING PIECE!
  const setupWalletListeners = () => {
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    }
  };

  const formatAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="relative group">
      {account ? (
        // UI when Connected
        <button 
          onClick={disconnectWallet}
          className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-bold transition-all hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50"
          title="Click to disconnect"
        >
          <span className="group-hover:hidden">Connected: {formatAddress(account)}</span>
          <span className="hidden group-hover:inline">Disconnect Wallet</span>
        </button>
      ) : (
        // UI when Disconnected
        <button 
          onClick={connectWallet}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#ffcc00] to-[#ffaa00] text-black font-bold transition-transform hover:scale-105 active:scale-95"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}