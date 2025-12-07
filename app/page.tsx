"use client";

import { useState } from "react";
import LandingScreen from "@/components/landing-screen";
import UsernameScreen from "@/components/username-screen";
import ReadyScreen from "@/components/ready-screen";
import GameScreen from "@/components/game-screen";
import LeaderboardScreen from "@/components/leaderboard-screen"; // Import the new component

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<
    "landing" | "username" | "ready" | "game" | "results"
  >("landing");
  const [username, setUsername] = useState("");
  const [finalScore, setFinalScore] = useState(0);

  const handlePlayNow = () => {
    setCurrentScreen("username");
  };

  const handleUsernameSubmit = (name: string) => {
    setUsername(name);
    setCurrentScreen("ready");
  };

  const handleStartGame = () => {
    setCurrentScreen("game");
  };

  const handleGameEnd = (score: number) => {
    setFinalScore(score);
    setCurrentScreen("results");
  };

  const handleRestart = () => {
    setFinalScore(0);
    // You can change this to "username" if you want them to re-enter a name,
    // or "landing" to go back to the start.
    setCurrentScreen("landing");
  };

  return (
    <main className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
      {currentScreen === "landing" && (
        <LandingScreen onPlayNow={handlePlayNow} />
      )}
      {currentScreen === "username" && (
        <UsernameScreen onNext={handleUsernameSubmit} />
      )}
      {currentScreen === "ready" && (
        <ReadyScreen username={username} onStartGame={handleStartGame} />
      )}
      {currentScreen === "game" && (
        <GameScreen username={username} onGameEnd={handleGameEnd} />
      )}
      {/* Replaced the hardcoded div with the LeaderboardScreen component */}
      {currentScreen === "results" && (
        <LeaderboardScreen
          username={username}
          currentScore={finalScore}
          onRestart={handleRestart}
        />
      )}
    </main>
  );
}
