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
  const nextMilestone = Math.max(
    10000,
    Math.ceil((totalStreams + 1) / 10000) * 10000,
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

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <p className="text-white/60">Total Streams</p>
          <h2 className="text-5xl font-black mt-4 text-[#ffcc00]">
            {totalStreams.toLocaleString()}
          </h2>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <p className="text-white/60">Royalty Earned</p>
          <h2 className="text-5xl font-black mt-4 text-[#ffcc00]">
            {royaltyEarned} USDC
          </h2>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <p className="text-white/60">Next Milestone</p>
          <h2 className="text-5xl font-black mt-4 text-[#ffcc00]">
            {nextMilestone.toLocaleString()}
          </h2>
        </div>
      </div>

      <h2 className="text-3xl font-bold mb-6">Your Tracks</h2>
      <div className="space-y-4 mb-12">
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

      {/* Song Analytics */}
      <div className="mt-12 bg-white/5 border border-white/10 rounded-3xl p-8">
        <h2 className="text-3xl font-bold mb-6">
          Song Analytics
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-white/60">
                <th className="text-left py-4">Song</th>
                <th className="text-left py-4">Streams</th>
                <th className="text-left py-4">Royalty</th>
                <th className="text-left py-4">Status</th>
              </tr>
            </thead>

            <tbody>
              <tr className="border-b border-white/5">
                <td className="py-4">Dreamscape</td>
                <td>12,500</td>
                <td>120 USDC</td>
                <td>
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400">
                    Verified
                  </span>
                </td>
              </tr>

              <tr className="border-b border-white/5">
                <td className="py-4">Neon Pulse</td>
                <td>8,200</td>
                <td>80 USDC</td>
                <td>
                  <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400">
                    Pending
                  </span>
                </td>
              </tr>

              <tr>
                <td className="py-4">Moonlight Echo</td>
                <td>3,800</td>
                <td>40 USDC</td>
                <td>
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400">
                    Verified
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-12 bg-white/5 border border-white/10 rounded-3xl p-8">
        <h2 className="text-3xl font-bold mb-6">
          Recent Activity
        </h2>

        <ul className="space-y-4 text-white/80">
          <li>🎵 Dreamscape reached 10K streams milestone.</li>
          <li>💰 50 USDC royalty distributed automatically.</li>
          <li>✅ Neon Pulse submitted for verification.</li>
          <li>🎤 New collaborator added to Moonlight Echo.</li>
        </ul>
      </div>
    </div>
  );
}
