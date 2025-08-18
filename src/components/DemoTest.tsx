import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { gradeLevels } from '../data/words';
import { UnifiedGameInterface } from './UnifiedGameInterface';
import { Card } from './ui/card';
import { Button } from './ui/button';
import {
  FaSmile as FaSmileIcon,
  FaFrown as FaFrownIcon,
  FaStar as FaStarIcon,
  FaRedoAlt as FaRedoAltIcon,
  FaHome as FaHomeIcon,
} from "react-icons/fa";

// Typed aliases to fix TS2786 errors
const Smile = FaSmileIcon as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const Frown = FaFrownIcon as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const Star = FaStarIcon as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const Redo = FaRedoAltIcon as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const Home = FaHomeIcon as unknown as React.FC<React.SVGProps<SVGSVGElement>>;

export const DemoTest: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { gradeLevel = 0 } = location.state || {};
  const [step, setStep] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [demoWords, setDemoWords] = useState(() => {
    // Pick 3 random words from the selected grade
    const words = gradeLevels[gradeLevel]?.words || [];
    if (words.length <= 3) return words;
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  });
  const [showHomeModal, setShowHomeModal] = useState(false);

  // Track results for summary
  const [results, setResults] = useState<{ word: string; correct: boolean; correctWord: string }[]>([]);

  const handleComplete = (success: boolean) => {
    setStep((prev) => prev + 1);
    setTotalAttempts((prev) => prev + 1);
    if (success) setCorrectAnswers((prev) => prev + 1);
    setResults(prev => [...prev, { word: demoWords[step].word, correct: success, correctWord: demoWords[step].word }]);
  };

  const handleDemoAgain = () => {
    const words = gradeLevels[gradeLevel]?.words || [];
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setDemoWords(shuffled.slice(0, 3));
    setStep(0);
    setCorrectAnswers(0);
    setTotalAttempts(0);
    setResults([]);
  };

  const handleHomeClick = () => {
    setShowHomeModal(true); // Show modal instead of navigating
  };

  if (step >= demoWords.length) {
    // Show summary with correct/incorrect icons
    return (
      <Card className="max-w-md mx-auto mt-12 p-8 border-4 border-green-300 rounded-3xl shadow-2xl text-center">
        <h2 className="text-3xl font-bold text-green-800 mb-4">Demo Complete!</h2>
        <div className="grid grid-cols-1 gap-4 mb-4">
          {results.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border-2 border-gray-200 bg-gray-50">
              <span className={`text-2xl ${item.correct ? 'text-green-500' : 'text-red-500'}`}>{item.correct ? '✅' : '❌'}</span>
              <span className="font-bold text-lg">{item.word}</span>
              {!item.correct && <span className="text-gray-500 ml-2">Correct: <span className="font-mono">{item.correctWord}</span></span>}
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-2 mb-4">
          {Array.from({ length: demoWords.length }, (_, i) => (
            <Star
              key={i}
              className={`text-3xl ${i < correctAnswers ? "text-yellow-400" : "text-gray-300"}`}
            />
          ))}
        </div>
        <p className="mb-4 text-lg font-medium">
          You answered {correctAnswers} out of {demoWords.length} correctly.
        </p>
        <Button
          className="bg-yellow-500 hover:bg-yellow-600 rounded-xl text-lg font-semibold flex items-center justify-center gap-2"
          onClick={handleDemoAgain}
        >
          <Redo /> Take Demo Again
        </Button>
      </Card>
    );
  }

  const currentWord = demoWords[step];
  if (!currentWord) {
    return (
      <Card className="max-w-md mx-auto mt-12 p-8 border-4 border-red-300 rounded-3xl shadow-2xl text-center">
        <h2 className="text-2xl font-bold text-red-800 mb-4">No Demo Words Found</h2>
        <Button onClick={handleHomeClick}>Back to Dashboard</Button>
      </Card>
    );
  }

  // Use drag mode for kindergarten, writing for others
  const isDragMode = gradeLevel === 0;

  return (
    <div className={`min-h-screen ${showHomeModal ? 'bg-gray-200' : 'bg-white'}`}>
      <UnifiedGameInterface
        word={currentWord}
        imageUrl={''} // Optionally use currentWord.imageQuery with an image fetcher
        onComplete={handleComplete}
        onBackToDashboard={handleHomeClick} // Updated to show modal
        isDragMode={isDragMode}
        playerName={''}
        currentIndex={step}
        totalWords={demoWords.length}
        correctAnswers={correctAnswers}
        totalAttempts={totalAttempts}
        gradeName={gradeLevels[gradeLevel]?.name || ''}
      />
      {/* Full-screen centered modal */}
      {showHomeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <Card className="relative w-full max-w-2xl p-8 bg-white rounded-xl shadow-2xl">
            {/* Close icon */}
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={() => setShowHomeModal(false)}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-2xl font-bold mb-6 text-center">Are you sure you want to leave the demo?</h3>
            <div className="flex justify-center gap-6">
             <Button
  onClick={() => {
    setShowHomeModal(false);
    navigate('/');
  }}
  className="bg-green-500 hover:bg-green-600 text-lg px-6 py-3"
>
  Yes
</Button>
              <Button
                onClick={() => setShowHomeModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-lg px-6 py-3"
              >
                No
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};