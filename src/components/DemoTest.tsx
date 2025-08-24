import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { gradeLevels, Word } from '../data/words';
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
import { submitGrade, WordResponse } from '../services/api';

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
  const [demoWords, setDemoWords] = useState<Word[]>([]);
  const [showHomeModal, setShowHomeModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<{ word: string; correct: boolean; correctWord: string }[]>([]);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  // Function to get random indices
  const getRandomIndices = (array: any[], count: number) => {
    const indices = Array.from({ length: array.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices.slice(0, count);
  };

  // Initialize demo words
  useEffect(() => {
    const initializeDemoWords = async () => {
      setIsLoading(true);
      try {
        const gradeName = gradeLevels[gradeLevel].name.replace(/ grade$/i, '').trim();
        const response = await submitGrade(gradeName) || { words: [] };
        const wordsArray = response.words || [];
        const randomIndices = getRandomIndices(wordsArray, 3);
        const selectedWords = randomIndices.map(index => wordsArray[index]);
        setDemoWords(selectedWords);
      } catch (error) {
        console.error('Error initializing demo words:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeDemoWords();
  }, [gradeLevel]);

  const handleComplete = () => {
    setShowCompleteModal(true);
  };

  const handleDemoAgain = async () => {
    setIsLoading(true);
    setShowCompleteModal(false);
    try {
      const gradeName = gradeLevels[gradeLevel].name.replace(/ grade$/i, '').trim();
      const response = await submitGrade(gradeName) || { words: [] };
      const wordsArray = response.words || [];
      const randomIndices = getRandomIndices(wordsArray, 3);
      const selectedWords = randomIndices.map(index => wordsArray[index]);
      setDemoWords(selectedWords);
      setStep(0);
      setCorrectAnswers(0);
      setTotalAttempts(0);
      setResults([]);
    } catch (error) {
      console.error('Error getting new demo words:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHomeClick = () => {
    setShowHomeModal(true); // Show modal instead of navigating
  };


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
          <p className="mt-4 text-lg text-gray-600">Loading demo words...</p>
        </div>
      </div>
    );
  }

  if (!demoWords || demoWords.length === 0) {
    return (
      <Card className="max-w-md mx-auto mt-12 p-8 border-4 border-red-300 rounded-3xl shadow-2xl text-center">
        <h2 className="text-2xl font-bold text-red-800 mb-4">No Demo Words Found</h2>
        <Button className="bg-yellow-500 hover:bg-yellow-600 rounded-xl text-lg font-semibold flex items-center justify-center gap-2" onClick={handleHomeClick}>Back to Dashboard</Button>
      </Card>
    );
  }

  // Use drag mode for kindergarten, writing for others
  const isDragMode = gradeLevel === 0;
  if (showCompleteModal) {
    return (
            <Card className="max-w-md mx-auto mt-12 p-8 border-4 border-green-300 rounded-3xl shadow-2xl text-center z-50">
        <h2 className="text-3xl font-bold text-green-800 mb-4">Demo Complete!</h2>
        <Button
          className="bg-yellow-500 hover:bg-yellow-600 rounded-xl text-lg font-semibold flex items-center justify-center gap-2"
          onClick={handleDemoAgain}
        >
          <Redo /> Take Demo Again
        </Button>
                <Button
          className="bg-yellow-500 hover:bg-yellow-600 rounded-xl text-lg font-semibold flex items-center justify-center gap-2"
            onClick={() => {
    navigate('/');
  }}
        >
           Go to Dashboard
        </Button>
      </Card>
    );
  }

  return (
    <div className={`min-h-screen ${showHomeModal ? 'bg-gray-200' : 'bg-white'}`}>
      <UnifiedGameInterface
        words={demoWords}
        // Optionally use currentWord.imageQuery with an image fetcher
        onComplete={handleComplete}
        onBackToDashboard={handleHomeClick} // Updated to show modal
        isDragMode={isDragMode}
        playerName={''}
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