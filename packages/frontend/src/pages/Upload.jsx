import React from "react"
import { useState } from "react";

export default function Upload() {
  const [songId, setSongId] = useState("");
  const [ipfsHash, setIpfsHash] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    alert("Song Registered Successfully 🚀");
  }

  return (
    <div className="max-w-3xl mx-auto py-20 px-6">
      <div className="bg-white/5 border border-white/10 rounded-[40px] p-10">
        <h1 className="text-5xl font-black mb-10">
          Upload Music
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            placeholder="Song ID"
            value={songId}
            onChange={(e) => setSongId(e.target.value)}
            className="w-full p-5 rounded-2xl bg-black/40 border border-white/10"
          />

          <input
            placeholder="IPFS Hash"
            value={ipfsHash}
            onChange={(e) => setIpfsHash(e.target.value)}
            className="w-full p-5 rounded-2xl bg-black/40 border border-white/10"
          />

          <button className="w-full p-5 rounded-2xl gradient text-black font-black text-xl">
            Register Song
          </button>
        </form>
      </div>
    </div>
  );
}