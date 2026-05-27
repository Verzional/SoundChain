import React from "react"
import { useState } from "react";

export default function WalletButton() {
  const [wallet, setWallet] = useState("");

  async function connectWallet() {
    if (!window.ethereum) {
      alert("Install MetaMask terlebih dahulu");
      return;
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    setWallet(accounts[0]);
  }

  return (
    <button
      onClick={connectWallet}
      className="px-5 py-3 rounded-xl font-bold gradient text-black hover:scale-105 transition"
    >
      {wallet
        ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}`
        : "Connect Wallet"}
    </button>
  );
}