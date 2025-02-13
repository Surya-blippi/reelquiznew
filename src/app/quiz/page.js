"use client";

import React, { useState, useEffect, useRef } from "react";
import { Award, Volume2, VolumeX, Timer, History, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { createClient } from "@supabase/supabase-js";

const MAX_TIME = 60;
const TIME_BONUS = 5;

// Initialize Supabase with error checking
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true },
});

// Helper function to shuffle an array
const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

const QuizPage = () => {
  const router = useRouter();
  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const [quizData, setQuizData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(MAX_TIME);
  // Initially true to allow muted autoplay on mobile
  const [isMuted, setIsMuted] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  // When answer is correct, show bonus animation in the center
  const [showTimerAnimation, setShowTimerAnimation] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [userHighScore, setUserHighScore] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [isUpdatingScore, setIsUpdatingScore] = useState(false);
  const [isGameComplete, setIsGameComplete] = useState(false);
  // Splash screen flag: user must tap to start so we can unmute video
  const [hasStarted, setHasStarted] = useState(false);

  // Listen for Firebase auth changes and fetch initial data when authenticated
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/");
      } else {
        fetchInitialData(user);
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Fetch quiz data and user scores using the authenticated user
  const fetchInitialData = async (user) => {
    try {
      const { data: videosWithQuestions, error: videosError } = await supabase
        .from("videos")
        .select(`
          id,
          url,
          title,
          questions (
            id,
            question_text,
            options,
            correct_answer
          )
        `);
      if (videosError) throw videosError;

      let processedQuizData = videosWithQuestions
        .filter((video) => video.questions && video.questions.length > 0)
        .map((video) => {
          const randomQuestion =
            video.questions[Math.floor(Math.random() * video.questions.length)];
          return {
            id: video.id,
            video: video.url,
            question: randomQuestion.question_text,
            options: randomQuestion.options,
            correctAnswer: randomQuestion.correct_answer,
          };
        })
        .filter((item) => item.question && item.options);
      if (processedQuizData.length === 0) {
        throw new Error("No quiz questions available");
      }
      processedQuizData = shuffleArray(processedQuizData);
      setQuizData(processedQuizData);

      const { data: scoreData, error: scoreError } = await supabase
        .from("scores")
        .select("*")
        .eq("user_id", user.uid)
        .single();
      if (scoreError) {
        if (scoreError.code === "PGRST116") {
          setUserHighScore(0);
          setGamesPlayed(0);
        } else {
          console.error("Error fetching scores:", scoreError);
        }
      } else if (scoreData) {
        setUserHighScore(scoreData.high_score);
        setGamesPlayed(scoreData.games_played);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error in fetchInitialData:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Timer effect – stops when game is complete
  useEffect(() => {
    if (isGameComplete) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    if (!loading && timeLeft > 0 && !isTransitioning) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, isTransitioning, timeLeft, isGameComplete]);

  // Whenever the question changes, force the video to reinitialize its source.
  useEffect(() => {
    if (!hasStarted || !videoRef.current) return;
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
    videoRef.current.load();
    videoRef.current
      .play()
      .then(() => console.log("New video playing"))
      .catch((err) =>
        console.error("Error playing new video on question change", err)
      );
  }, [currentQuestionIndex, hasStarted]);

  // Start the game when the user taps the splash screen.
  const startGame = () => {
    setHasStarted(true);
    // Unmute the video and attempt to play it with sound.
    setIsMuted(false);
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.removeAttribute("muted");
      videoRef.current
        .play()
        .then(() => console.log("Video playing with sound"))
        .catch((err) =>
          console.error("Failed to play video with sound on start", err)
        );
    }
  };

  const updateUserScore = async (finalScore) => {
    try {
      setIsUpdatingScore(true);
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");
      const { data: existingScore, error: fetchError } = await supabase
        .from("scores")
        .select("*")
        .eq("user_id", user.uid)
        .single();
      if (!existingScore) {
        const { data: newScore, error: insertError } = await supabase
          .from("scores")
          .insert([
            {
              user_id: user.uid,
              total_score: finalScore,
              high_score: finalScore,
              games_played: 1,
            },
          ])
          .select()
          .single();
        if (insertError) throw insertError;
      } else {
        const newHighScore = Math.max(existingScore.high_score, finalScore);
        const { data: updatedScore, error: updateError } = await supabase
          .from("scores")
          .update({
            total_score: existingScore.total_score + finalScore,
            high_score: newHighScore,
            games_played: existingScore.games_played + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.uid)
          .select()
          .single();
        if (updateError) throw updateError;
      }
      setUserHighScore((prev) => Math.max(prev, finalScore));
      setGamesPlayed((prev) => prev + 1);
    } catch (err) {
      console.error("Error in updateUserScore:", err);
      alert("Failed to save score. Please try again.");
    } finally {
      setIsUpdatingScore(false);
    }
  };

  const moveToNextQuestion = () => {
    setIsTransitioning(true);
    setIsAnswered(false);
    setSelectedOption(null);
    // Hide bonus animation after a right answer.
    setShowTimerAnimation(false);
    setTimeout(() => {
      if (currentQuestionIndex < quizData.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        clearInterval(timerRef.current);
        setIsGameComplete(true);
      }
      setIsTransitioning(false);
    }, 1000);
  };

  const handleAnswer = async (index) => {
    if (isAnswered || isTransitioning) return;
    const currentQuestion = quizData[currentQuestionIndex];
    const isCorrect = index === currentQuestion.correctAnswer;
    setSelectedOption(index);
    setIsAnswered(true);
    if (isCorrect) {
      setScore((prev) => prev + 100);
      // Show bonus animation in center if correct.
      setShowTimerAnimation(true);
      const newTime = Math.min(timeLeft + TIME_BONUS, MAX_TIME);
      setTimeLeft(newTime);
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
    moveToNextQuestion();
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const getTimerColor = () => {
    if (timeLeft > 10) return "text-green-500";
    if (timeLeft > 5) return "text-yellow-500";
    return "text-red-500";
  };

  // Render loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-r-2 border-red-500"></div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-white text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Render "Time's Up" state
  if (timeLeft === 0) {
    return (
      <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-50">
        <div className="text-center space-y-8 animate-fade-in">
          <div className="relative">
            <Timer className="w-24 h-24 text-red-500 mx-auto animate-pulse" />
            <h2 className="text-5xl font-bold text-white mt-4">Time's Up!</h2>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <p className="text-lg text-gray-400">Final Score</p>
              <p className="text-4xl font-bold text-white">{score}</p>
            </div>
            <div className="space-y-2">
              <p className="text-lg text-gray-400">Personal Best</p>
              <p className="text-4xl font-bold text-yellow-500">
                {Math.max(userHighScore, score)}
              </p>
            </div>
          </div>
          <button
            onClick={async () => {
              if (!isUpdatingScore) {
                await updateUserScore(score);
                window.location.reload();
              }
            }}
            disabled={isUpdatingScore}
            className="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-full font-medium transition-all hover:scale-105 shadow-lg shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdatingScore ? "Saving Score..." : "Play Again"}
          </button>
        </div>
      </div>
    );
  }

  // Render Game Complete state (when all questions are answered)
  if (isGameComplete) {
    return (
      <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-50">
        <div className="text-center space-y-8 animate-fade-in">
          <div className="mb-12">
            <div className="w-24 h-24 mx-auto mb-4 relative">
              <Trophy className="w-full h-full text-yellow-500 animate-glow" />
              <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-xl animate-pulse-slow" />
            </div>
            <h2 className="text-5xl font-bold text-white">Game Complete!</h2>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <p className="text-lg text-gray-400">Final Score</p>
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <p className="text-4xl font-bold text-white">{score}</p>
              </div>
              <p className="text-lg text-gray-400">Time Left</p>
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <p className="text-4xl font-bold text-green-500">{timeLeft}s</p>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-lg text-gray-400">Personal Best</p>
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <p className="text-4xl font-bold text-yellow-500">
                  {Math.max(userHighScore, score)}
                </p>
              </div>
              <p className="text-lg text-gray-400">Games Played</p>
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <p className="text-4xl font-bold text-blue-500">{gamesPlayed + 1}</p>
              </div>
            </div>
          </div>
          <div className="pt-8">
            <button
              onClick={async () => {
                if (!isUpdatingScore) {
                  await updateUserScore(score);
                  window.location.reload();
                }
              }}
              disabled={isUpdatingScore}
              className="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-full font-medium transition-all hover:scale-105 shadow-lg shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdatingScore ? "Saving Score..." : "Play Again"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Splash screen: ask user to tap to start.
  if (!hasStarted) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center">
        <h1 className="text-white text-4xl mb-8">Welcome to the Quiz!</h1>
        <button
          onClick={startGame}
          className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-full font-medium transition-all hover:scale-105"
        >
          Tap to Start
        </button>
      </div>
    );
  }

  // Main game UI
  const currentQuestion = quizData[currentQuestionIndex];
  return (
    <div className="fixed inset-0 bg-black flex justify-center">
      <div className="relative h-full aspect-[9/16] bg-black max-w-md w-full">
        {/* Video Background */}
        <div className={`absolute inset-0 transition-opacity duration-500 ${isTransitioning ? "opacity-50" : "opacity-100"}`}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            webkitPlaysInline="true"
            muted={isMuted}
            loop
            preload="auto"
            className="w-full h-full object-cover"
          >
            <source src={currentQuestion.video} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />
        </div>

        {/* Center Bonus Animation for correct answer */}
        {showTimerAnimation && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="text-6xl font-bold text-green-500 animate-bounce">
              +{TIME_BONUS}s
            </div>
          </div>
        )}

        {/* Timer */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2">
          <div className="relative">
            <svg className="w-20 h-20 -rotate-90 transform">
              <circle
                cx="40"
                cy="40"
                r="35"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-gray-700"
              />
              <circle
                cx="40"
                cy="40"
                r="35"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                className={`${getTimerColor()} transition-all duration-1000`}
                style={{
                  strokeDasharray: `${2 * Math.PI * 35}`,
                  strokeDashoffset: `${2 * Math.PI * 35 * (1 - timeLeft / MAX_TIME)}`,
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className={`text-2xl font-bold ${getTimerColor()}`}>{timeLeft}</span>
                <Timer className={`w-4 h-4 mx-auto mt-1 ${getTimerColor()}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Game HUD */}
        <div className="absolute top-4 inset-x-4 flex justify-between items-center">
          <div className="flex items-center space-x-2 bg-black/50 rounded-full px-3 py-1 backdrop-blur-sm">
            <Award className="w-5 h-5 text-yellow-500" />
            <span className="font-bold text-white">{score}</span>
          </div>
          <button onClick={toggleMute} className="p-2 bg-black/50 rounded-full backdrop-blur-sm hover:bg-black/70 transition-colors">
            {isMuted ? <VolumeX className="w-6 h-6 text-white" /> : <Volume2 className="w-6 h-6 text-white" />}
          </button>
        </div>

        {/* Question and Options */}
        <div className={`absolute bottom-0 left-0 right-0 p-6 space-y-4 transition-all duration-500 ${isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}>
          <div className="bg-gradient-to-r from-black/80 to-black/60 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-lg animate-question-in">
            <div className="flex items-center space-x-3">
              <div className="bg-red-500 rounded-lg p-2 shadow-lg">
                <Timer className="w-5 h-5 text-white" />
              </div>
              <p className="text-white text-lg font-medium">{currentQuestion.question}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={isAnswered || isTransitioning}
                style={{ animationDelay: `${index * 0.1}s` }}
                className={`option-button p-5 rounded-xl text-left transition-all transform ${
                  isAnswered
                    ? index === currentQuestion.correctAnswer
                      ? "correct-highlight bg-gradient-to-r from-green-500 to-green-600 text-white animate-correct"
                      : index === selectedOption
                      ? "wrong-highlight bg-gradient-to-r from-red-500 to-red-600 text-white animate-wrong"
                      : "bg-black/50 opacity-50"
                    : "animate-option-in bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 active:scale-95"
                } backdrop-blur-sm shadow-lg border border-white/10 group`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isAnswered
                      ? index === currentQuestion.correctAnswer
                        ? "bg-green-600"
                        : index === selectedOption
                        ? "bg-red-600"
                        : "bg-white/10"
                      : "bg-white/10 group-hover:bg-white/20"
                  } transition-colors`}>
                    <span className="text-sm font-bold text-white">{String.fromCharCode(65 + index)}</span>
                  </div>
                  <span className="text-base font-medium text-white">{option}</span>
                </div>
                <div className="absolute inset-0 rounded-xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
