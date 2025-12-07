"use client"

import type React from "react"

import { useState } from "react"

interface UsernameScreenProps {
  onNext: (username: string) => void
}

export default function UsernameScreen({ onNext }: UsernameScreenProps) {
  const [username, setUsername] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      onNext(username)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center text-center px-4 w-full max-w-md">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-12 whitespace-nowrap">ENTER YOUR USERNAME</h1>
      <form onSubmit={handleSubmit} className="w-full">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder=""
          className="w-full px-6 py-4 mb-8 bg-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-lg"
        />
        <button
          type="submit"
          disabled={!username.trim()}
          className="px-12 py-4 bg-cyan-400 hover:bg-cyan-300 disabled:bg-gray-400 text-black font-bold text-lg rounded-full transition-colors duration-200"
        >
          Next
        </button>
      </form>
    </div>
  )
}
