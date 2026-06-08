import React from "react";

export default function Dashboard() {
  return (
    <div className="px-10 py-20">
      <h1 className="text-5xl font-black mb-12">
        Artist Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <p className="text-white/60">Total Streams</p>
          <h2 className="text-5xl font-black mt-4 text-[#ffcc00]">
            24.5K
          </h2>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <p className="text-white/60">Royalty Earned</p>
          <h2 className="text-5xl font-black mt-4 text-[#ffcc00]">
            420 USDC
          </h2>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <p className="text-white/60">Next Milestone</p>
          <h2 className="text-5xl font-black mt-4 text-[#ffcc00]">
            30K
          </h2>
        </div>
      </div>

      {/* Song Analytics */}
      <div className="mt-12 bg-white/5 border border-white/10 rounded-3xl p-8">
        <h2 className="text-3xl font-bold mb-6">
          Song Analytics
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-white/60">
                <th className="text-left py-4">Song</th>
                <th className="text-left py-4">Streams</th>
                <th className="text-left py-4">Royalty</th>
                <th className="text-left py-4">Status</th>
              </tr>
            </thead>

            <tbody>
              <tr className="border-b border-white/5">
                <td className="py-4">Dreamscape</td>
                <td>12,500</td>
                <td>120 USDC</td>
                <td>
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400">
                    Verified
                  </span>
                </td>
              </tr>

              <tr className="border-b border-white/5">
                <td className="py-4">Neon Pulse</td>
                <td>8,200</td>
                <td>80 USDC</td>
                <td>
                  <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400">
                    Pending
                  </span>
                </td>
              </tr>

              <tr>
                <td className="py-4">Moonlight Echo</td>
                <td>3,800</td>
                <td>40 USDC</td>
                <td>
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400">
                    Verified
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-12 bg-white/5 border border-white/10 rounded-3xl p-8">
        <h2 className="text-3xl font-bold mb-6">
          Recent Activity
        </h2>

        <ul className="space-y-4 text-white/80">
          <li>🎵 Dreamscape reached 10K streams milestone.</li>
          <li>💰 50 USDC royalty distributed automatically.</li>
          <li>✅ Neon Pulse submitted for verification.</li>
          <li>🎤 New collaborator added to Moonlight Echo.</li>
        </ul>
      </div>
    </div>
  );
}