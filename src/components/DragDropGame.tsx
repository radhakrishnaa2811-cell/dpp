import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Word, Phoneme } from '../data/words';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Volume2, RotateCcw, CheckCircle, Eye, EyeOff } from 'lucide-react';

interface PhonemeCardProps {
  phoneme: Phoneme;
  index: number;
  isCorrect?: boolean;
  isUsed?: boolean;
}

interface DropZoneProps {
  index: number;
  phoneme: Phoneme | null;
  onDrop: (phoneme: Phoneme, index: number) => void;
  isCorrect?: boolean;
}

interface GameProps {
  word: Word;
  imageUrl: string;
  onComplete: (success: boolean) => void;
}

const PhonemeCard: React.FC<PhonemeCardProps> = ({ phoneme, index, isCorrect, isUsed }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'phoneme',
    item: { phoneme, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: !isUsed,
  });

  const getPhonemeColor = (type: string) => {
    const colors = {
      consonant: 'bg-blue-100 border-blue-300 text-blue-800',
      vowel: 'bg-red-100 border-red-300 text-red-800',
      digraph: 'bg-purple-100 border-purple-300 text-purple-800',
      blend: 'bg-green-100 border-green-300 text-green-800',
      vowel_team: 'bg-pink-100 border-pink-300 text-pink-800',
      r_controlled: 'bg-orange-100 border-orange-300 text-orange-800',
      diphthong: 'bg-yellow-100 border-yellow-300 text-yellow-800',
      final_stable: 'bg-gray-100 border-gray-300 text-gray-800'
    };
    return colors[type as keyof typeof colors] || colors.consonant;
  };

  return (
    <div
      ref={(node) => {
        if (node) {
          drag(node);
        }
      }}
      className={`
        p-3 rounded-lg border-2 min-w-[60px] text-center
        transition-all duration-200 select-none
        ${!isUsed ? 'cursor-grab active:cursor-grabbing hover:scale-105' : 'cursor-not-allowed opacity-40'}
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        ${isCorrect ? 'bg-green-100 border-green-400 text-green-800' : getPhonemeColor(phoneme.type)}
        ${isUsed ? 'bg-gray-100 border-gray-300 text-gray-500' : ''}
      `}
      style={{ fontSize: '18px', fontWeight: 'bold' }}
    >
      <div className="text-xs opacity-70 mb-1">{phoneme.sound}</div>
      <div>{phoneme.letters}</div>
    </div>
  );
};

const DropZone: React.FC<DropZoneProps> = ({ index, phoneme, onDrop, isCorrect }) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'phoneme',
    drop: (item: { phoneme: Phoneme; index: number }) => {
      onDrop(item.phoneme, index);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div
          ref={(node) => {
        if (node) {
          drop(node);
        }
      }}
      className={`
        min-h-[80px] min-w-[80px] border-2 border-dashed rounded-lg
        flex items-center justify-center transition-all duration-200 relative
        ${isOver && canDrop ? 'border-blue-400 bg-blue-50 scale-105' : 'border-gray-300 bg-gray-50'}
        ${isCorrect ? 'border-green-400 bg-green-50' : ''}
        ${phoneme && !isCorrect ? 'border-red-400 bg-red-50' : ''}
      `}
    >
      {phoneme ? (
        <div className="text-center">
          <div className="text-xs opacity-70 mb-1">{phoneme.sound}</div>
          <div className="font-bold" style={{ fontSize: '18px' }}>
            {phoneme.letters}
          </div>
        </div>
      ) : (
        <div className="text-gray-400 text-sm">Drop here</div>
      )}
      {isCorrect && <CheckCircle className="absolute -top-2 -right-2 w-5 h-5 text-green-600 bg-white rounded-full" />}
    </div>
  );
};

