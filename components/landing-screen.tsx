"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface LandingScreenProps {
  onPlayNow: () => void;
}

interface LeaderboardEntry {
  username: string;
  score: number;
}

export default function LandingScreen({ onPlayNow }: LandingScreenProps) {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Leaderboard on Mount
  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const { data, error } = await supabase
          .from("leaderboard")
          .select("username, score")
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
          if (uniqueLeaders.length >= 5) break; // Only show Top 5
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
    <div className="flex flex-col md:flex-row items-center justify-between gap-8 px-6 w-full max-w-7xl mx-auto py-12 min-h-[80vh]">
      {/* --- LEFT COLUMN (Hero Section) --- */}
      <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1 space-y-8">
        <h1 className="text-6xl md:text-8xl font-extrabold text-white leading-none tracking-tight text-balance">
          GUESS <br /> THE LOGO
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 flex items-center justify-center md:justify-start gap-3">
          <span className="text-2xl">🔗</span>
          <span>
            Developed by
            <a
              href="https://www.instagram.com/github.gitam.hyd/"
              target="_blank"
              rel="noopener noreferrer"
              // FIX: Removed 'hover:underline' class
              className="text-cyan-400 font-bold transition-all duration-300 ease-in-out underline-offset-4 hover:text-cyan-200 hover:drop-shadow-[0_0_5px_rgba(45,212,255,0.3)]"
            >
              &nbsp;Github Community - GITAM
            </a>
          </span>
        </p>

        <button
          onClick={onPlayNow}
          className="px-14 py-5 bg-gray-100 hover:bg-white text-black font-extrabold text-xl rounded-full transition-all duration-300 shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:scale-105 hover:shadow-[0_0_35px_rgba(255,255,255,0.5)] active:scale-95"
        >
          Play Now!
        </button>
      </div>

      {/* --- RIGHT COLUMN (Leaderboard Section) --- */}
      <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl flex-none">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center justify-center gap-3 pb-4 border-b border-gray-700/50">
          <span className="text-3xl">🏆</span> Current Top Players
        </h2>

        {loading ? (
          <div className="text-gray-400 animate-pulse text-center py-8 text-lg">
            Loading scores...
          </div>
        ) : leaders.length === 0 ? (
          <div className="text-gray-400 text-center py-8 text-lg">
            No scores yet. Be the first!
          </div>
        ) : (
          <div className="space-y-4">
            {leaders.map((entry, index) => (
              <div
                key={index}
                className="flex justify-between items-center bg-gray-800/50 p-4 rounded-2xl border border-gray-700/30 transition-all hover:bg-gray-800/70 hover:border-gray-600"
              >
                <div className="flex items-center gap-4">
                  {/* Rank Badge with Gradients */}
                  <div
                    className={`
                    w-11 h-11 flex items-center justify-center rounded-full font-extrabold text-xl text-black shadow-lg
                    ${
                      index === 0
                        ? "bg-gradient-to-br from-yellow-300 to-yellow-500"
                        : index === 1
                        ? "bg-gradient-to-br from-gray-200 to-gray-400"
                        : index === 2
                        ? "bg-gradient-to-br from-amber-600 to-amber-800"
                        : "bg-gray-700 text-white"
                    }
                  `}
                  >
                    {index + 1}
                  </div>
                  <span className="text-white font-bold text-lg truncate max-w-[160px]">
                    {entry.username}
                  </span>
                </div>
                <span className="text-cyan-300 font-extrabold text-2xl">
                  {entry.score}{" "}
                  <span className="text-base font-medium text-cyan-500/70">
                    pts
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
