"use client"

interface ReadyScreenProps {
  username: string
  onStartGame: () => void
}

export default function ReadyScreen({ username, onStartGame }: ReadyScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 text-balance">ARE YOU READY???</h1>
      <div className="max-w-2xl mb-12 text-white text-base md:text-lg leading-tight">
        <p className="mb-2">
          Once you click <span className="text-cyan-400 font-semibold">Start Now</span>, a{" "}
          <span className="text-cyan-400 font-semibold">1-minute timer</span> will begin immediately.
        </p>
        <p className="mb-2">Your goal is to answer as many questions as you can within the time limit.</p>
        <p>
          Give it your all and climb to the top of the <span className="text-cyan-400 font-semibold">leaderboard</span>!
        </p>
      </div>
      <button
        onClick={onStartGame}
        className="px-12 py-4 bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-lg rounded-full transition-colors duration-200"
      >
        Start Now
      </button>
    </div>
  )
}
