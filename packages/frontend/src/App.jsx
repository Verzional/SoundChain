// packages/frontend/src/App.jsx
import React, { useState } from 'react';

export default function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [artistStats, setArtistStats] = useState({ streams: 0, payoutClaimed: 0 });

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', backgroundColor: '#121212', color: '#fff', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>SoundChain Artist Dashboard</h2>
        <button 
          onClick={() => setWalletConnected(!walletConnected)}
          style={{ padding: '0.5rem 1rem', cursor: 'pointer', background: '#10B981', border: 'none', color: '#fff', borderRadius: '4px' }}
        >
          {walletConnected ? "0xArtist...Connected" : "Connect Web3 Wallet"}
        </button>
      </header>

      <hr style={{ borderColor: '#333', margin: '2rem 0' }} />

      <main style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div style={{ background: '#1E1E1E', padding: '1.5rem', borderRadius: '8px' }}>
          <h3>Milestone Metrics</h3>
          <p>Validated Streams: <strong>{artistStats.streams}</strong></p>
        </div>
        <div style={{ background: '#1E1E1E', padding: '1.5rem', borderRadius: '8px' }}>
          <h3>Royalty Financials</h3>
          <p>Claimed Royalty: <strong>{artistStats.payoutClaimed} ETH</strong></p>
        </div>
      </main>
    </div>
  );
}