import React, { useState, useEffect } from 'react';
import { Word } from '../data/words';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Volume2, RotateCcw, CheckCircle, Eye, EyeOff } from 'lucide-react';

interface WritingGameProps {
  word: Word;
  imageUrl: string;
  onComplete: (success: boolean) => void;
}

export const WritingGame: React.FC<WritingGameProps> = ({ word, imageUrl, onComplete }) => {
  const [userInput, setUserInput] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showPhonemes, setShowPhonemes] = useState(false);

  useEffect(() => {
    setUserInput('');
    setIsComplete(false);
    setShowHint(false);
    setAttempts(0);
    setShowPhonemes(false);
    
    // Auto-speak word when component loads
    setTimeout(() => speakWord(), 500);
  }, [word]);

  const handleSubmit = () => {
    const cleanInput = userInput.trim().toLowerCase();
    const correctWord = word.word.toLowerCase();
    const isCorrect = cleanInput === correctWord;
    
    setAttempts(prev => prev + 1);
    
    if (isCorrect) {
      setIsComplete(true);
      setTimeout(() => onComplete(true), 1000);
    } else {
      // Give hints after attempts
      if (attempts >= 1) {
        setShowHint(true);
      }
      if (attempts >= 2) {
        setShowPhonemes(true);
      }
      
      // Auto-correct after 3 attempts
      if (attempts >= 2) {
        setUserInput(word.word);
        setIsComplete(true);
        setTimeout(() => onComplete(false), 2000);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && userInput.trim()) {
      handleSubmit();
    }
  };

  const handleReset = () => {
    setUserInput('');
    setIsComplete(false);
    setShowHint(false);
    setAttempts(0);
    setShowPhonemes(false);
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
    <div className="max-w-4xl mx-auto p-6">
      {/* Image and Audio Controls */}
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
                Listen to the word and write it below:
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

      {/* Writing Input */}
      <Card className="p-6 mb-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-6">Write the word you hear:</h3>
          
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type the word here..."
                className="text-center text-2xl p-4 h-16 border-2"
                disabled={isComplete}
                autoFocus
              />
              {isComplete && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-green-600" />
              )}
            </div>
            
            <Button 
              onClick={handleSubmit}
              disabled={!userInput.trim() || isComplete}
              className="mt-4 w-full"
              size="lg"
            >
              Check Answer
            </Button>
          </div>
          
          {isComplete && (
            <div className="mt-6">
              <div className="text-2xl font-bold text-green-600 mb-2">🎉 Well done! 🎉</div>
              <p className="text-green-700">
                {attempts <= 1 ? 'Perfect spelling!' : 'Good effort! Keep practicing!'}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Hints Section */}
      {(showHint || showPhonemes) && (
        <Card className="p-6">
          <div className="text-center">
            <h4 className="text-lg font-semibold mb-4">Need some help? 🤔</h4>
            
            {showHint && (
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">
                  💡 The word has {word.word.length} letters
                </div>
                <div className="flex justify-center gap-1">
                  {word.word.split('').map((_, index) => (
                    <div key={index} className="w-8 h-8 border-2 border-gray-300 rounded"></div>
                  ))}
                </div>
              </div>
            )}
            
            {showPhonemes && (
              <div>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Button 
                    onClick={() => setShowPhonemes(!showPhonemes)} 
                    variant="ghost" 
                    size="sm"
                  >
                    {showPhonemes ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showPhonemes ? 'Hide' : 'Show'} Sounds
                  </Button>
                </div>
                
                <div className="flex justify-center gap-2 flex-wrap">
                  {word.phonemes.map((phoneme, index) => (
                    <div
                      key={index}
                      className={`
                        p-2 rounded-lg border text-center min-w-[50px]
                        ${getPhonemeColor(phoneme.type)}
                      `}
                    >
                      <div className="text-xs opacity-70">{phoneme.sound}</div>
                      <div className="font-semibold">{phoneme.letters}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};