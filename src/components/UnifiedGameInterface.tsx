import React, { useState, useEffect } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Word, Phoneme } from '../data/words';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Volume2, RotateCcw, CheckCircle, Eye, EyeOff, Star, Home, ArrowLeft } from 'lucide-react';

interface PhonemeCardProps {
  phoneme: Phoneme;
  index: number;
  isCorrect?: boolean;
  isUsed?: boolean;
  isDragMode: boolean;
}

interface DropZoneProps {
  index: number;
  letter: string | null;
  onDrop: (letter: string, index: number, poolIdx: number) => void;
}

interface DraggableLetterProps {
  letter: string;
  poolIdx: number;
}

interface UnifiedGameInterfaceProps {
  word: Word;
  imageUrl: string;
  onComplete: (success: boolean) => void;
  onBackToDashboard: () => void;
  isDragMode: boolean;
  playerName: string;
  currentIndex: number;
  totalWords: number;
  correctAnswers: number;
  totalAttempts: number;
  gradeName: string;
  disableGrayOut?: boolean; // Added to prevent graying out letters
}

const PhonemeCard: React.FC<PhonemeCardProps> = ({ phoneme, index, isCorrect, isUsed, isDragMode }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'phoneme',
    item: { phoneme, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: !isUsed && isDragMode,
  });

  const getPhonemeColor = (type: string) => {
    const colors = {
      consonant: 'bg-blue-200 border-blue-400 text-blue-900',
      vowel: 'bg-red-200 border-red-400 text-red-900',
      digraph: 'bg-purple-200 border-purple-400 text-purple-900',
      blend: 'bg-green-200 border-green-400 text-green-900',
      vowel_team: 'bg-pink-200 border-pink-400 text-pink-900',
      r_controlled: 'bg-orange-200 border-orange-400 text-orange-900',
      diphthong: 'bg-yellow-200 border-yellow-400 text-yellow-900',
      final_stable: 'bg-gray-200 border-gray-400 text-gray-900'
    };
    return colors[type as keyof typeof colors] || colors.consonant;
  };

  if (!isDragMode) return null;

  return (
    <div
      ref={(node) => {
        if (node) {
          drag(node);
        }
      }}
      className={`
        p-2 rounded-xl border-3 min-w-[50px] text-center
        transition-all duration-300 select-none transform
        ${!isUsed ? 'cursor-grab active:cursor-grabbing hover:scale-105 hover:shadow-md phoneme-gentle-pulse' : 'cursor-not-allowed opacity-40'}
        ${isDragging ? 'opacity-50 scale-95' : 'opacity-100'}
        ${isCorrect ? 'bg-green-200 border-green-500 text-green-900 animate-soft-glow' : getPhonemeColor(phoneme.type)}
        ${isUsed ? 'bg-gray-100 border-gray-300 text-gray-500' : ''}
      `}
    >
      <div className="text-[10px] opacity-70 mb-1">{phoneme.sound}</div>
      <div className="text-sm font-bold">{phoneme.letters}</div>
    </div>
  );
};

