import React, { useState } from "react";

export default function SongCard({ id, title, initialStreams, milestone }) {
  const [streams, setStreams] = useState(initialStreams);

  async function handlePlay() {
    // Optimistic UI update
    setStreams((prev) => prev + 1);

    try {
      // Tell backend to increment off-chain stream count
      await fetch(`http://localhost:3001/api/play/${id}`, { method: "POST" });
    } catch (error) {
      console.error("Failed to record stream:", error);
    }
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:scale-105 transition duration-300">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-white/60 mt-2">
            {streams.toLocaleString()} streams
          </p>
        </div>

        <div className="gradient text-black px-5 py-2 rounded-xl font-bold">
          Target: {milestone}
        </div>
      </div>

      <div className="mb-6 w-full h-3 bg-white/10 rounded-full overflow-hidden">
        <div
          className="gradient h-full transition-all duration-300"
          style={{ width: `${Math.min((streams / milestone) * 100, 100)}%` }}
        />
      </div>

      <button
        onClick={handlePlay}
        className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition"
      >
        ▶ Play Song
      </button>
    </div>
  );
}
