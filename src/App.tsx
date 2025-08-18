import React, { useState, useEffect } from 'react';
import { Authentication } from './components/Authentication';
import { InteractiveTutorial } from './components/InteractiveTutorial';
import { Dashboard } from './components/Dashboard';
import { DemoTest } from './components/DemoTest';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UnifiedGameInterface } from './components/UnifiedGameInterface';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Home, RotateCcw } from 'lucide-react';
import { gradeLevels } from './data/words';
import { getWordImage } from './data/imageMapping';

interface User {
  id: string;
  email: string;
  name: string;
  // ...existing code...
  createdAt: string;
  hasSeenTutorial: boolean;
}

interface PlayerProfile {
  id: string;
  name: string;
  age: number;
  gradeLevel: number;
  wordsCompleted: number;
  totalWordsAttempted: number;
  averageAccuracy: number;
  lastPlayed: string;
}

type GameState = 'intro' | 'playing' | 'correct' | 'incorrect' | 'complete';
type AppView = 'auth' | 'tutorial' | 'dashboard' | 'game';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('auth');
  const [selectedProfile, setSelectedProfile] = useState<PlayerProfile | null>(null);
  const [selectedGradeLevel, setSelectedGradeLevel] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [gameState, setGameState] = useState<GameState>('intro');
  const [sessionStats, setSessionStats] = useState({
    wordsCompleted: 0,
    totalAttempts: 0,
    correctAnswers: 0
  });

  const currentGrade = gradeLevels[selectedGradeLevel];
  const currentWord = currentGrade?.words[currentWordIndex];
  
  // Determine if we should use drag-drop (Kindergarten) or writing (1st+ grade)
  const useDragDrop = selectedGradeLevel === 0; // Kindergarten uses drag-drop

  // Check for existing authentication on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('phonics-current-user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        // Check if user has seen tutorial
        if (user.hasSeenTutorial) {
          setCurrentView('dashboard');
        } else {
          setCurrentView('tutorial');
        }
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('phonics-current-user');
        setCurrentView('auth');
      }
    }
  }, []);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    // Show tutorial for new users or users who haven't seen it
    if (user.hasSeenTutorial) {
      setCurrentView('dashboard');
    } else {
      setCurrentView('tutorial');
    }
  };

  const handleTutorialComplete = () => {
    if (currentUser) {
      // Mark user as having seen tutorial
      const updatedUser = { ...currentUser, hasSeenTutorial: true };
      
      // Update in localStorage
      const users = JSON.parse(localStorage.getItem('phonics-users') || '[]');
      const updatedUsers = users.map((u: User) => 
        u.id === currentUser.id ? updatedUser : u
      );
      localStorage.setItem('phonics-users', JSON.stringify(updatedUsers));
      localStorage.setItem('phonics-current-user', JSON.stringify(updatedUser));
      
      setCurrentUser(updatedUser);
    }
    setCurrentView('dashboard');
  };

  const handleTutorialSkip = () => {
    handleTutorialComplete(); // Same action as completing
  };

  const handleStartGame = (profile: PlayerProfile, gradeLevel: number) => {
    setSelectedProfile(profile);
    setSelectedGradeLevel(gradeLevel);
    setCurrentWordIndex(0);
    setGameState('playing');
    setSessionStats({
      wordsCompleted: 0,
      totalAttempts: 0,
      correctAnswers: 0
    });
    setCurrentView('game');
  };

  const handleWordComplete = (success: boolean) => {
    const newStats = {
      ...sessionStats,
      totalAttempts: sessionStats.totalAttempts + 1,
      correctAnswers: sessionStats.correctAnswers + (success ? 1 : 0),
      wordsCompleted: sessionStats.wordsCompleted + (success ? 1 : 0)
    };
    setSessionStats(newStats);

    // Update profile progress
    if (selectedProfile) {
      updateProfileProgress(selectedProfile, success);
    }

    // Move to next word after current word processing
    setTimeout(() => {
      if (currentWordIndex < currentGrade.words.length - 1) {
        setCurrentWordIndex(currentWordIndex + 1);
        setGameState('playing');
      } else {
        // End of level
        setGameState('complete');
      }
    }, 100);
  };

  const updateProfileProgress = (profile: PlayerProfile, success: boolean) => {
    const profiles = JSON.parse(localStorage.getItem('phonics-profiles') || '[]');
    const updatedProfiles = profiles.map((p: PlayerProfile) => {
      if (p.id === profile.id) {
        const newTotalAttempts = p.totalWordsAttempted + 1;
        const newCompleted = success ? p.wordsCompleted + 1 : p.wordsCompleted;
        const newAccuracy = newTotalAttempts > 0 ? (newCompleted / newTotalAttempts) * 100 : 0;
        
        return {
          ...p,
          wordsCompleted: newCompleted,
          totalWordsAttempted: newTotalAttempts,
          averageAccuracy: newAccuracy,
          lastPlayed: new Date().toISOString()
        };
      }
      return p;
    });
    
    localStorage.setItem('phonics-profiles', JSON.stringify(updatedProfiles));
    setSelectedProfile(updatedProfiles.find((p: PlayerProfile) => p.id === profile.id));
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedProfile(null);
    setSelectedGradeLevel(0);
    setCurrentWordIndex(0);
    setGameState('intro');
  };

  const handleRestartLevel = () => {
    setCurrentWordIndex(0);
    setGameState('playing');
    setSessionStats({
      wordsCompleted: 0,
      totalAttempts: 0,
      correctAnswers: 0
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('phonics-current-user');
    setCurrentUser(null);
    setCurrentView('auth');
    setSelectedProfile(null);
    setSelectedGradeLevel(0);
    setCurrentWordIndex(0);
    setGameState('intro');
  };

  // ...existing code...
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          (currentView === 'auth' || !currentUser) ? (
            <div>
              <Authentication onAuthSuccess={handleAuthSuccess} />
              <div className="flex justify-center mt-4">
                <button
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-xl shadow"
                  onClick={() => {
                    const guestUser = {
                      id: 'guest',
                      email: '',
                      name: 'Guest',
                      createdAt: new Date().toISOString(),
                      hasSeenTutorial: true
                    };
                    setCurrentUser(guestUser);
                    setCurrentView('dashboard');
                  }}
                >
                  Skip Sign In
                </button>
              </div>
            </div>
          ) : (currentView === 'tutorial') ? (
            <InteractiveTutorial
              onComplete={handleTutorialComplete}
              onSkip={handleTutorialSkip}
              userName={currentUser.name}
            />
          ) : (currentView === 'dashboard') ? (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
              <Dashboard 
                onStartGame={handleStartGame} 
                currentUser={currentUser}
                onLogout={handleLogout}
                onShowTutorial={() => setCurrentView('tutorial')}
              />
            </div>
          ) : (!currentWord || !selectedProfile) ? (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200">
              <div className="text-center">
                <div className="text-6xl animate-gentle-float mb-4">🦉</div>
                <div className="text-xl">Loading your phonics adventure...</div>
              </div>
            </div>
          ) : (gameState === 'complete') ? (
            <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 p-4">
              <Card className="p-8 text-center bg-white/95 backdrop-blur shadow-2xl border-4 border-purple-300 rounded-3xl max-w-md">
                <div className="mb-6">
                  <div className="text-8xl mb-4 animate-gentle-bounce">🎉</div>
                  <h2 className="text-3xl font-bold text-green-600 mb-2">
                    Level Complete!
                  </h2>
                  <p className="text-gray-600">
                    Amazing work completing {currentGrade.name}!
                  </p>
                  <div className="text-6xl my-4 animate-gentle-float">⭐</div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-100 p-4 rounded-2xl border-3 border-blue-300">
                    <div className="text-2xl font-bold text-blue-600">
                      {sessionStats.totalAttempts}
                    </div>
                    <div className="text-sm text-gray-600">Words</div>
                  </div>
                  <div className="bg-green-100 p-4 rounded-2xl border-3 border-green-300">
                    <div className="text-2xl font-bold text-green-600">
                      {sessionStats.correctAnswers}
                    </div>
                    <div className="text-sm text-gray-600">Correct</div>
                  </div>
                  <div className="bg-purple-100 p-4 rounded-2xl border-3 border-purple-300">
                    <div className="text-2xl font-bold text-purple-600">
                      {sessionStats.totalAttempts > 0 ? 
                        Math.round((sessionStats.correctAnswers / sessionStats.totalAttempts) * 100) : 0}%
                    </div>
                    <div className="text-sm text-gray-600">Score</div>
                  </div>
                </div>
                <div className="flex gap-4 justify-center">
                  <Button onClick={handleRestartLevel} variant="outline" className="rounded-2xl btn-bouncy" size="lg">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Play Again
                  </Button>
                  <Button onClick={handleBackToDashboard} className="bg-purple-500 hover:bg-purple-600 rounded-2xl btn-bouncy" size="lg">
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </Button>
                </div>
              </Card>
            </div>
          ) : (
            <UnifiedGameInterface
              word={currentWord}
              imageUrl={getWordImage(currentWord.word)}
              onComplete={handleWordComplete}
              onBackToDashboard={handleBackToDashboard}
              isDragMode={useDragDrop}
              playerName={selectedProfile.name}
              currentIndex={currentWordIndex}
              totalWords={currentGrade.words.length}
              correctAnswers={sessionStats.correctAnswers}
              totalAttempts={sessionStats.totalAttempts}
              gradeName={currentGrade.name}
            />
          )
        } />
        <Route path="/demo" element={<DemoTest />} />
      </Routes>
    </Router>
  );
  }