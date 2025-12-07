"use client"

import { useState } from "react"
import LandingScreen from "@/components/landing-screen"
import UsernameScreen from "@/components/username-screen"
import ReadyScreen from "@/components/ready-screen"
import GameScreen from "@/components/game-screen"

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<"landing" | "username" | "ready" | "game" | "results">("landing")
  const [username, setUsername] = useState("")
  const [finalScore, setFinalScore] = useState(0)

  const handlePlayNow = () => {
    setCurrentScreen("username")
  }

  const handleUsernameSubmit = (name: string) => {
    setUsername(name)
    setCurrentScreen("ready")
  }

  const handleStartGame = () => {
    setCurrentScreen("game")
  }

  const handleGameEnd = (score: number) => {
    setFinalScore(score)
    setCurrentScreen("results")
  }

  return (
    <main className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
      {currentScreen === "landing" && <LandingScreen onPlayNow={handlePlayNow} />}
      {currentScreen === "username" && <UsernameScreen onNext={handleUsernameSubmit} />}
      {currentScreen === "ready" && <ReadyScreen username={username} onStartGame={handleStartGame} />}
      {currentScreen === "game" && <GameScreen username={username} onGameEnd={handleGameEnd} />}
      {currentScreen === "results" && (
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold mb-4">Game Over!</h1>
          <p className="text-2xl mb-8">Final Score: {finalScore}</p>
          <button
            onClick={() => setCurrentScreen("landing")}
            className="bg-cyan-500 text-black px-8 py-4 rounded-full font-bold text-lg"
          >
            Play Again
          </button>
        </div>
      )}
    </main>
  )
}
