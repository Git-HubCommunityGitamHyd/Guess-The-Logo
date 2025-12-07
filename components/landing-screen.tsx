"use client"

interface LandingScreenProps {
  onPlayNow: () => void
}

export default function LandingScreen({ onPlayNow }: LandingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl md:text-7xl font-bold text-white mb-4 text-balance">GUESS THE LOGO</h1>
      <p className="text-lg md:text-xl text-white mb-12 flex items-center justify-center gap-2">
        <span>🔗</span>
        <span>
          Developed by <span className="text-cyan-400">Github Community - GITAM</span>
        </span>
      </p>
      <button
        onClick={onPlayNow}
        className="px-12 py-4 bg-gray-300 hover:bg-gray-200 text-black font-bold text-lg rounded-full transition-colors duration-200"
      >
        Play Now!
      </button>
    </div>
  )
}
