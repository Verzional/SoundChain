import React from "react"
import Hero from "../components/Hero";
import SongCard from "../components/SongCard";

export default function Home() {
  return (
    <div>
      <Hero />

      <div className="px-10 pb-20">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-black">
            Trending Songs
          </h1>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <SongCard
            title="Dreamscape"
            streams={720}
            milestone={1000}
          />

          <SongCard
            title="Neon Pulse"
            streams={1900}
            milestone={2000}
          />

          <SongCard
            title="Moonlight Echo"
            streams={450}
            milestone={1000}
          />
        </div>
      </div>
    </div>
  );
}