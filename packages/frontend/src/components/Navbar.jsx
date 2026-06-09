import React, {useState} from "react";
import { NavLink } from "react-router-dom";
import WalletButton from "./WalletButton";

export default function Navbar() {
  const [activeAccount, setActiveAccount] = useState("");
  
  const navStyle = ({ isActive }) =>
    `relative transition duration-300 ${
      isActive
        ? "text-[#ffcc00] font-bold drop-shadow-[0_0_10px_#ffcc00]"
        : "text-white/70 hover:text-white"
    }`;

  return (
    <nav className="flex items-center justify-between px-10 py-6 border-b border-white/10 backdrop-blur-lg sticky top-0 z-50 bg-black/20">
      <NavLink
        to="/"
        className="text-3xl font-black text-[#ffcc00]"
      >
        SoundChain
      </NavLink>

      <div className="flex items-center gap-8">

        <NavLink to="/" className={navStyle}>
          {({ isActive }) => (
            <>
              Home
              {isActive && (
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></span>
              )}
            </>
          )}
        </NavLink>

        <NavLink to="/creator-hub" className={navStyle}>
          {({ isActive }) => (
            <>
              Creator Hub
              {isActive && (
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></span>
              )}
            </>
          )}
        </NavLink>

        <NavLink to="/subscription" className={navStyle}>
          {({ isActive }) => (
            <>
              Subscription
              {isActive && (
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></span>
              )}
            </>
          )}
        </NavLink>

        <NavLink to="/dashboard" className={navStyle}>
          {({ isActive }) => (
            <>
              Dashboard
              {isActive && (
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></span>
              )}
            </>
          )}
        </NavLink>

        <WalletButton onAccountChange={(acc) => setActiveAccount(acc)} />
      </div>
    </nav>
  );
}