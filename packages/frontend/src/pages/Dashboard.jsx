import React from "react"
export default function Dashboard() {
  return (
    <div className="px-10 py-20">
      <h1 className="text-5xl font-black mb-12">
        Artist Dashboard
      </h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <p className="text-white/60">Total Streams</p>
          <h2 className="text-5xl font-black mt-4">24.5K</h2>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <p className="text-white/60">Royalty Earned</p>
          <h2 className="text-5xl font-black mt-4">420 USDC</h2>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <p className="text-white/60">Next Milestone</p>
          <h2 className="text-5xl font-black mt-4">30K</h2>
        </div>
      </div>
    </div>
  );
}