export const DragDropGame: React.FC<GameProps> = ({ word, imageUrl, onComplete }) => {
  const [userPhonemes, setUserPhonemes] = useState<(Phoneme | null)[]>(
    new Array(word.phonemes.length).fill(null)
  );
  const [shuffledPhonemes, setShuffledPhonemes] = useState<Phoneme[]>([]);
  const [usedPhonemes, setUsedPhonemes] = useState<Set<number>>(new Set());
  const [isComplete, setIsComplete] = useState(false);
  const [correctPositions, setCorrectPositions] = useState<boolean[]>([]);
  const [showPhonemeHints, setShowPhonemeHints] = useState(false);

  useEffect(() => {
    // Shuffle phonemes for the game
    const shuffled = [...word.phonemes].sort(() => Math.random() - 0.5);
    setShuffledPhonemes(shuffled);
    setUserPhonemes(new Array(word.phonemes.length).fill(null));
    setUsedPhonemes(new Set());
    setIsComplete(false);
    setCorrectPositions(new Array(word.phonemes.length).fill(false));
    setShowPhonemeHints(false);
    
    // Auto-speak word when component loads
    setTimeout(() => speakWord(), 500);
  }, [word]);

  const handleDrop = (phoneme: Phoneme, index: number) => {
    const newUserPhonemes = [...userPhonemes];
    
    // If there's already a phoneme in this position, free it up
    if (newUserPhonemes[index]) {
      const oldPhonemeIndex = shuffledPhonemes.findIndex(p => 
        p.letters === newUserPhonemes[index]?.letters && 
        p.sound === newUserPhonemes[index]?.sound
      );
      if (oldPhonemeIndex !== -1) {
        setUsedPhonemes(prev => {
          const newSet = new Set(prev);
          newSet.delete(oldPhonemeIndex);
          return newSet;
        });
      }
    }
    
    newUserPhonemes[index] = phoneme;
    setUserPhonemes(newUserPhonemes);

    // Mark this phoneme as used
    const phonemeIndex = shuffledPhonemes.findIndex(p => 
      p.letters === phoneme.letters && p.sound === phoneme.sound
    );
    if (phonemeIndex !== -1) {
      setUsedPhonemes(prev => new Set(prev).add(phonemeIndex));
    }

    // Check correctness
    const newCorrectPositions = newUserPhonemes.map((userPhoneme, i) => {
      return userPhoneme?.letters === word.phonemes[i]?.letters;
    });
    setCorrectPositions(newCorrectPositions);

    // Check if complete and correct
    const allFilled = newUserPhonemes.every(p => p !== null);
    const allCorrect = newCorrectPositions.every(Boolean);
    
    if (allFilled && allCorrect) {
      setIsComplete(true);
      setTimeout(() => onComplete(true), 1000);
    }
  };

  const handleReset = () => {
    setUserPhonemes(new Array(word.phonemes.length).fill(null));
    setUsedPhonemes(new Set());
    setCorrectPositions(new Array(word.phonemes.length).fill(false));
    setIsComplete(false);
  };

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

  const speakPhonemes = () => {
    if ('speechSynthesis' in window) {
      word.phonemes.forEach((phoneme, index) => {
        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance(phoneme.sound.replace(/[\/]/g, ''));
          const voices = speechSynthesis.getVoices();
          const ukVoice = voices.find(voice => voice.lang.includes('en-GB')) || voices[0];
          if (ukVoice) utterance.voice = ukVoice;
          utterance.rate = 0.6;
          speechSynthesis.speak(utterance);
        }, index * 800);
      });
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="max-w-4xl mx-auto p-6">
        {/* Image and Audio Controls - No Word Display */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-6 mb-4">
            <div className="w-48 h-48">
              <ImageWithFallback
                src={imageUrl}
                alt="Word to spell"
                className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
              />
            </div>
            
            <div className="flex-1">
              <div className="text-center mb-4">
                <div className="text-lg text-gray-600 mb-4">
                  Listen to the word and build it with sounds:
                </div>
                
                <div className="flex justify-center gap-3 mb-4">
                  <Button onClick={speakWord} variant="outline" size="lg">
                    <Volume2 className="w-5 h-5 mr-2" />
                    Say Word
                  </Button>
                  <Button onClick={speakPhonemes} variant="outline" size="lg">
                    <Volume2 className="w-5 h-5 mr-2" />
                    Say Sounds
                  </Button>
                  <Button onClick={handleReset} variant="outline" size="lg">
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
              
              {/* Word Type Badge */}
              <div className="text-center">
                <span className={`
                  px-3 py-1 rounded-full text-sm
                  ${word.type === 'real' ? 'bg-green-100 text-green-800' : ''}
                  ${word.type === 'nonsense' ? 'bg-purple-100 text-purple-800' : ''}
                  ${word.type === 'sight' ? 'bg-blue-100 text-blue-800' : ''}
                `}>
                  {word.type === 'real' ? '📚 Real Word' : ''}
                  {word.type === 'nonsense' ? '🎭 Nonsense Word' : ''}
                  {word.type === 'sight' ? '👁️ Sight Word' : ''}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Drop Zones */}
        <Card className="p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 text-center">Build the word by dragging sounds:</h3>
          <div className="flex justify-center gap-2 flex-wrap">
            {userPhonemes.map((phoneme, index) => (
              <div key={index} className="relative">
                <DropZone
                  index={index}
                  phoneme={phoneme}
                  onDrop={handleDrop}
                  isCorrect={correctPositions[index]}
                />
              </div>
            ))}
          </div>
          
          {isComplete && (
            <div className="text-center mt-4">
              <div className="text-2xl font-bold text-green-600">🎉 Great job! 🎉</div>
              <p className="text-green-700">You spelled the word correctly!</p>
            </div>
          )}
        </Card>

        {/* Phoneme Cards */}
        <Card className="p-6">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h3 className="text-xl font-semibold">Drag these sounds:</h3>
            <Button 
              onClick={() => setShowPhonemeHints(!showPhonemeHints)} 
              variant="ghost" 
              size="sm"
            >
              {showPhonemeHints ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPhonemeHints ? 'Hide' : 'Show'} Types
            </Button>
          </div>
          
          <div className="flex justify-center gap-3 flex-wrap">
            {shuffledPhonemes.map((phoneme, index) => (
              <PhonemeCard
                key={`${phoneme.letters}-${index}`}
                phoneme={phoneme}
                index={index}
                isUsed={usedPhonemes.has(index)}
              />
            ))}
          </div>
          
          {/* Legend */}
          {showPhonemeHints && (
            <div className="mt-6 text-center">
              <div className="text-sm text-gray-600 mb-2">Sound Types:</div>
              <div className="flex justify-center gap-2 flex-wrap text-xs">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">Consonant</span>
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded">Vowel</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">Digraph</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Blend</span>
                <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded">Vowel Team</span>
                <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded">R-Controlled</span>
              </div>
            </div>
          )}
        </Card>
      </div>
    </DndProvider>
  );
};