export const UnifiedGameInterface: React.FC<UnifiedGameInterfaceProps> = ({ 
  word, 
  imageUrl, 
  onComplete, 
  onBackToDashboard,
  isDragMode,
  playerName,
  currentIndex,
  totalWords,
  correctAnswers,
  totalAttempts,
  gradeName,
  disableGrayOut = false, // Default to false if not provided
}) => {
  // Drag and Drop State (track used letters)
  const [userPhonemes, setUserPhonemes] = useState<(string | null)[]>(
    new Array(word.phonemes.length).fill(null)
  );
  const [letterPool, setLetterPool] = useState<string[]>([]);
  
  // Writing Mode State
  const [userInput, setUserInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [showPhonemes, setShowPhonemes] = useState(false);
  
  // Common State
  const [isComplete, setIsComplete] = useState(false);
  const [correctPositions, setCorrectPositions] = useState<boolean[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [owlMessage, setOwlMessage] = useState('');
  const [owlExpression, setOwlExpression] = useState('😊');
  const [isAutoSpeaking, setIsAutoSpeaking] = useState(true);
  const [nextPressed, setNextPressed] = useState(false);

  const progressPercentage = ((currentIndex + 1) / totalWords) * 100;
  const accuracy = totalAttempts > 0 ? (correctAnswers / totalAttempts) * 100 : 0;

  useEffect(() => {
    // Reset states when word changes
    if (isDragMode) {
      // Build pool of 18 random letters, always including the correct ones
      const correctLetters = word.phonemes.map(p => p.letters);
      const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
      let pool = [...correctLetters];
      while (pool.length < 18) {
        const rand = alphabet[Math.floor(Math.random() * alphabet.length)];
        if (!pool.includes(rand)) pool.push(rand);
      }
      pool = pool.sort(() => Math.random() - 0.5);
      setLetterPool(pool);
      setUserPhonemes(new Array(word.phonemes.length).fill(null));
    } else {
      setUserInput('');
      setShowHint(false);
      setShowPhonemes(false);
    }
    
    setIsComplete(false);
    setCorrectPositions(new Array(word.phonemes.length).fill(false));
    setAttempts(0);
    setNextPressed(false);
    
    // Set owl message
    const messages = [
      `Listen carefully ${playerName}! What word do you hear? 🎵`,
      `Great job so far! Let's spell this next word! 📚`,
      `You're doing amazing! Time for another word! ⭐`,
      `Ready for the next challenge? You've got this! 💪`
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setOwlMessage(randomMessage);
    setOwlExpression('🤔');
    
    // Auto-speak word
    if (isAutoSpeaking) {
      setTimeout(() => speakWord(), 800);
      setTimeout(() => speakMessage(randomMessage), 1500);
    }
  }, [word, isDragMode, playerName, isAutoSpeaking]);

  const speakWord = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word.word);
      const voices = speechSynthesis.getVoices();
      const ukVoice = voices.find(voice => voice.lang.includes('en-GB')) || voices[0];
      if (ukVoice) utterance.voice = ukVoice;
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const speakMessage = (message: string) => {
    if ('speechSynthesis' in window && isAutoSpeaking) {
      const cleanMessage = message.replace(/[^\w\s.,!?]/g, '').replace(/\s+/g, ' ').trim();
      if (cleanMessage) {
        const utterance = new SpeechSynthesisUtterance(cleanMessage);
        const voices = speechSynthesis.getVoices();
        const ukVoice = voices.find(voice => voice.lang.includes('en-GB')) || voices[0];
        if (ukVoice) utterance.voice = ukVoice;
        utterance.rate = 0.9;
        utterance.pitch = 1.2;
        speechSynthesis.speak(utterance);
      }
    }
  };

  // Drag and Drop Logic (react-dnd)
  const DropZone: React.FC<DropZoneProps> = ({ index, letter, onDrop }) => {
    const [{ isOver, canDrop }, drop] = useDrop({
      accept: 'letter',
      drop: (item: { letter: string; poolIdx: number }) => onDrop(item.letter, index, item.poolIdx),
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    });
    return (
      <div
        ref={drop as unknown as React.Ref<HTMLDivElement>}
        className={`w-16 h-16 border-4 rounded-xl flex items-center justify-center bg-white text-2xl font-bold mx-1 ${letter ? 'border-blue-400' : 'border-gray-300'} ${isOver && canDrop ? 'bg-blue-100' : ''}`}
        onClick={() => handleClearDropZone(index)}
      >
        {letter || <span className="text-gray-400">?</span>}
      </div>
    );
  };

  const DraggableLetter: React.FC<DraggableLetterProps> = ({ letter, poolIdx }) => {
    const [{ isDragging }, drag] = useDrag({
      type: 'letter',
      item: { letter, poolIdx },
      canDrag: true,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });
    return (
      <div
        ref={drag as unknown as React.Ref<HTMLDivElement>}
        className={`w-12 h-12 border-2 border-purple-300 rounded-lg flex items-center justify-center bg-purple-50 text-xl font-bold cursor-pointer hover:bg-purple-200 transition-all duration-200 ${isDragging ? 'opacity-50' : ''}`}
      >
        {letter.toUpperCase()}
      </div>
    );
  };

  const handleDrop = (letter: string, index: number, poolIdx: number) => {
    if (userPhonemes[index] === null) {
      const newUserPhonemes = [...userPhonemes];
      newUserPhonemes[index] = letter;
      setUserPhonemes(newUserPhonemes);
    }
  };

  const handleClearDropZone = (index: number) => {
    const letter = userPhonemes[index];
    if (letter !== null) {
      const poolIdx = letterPool.findIndex((l) => l === letter);
      const newUserPhonemes = [...userPhonemes];
      newUserPhonemes[index] = null;
      setUserPhonemes(newUserPhonemes);
    }
  };

  // Drag and Drop Logic (refactored for letter pool)
  const handleLetterDrop = (letter: string, index: number) => {
    const newUserPhonemes = [...userPhonemes];
    newUserPhonemes[index] = letter;
    setUserPhonemes(newUserPhonemes);

    // Check positions
    const newCorrectPositions = newUserPhonemes.map((userLetter, i) => {
      return userLetter === word.phonemes[i]?.letters;
    });
    setCorrectPositions(newCorrectPositions);
  };

  // Writing Mode Logic
  const handleSubmit = () => {
    const cleanInput = userInput.trim().toLowerCase();
    const correctWord = word.word.toLowerCase();
    const isCorrect = cleanInput === correctWord;
    
    setAttempts(prev => prev + 1);
    
    if (isCorrect) {
      setIsComplete(true);
      setOwlMessage(`🎉 Perfect spelling ${playerName}! You're a star! 🌟`);
      setOwlExpression('🎊');
      if (isAutoSpeaking) {
        setTimeout(() => speakMessage(`Perfect spelling ${playerName}! You're a star!`), 500);
      }
      setTimeout(() => onComplete(true), 1500);
    } else {
      if (attempts >= 1) setShowHint(true);
      if (attempts >= 2) setShowPhonemes(true);
      
      if (attempts >= 2) {
        setUserInput(word.word);
        setIsComplete(true);
        setOwlMessage(`Good try ${playerName}! The word is "${word.word}". You're learning! 📚`);
        setOwlExpression('😊');
        if (isAutoSpeaking) {
          setTimeout(() => speakMessage(`Good try ${playerName}! The word is ${word.word}. You're learning!`), 500);
        }
        setTimeout(() => onComplete(false), 2000);
      } else {
        setOwlMessage(`Close one! Listen again and try once more! 🎵`);
        setOwlExpression('🤔');
        if (isAutoSpeaking) {
          setTimeout(() => speakMessage('Close one! Listen again and try once more!'), 500);
        }
      }
    }
  };

  // Drag and Drop Logic (Next button answer checking)
  const handleNext = () => {
    setNextPressed(true);
    const isCorrect = userPhonemes.every((letter, i) => letter === word.phonemes[i]?.letters);
    setCorrectPositions(userPhonemes.map((letter, i) => letter === word.phonemes[i]?.letters));
    setIsComplete(true);
    if (isCorrect) {
      setOwlMessage(`🎉 Amazing work ${playerName}! You spelled it perfectly! 🎉`);
      setOwlExpression('🎊');
      if (isAutoSpeaking) {
        setTimeout(() => speakMessage(`Amazing work ${playerName}! You spelled it perfectly!`), 500);
      }
      setTimeout(() => onComplete(true), 1500);
    } else {
      setOwlMessage(`Good try ${playerName}! The word is "${word.word}". You're learning! 📚`);
      setOwlExpression('😊');
      if (isAutoSpeaking) {
        setTimeout(() => speakMessage(`Good try ${playerName}! The word is ${word.word}. You're learning!`), 500);
      }
      setTimeout(() => onComplete(false), 2000);
    }
  };

  const handleReset = () => {
    if (isDragMode) {
      setUserPhonemes(new Array(word.phonemes.length).fill(null));
    } else {
      setUserInput('');
      setShowHint(false);
      setShowPhonemes(false);
    }
    setIsComplete(false);
    setCorrectPositions(new Array(word.phonemes.length).fill(false));
    setAttempts(0);
    setNextPressed(false);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex flex-col bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 p-4">
        {/* Header with controls and progress */}
        <div className="flex items-center justify-between mb-4">
          <Button onClick={onBackToDashboard} variant="outline" size="sm" className="bg-white/80 hover:bg-white btn-bouncy">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Home
          </Button>
          
          {/* Progress in header */}
          <div className="flex-1 mx-6">
            <div className="flex justify-center gap-1 mb-2">
              {Array.from({ length: totalWords }, (_, index) => (
                <div
                  key={index}
                  className={`
                    w-3 h-3 rounded-full border-2 transition-all duration-500
                    ${index < currentIndex ? 'bg-green-400 border-green-500' : ''}
                    ${index === currentIndex ? 'bg-blue-400 border-blue-500 animate-gentle-bounce scale-125' : ''}
                    ${index > currentIndex ? 'bg-gray-200 border-gray-300' : ''}
                  `}
                />
              ))}
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <div className="text-right">
            <div className="text-sm font-bold text-purple-800">{playerName}</div>
            <div className="text-xs text-gray-600">{gradeName}</div>
          </div>
        </div>

        {/* Main Game Card - Single unified interface */}
        <Card className="flex-1 p-6 bg-white/95 backdrop-blur shadow-2xl border-4 border-purple-300 rounded-3xl overflow-hidden">
          <div className="h-full grid grid-cols-12 gap-6">
            
            {/* Left Column - Owl Character */}
            <div className="col-span-3 flex flex-col justify-center items-center">
              <div className="text-center mb-4">
                <div className="text-6xl character-animation mb-4 filter drop-shadow-lg">🦉</div>
                <div className="text-lg font-bold text-purple-800 mb-2">Olly says:</div>
                <div className="bg-purple-100 rounded-2xl p-3 border-3 border-purple-300 speech-bubble-gentle">
                  <p className="text-sm text-purple-900 font-medium leading-tight">{owlMessage}</p>
                </div>
                
                <div className="flex justify-center gap-2 mt-3">
                  <Button onClick={speakWord} size="sm" className="bg-blue-500 hover:bg-blue-600 btn-bouncy">
                    <Volume2 className="w-4 h-4" />
                  </Button>
                  <Button onClick={handleReset} size="sm" variant="outline" className="btn-bouncy">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Stats */}
              {totalAttempts > 0 && (
                <div className="grid grid-cols-1 gap-2 w-full">
                  <div className="bg-green-100 rounded-xl p-2 text-center border-2 border-green-300">
                    <div className="text-lg font-bold text-green-600">{correctAnswers}</div>
                    <div className="text-xs text-green-800">Correct</div>
                  </div>
                  <div className="bg-blue-100 rounded-xl p-2 text-center border-2 border-blue-300">
                    <div className="text-lg font-bold text-blue-600">{Math.round(accuracy)}%</div>
                    <div className="text-xs text-blue-800">Score</div>
                  </div>
                </div>
              )}
            </div>

            {/* Center Column - Large Gentle Image */}
            <div className="col-span-6 flex flex-col justify-center items-center">
              <div className="mb-6">
                <div className="w-80 h-80 relative">
                  <ImageWithFallback
                    src={imageUrl}
                    alt="Word to spell"
                    className="w-full h-full object-cover rounded-3xl border-4 border-yellow-400 shadow-2xl image-subtle-bounce image-gentle-hover transition-transform duration-500"
                  />
                  {/* Word type badge */}
                  <div className="absolute -top-3 -right-3">
                    <span className={`
                      px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-gentle-float
                      ${word.type === 'real' ? 'bg-green-400 text-green-900' : ''}
                      ${word.type === 'nonsense' ? 'bg-purple-400 text-purple-900' : ''}
                      ${word.type === 'sight' ? 'bg-blue-400 text-blue-900' : ''}
                    `}>
                      {word.type === 'real' ? '📚' : ''}
                      {word.type === 'nonsense' ? '🎭' : ''}
                      {word.type === 'sight' ? '👁️' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Game Mode Interface */}
              {isDragMode ? (
                <>
                  {/* Drop Zones for Drag Mode */}
                  <div className="flex justify-center gap-2 mb-6">
                    {userPhonemes.map((letter, index) => (
                      <DropZone
                        key={index}
                        index={index}
                        letter={letter}
                        onDrop={handleDrop}
                      />
                    ))}
                  </div>
                  {/* Letter Pool Grid */}
                  <div className="grid grid-cols-6 gap-2 mb-6">
                    {letterPool.map((letter, idx) => (
                      <DraggableLetter
                        key={idx}
                        letter={letter}
                        poolIdx={idx}
                      />
                    ))}
                  </div>
                  {/* Next Button */}
                  <Button
                    onClick={handleNext}
                    disabled={userPhonemes.some(l => l === null) || isComplete}
                    className="mt-3 w-full h-12 bg-green-500 hover:bg-green-600 rounded-2xl btn-bouncy text-xl"
                    size="lg"
                  >
                    Next ➡️
                  </Button>
                </>
              ) : (
                <>
                  {/* Writing Input */}
                  <div className="w-full max-w-md mb-4">
                    <Input
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && userInput.trim() && handleSubmit()}
                      placeholder="Type the word here..."
                      className="text-center text-2xl p-4 h-16 border-4 border-purple-300 rounded-2xl transition-all duration-300 hover:border-purple-400 focus:border-purple-500"
                      disabled={isComplete}
                      autoFocus
                    />
                    <Button 
                      onClick={handleSubmit}
                      disabled={!userInput.trim() || isComplete}
                      className="mt-3 w-full h-12 bg-purple-500 hover:bg-purple-600 rounded-2xl btn-bouncy"
                      size="lg"
                    >
                      Check Answer ✨
                    </Button>
                  </div>

                  {/* Hints for Writing Mode */}
                  {showHint && (
                    <div className="bg-yellow-100 rounded-2xl p-3 border-3 border-yellow-400 mb-4 animate-gentle-float">
                      <div className="text-center">
                        <div className="text-sm text-yellow-800 mb-2">💡 The word has {word.word.length} letters</div>
                        <div className="flex justify-center gap-1">
                          {word.word.split('').map((_, index) => (
                            <div key={index} className="w-6 h-6 border-2 border-yellow-500 rounded bg-white"></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Success Message */}
              {isComplete && (
                <div className="text-center animate-gentle-bounce">
                  <div className="text-4xl mb-2">🎉</div>
                  <div className="text-xl font-bold text-green-600">Great job!</div>
                </div>
              )}
            </div>

            {/* Right Column - Phoneme Cards (Drag Mode Only) */}
            {/* {isDragMode && (
              <div className="col-span-3 flex flex-col justify-center">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-purple-800 mb-3">Drag the sounds:</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {letterPool.map((letter, index) => (
                      <PhonemeCard
                        key={`${letter}-${index}`}
                        phoneme={{ letters: letter, sound: letter } as Phoneme}
                        index={index}
                        isUsed={userPhonemes.includes(letter)}
                        isDragMode={isDragMode}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )} */}

            {/* Phonemes Helper for Writing Mode */}
            {!isDragMode && showPhonemes && (
              <div className="col-span-3 flex flex-col justify-center">
                <div className="text-center">
                  <h4 className="text-lg font-bold text-purple-800 mb-3">Sound Helper:</h4>
                  <div className="grid grid-cols-1 gap-1">
                    {word.phonemes.map((phoneme, index) => (
                      <div
                        key={index}
                        className="p-2 rounded-lg border-2 bg-purple-100 border-purple-300 text-purple-900 text-center transition-all duration-300 hover:scale-105"
                      >
                        <div className="text-xs opacity-70">{phoneme.sound}</div>
                        <div className="font-bold text-sm">{phoneme.letters}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DndProvider>
  );
};