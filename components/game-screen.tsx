"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

interface Logo {
  id: string;
  name: string;
  image_url: string;
}

interface Question {
  id: string;
  type: "text_options" | "image_options";
  correctLogoId: string;
  logoImage: string;
  options: Logo[];
}

interface GameScreenProps {
  username: string;
  onGameEnd: (score: number) => void;
}

export default function GameScreen({ username, onGameEnd }: GameScreenProps) {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);

  // FIX 1: Changed initial time from 60 to 180 (3 minutes)
  const [timeLeft, setTimeLeft] = useState(180);
  const [score, setScore] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // --- HELPER: End Game & Save Score ---
  const handleGameOver = useCallback(
    async (finalScore: number) => {
      if (isSaving) return;
      setIsSaving(true);
      setGameActive(false);

      try {
        const { error } = await supabase.from("leaderboard").insert([
          {
            username: username,
            score: finalScore,
          },
        ]);
        if (error) console.error("Error saving score:", error);
      } catch (err) {
        console.error("Failed to save score:", err);
      }

      onGameEnd(finalScore);
    },
    [username, onGameEnd, isSaving]
  );

  // --- HELPER: Format Time (MM:SS) ---
  // FIX 2: Added helper to show "02:59" instead of "179:00"
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  // FETCH DATA
  useEffect(() => {
    async function fetchGameData() {
      try {
        setLoading(true);
        const { data: logosData, error: logosError } = await supabase
          .from("logostable")
          .select("*");
        if (logosError) throw logosError;
        if (!logosData) throw new Error("No logos found");

        const { data: questionsData, error: questionsError } = await supabase
          .from("questionstable")
          .select("*");

        if (questionsError) throw questionsError;
        if (!questionsData) throw new Error("No questions found");

        const formattedQuestions: Question[] = questionsData.map((q) => {
          const correctLogo = logosData.find((l) => l.id === q.correct_logo_id);
          const options = (
            q.option_ids
              .map((id: string) => logosData.find((l) => l.id === id))
              .filter(Boolean) as Logo[]
          ).sort(() => Math.random() - 0.5);

          return {
            id: q.id,
            type: q.question_type,
            correctLogoId: q.correct_logo_id,
            logoImage: correctLogo?.image_url || "",
            options: options,
          };
        });

        // SORTING LOGIC: 2-2 PATTERN
        const textQs = formattedQuestions.filter(
          (q) => q.type === "text_options"
        );
        const imageQs = formattedQuestions.filter(
          (q) => q.type === "image_options"
        );

        textQs.sort(() => Math.random() - 0.5);
        imageQs.sort(() => Math.random() - 0.5);

        const patternedQuestions: Question[] = [];
        let t = 0;
        let i = 0;

        while (t < textQs.length || i < imageQs.length) {
          if (t < textQs.length) patternedQuestions.push(textQs[t++]);
          if (t < textQs.length) patternedQuestions.push(textQs[t++]);
          if (i < imageQs.length) patternedQuestions.push(imageQs[i++]);
          if (i < imageQs.length) patternedQuestions.push(imageQs[i++]);
        }

        setQuestions(patternedQuestions);
        setGameActive(true);
      } catch (error) {
        console.error("Error fetching game data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchGameData();
  }, []);

  const currentQuestion = questions[currentQuestionIndex];

  // TIMER LOGIC
  useEffect(() => {
    if (!gameActive) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleGameOver(score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameActive, score, handleGameOver]);

  // FEEDBACK LOGIC
  useEffect(() => {
    if (!showFeedback) return;
    const timer = setTimeout(() => {
      setSelectedAnswer(null);
      setShowFeedback(false);
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        handleGameOver(score);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [
    showFeedback,
    currentQuestionIndex,
    questions.length,
    score,
    handleGameOver,
  ]);

  const handleOptionSelect = (optionId: string) => {
    if (selectedAnswer || !gameActive) return;
    const isCorrectAnswer = optionId === currentQuestion.correctLogoId;
    setSelectedAnswer(optionId);
    setIsCorrect(isCorrectAnswer);
    setShowFeedback(true);
    if (isCorrectAnswer) setScore((prev) => prev + 1);
  };

  if (loading)
    return (
      <div className="text-white text-center mt-20 text-xl font-bold animate-pulse">
        Loading Questions...
      </div>
    );
  if (isSaving)
    return (
      <div className="text-white text-center mt-20 text-xl font-bold animate-pulse">
        Saving Score...
      </div>
    );
  if (!currentQuestion) return null;

  const timerColor = timeLeft <= 30 ? "bg-red-500" : "bg-green-500"; // Changed warning color to last 30s

  return (
    <div className="w-full flex flex-col items-center justify-center p-4">
      {/* Timer Badge */}
      <div
        className={`fixed top-6 right-6 ${timerColor} rounded-full px-6 py-3 font-bold text-xl text-black z-20`}
      >
        {/* FIX 3: Use formatTime function here */}
        {formatTime(timeLeft)}
      </div>

      {/* Score */}
      <div className="absolute top-6 left-6 text-white text-lg font-bold z-20">
        Score: {score}
      </div>

      <h1 className="text-white text-4xl font-bold text-center mb-12 max-w-4xl drop-shadow-md w-full">
        {currentQuestion.type === "text_options" ? (
          "WHICH LOGO IS THIS?"
        ) : (
          <div className="h-10 w-full" aria-hidden="true" />
        )}
      </h1>

      <div className="flex flex-col items-center gap-8 w-full max-w-2xl">
        {currentQuestion.type === "text_options" ? (
          <>
            <div className="flex justify-center">
              <div className="w-48 h-48 bg-white rounded-2xl flex items-center justify-center p-4 shadow-xl">
                <Image
                  src={currentQuestion.logoImage || "/placeholder.svg"}
                  alt="Logo"
                  width={200}
                  height={200}
                  className="object-contain w-full h-full"
                  priority
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id)}
                  disabled={showFeedback}
                  className={`${
                    showFeedback && selectedAnswer === option.id
                      ? isCorrect
                        ? "bg-green-500"
                        : "bg-red-500"
                      : showFeedback &&
                        option.id === currentQuestion.correctLogoId
                      ? "bg-green-500"
                      : "bg-[#505050] hover:bg-[#606060]"
                  } text-white text-xl font-bold py-6 rounded-full transition-colors disabled:cursor-not-allowed shadow-lg`}
                >
                  {option.name}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <h2 className="text-white text-3xl font-bold mb-4 drop-shadow-md text-center max-w-lg mx-auto">
              Find the logo for:{" "}
              <span className="text-green-400">
                {
                  currentQuestion.options.find(
                    (o) => o.id === currentQuestion.correctLogoId
                  )?.name
                }
              </span>
            </h2>

            <div className="grid grid-cols-2 gap-6 w-full max-w-2xl mx-auto">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id)}
                  disabled={showFeedback}
                  className={`${
                    showFeedback && selectedAnswer === option.id
                      ? isCorrect
                        ? "border-green-500"
                        : "border-red-500"
                      : showFeedback &&
                        option.id === currentQuestion.correctLogoId
                      ? "border-green-500"
                      : "border-[#505050]"
                  } border-4 rounded-2xl overflow-hidden bg-white flex items-center justify-center w-80 h-52 transition-all p-4 shadow-xl hover:scale-105`}
                >
                  <Image
                    src={option.image_url}
                    alt="Option"
                    width={150}
                    height={100}
                    className="object-contain w-full h-full"
                    priority
                  />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
