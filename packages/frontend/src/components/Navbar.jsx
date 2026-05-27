import React from "react"
import { Link } from "react-router-dom";
import WalletButton from "./WalletButton";

export default function Navbar() {
  return (
    <div className="flex items-center justify-between px-10 py-6 border-b border-white/10 backdrop-blur-lg sticky top-0 z-50 bg-black/20">
      <Link to="/" className="text-3xl font-black tracking-wide">
        🎵 SoundChain
      </Link>

      <div className="flex gap-8 items-center">
        <Link to="/">Home</Link>
        <Link to="/upload">Upload</Link>
        <Link to="/dashboard">Dashboard</Link>

        <WalletButton />
      </div>
    </div>
  );
}