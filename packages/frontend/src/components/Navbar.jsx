import React from 'react';
import { Link } from 'react-router-dom';
import WalletButton from './WalletButton';

export default function Navbar({ onAccountChange, userRole }) {
  return (
    <nav className="flex justify-between items-center p-6 border-b border-white/10">
      <Link to="/" className="text-2xl font-black text-[#ffcc00]">SoundChain</Link>
      
      <div className="flex items-center gap-6 font-bold">
        <Link to="/" className="hover:text-[#ffcc00] transition-colors">Home</Link>
        <Link to="/subscription" className="hover:text-[#ffcc00] transition-colors">Subscription</Link>
        
        {/* Only show these links if the user is an Artist (Role 2) */}
        {userRole === 2 && (
          <>
            <Link to="/creator" className="hover:text-[#ffcc00] transition-colors">Creator Hub</Link>
            <Link to="/dashboard" className="hover:text-[#ffcc00] transition-colors">Dashboard</Link>
          </>
        )}
      </div>

      <WalletButton onAccountChange={onAccountChange} />
    </nav>
  );
}