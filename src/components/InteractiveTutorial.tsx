import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Volume2, ArrowRight, ArrowLeft, CheckCircle, Play, RotateCcw } from 'lucide-react';

interface TutorialProps {
  onComplete: () => void;
  onSkip: () => void;
  userName: string;
}

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  owlExpression: string;
  owlMessage: string;
  demonstration?: 'drag-drop' | 'writing' | 'audio' | 'progress';
  tips: string[];
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: "Meet Olly, Your Learning Buddy!",
    description: "Hi there! I'm Olly the Owl, and I'm here to help you learn phonics and spelling in a fun way!",
    owlExpression: "👋",
    owlMessage: "Welcome! I'm so excited to be your learning buddy on this amazing adventure!",
    tips: [
      "Olly will guide you through every step",
      "Click the speaker button to hear words",
      "Don't worry about making mistakes - they help us learn!"
    ]
  },
  {
    id: 2,
    title: "How We Learn Together",
    description: "We'll look at pictures, listen to words, and build them using sounds called phonemes!",
    owlExpression: "🎵",
    owlMessage: "Every word is made of special sounds called phonemes. We'll learn to hear them and put them together!",
    demonstration: 'audio',
    tips: [
      "Listen carefully to each word",
      "Look at the picture for clues",
      "Take your time - learning is not a race!"
    ]
  },
  {
    id: 3,
    title: "For Little Learners (Kindergarten)",
    description: "Kindergarten friends will drag and drop colorful sound blocks to build words!",
    owlExpression: "🎯",
    owlMessage: "Drag the colorful sound blocks into the right order. It's like solving a fun puzzle!",
    demonstration: 'drag-drop',
    tips: [
      "Drag sound blocks to the empty spaces",
      "Each color represents a different type of sound",
      "Green = correct, try different combinations!"
    ]
  },
  {
    id: 4,
    title: "For Bigger Learners (1st & 2nd Grade)",
    description: "Older students will type the words they hear using the keyboard!",
    owlExpression: "✏️",
    owlMessage: "Listen to the word, then type what you hear. I'll give you hints if you need help!",
    demonstration: 'writing',
    tips: [
      "Type the word you hear in the text box",
      "Don't worry about capital letters",
      "Use the hint system if you get stuck"
    ]
  },
  {
    id: 5,
    title: "Track Your Amazing Progress",
    description: "Watch your progress as you complete words and celebrate your achievements!",
    owlExpression: "⭐",
    owlMessage: "I love watching you grow as a reader! Every word you complete makes you stronger!",
    demonstration: 'progress',
    tips: [
      "Colorful dots show your progress through each level",
      "Green dots mean completed words",
      "Blue dot shows where you are now"
    ]
  },
  {
    id: 6,
    title: "You're Ready to Start!",
    description: "Now you know everything you need! Are you ready to start your phonics adventure?",
    owlExpression: "🎉",
    owlMessage: "You're going to do amazing! Remember, I'm always here to help. Let's start learning together!",
    tips: [
      "Have fun and don't worry about mistakes",
      "Ask for help whenever you need it",
      "Celebrate every success, big or small!"
    ]
  }
];

