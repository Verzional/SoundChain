import React from "react"
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-10">
      <div className="grid md:grid-cols-2 gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-7xl font-black leading-tight">
            Music Royalty
            <span className="block gradient bg-clip-text text-transparent">
              On Blockchain
            </span>
          </h1>

          <p className="text-white/70 mt-8 text-xl leading-relaxed max-w-xl">
            Transparent milestone-based royalty distribution for artists,
            producers, and collaborators.
          </p>

          <div className="flex gap-5 mt-10">
            <button className="px-8 py-4 rounded-2xl gradient text-black font-bold text-lg">
              Launch App
            </button>

            <button className="px-8 py-4 rounded-2xl border border-white/20 bg-white/5">
              Learn More
            </button>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="relative"
        >
          <div className="w-[450px] h-[450px] rounded-full gradient blur-3xl absolute opacity-40"></div>

          <div className="relative z-10 bg-white/10 border border-white/10 backdrop-blur-2xl rounded-[40px] p-10 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1200"
              className="rounded-3xl"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}