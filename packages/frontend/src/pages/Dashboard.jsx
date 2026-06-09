import React, { useState, useEffect } from "react";

export default function Dashboard() {
  const [account, setAccount] = useState("");
  const [tracks, setTracks] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // 1. Get the connected wallet and fetch tracks
  useEffect(() => {
    const fetchAccountAndData = async () => {
      let currentAccount = "";
      if (window.ethereum) {
        try {
          const accs = await window.ethereum.request({ method: "eth_accounts" });
          if (accs.length > 0) {
            currentAccount = accs[0];
            setAccount(currentAccount);
          }
        } catch (err) {
          console.error(err);
        }
      }

      try {
        const res = await fetch("http://localhost:3001/api/tracks");
        const data = await res.json();
        
        // Filter tracks to only show the ones belonging to the connected wallet
        if (currentAccount) {
          const myTracks = data.filter(
            (t) => t.artistAddress.toLowerCase() === currentAccount.toLowerCase()
          );
          setTracks(myTracks);
        } else {
          setTracks([]); // Don't show anything if no wallet is connected
        }
      } catch (err) {
        console.error("Failed to fetch tracks", err);
      }
    };

    fetchAccountAndData();
  }, []);

  // 2. Calculate aggregated stats based ONLY on the filtered personal tracks
  const totalStreams = tracks.reduce((sum, track) => sum + track.streamCount, 0);
  const royaltyEarned = tracks.reduce((sum, track) => sum + (track.lastValidatedMilestone / 1000) * 10, 0);
  const nextMilestone = Math.max(10000, Math.ceil((totalStreams + 1) / 10000) * 10000);

  async function handleClaimRoyalties(trackId) {
    setIsSyncing(true);
    try {
      const res = await fetch(`http://localhost:3001/api/sync/${trackId}`, { method: "POST" });
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

  if (!account) {
    return (
      <div className="px-10 py-20 text-center">
        <h1 className="text-4xl font-black mb-6">Please connect your wallet to view your Dashboard.</h1>
      </div>
    );
  }

  return (
    <div className="px-10 py-20">
      <h1 className="text-5xl font-black mb-12">Artist Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <p className="text-white/60">Total Streams</p>
          <h2 className="text-5xl font-black mt-4 text-[#ffcc00]">{totalStreams.toLocaleString()}</h2>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <p className="text-white/60">Royalty Earned</p>
          <h2 className="text-5xl font-black mt-4 text-[#ffcc00]">{royaltyEarned} USDC</h2>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <p className="text-white/60">Next Milestone</p>
          <h2 className="text-5xl font-black mt-4 text-[#ffcc00]">{nextMilestone.toLocaleString()}</h2>
        </div>
      </div>

      <h2 className="text-3xl font-bold mb-6">Your Tracks</h2>
      <div className="space-y-4 mb-12">
        {tracks.length === 0 && <p className="text-white/60">No tracks found for this wallet.</p>}
        {tracks.map((track) => (
          <div key={track.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold">{track.title}</h3>
              <p className="text-white/60 mt-1">Unclaimed Streams: {track.streamCount - track.lastValidatedMilestone}</p>
            </div>
            <button
              onClick={() => handleClaimRoyalties(track.id)}
              disabled={isSyncing}
              className="gradient text-black px-6 py-3 rounded-xl font-black disabled:opacity-50"
            >
              {isSyncing ? "Syncing..." : "Sync & Claim Royalties"}
            </button>
          </div>
        ))}
      </div>

      {/* Song Analytics */}
      <div className="mt-12 bg-white/5 border border-white/10 rounded-3xl p-8">
        <h2 className="text-3xl font-bold mb-6">Song Analytics</h2>
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
              {tracks.map(track => (
                <tr key={track.id} className="border-b border-white/5">
                  <td className="py-4">{track.title}</td>
                  <td>{track.streamCount.toLocaleString()}</td>
                  <td className="text-[#ffcc00]">{(track.lastValidatedMilestone / 1000) * 10} USDC</td>
                  <td>
                    {track.streamCount > track.lastValidatedMilestone ? (
                      <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm">Pending Sync</span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">Synced</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}