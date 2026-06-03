import React, { useState, useEffect } from "react";
import Hero from "../components/Hero";
import SongCard from "../components/SongCard";

export default function Home() {
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    // Fetch all off-chain tracks from the SQLite Database
    fetch("http://localhost:3001/api/tracks")
      .then((res) => res.json())
      .then((data) => setTracks(data))
      .catch((err) => console.error("Error fetching tracks:", err));
  }, []);

  return (
    <div>
      <Hero />

      <div className="px-10 pb-20">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-black">Trending Songs</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {tracks.length > 0 ? (
            tracks.map((track) => (
              <SongCard
                key={track.id}
                id={track.id}
                title={track.title}
                initialStreams={track.streamCount}
                // Calculate next milestone target (e.g. intervals of 1000)
                milestone={track.lastValidatedMilestone + 1000}
              />
            ))
          ) : (
            <p className="text-white/60">No tracks found. Go upload one!</p>
          )}
        </div>
      </div>
    </div>
  );
}
  