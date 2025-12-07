"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface LeaderboardScreenProps {
  currentScore: number;
  username: string;
  onRestart: () => void;
}

interface LeaderboardEntry {
  username: string;
  score: number;
  created_at: string;
}

export default function LeaderboardScreen({
  currentScore,
  username,
  onRestart,
}: LeaderboardScreenProps) {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const { data, error } = await supabase
          .from("leaderboard")
          .select("username, score, created_at")
          .order("score", { ascending: false })
          .limit(50);

        if (error) throw error;

        const uniqueLeaders: LeaderboardEntry[] = [];
        const seenUsers = new Set();

        for (const entry of data || []) {
          if (!seenUsers.has(entry.username)) {
            uniqueLeaders.push(entry);
            seenUsers.add(entry.username);
          }
          if (uniqueLeaders.length >= 10) break;
        }

        setLeaders(uniqueLeaders);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 px-6 w-full max-w-7xl mx-auto py-12 min-h-[80vh]">
      {/* --- LEFT COLUMN: Score & Actions --- */}
      <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1 space-y-6">
        <h1 className="text-6xl md:text-8xl font-extrabold text-white leading-none tracking-tight">
          GAME <br /> <span className="text-red-500">OVER!</span>
        </h1>

        <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 w-full max-w-sm backdrop-blur-sm">
          <p className="text-xl text-gray-300 mb-2">
            Well played,{" "}
            <span className="font-bold text-white">{username}</span>!
          </p>

          {/* FIX: Added strong drop-shadow to make the big score GLOW */}
          <div className="text-6xl font-black text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">
            {currentScore}{" "}
            <span className="text-2xl text-cyan-600 font-bold drop-shadow-none">
              pts
            </span>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="px-12 py-5 bg-green-500 hover:bg-green-400 text-black font-extrabold text-xl rounded-full transition-all duration-300 shadow-lg hover:scale-105 active:scale-95 w-full max-w-sm"
        >
          Play Again ↺
        </button>
      </div>

      {/* --- RIGHT COLUMN: The Wide Leaderboard --- */}
      <div className="w-full max-w-xl bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl flex-none h-[600px] flex flex-col">
        <h2 className="text-3xl font-bold text-white mb-6 flex items-center justify-center gap-3 pb-4 border-b border-gray-700/50 shrink-0">
          <span className="text-3xl">🏆</span> Top Players
        </h2>

        {loading ? (
          <div className="text-gray-400 animate-pulse text-center py-20 text-xl">
            Loading scores...
          </div>
        ) : (
          <div className="space-y-2 overflow-y-scroll flex-grow pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {leaders.map((entry, index) => (
              <div
                key={index}
                className={`flex justify-between items-center p-3 rounded-lg transition-all border
                  ${
                    entry.username === username && entry.score === currentScore
                      ? "bg-cyan-900/40 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                      : "bg-gray-800/40 border-gray-700/30 hover:bg-gray-700/50"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`
                    w-8 h-8 flex items-center justify-center rounded-md font-bold text-base shadow-md transform -rotate-3
                    ${
                      index === 0
                        ? "bg-yellow-400 text-black"
                        : index === 1
                        ? "bg-gray-300 text-black"
                        : index === 2
                        ? "bg-amber-600 text-white"
                        : "bg-gray-700 text-gray-300"
                    }
                  `}
                  >
                    #{index + 1}
                  </div>
                  <span
                    className={`font-bold text-base truncate max-w-[200px] ${
                      entry.username === username
                        ? "text-cyan-300"
                        : "text-white"
                    }`}
                  >
                    {entry.username} {entry.username === username && "(You)"}
                  </span>
                </div>
                {/* Score Glow maintained here as requested */}
                <span className="text-cyan-300 font-mono font-bold text-lg drop-shadow-[0_0_4px_rgba(34,211,238,0.6)]">
                  {entry.score}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
