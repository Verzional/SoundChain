import React, { useState } from "react";

export default function Upload() {
  const [title, setTitle] = useState("");
  const [ipfsHash, setIpfsHash] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsRegistering(true);

    try {
      const response = await fetch("http://localhost:3001/api/tracks/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title,
          ipfsHash: ipfsHash,
          // Using Hardhat Account #0 as the artist wallet address for local testing
          artistAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(
          `🚀 Song Created & Registered! Assigned Database ID: ${data.trackId}`,
        );
        setTitle("");
        setIpfsHash("");
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      alert("Failed to connect to backend server.");
    }

    setIsRegistering(false);
  }

  return (
    <div className="max-w-3xl mx-auto py-20 px-6">
      <div className="bg-white/5 border border-white/10 rounded-[40px] p-10">
        <h1 className="text-5xl font-black mb-10">Upload Music</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            placeholder="Song Title (e.g., Midnight Melodies)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-5 rounded-2xl bg-black/40 border border-white/10 text-white"
            required
          />

          <input
            placeholder="IPFS Casing Hash (Audio File URI)"
            value={ipfsHash}
            onChange={(e) => setIpfsHash(e.target.value)}
            className="w-full p-5 rounded-2xl bg-black/40 border border-white/10 text-white"
            required
          />

          <button
            type="submit"
            disabled={isRegistering}
            className="w-full p-5 rounded-2xl gradient text-black font-black text-xl disabled:opacity-50"
          >
            {isRegistering ? "Syncing with Blockchain..." : "Register New Song"}
          </button>
        </form>
      </div>
    </div>
  );
}
