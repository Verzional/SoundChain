import React from "react";

export default function Subscription() {
  return (
    <div className="px-10 py-20">

      <h1 className="text-6xl font-black mb-12">
        Subscription Plans
      </h1>

      <div className="grid md:grid-cols-3 gap-8">

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <h2 className="text-3xl font-bold">Basic</h2>
          <p className="mt-4 text-5xl font-black text-[#ffcc00]">
            5 USDC
          </p>

          <button className="w-full mt-8 p-4 gradient text-black rounded-xl font-bold">
            Subscribe
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <h2 className="text-3xl font-bold">Pro</h2>
          <p className="mt-4 text-5xl font-black text-[#ffcc00]">
            10 USDC
          </p>

          <button className="w-full mt-8 p-4 gradient text-black rounded-xl font-bold">
            Subscribe
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <h2 className="text-3xl font-bold">Enterprise</h2>
          <p className="mt-4 text-5xl font-black text-[#ffcc00]">
            20 USDC
          </p>

          <button className="w-full mt-8 p-4 gradient text-black rounded-xl font-bold">
            Subscribe
          </button>
        </div>

      </div>

    </div>
  );
}