export const InteractiveTutorial: React.FC<TutorialProps> = ({ onComplete, onSkip, userName }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAutoSpeaking, setIsAutoSpeaking] = useState(true);
  const [showDemo, setShowDemo] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  const step = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  useEffect(() => {
    if (isAutoSpeaking && voicesLoaded) {
      setTimeout(() => speakMessage(step.owlMessage), 1000);
    }
  }, [currentStep, isAutoSpeaking, step.owlMessage, voicesLoaded]);

  useEffect(() => {
    const loadVoices = () => {
      return new Promise<SpeechSynthesisVoice[]>((resolve) => {
        let voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
          resolve(voices);
        } else {
          speechSynthesis.onvoiceschanged = () => {
            voices = speechSynthesis.getVoices();
            resolve(voices);
          };
        }
      });
    };

    loadVoices().then((availableVoices) => {
      setVoices(availableVoices);
      setVoicesLoaded(true);
    });
  }, []);

  const speakMessage = async (message: string) => {
    if (!voicesLoaded || !('speechSynthesis' in window)) return;

    speechSynthesis.cancel();
    const cleanMessage = message.replace(/[^\w\s.,!?]/g, '').replace(/\s+/g, ' ').trim();
    if (cleanMessage) {
      const utterance = new SpeechSynthesisUtterance(cleanMessage);
      const ukVoice = voices.find(voice => 
        voice.lang.includes('en-GB') && voice.name.includes('Female')
      ) || voices.find(voice => voice.lang.includes('en-GB')) || voices[0];
      
      if (ukVoice) {
        utterance.voice = ukVoice;
        utterance.rate = 0.9;
        utterance.pitch = 1.2;
        speechSynthesis.speak(utterance);
      }
    }
  };

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setShowDemo(false);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setShowDemo(false);
    }
  };

  const renderDemonstration = () => {
    if (!step.demonstration || !showDemo) return null;

    switch (step.demonstration) {
      case 'drag-drop':
        return (
          <div className="bg-blue-50 p-6 rounded-2xl border-3 border-blue-300 mt-4">
            <h4 className="text-lg font-bold text-blue-800 mb-4 text-center">🎯 Drag & Drop Demo</h4>
            <div className="flex justify-center gap-4 mb-4">
              <div className="flex gap-2">
                {['c', 'a', 't'].map((letter, index) => (
                  <div key={index} className="w-12 h-12 border-2 border-dashed border-gray-400 rounded-xl flex items-center justify-center bg-gray-50">
                    <span className="text-xs text-gray-500">Drop</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center gap-2">
              {[
                { letter: 'c', color: 'bg-blue-200 border-blue-400' },
                { letter: 'a', color: 'bg-red-200 border-red-400' },
                { letter: 't', color: 'bg-blue-200 border-blue-400' }
              ].map((item, index) => (
                <div key={index} className={`p-2 rounded-lg border-2 ${item.color} text-center min-w-[40px] cursor-pointer animate-pulse`}>
                  <div className="font-bold">{item.letter}</div>
                </div>
              ))}
            </div>
            <p className="text-center text-blue-700 mt-3 text-sm">Drag the colored blocks to spell the word!</p>
          </div>
        );

      case 'writing':
        return (
          <div className="bg-green-50 p-6 rounded-2xl border-3 border-green-300 mt-4">
            <h4 className="text-lg font-bold text-green-800 mb-4 text-center">✏️ Writing Demo</h4>
            <div className="max-w-xs mx-auto">
              <div className="border-2 border-green-300 rounded-xl p-4 bg-white text-center">
                <div className="text-gray-400 mb-2">Type the word here...</div>
                <div className="text-2xl font-bold animate-pulse">cat</div>
              </div>
              <Button className="w-full mt-3 bg-green-500 hover:bg-green-600 rounded-xl">
                Check Answer ✨
              </Button>
            </div>
            <p className="text-center text-green-700 mt-3 text-sm">Listen and type what you hear!</p>
          </div>
        );

      case 'audio':
        return (
          <div className="bg-purple-50 p-6 rounded-2xl border-3 border-purple-300 mt-4">
            <h4 className="text-lg font-bold text-purple-800 mb-4 text-center">🎵 Audio Demo</h4>
            <div className="flex justify-center gap-4">
              <Button onClick={() => speakMessage('cat')} className="bg-purple-500 hover:bg-purple-600 rounded-xl">
                <Volume2 className="w-5 h-5 mr-2" />
                Say Word
              </Button>
              <Button onClick={() => speakMessage('c a t')} className="bg-purple-500 hover:bg-purple-600 rounded-xl">
                <Volume2 className="w-5 h-5 mr-2" />
                Say Sounds
              </Button>
            </div>
            <p className="text-center text-purple-700 mt-3 text-sm">Click to hear words and sounds!</p>
          </div>
        );

      case 'progress':
        return (
          <div className="bg-yellow-50 p-6 rounded-2xl border-3 border-yellow-300 mt-4">
            <h4 className="text-lg font-bold text-yellow-800 mb-4 text-center">⭐ Progress Demo</h4>
            <div className="mb-4">
              <div className="flex justify-center gap-1 mb-2">
                {Array.from({ length: 8 }, (_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                      index < 3 ? 'bg-green-400 border-green-500' : 
                      index === 3 ? 'bg-blue-400 border-blue-500 animate-pulse scale-125' : 
                      'bg-gray-200 border-gray-300'
                    }`}
                  />
                ))}
              </div>
              <Progress value={50} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-green-100 rounded-xl p-2 text-center">
                <div className="text-lg font-bold text-green-600">3</div>
                <div className="text-xs text-green-800">Correct</div>
              </div>
              <div className="bg-blue-100 rounded-xl p-2 text-center">
                <div className="text-lg font-bold text-blue-600">75%</div>
                <div className="text-xs text-blue-800">Score</div>
              </div>
            </div>
            <p className="text-center text-yellow-700 mt-3 text-sm">Watch your progress grow!</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-300 via-pink-300 to-blue-300 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
            🎓 How to Use Phonics Fun!
          </h1>
          <div className="flex items-center justify-center gap-4 mb-4">
            <Button onClick={onSkip} variant="outline" className="bg-white/80 hover:bg-white rounded-2xl">
              Skip Tutorial
            </Button>
            <div className="bg-white/80 rounded-2xl px-4 py-2">
              <span className="text-purple-800 font-semibold">
                Step {currentStep + 1} of {tutorialSteps.length}
              </span>
            </div>
          </div>
          <Progress value={progress} className="max-w-md mx-auto h-3" />
        </div>

        {/* Main Tutorial Card */}
        <Card className="p-8 bg-white/95 backdrop-blur border-4 border-white rounded-3xl shadow-2xl">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            
            {/* Left Column - Huge Olly Character */}
            <div className="text-center">
              <div className="relative">
                {/* Main Olly Character - HUGE! */}
                <div className="text-[12rem] leading-none animate-gentle-float filter drop-shadow-2xl">
                  🦉
                </div>
                
                {/* Expression overlay */}
                <div className="absolute -top-4 -right-4 text-6xl animate-gentle-bounce">
                  {step.owlExpression}
                </div>
                
                {/* Speech bubble */}
                <div className="relative mt-6">
                  <div className="bg-purple-100 rounded-3xl p-6 border-4 border-purple-300 relative">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-purple-100 border-l-4 border-t-4 border-purple-300 rotate-45"></div>
                    <p className="text-lg text-purple-900 font-medium leading-relaxed">
                      {step.owlMessage}
                    </p>
                    <Button 
                      onClick={() => speakMessage(step.owlMessage)}
                      variant="ghost" 
                      size="sm"
                      className="mt-3 hover:bg-purple-200 rounded-xl"
                    >
                      <Volume2 className="w-5 h-5 mr-2" />
                      Listen to Olly
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Tutorial Content */}
            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-purple-800 mb-4">
                  {step.title}
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  {step.description}
                </p>

                {/* Tips */}
                <div className="bg-blue-50 rounded-2xl p-4 border-3 border-blue-200 mb-6">
                  <h4 className="font-bold text-blue-800 mb-3 flex items-center">
                    💡 Learning Tips:
                  </h4>
                  <ul className="space-y-2">
                    {step.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-blue-700">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Demo Button */}
                {step.demonstration && (
                  <Button
                    onClick={() => setShowDemo(!showDemo)}
                    className="w-full mb-4 bg-yellow-500 hover:bg-yellow-600 rounded-2xl h-12"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    {showDemo ? 'Hide Demo' : 'Show Me How!'}
                  </Button>
                )}
              </div>

              {/* Demonstration Area */}
              {renderDemonstration()}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t-2 border-gray-200">
            <Button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              variant="outline"
              className="rounded-2xl h-12"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Previous
            </Button>

            <div className="text-center">
              <p className="text-purple-600 font-medium">
                Hi {userName}! 👋
              </p>
            </div>

            <Button
              onClick={handleNext}
              className="bg-purple-500 hover:bg-purple-600 rounded-2xl h-12"
            >
              {currentStep === tutorialSteps.length - 1 ? (
                <>
                  Start Learning! 🚀
                </>
              ) : (
                <>
                  Next <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};