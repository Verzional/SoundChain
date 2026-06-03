import React, { useState, useEffect } from "react";

export default function Dashboard() {
  const [tracks, setTracks] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3001/api/tracks")
      .then((res) => res.json())
      .then((data) => setTracks(data));
  }, []);

  // Calculate aggregated stats
  const totalStreams = tracks.reduce(
    (sum, track) => sum + track.streamCount,
    0,
  );
  // Example calculation: 10 USDC per 1000 streams (based on last validated milestone)
  const royaltyEarned = tracks.reduce(
    (sum, track) => sum + (track.lastValidatedMilestone / 1000) * 10,
    0,
  );

  async function handleClaimRoyalties(trackId) {
    setIsSyncing(true);
    try {
      // Trigger the Oracle smart contract sync
      const res = await fetch(`http://localhost:3001/api/sync/${trackId}`, {
        method: "POST",
      });
      const data = await res.json();

      if (data.success || data.txHash) {
        alert(`✅ Payout Successful! TX Hash: ${data.txHash}`);
      } else {
        alert(`❌ Payout Failed: ${data.error}`);
      }
    } catch (error) {
      alert("Error syncing with blockchain.");
    }
    setIsSyncing(false);
  }

  return (
    <div className="px-10 py-20">
      <h1 className="text-5xl font-black mb-12">Artist Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <p className="text-white/60">Total Streams</p>
          <h2 className="text-5xl font-black mt-4">
            {totalStreams.toLocaleString()}
          </h2>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <p className="text-white/60">Royalty Claimed</p>
          <h2 className="text-5xl font-black mt-4 text-green-400">
            {royaltyEarned} USDC
          </h2>
        </div>
      </div>

      <h2 className="text-3xl font-bold mb-6">Your Tracks</h2>
      <div className="space-y-4">
        {tracks.map((track) => (
          <div
            key={track.id}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 flex justify-between items-center"
          >
            <div>
              <h3 className="text-2xl font-bold">{track.title}</h3>
              <p className="text-white/60 mt-1">
                Unclaimed Streams:{" "}
                {track.streamCount - track.lastValidatedMilestone}
              </p>
            </div>
            <button
              onClick={() => handleClaimRoyalties(track.id)}
              disabled={isSyncing}
              className="gradient text-black px-6 py-3 rounded-xl font-black disabled:opacity-50"
            >
              {isSyncing ? "Syncing Oracle..." : "Sync & Claim Royalties"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
