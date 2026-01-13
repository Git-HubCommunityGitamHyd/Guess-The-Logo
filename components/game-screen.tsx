"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

const BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==";

// New component to handle individual image loading errors
const OptionImage = ({ src, alt }: { src: string; alt: string }) => {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={150}
      height={100}
      className="object-contain w-full h-full"
      priority
      loading="eager"
      placeholder="blur"
      blurDataURL={BLUR_DATA_URL}
      onError={() => {
        setImgSrc("/placeholder.svg"); 
      }}
    />
  );
};

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

  const [timeLeft, setTimeLeft] = useState(180);
  const [score, setScore] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // --- PRELOAD LOGIC ---
  const imagesToPreload = useMemo(() => {
    const urls: string[] = [];
    for (let i = 1; i <= 2; i++) {
      const nextQ = questions[currentQuestionIndex + i];
      if (nextQ) {
        if (nextQ.logoImage) urls.push(nextQ.logoImage);
        nextQ.options.forEach((opt) => {
          if (opt.image_url) urls.push(opt.image_url);
        });
      }
    }
    return urls;
  }, [questions, currentQuestionIndex]);

  useEffect(() => {
    imagesToPreload.forEach((url) => {
      const img = new window.Image();
      img.src = url;
    });
  }, [imagesToPreload]);

  // --- GAME OVER LOGIC ---
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

  // --- NAVIGATION ---
  const advanceToNextQuestion = useCallback(() => {
    setSelectedAnswer(null);
    setShowFeedback(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleGameOver(score);
    }
  }, [currentQuestionIndex, questions.length, score, handleGameOver]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  // --- KEYBOARD LISTENER ---
  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (!gameActive || !currentQuestion) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (showFeedback && e.key === "Enter") {
        advanceToNextQuestion();
        return;
      }
      if (!showFeedback) {
        const keyMap: { [key: string]: number } = {
          "1": 0,
          "2": 1,
          "3": 2,
          "4": 3,
        };
        if (keyMap.hasOwnProperty(e.key)) {
          const index = keyMap[e.key];
          if (currentQuestion.options[index]) {
            handleOptionSelect(currentQuestion.options[index].id);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameActive, currentQuestion, showFeedback, advanceToNextQuestion]);

  // --- DATA FETCHING ---
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
          // ... (your existing mapping logic) ...
          return {
            id: q.id,
            type: q.question_type,
            correctLogoId: q.correct_logo_id,
            logoImage: correctLogo?.image_url || "",
            options: options,
          };
        });

        const uniqueQuestions: Question[] = [];
        const seenLogoIds = new Set<string>();

        for (const q of formattedQuestions) {
          if (!seenLogoIds.has(q.correctLogoId)) {
            uniqueQuestions.push(q);
            seenLogoIds.add(q.correctLogoId);
          }
        }

        const textQs = uniqueQuestions.filter((q) => q.type === "text_options");
        const imageQs = uniqueQuestions.filter((q) => q.type === "image_options");

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

  // --- TIMER ---
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

  // --- FEEDBACK TIMER ---
  useEffect(() => {
    if (!showFeedback) return;
    const timer = setTimeout(() => {
      advanceToNextQuestion();
    }, 500); 
    return () => clearTimeout(timer);
  }, [showFeedback, advanceToNextQuestion]);

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

  const timerColor = timeLeft <= 30 ? "bg-red-500" : "bg-green-500";

  return (
    <div className="w-full flex flex-col items-center justify-center p-4">
      {/* Timer Badge (Fixed) */}
      <div
        className={`fixed top-6 right-6 ${timerColor} rounded-full px-6 py-3 font-bold text-xl text-black z-20`}
      >
        {formatTime(timeLeft)}
      </div>

      {/* FIX: Changed 'absolute' to 'fixed' to pin it to top-left of viewport */}
      <div className="fixed top-6 left-6 text-white text-lg font-bold z-20">
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
                  loading="eager"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full">
              {currentQuestion.options.map((option, index) => (
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
                  } text-white text-xl font-bold py-6 rounded-full transition-colors duration-200 disabled:cursor-not-allowed shadow-lg relative`}
                >
                  <span className="absolute top-2 left-3 text-xs text-gray-400 opacity-50 font-mono border border-gray-500 rounded px-1.5">
                    {index + 1}
                  </span>
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
              {currentQuestion.options.map((option, index) => (
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
                  } border-4 rounded-2xl overflow-hidden bg-white flex items-center justify-center w-80 h-52 transition-all duration-200 p-4 shadow-xl hover:scale-105 relative`}
                >
                  <span className="absolute top-2 left-3 text-xs text-gray-400 font-mono border border-gray-300 rounded px-1.5 z-10 bg-white/80">
                    {index + 1}
                  </span>
                  {/* Using the robust OptionImage component for safety */}
                  <OptionImage 
                    src={option.image_url} 
                    alt={option.name} 
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