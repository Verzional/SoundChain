import React from "react"
export default function SongCard({ title, streams, milestone }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:scale-105 transition duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-white/60 mt-2">
            {streams.toLocaleString()} streams
          </p>
        </div>

        <div className="gradient text-black px-5 py-2 rounded-xl font-bold">
          {milestone}
        </div>
      </div>

      <div className="mt-6 w-full h-3 bg-white/10 rounded-full overflow-hidden">
        <div
          className="gradient h-full"
          style={{ width: `${(streams / milestone) * 100}%` }}
        />
      </div>
    </div>
  );
}