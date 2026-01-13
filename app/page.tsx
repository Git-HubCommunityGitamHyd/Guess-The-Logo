"use client";

import { useState } from "react";
import LandingScreen from "@/components/landing-screen";
import UsernameScreen from "@/components/username-screen";
import ReadyScreen from "@/components/ready-screen";
import GameScreen from "@/components/game-screen";
import LeaderboardScreen from "@/components/leaderboard-screen";
import FloatingBackground from "@/components/FloatingBackground"; // 1. Import the background

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
    setCurrentScreen("landing");
  };

  return (
    // 2. Added 'relative overflow-hidden' to main to contain the background
    <main className="min-h-screen bg-[#1a1a1a] flex items-center justify-center relative overflow-hidden">
      
      {/* 3. The Floating Background (sits behind everything) */}
      <FloatingBackground />

      {/* 4. Content Wrapper: 'relative z-10' ensures clicks work and content is visible */}
      <div className="relative z-10 w-full">
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
        {currentScreen === "results" && (
          <LeaderboardScreen
            username={username}
            currentScore={finalScore}
            onRestart={handleRestart}
          />
        )}
      </div>
    </main>
  );
}