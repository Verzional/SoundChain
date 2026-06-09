import React, { useState, useEffect } from "react";

export default function CreatorHub() {
  const [account, setAccount] = useState("");
  const [artistName, setArtistName] = useState("");
  const [songName, setSongName] = useState("");
  const [ipfsHash, setIpfsHash] = useState("");
  const [myTracks, setMyTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Grab the connected wallet
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_requestAccounts' })
        .then(accs => setAccount(accs[0]))
        .catch(console.error);
    }
    loadMySongs();
  }, [account]);

  const loadMySongs = async () => {
    if (!account) return;
    const res = await fetch("http://localhost:3001/api/tracks");
    const data = await res.json();
    // Filter tracks belonging to the connected wallet
    const filtered = data.filter(t => t.artistAddress.toLowerCase() === account.toLowerCase());
    setMyTracks(filtered);
  };

  const handleRegisterArtist = async () => {
    if (!account) return alert("Please connect your wallet first!");
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userAddress: account, role: 2 }) // 2 = ARTIST
      });
      const data = await res.json();
      if (data.success) alert("Artist successfully registered on SoundChain!");
      else alert(`Error: ${data.error}`);
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const handleRegisterSong = async () => {
    if (!songName || !ipfsHash) return alert("Fill in song details");
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/tracks/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: songName, ipfsHash, artistAddress: account })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Song Registered! TX: ${data.txHash}`);
        loadMySongs();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto py-16 px-6">
      <h1 className="text-6xl font-black mb-12">Creator Hub</h1>
      <div className="grid lg:grid-cols-2 gap-8">

        {/* Artist Section */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <h2 className="text-3xl font-bold mb-6 text-[#ffcc00]">Artist Registration</h2>
          <div className="space-y-4">
            <input placeholder="Artist Name" value={artistName} onChange={(e) => setArtistName(e.target.value)} className="w-full p-4 rounded-xl bg-black/40 border border-white/10 text-white" />
            <p className="text-sm text-white/50 px-2">Wallet: {account || "Not connected"}</p>
            <button onClick={handleRegisterArtist} disabled={isLoading} className="w-full p-4 rounded-xl gradient text-black font-bold disabled:opacity-50">
              {isLoading ? "Processing..." : "Register as Artist"}
            </button>
          </div>
        </div>

        {/* Song Section */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <h2 className="text-3xl font-bold mb-6 text-[#ffcc00]">Upload Track</h2>
          <div className="space-y-4">
            <input placeholder="Song Name" value={songName} onChange={(e) => setSongName(e.target.value)} className="w-full p-4 rounded-xl bg-black/40 border border-white/10 text-white" />
            <input placeholder="IPFS Hash (Audio CID)" value={ipfsHash} onChange={(e) => setIpfsHash(e.target.value)} className="w-full p-4 rounded-xl bg-black/40 border border-white/10 text-white" />
            <button onClick={handleRegisterSong} disabled={isLoading} className="w-full p-4 rounded-xl gradient text-black font-bold disabled:opacity-50">
              {isLoading ? "Minting to Blockchain..." : "Register Song"}
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Song List */}
      <div className="mt-12">
        <h2 className="text-4xl font-black mb-6">My Songs</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {myTracks.length === 0 && <p className="text-white/60">No songs uploaded yet.</p>}
          {myTracks.map((track) => (
            <div key={track.id} className="bg-white/5 border border-white/10 rounded-3xl p-6">
              <h3 className="text-2xl font-bold">{track.title}</h3>
              <p className="text-xs text-white/40 break-all mt-1">CID: {track.ipfsHash}</p>
              <p className="text-[#ffcc00] mt-2 font-bold">{track.streamCount} Streams</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}