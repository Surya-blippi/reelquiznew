import React, { useState, useEffect } from 'react';
import { Heart, Award, Timer } from 'lucide-react';

const VideoQuizDemo = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isCorrect, setIsCorrect] = useState(null);

  // Sample question data
  const question = {
    text: "What's the main purpose of this viral marketing campaign?",
    options: [
      "Increase brand awareness",
      "Drive website traffic",
      "Generate social shares",
      "All of the above"
    ],
    correctAnswer: 3
  };

  useEffect(() => {
    const timer = timeLeft > 0 && setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    if (timeLeft === 0) {
      handleTimeout();
    }

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleOptionSelect = (index) => {
    setSelectedOption(index);
    setIsCorrect(index === question.correctAnswer);
    
    if (index === question.correctAnswer) {
      setScore(prev => prev + 100);
    } else {
      setLives(prev => prev - 1);
    }
  };

  const handleTimeout = () => {
    setLives(prev => prev - 1);
    setIsCorrect(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-red-950 via-black to-black p-4">
      <div className="relative max-w-md w-full aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl">
        {/* Video Container */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/demo-video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {/* Overlay gradient for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-90" />
        </div>

        {/* HUD Elements */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          {/* Lives */}
          <div className="flex items-center space-x-1">
            {[...Array(3)].map((_, i) => (
              <Heart
                key={i}
                className={`w-6 h-6 ${i < lives ? 'text-red-500' : 'text-gray-600'}`}
                fill={i < lives ? 'currentColor' : 'none'}
              />
            ))}
          </div>
          
          {/* Score */}
          <div className="flex items-center space-x-2 bg-black/50 rounded-full px-3 py-1 backdrop-blur-sm">
            <Award className="w-5 h-5 text-yellow-500" />
            <span className="font-bold text-white">{score}</span>
          </div>
        </div>

        {/* Timer */}
        <div className="absolute top-16 left-1/2 -translate-x-1/2">
          <div className="relative flex items-center justify-center w-16 h-16">
            {/* Background circle */}
            <div className="absolute w-full h-full rounded-full bg-black/50 backdrop-blur-sm" />
            
            {/* Progress circle */}
            <svg className="absolute w-full h-full -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-red-500/20"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                className="text-red-500"
                style={{
                  strokeDasharray: `${2 * Math.PI * 28}`,
                  strokeDashoffset: `${2 * Math.PI * 28 * (1 - timeLeft / 15)}`,
                  transition: 'stroke-dashoffset 1s linear'
                }}
              />
            </svg>
            
            {/* Timer icon and number */}
            <div className="relative flex flex-col items-center justify-center">
              <Timer className="w-5 h-5 text-white mb-1" />
              <span className="text-lg font-bold text-white">{timeLeft}s</span>
            </div>
          </div>
        </div>

        {/* Question Container */}
        <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
          {/* Question Text */}
          <div className="bg-black/70 backdrop-blur-md rounded-2xl p-4">
            <p className="text-white text-lg font-medium">{question.text}</p>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-2 gap-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                disabled={selectedOption !== null}
                className={`p-4 rounded-xl text-left transition-all transform hover:scale-105 ${
                  selectedOption === null
                    ? 'bg-white/10 hover:bg-white/20 backdrop-blur-sm'
                    : selectedOption === index
                    ? isCorrect
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                    : index === question.correctAnswer && selectedOption !== null
                    ? 'bg-green-500 text-white'
                    : 'bg-white/10 opacity-50'
                }`}
              >
                <span className="text-sm font-medium">{option}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Game Over Overlay */}
        {lives === 0 && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center space-y-4 animate-fade-in">
            <h2 className="text-3xl font-bold text-white">Game Over!</h2>
            <p className="text-gray-400">Final Score: {score}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium transition-colors"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoQuizDemo;