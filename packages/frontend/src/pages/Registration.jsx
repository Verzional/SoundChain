import React, { useState } from 'react';

export default function Registration({ account, onComplete }) {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleRegister = async (roleId) => {
        setIsProcessing(true);
        try {
            const res = await fetch("http://localhost:3001/api/users/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userAddress: account, role: roleId })
            });
            const data = await res.json();

            if (data.success) {
                alert(`Successfully registered as a ${roleId === 1 ? 'Listener' : 'Artist'}!`);
                onComplete(roleId); // <-- Pass the roleId here!
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error(error);
            alert("Registration failed");
        }
        setIsProcessing(false);
    };

    return (
        <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
            <h1 className="text-5xl font-black mb-6">Welcome to SoundChain!</h1>
            <p className="text-xl text-white/60 mb-12">Choose your path to continue.</p>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
                {/* Listener Option */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-10 hover:border-[#ffcc00]/50 transition-colors">
                    <h2 className="text-4xl font-bold mb-4">Listener</h2>
                    <p className="text-white/60 mb-8">Stream exclusive music, support your favorite artists, and be part of the decentralized revolution.</p>
                    <button
                        onClick={() => handleRegister(1)}
                        disabled={isProcessing}
                        className="w-full py-4 rounded-xl border-2 border-[#ffcc00] text-[#ffcc00] font-bold hover:bg-[#ffcc00] hover:text-black transition-all disabled:opacity-50"
                    >
                        {isProcessing ? "Processing..." : "Join as Listener"}
                    </button>
                </div>

                {/* Artist Option */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-10 hover:border-[#ffcc00]/50 transition-colors">
                    <h2 className="text-4xl font-bold mb-4">Artist</h2>
                    <p className="text-white/60 mb-8">Upload tracks, earn 100% of your royalties instantly, and connect directly with your fanbase.</p>
                    <button
                        onClick={() => handleRegister(2)}
                        disabled={isProcessing}
                        className="w-full py-4 rounded-xl gradient text-black font-bold hover:scale-105 transition-transform disabled:opacity-50"
                    >
                        {isProcessing ? "Processing..." : "Join as Artist"}
                    </button>
                </div>
            </div>
        </div>
    );
}