"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface Question {
  id: string
  type: "text_options" | "image_options"
  correctLogoId: string
  logoImage: string
  options: Array<{
    id: string
    name?: string
    image?: string
  }>
}

interface GameScreenProps {
  username: string
  onGameEnd: (score: number) => void
}

export default function GameScreen({ username, onGameEnd }: GameScreenProps) {
  const [timeLeft, setTimeLeft] = useState(60)
  const [score, setScore] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [gameActive, setGameActive] = useState(true)

  // Mock questions - replace with API call to fetch from database
  const mockQuestions: Question[] = [
    {
      id: "q1",
      type: "text_options",
      correctLogoId: "logo1",
      logoImage: "https://via.placeholder.com/200?text=GitHub+Logo",
      options: [
        { id: "logo1", name: "GitHub" },
        { id: "logo2", name: "Google" },
        { id: "logo3", name: "Facebook" },
        { id: "logo4", name: "React" },
      ],
    },
    {
      id: "q2",
      type: "image_options",
      correctLogoId: "logo5",
      logoImage: "",
      options: [
        { id: "logo5", image: "https://via.placeholder.com/150?text=Real+Logo" },
        { id: "logo6", image: "https://via.placeholder.com/150?text=Fake+1" },
        { id: "logo7", image: "https://via.placeholder.com/150?text=Fake+2" },
        { id: "logo8", image: "https://via.placeholder.com/150?text=Fake+3" },
      ],
    },
  ]

  const currentQuestion = mockQuestions[currentQuestionIndex % mockQuestions.length]

  useEffect(() => {
    if (!gameActive) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameActive(false)
          onGameEnd(score)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameActive, score, onGameEnd])

  useEffect(() => {
    if (!showFeedback) return

    const timer = setTimeout(() => {
      setSelectedAnswer(null)
      setShowFeedback(false)
      setCurrentQuestionIndex((prev) => prev + 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [showFeedback])

  const handleOptionSelect = (optionId: string) => {
    if (selectedAnswer || !gameActive) return

    const isCorrectAnswer = optionId === currentQuestion.correctLogoId
    setSelectedAnswer(optionId)
    setIsCorrect(isCorrectAnswer)
    setShowFeedback(true)

    if (isCorrectAnswer) {
      setScore((prev) => prev + 1)
    }
  }

  const timerColor = timeLeft <= 10 ? "bg-red-500" : "bg-green-500"
  const timerTextColor = timeLeft <= 10 ? "text-red-500" : "text-green-500"

  return (
    <main className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center p-4">
      {/* Timer Badge */}
      <div className={`fixed top-6 right-6 ${timerColor} rounded-full px-6 py-3 font-bold text-xl text-black`}>
        {String(timeLeft).padStart(2, "0")}:00
      </div>

      {/* Score Display */}
      <div className="absolute top-6 left-6 text-white text-lg font-bold">Score: {score}</div>

      {/* Question Title */}
      <h1 className="text-white text-4xl font-bold text-center mb-12 max-w-4xl">
        {currentQuestion.type === "text_options" ? "WHICH LOGO IS THIS?" : "WHICH OF THE FOLLOWING LOGO IS REAL?"}
      </h1>

      {/* Question Content */}
      <div className="flex flex-col items-center gap-8 w-full max-w-2xl">
        {/* Logo Display for text_options */}
        {currentQuestion.type === "text_options" && (
          <div className="flex justify-center">
            <div className="w-48 h-48 bg-white rounded-2xl flex items-center justify-center">
              <Image
                src={currentQuestion.logoImage || "/placeholder.svg"}
                alt="Logo to identify"
                width={200}
                height={200}
                className="object-contain"
              />
            </div>
          </div>
        )}

        {/* Text Options Grid */}
        {currentQuestion.type === "text_options" && (
          <div className="grid grid-cols-2 gap-4 w-full">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedAnswer === option.id
              const isCorrectOption = option.id === currentQuestion.correctLogoId

              let bgColor = "bg-[#505050] hover:bg-[#606060]"
              if (showFeedback && isSelected) {
                bgColor = isCorrect ? "bg-green-500" : "bg-red-500"
              } else if (showFeedback && isCorrectOption && !isCorrect) {
                bgColor = "bg-green-500"
              }

              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id)}
                  disabled={showFeedback}
                  className={`${bgColor} text-white text-xl font-bold py-6 rounded-full transition-colors disabled:cursor-not-allowed`}
                >
                  {option.name}
                </button>
              )
            })}
          </div>
        )}

        {/* Image Options Grid */}
        {currentQuestion.type === "image_options" && (
          <div className="grid grid-cols-2 gap-6 w-full">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedAnswer === option.id
              const isCorrectOption = option.id === currentQuestion.correctLogoId

              let borderColor = "border-4 border-[#505050]"
              if (showFeedback && isSelected) {
                borderColor = isCorrect ? "border-4 border-green-500" : "border-4 border-red-500"
              } else if (showFeedback && isCorrectOption && !isCorrect) {
                borderColor = "border-4 border-green-500"
              }

              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id)}
                  disabled={showFeedback}
                  className={`${borderColor} rounded-3xl overflow-hidden bg-white flex items-center justify-center h-48 transition-all disabled:cursor-not-allowed`}
                >
                  <Image
                    src={option.image || ""}
                    alt="Logo option"
                    width={150}
                    height={150}
                    className="object-contain"
                  />
                </button>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
