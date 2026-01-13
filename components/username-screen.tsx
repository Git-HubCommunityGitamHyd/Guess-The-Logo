"use client";

import { useState } from "react";

interface UsernameScreenProps {
  onNext: (username: string) => void;
}

export default function UsernameScreen({ onNext }: UsernameScreenProps) {
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().length > 0) {
      onNext(username.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4 animate-in fade-in zoom-in duration-300">
      {/* Title with drop shadow to stand out against icons */}
      <h1 className="text-4xl md:text-6xl font-black text-white mb-10 text-center tracking-tight drop-shadow-lg uppercase">
        Enter Your <span className="text-cyan-400">Username</span>
      </h1>

      <form 
        onSubmit={handleSubmit}
        className="flex flex-col items-center w-full max-w-md gap-6"
      >
        <div className="relative w-full">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="eg: username123"
            maxLength={15}
            autoFocus
            className="w-full px-8 py-5 bg-gray-800/60 backdrop-blur-md border-2 border-gray-600 focus:border-cyan-400 rounded-2xl text-white text-2xl font-bold text-center outline-none transition-all placeholder:text-gray-500 shadow-xl focus:shadow-[0_0_30px_rgba(34,211,238,0.2)]"
          />
        </div>

        <button
          type="submit"
          disabled={!username.trim()}
          className="px-12 py-4 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-extrabold text-xl rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] hover:scale-105 active:scale-95"
        >
          Next ➔
        </button>
      </form>
    </div>
  );
}