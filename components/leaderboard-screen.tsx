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
        // 1. Fetch TOP 50 scores (fetch more than 10 to allow for duplicates)
        const { data, error } = await supabase
          .from("leaderboard")
          .select("username, score, created_at")
          .order("score", { ascending: false })
          .limit(50);

        if (error) throw error;

        // 2. Filter: Keep only the BEST (first) score for each unique username
        const uniqueLeaders: LeaderboardEntry[] = [];
        const seenUsers = new Set();

        for (const entry of data || []) {
          // If we haven't seen this user yet, add them (since lists are ordered by score, this is their best)
          if (!seenUsers.has(entry.username)) {
            uniqueLeaders.push(entry);
            seenUsers.add(entry.username);
          }
          // Stop once we have 10 unique winners
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1a1a1a] p-4 text-white">
      <h1 className="text-4xl font-bold mb-2 text-cyan-400">GAME OVER!</h1>
      <p className="text-xl mb-8">
        {username}, you scored:{" "}
        <span className="font-bold text-yellow-400">{currentScore}</span>
      </p>

      <div className="w-full max-w-md bg-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-center border-b border-gray-600 pb-4">
          TOP PLAYERS
        </h2>

        {loading ? (
          <div className="text-center py-4">Loading scores...</div>
        ) : (
          <div className="space-y-3">
            {leaders.map((entry, index) => (
              <div
                key={index}
                className={`flex justify-between items-center p-3 rounded-lg ${
                  entry.username === username && entry.score === currentScore
                    ? "bg-cyan-900 border border-cyan-500" // Highlight current user
                    : "bg-gray-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`font-bold w-6 ${
                      index === 0
                        ? "text-yellow-400"
                        : index === 1
                        ? "text-gray-300"
                        : index === 2
                        ? "text-amber-600"
                        : "text-gray-500"
                    }`}
                  >
                    #{index + 1}
                  </span>
                  <span className="font-medium truncate max-w-[150px]">
                    {entry.username}
                  </span>
                </div>
                <span className="font-bold text-cyan-300">
                  {entry.score} pts
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onRestart}
        className="mt-8 px-8 py-3 bg-green-500 hover:bg-green-600 text-black font-bold text-lg rounded-full transition-all transform hover:scale-105"
      >
        Play Again
      </button>
    </div>
  );
}
