import React, { useState, useEffect } from 'react';
import { Authentication } from './components/Authentication';
import { InteractiveTutorial } from './components/InteractiveTutorial';
import { Dashboard } from './components/Dashboard';
import { DemoTest } from './components/DemoTest';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UnifiedGameInterface } from './components/UnifiedGameInterface';
import SpellingAssessment from './components/SpellingAssessment';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Home, RotateCcw } from 'lucide-react';
import { gradeLevels, Phoneme, Word } from './data/words';
import { getWordImage } from './data/imageMapping';
import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { submitGrade, submitWords } from './services/api';

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
const firebaseConfig = {
  apiKey: "AIzaSyAndj6cTVS48-koGsdYyVr_BLCEIu5G1tU",
  authDomain: "the-dear-parent-project.firebaseapp.com",
  projectId: "the-dear-parent-project",
  storageBucket: "the-dear-parent-project.firebasestorage.app",
  messagingSenderId: "235781574670",
  appId: "1:235781574670:web:f5e8fe651ac34667abec5f",
  measurementId: "G-SKHRXP4H06"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

type GameState = 'intro' | 'playing' | 'correct' | 'incorrect' | 'complete';
type AppView = 'auth' | 'tutorial' | 'dashboard' | 'game';



export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('auth');
  const [selectedProfile, setSelectedProfile] = useState<PlayerProfile | null>(null);
  const [selectedGradeLevel, setSelectedGradeLevel] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [gameState, setGameState] = useState<GameState>('intro');
  const [wordsList, setWordsList] = useState<Word[]>([]);
  const [sessionStats, setSessionStats] = useState({
    wordsCompleted: 0,
    totalAttempts: 0,
    correctAnswers: 0
  });

  const [assessmentData, setAssessmentData] = useState<any>(null);
  const currentGrade = gradeLevels[selectedGradeLevel];
  const apiWord = wordsList;
  const currentWord = apiWord;
    const [isLoading, setIsLoading] = useState(false);
  
  // Determine if we should use drag-drop (Kindergarden) or writing (1st+ grade)
  const useDragDrop = selectedGradeLevel === 0; // Kindergarden uses drag-drop

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

  const handleStartGame = async (profile: PlayerProfile, gradeLevel: number) => {
    try {
      setIsLoading(true);
      setSelectedProfile(profile);
      setSelectedGradeLevel(gradeLevel);
      
      // Get the grade name from the gradeLevels array
      const gradeName = gradeLevels[gradeLevel].name.replace(/ grade$/i, '').trim();
      
      // Call the API to get words for this grade
      const wordResponse = await submitGrade(gradeName);
      
      // // Store the words from the API
      setWordsList(wordResponse.words);
      // setGameState('complete');
      // Reset game state
      setCurrentWordIndex(0);
      setGameState('playing');
      setIsLoading(false);
      setSessionStats({
        wordsCompleted: 0,
        totalAttempts: 0,
        correctAnswers: 0
      });
      setCurrentView('game');
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

const handleWordComplete = async (results: Array<{ word: string; user_input: string; type: string }>) => {
  try {
    const gradeName = gradeLevels[gradeLevel].name.replace(/ grade$/i, '').trim();
    const response = await submitWords(results, selectedProfile?.id, gradeName);
    setAssessmentData(response); // Store the API response
    setGameState('complete');
  } catch (error) {
    console.error('Error submitting words:', error);
  }
  console.log(results);
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
    setAssessmentData(null);
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

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('phonics-profiles');
      setCurrentUser(null);
      setCurrentView('auth');
      setSelectedProfile(null);
      setSelectedGradeLevel(0);
      setCurrentWordIndex(0);
      setGameState('intro');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

    if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
          <p className="mt-4 text-lg text-gray-600">Loading ...</p>
        </div>
      </div>
    );
  }

  // ...existing code...
    return (
    <Router>
      <Routes>
        <Route path="/" element={
          (currentView === 'auth' || !currentUser) ? (
            <div>
              <Authentication onAuthSuccess={handleAuthSuccess} />
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
          <SpellingAssessment  assessmentData={assessmentData }
    onBackToDashboard={handleBackToDashboard} />
          ) : (
    <UnifiedGameInterface
      words={currentWord}
      onComplete={({ words }) => {handleWordComplete(words)}}
      onBackToDashboard={handleBackToDashboard}
      isDragMode={useDragDrop}
      playerName={selectedProfile.name}
      gradeName={currentGrade.name}
    />
          )
        } />
        <Route path="/demo" element={<DemoTest />} />
      </Routes>
    </Router>
  );
}