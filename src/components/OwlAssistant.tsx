import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Volume2, VolumeX } from 'lucide-react';

interface OwlAssistantProps {
  gameState: 'intro' | 'playing' | 'correct' | 'incorrect' | 'complete';
  playerName?: string;
  word?: string;
  correctCount?: number;
  totalAttempts?: number;
}

export const OwlAssistant: React.FC<OwlAssistantProps> = ({ 
  gameState, 
  playerName = 'little learner',
  word,
  correctCount = 0,
  totalAttempts = 0
}) => {
  const [message, setMessage] = useState('');
  const [owlExpression, setOwlExpression] = useState('😊');
  const [isAutoSpeaking, setIsAutoSpeaking] = useState(true);

  const encouragementMessages = {
    intro: [
      `Hello ${playerName}! I'm Olly the Owl! 🦉 Ready to learn some spelling?`,
      `Welcome back ${playerName}! Let's practice some phonics together! 📚`,
      `Hi there! I'm excited to help you become a reading superstar! ⭐`
    ],
    playing: [
      `You're doing fantastic! Listen carefully to the sounds! 💪`,
      `Great effort! Take your time and think about each sound! 🎵`,
      `Wonderful work! Remember, each letter has its own special sound! 🔤`,
      `Keep going ${playerName}! You're learning so much! 🌟`
    ],
    correct: [
      `Outstanding! You spelled that perfectly! 🎉`,
      `Wow ${playerName}! You're becoming a phonics expert! 🌟`,
      `Amazing work! Your spelling skills are really growing! 📈`,
      `Super job! You matched all the sounds correctly! 🎯`,
      `Brilliant ${playerName}! You're a spelling champion! 🏆`
    ],
    incorrect: [
      `Good try! Let's listen to the sounds again and try once more! 🔄`,
      `Almost there! Take another look at the sounds. You can do it! 💪`,
      `Nice attempt! Remember to listen to each sound carefully! 👂`,
      `Keep trying! Every attempt helps us learn something new! 📚`
    ],
    complete: [
      `Wonderful session ${playerName}! You completed ${correctCount} out of ${totalAttempts} words! 🎊`,
      `Great job today! You're becoming such a strong reader! 📖`,
      `Excellent work! Your phonics skills are really improving! 📈`,
      `Way to go! You should be proud of your hard work! 🌈`
    ]
  };

  useEffect(() => {
    const messages = encouragementMessages[gameState];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setMessage(randomMessage);

    // Set owl expression based on game state
    const expressions = {
      intro: '😊',
      playing: '🤔',
      correct: '🎉',
      incorrect: '😊',
      complete: '⭐'
    };
    setOwlExpression(expressions[gameState]);

    // Auto-speak the message if enabled
    if (isAutoSpeaking) {
      setTimeout(() => speakMessage(randomMessage), 800);
    }
  }, [gameState, playerName, word, correctCount, totalAttempts, isAutoSpeaking]);

  const speakMessage = (messageToSpeak: string = message) => {
    if ('speechSynthesis' in window && messageToSpeak) {
      // Stop any current speech
      speechSynthesis.cancel();
      
      // Remove emojis and clean up text for speech
      const cleanMessage = messageToSpeak
        .replace(/[^\w\s.,!?]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (cleanMessage) {
        const utterance = new SpeechSynthesisUtterance(cleanMessage);
        
        const voices = speechSynthesis.getVoices();
        const ukVoice = voices.find(voice => voice.lang.includes('en-GB')) || voices[0];
        if (ukVoice) utterance.voice = ukVoice;
        
        utterance.rate = 0.9;
        utterance.pitch = 1.2; // Higher pitch for friendly owl voice
        utterance.volume = 0.8;
        speechSynthesis.speak(utterance);
      }
    }
  };

  const toggleAutoSpeak = () => {
    setIsAutoSpeaking(!isAutoSpeaking);
    if (!isAutoSpeaking) {
      // Stop current speech when disabling
      speechSynthesis.cancel();
    }
  };

  const getOwlAnimation = () => {
    const animations = {
      intro: 'animate-bounce',
      playing: 'animate-pulse',
      correct: 'animate-bounce',
      incorrect: 'animate-pulse',
      complete: 'animate-bounce'
    };
    return animations[gameState];
  };

  const getOwlSize = () => {
    // Make owl bigger during important moments
    if (gameState === 'correct' || gameState === 'complete') {
      return 'text-6xl';
    }
    return 'text-5xl';
  };

  return (
    <Card className="p-6 mb-6 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-300 shadow-lg">
      <div className="flex items-start gap-6">
        {/* Large Owl Avatar */}
        <div className={`${getOwlSize()} ${getOwlAnimation()} flex-shrink-0`}>
          🦉
        </div>
        
        {/* Message Content */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-xl font-bold text-blue-800">Olly says:</h3>
            <Button 
              onClick={() => speakMessage()} 
              variant="ghost" 
              size="sm"
              className="p-2 h-auto hover:bg-blue-100"
            >
              <Volume2 className="w-5 h-5 text-blue-600" />
            </Button>
            <Button 
              onClick={toggleAutoSpeak} 
              variant="ghost" 
              size="sm"
              className={`p-2 h-auto ${isAutoSpeaking ? 'bg-blue-100' : 'bg-gray-100'}`}
              title={isAutoSpeaking ? "Turn off auto-speech" : "Turn on auto-speech"}
            >
              {isAutoSpeaking ? 
                <Volume2 className="w-4 h-4 text-blue-600" /> : 
                <VolumeX className="w-4 h-4 text-gray-600" />
              }
            </Button>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">{message}</p>
          
          {/* Progress indicator for complete state */}
          {gameState === 'complete' && totalAttempts > 0 && (
            <div className="flex items-center gap-3 bg-white rounded-lg p-3">
              <div className="flex-1">
                <div className="text-sm text-gray-600 mb-1">Session Progress</div>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(correctCount / totalAttempts) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{correctCount}</div>
                <div className="text-xs text-gray-600">out of {totalAttempts}</div>
              </div>
            </div>
          )}

          {/* Learning tip for playing state */}
          {gameState === 'playing' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
              <div className="flex items-center gap-2 mb-1">
                <span>💡</span>
                <span className="font-semibold text-yellow-800">Olly's Learning Tip:</span>
              </div>
              <p className="text-yellow-800 text-sm">
                Listen to the word first, then think about each sound you hear. Take your time!
              </p>
            </div>
          )}
        </div>
        
        {/* Expression and Status */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <div className="text-3xl">{owlExpression}</div>
          {gameState === 'correct' && (
            <div className="text-xs text-green-600 font-semibold bg-green-100 px-2 py-1 rounded-full">
              Correct!
            </div>
          )}
          {gameState === 'incorrect' && (
            <div className="text-xs text-orange-600 font-semibold bg-orange-100 px-2 py-1 rounded-full">
              Try again!
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// Additional tips component for specific phoneme types
export const OwlTips: React.FC<{ phonemeType: string }> = ({ phonemeType }) => {
  const tips = {
    vowel: "Vowels are the singing sounds: A, E, I, O, U! 🎵",
    consonant: "Consonants are the other letters that work with vowels! 🔤",
    digraph: "Two letters that make one sound, like 'ch' and 'sh'! 👥",
    blend: "Two or more consonants that blend together, like 'st' and 'bl'! 🌪️",
    vowel_team: "Two vowels working together to make one sound! 👫",
    r_controlled: "When 'r' changes how vowels sound, like in 'car'! 🚗",
    diphthong: "A vowel sound that glides from one to another! 🛝",
    final_stable: "Special endings like '-le' that always sound the same! 🎯"
  };

  const tip = tips[phonemeType as keyof typeof tips] || "Every sound is special and important! 🌟";

  return (
    <Card className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200">
      <div className="flex items-start gap-3">
        <div className="text-2xl">🦉</div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span>💡</span>
            <span className="font-semibold text-yellow-800">Olly's Phonics Tip:</span>
          </div>
          <p className="text-yellow-800">{tip}</p>
        </div>
      </div>
    </Card>
  );
};