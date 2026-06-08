import React, { useState } from "react";

export default function CreatorHub() {
  const [artistName, setArtistName] = useState("");
  const [genre, setGenre] = useState("");

  const [songName, setSongName] = useState("");
  const [ipfsHash, setIpfsHash] = useState("");

  return (
    <div className="max-w-6xl mx-auto py-16 px-6">

      <h1 className="text-6xl font-black mb-12">
        Creator Hub
      </h1>

      <div className="grid lg:grid-cols-2 gap-8">

        {/* Artist Section */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">

          <h2 className="text-3xl font-bold mb-6 text-[#ffcc00]">
            Artist Registration
          </h2>

          <div className="space-y-4">

            <input
              placeholder="Artist Name"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              className="w-full p-4 rounded-xl bg-black/40 border border-white/10"
            />

            <input
              placeholder="Genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full p-4 rounded-xl bg-black/40 border border-white/10"
            />

            <button className="w-full p-4 rounded-xl gradient text-black font-bold">
              Register Artist
            </button>
          </div>
        </div>

        {/* Song Section */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">

          <h2 className="text-3xl font-bold mb-6 text-[#ffcc00]">
            Song Management
          </h2>

          <div className="space-y-4">

            <input
              placeholder="Song Name"
              value={songName}
              onChange={(e) => setSongName(e.target.value)}
              className="w-full p-4 rounded-xl bg-black/40 border border-white/10"
            />

            <input
              placeholder="IPFS Hash"
              value={ipfsHash}
              onChange={(e) => setIpfsHash(e.target.value)}
              className="w-full p-4 rounded-xl bg-black/40 border border-white/10"
            />

            <div className="grid grid-cols-2 gap-4">

              <button className="p-4 rounded-xl gradient text-black font-bold">
                Register Song
              </button>

              <button className="p-4 rounded-xl bg-white/10 border border-white/10">
                Verify Song
              </button>

            </div>

            <button className="w-full p-4 rounded-xl bg-white/10 border border-white/10">
              Update Song
            </button>

          </div>
        </div>

      </div>

      {/* Existing Songs */}

      <div className="mt-12">

        <h2 className="text-4xl font-black mb-6">
          My Songs
        </h2>

        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <h3 className="text-2xl font-bold">
              Dreamscape
            </h3>

            <p className="text-white/60 mt-2">
              Verified
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <h3 className="text-2xl font-bold">
              Neon Pulse
            </h3>

            <p className="text-white/60 mt-2">
              Pending
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}