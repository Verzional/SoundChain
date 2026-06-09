import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Home({ isSubscribed }) {
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    // Only bother fetching music if they have paid to unlock it
    if (isSubscribed) {
      fetch("http://localhost:3001/api/tracks")
        .then(res => res.json())
        .then(data => setTracks(data))
        .catch(console.error);
    }
  }, [isSubscribed]);

  return (
    <div className="px-10 py-20 max-w-7xl mx-auto">
      <h1 className="text-6xl font-black mb-12">Discover Music</h1>
      
      {!isSubscribed ? (
        // The Locked State
        <div className="bg-white/5 border border-[#ffcc00]/30 rounded-3xl p-16 text-center max-w-2xl mx-auto mt-16 shadow-[0_0_50px_rgba(255,204,0,0.1)]">
          <span className="text-6xl mb-6 block">🔒</span>
          <h2 className="text-4xl font-bold mb-4">Music is Locked</h2>
          <p className="text-white/60 text-lg mb-8">
            You must have an active subscription to browse and stream exclusive music on SoundChain.
          </p>
          <Link to="/subscription">
            <button className="px-8 py-4 gradient text-black font-bold rounded-xl text-lg hover:scale-105 transition-transform">
              View Subscription Plans
            </button>
          </Link>
        </div>
      ) : (
        // The Unlocked State
        <div className="grid md:grid-cols-3 gap-6">
          {tracks.length === 0 ? (
            <p className="text-white/60 text-xl">No tracks available yet.</p>
          ) : (
            tracks.map(track => (
              <div key={track.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-[#ffcc00]/50 transition-colors">
                 <h3 className="text-2xl font-bold">{track.title}</h3>
                 <p className="text-xs text-white/40 break-all mt-1">CID: {track.ipfsHash}</p>
                 <button className="mt-6 w-full py-3 bg-white/10 rounded-xl text-sm font-bold hover:bg-[#ffcc00] hover:text-black transition-colors">
                   ▶ Play Track
                 </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}