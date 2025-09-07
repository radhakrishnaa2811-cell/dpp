import React, { useEffect, useMemo, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Word, Phoneme } from '../data/words';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Volume2, RotateCcw, ArrowLeft, Eye, EyeOff } from 'lucide-react';

type ResultRow = { word: string; user_input: string; type: string };

interface UnifiedGameInterfaceProps {
  /** Pass the full list of words; component will manage its own index */
  words: Word[];
  /** Function to get the image for a word (called on each word change) */
 
  /** Called once at the end with { words: ResultRow[] } */
  onComplete: (results: { words: ResultRow[] }) => void;
  onBackToDashboard: () => void;
  /** true = drag/drop mode; false = typing mode */
  isDragMode: boolean;
  playerName: string;
  gradeName: string;
}

interface DropZoneProps {
  index: number;
  letter: string | null;
  onDrop: (letter: string, index: number, fromPoolIdx: number) => void;
}

interface DraggableLetterProps {
  letter: string;
  poolIdx: number;
}

/** --- Draggable letter tile (drag mode) --- */
const DraggableLetter: React.FC<DraggableLetterProps> = ({ letter, poolIdx }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'letter',
    item: { letter, poolIdx },
    canDrag: true,
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      className={`w-12 h-12 border-2 border-purple-300 rounded-lg flex items-center justify-center bg-purple-50 text-xl font-bold cursor-pointer hover:bg-purple-200 transition-all duration-200 ${
        isDragging ? 'opacity-50' : ''
      }`}
      title={letter}
    >
      {letter.toUpperCase()}
    </div>
  );
};

/** --- Drop slot for each phoneme position (drag mode) --- */
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
      className={`w-16 h-16 border-4 rounded-xl flex items-center justify-center bg-white text-2xl font-bold mx-1 ${
        letter ? 'border-blue-400' : 'border-gray-300'
      } ${isOver && canDrop ? 'bg-blue-100' : ''}`}
    >
      {letter?letter.toUpperCase() :<span className="text-gray-400">?</span>}
    </div>
  );
};

export const UnifiedGameInterface: React.FC<UnifiedGameInterfaceProps> = ({
  words,
  onComplete,
  onBackToDashboard,
  isDragMode,
  playerName,
  gradeName,
}) => {
  // ----- progression state (internal index) -----
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentWord = words[currentIndex];
  const totalWords = words.length;
  const phoneme = words[currentIndex].word.split('').map(letter => ({
            sound: letter,
            letters: letter,
            type: /[aeiou]/i.test(letter) ? 'vowel' as const : 'consonant' as const
          } as Phoneme));

  // ----- results -----
  const [results, setResults] = useState<ResultRow[]>([]);

  // ----- typing mode -----
  const [userInput, setUserInput] = useState('');

  // ----- drag mode -----
  const [userPhonemes, setUserPhonemes] = useState<(string | null)[]>(
    new Array(phoneme?.length || 0).fill(null)
  );
  const [letterPool, setLetterPool] = useState<string[]>([]);

  // ----- misc UI state -----
  const [isComplete, setIsComplete] = useState(false);
  const [showPhonemes, setShowPhonemes] = useState(false);
  const [owlMessage, setOwlMessage] = useState('');
  const [isAutoSpeaking, setIsAutoSpeaking] = useState(true);

  const progressPercentage = useMemo(() => ((currentIndex + 1) / totalWords) * 100, [currentIndex, totalWords]);
  const imageUrl = useMemo(() => (currentWord.word), [currentWord.word]);

  // ----- speaking helpers -----
  const speakText = (text: string, opts?: Partial<SpeechSynthesisUtterance>) => {
    if (!('speechSynthesis' in window)) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = speechSynthesis.getVoices();
    
    // Try to find the most natural female voice available
    const naturalVoice = voices.find(voice => 
      voice.lang.includes('en-US') && 
      (voice.name.includes('Samantha') || // MacOS natural voice
       voice.name.includes('Microsoft Zira') || // Windows natural voice
       voice.name.includes('Google US English Female')) // Chrome voice
    ) || voices.find(voice => 
      voice.lang.includes('en-US') && voice.name.includes('Female')
    ) || voices.find(voice => voice.lang.includes('en-US')) || voices[0];

    if (naturalVoice) {
      utterance.voice = naturalVoice;
      utterance.rate = opts?.rate ?? 0.95; // Slightly slower for clarity
      utterance.pitch = opts?.pitch ?? 1.05; // Slightly higher pitch for female voice
      utterance.volume = 1; // Maximum volume
      window.speechSynthesis.speak(utterance);
    }
  };

  const speakWord = () => {
    speechSynthesis.cancel();
    speakText(currentWord.word, { rate: 0.85, pitch: 1.0 });
  };
  const speakSentence = () => {
    speechSynthesis.cancel();
    speakText(currentWord.sentence, { rate: 0.85, pitch: 1.0 });
  };

  const speakPrompt = (msg: string) => {
    speechSynthesis.cancel();
    speakText(msg, { rate: 0.95, pitch: 1.1 });
  };

  // ----- on word change: reset inputs, build pool, set message, auto-speak -----
  useEffect(() => {
    // reset per-word UI
    setIsComplete(false);
    setUserInput('');
    setShowPhonemes(false);

    // reset drag state sized to current word
    const slots = new Array(phoneme.length).fill(null);
    setUserPhonemes(slots);

    // build letter pool: include correct phoneme graphemes + random letters up to 18
    if (isDragMode) {
      const correctLetters = phoneme.map((p) => p.letters);
      const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
      let pool = [...correctLetters];
      while (pool.length < 18) {
        const rand = alphabet[Math.floor(Math.random() * alphabet.length)];
        if (!pool.includes(rand)) pool.push(rand);
      }
      pool = pool.sort(() => Math.random() - 0.5);
      setLetterPool(pool);
    } else {
      setLetterPool([]);
    }

    // owl message + auto speak
    const messages = [
      `Listen carefully! What word do you hear?`,
      ` Let's spell the  word!`,
      `You've got this!`,
    ];
    const msg = messages[Math.floor(Math.random() * messages.length)];
    setOwlMessage(msg);

    // auto speak: first the word, then a short prompt
    if (isAutoSpeaking) {
      // small delay so voices initialize on some browsers
      const t1 = setTimeout(() => speakText(currentWord.word, { rate: 0.85, pitch: 1.0 }), 400);
      const t2 = setTimeout(() => speakText(currentWord.sentence, { rate: 0.85, pitch: 1.0 }), 800);
      const t3 = setTimeout(() => speakText(msg, { rate: 0.95, pitch: 1.1 }));
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3)
        // stop any queued speech when switching words
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isDragMode, currentWord?.word]);

  // ----- drag handlers -----
  const handleDropToSlot = (letter: string, index: number) => {
    setUserPhonemes((prev) => {
      const next = [...prev];
      next[index] = letter;
      return next;
    });
  };

  const clearAllSlots = () => {
    setUserPhonemes(new Array(phoneme.length).fill(null));
  };

  // ----- collect & advance (typing) -----
  const handleNextTyping = () => {
    const clean = userInput.trim();
    if (!clean) return;

    const row: ResultRow = {
      word: currentWord.word,
      user_input: clean,
      type: (currentWord as any).type || 'regular',
    };
    const updated = [...results, row];
    setResults(updated);
    setIsComplete(true);
    window.speechSynthesis.cancel();

    if (currentIndex < totalWords - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      onComplete({ words: updated });
    }
  };

  // ----- collect & advance (drag) -----
  const handleNextDrag = () => {
    // join user selected graphemes in order
    const userWord = userPhonemes.map((x) => x || '').join('');
    if (!userWord) return;

    const row: ResultRow = {
      word: currentWord.word,
      user_input: userWord,
      type: (currentWord as any).type || 'regular',
    };
    const updated = [...results, row];
    setResults(updated);
    setIsComplete(true);
    window.speechSynthesis.cancel();

    if (currentIndex < totalWords - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      onComplete({ words: updated });
    }
  };
  const handleLeave = () => {
    onComplete({words: results})
  }

  // ----- reset just the current word input -----
  const handleReset = () => {
    if (isDragMode) {
      clearAllSlots();
    } else {
      setUserInput('');
    }
    setIsComplete(false);
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

          <div className="flex-1 mx-6">
            <div className="flex justify-center gap-1 mb-2">
              {Array.from({ length: totalWords }, (_, idx) => (
                <div
                  key={idx}
                  className={`
                    w-3 h-3 rounded-full border-2 transition-all duration-500
                    ${idx < currentIndex ? 'bg-green-400 border-green-500' : ''}
                    ${idx === currentIndex ? 'bg-blue-400 border-blue-500 animate-gentle-bounce scale-125' : ''}
                    ${idx > currentIndex ? 'bg-gray-200 border-gray-300' : ''}
                  `}
                />
              ))}
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <div className="text-right">
            <div className="text-sm font-bold text-purple-800">Name : {playerName}</div>
            <div className="text-xs text-gray-600">Grade Level : {gradeName}</div>
          </div>
        </div>

        {/* Main Game Card */}
        <Card className="flex-1 p-3 sm:p-4 md:p-6 bg-white/95 backdrop-blur shadow-2xl border-4 border-purple-300 rounded-3xl overflow-auto">
          <div className="h-full grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
            {/* Left Column - Owl Character */}
            <div className="md:col-span-3 flex flex-col justify-center items-center">
              <div className="text-center mb-4 w-full max-w-xs">
                <div className="text-4xl sm:text-5xl md:text-6xl character-animation mb-4 drop-shadow">🦉</div>
                <div className="text-base sm:text-lg font-bold text-purple-800 mb-2">Olly says:</div>
                <div className="bg-purple-100 rounded-2xl p-2 sm:p-3 border-3 border-purple-300">
                  <p className="text-xs sm:text-sm text-purple-900 font-medium leading-tight">{owlMessage}</p>
                </div>

                <div className="flex flex-wrap justify-center gap-2 mt-3">
                  <Button onClick={speakWord} size="sm" className="bg-blue-500 hover:bg-blue-600 btn-bouncy flex-1 min-w-[120px]" title="Play the word">
                    <Volume2 className="w-4 h-4 mr-1" />
                    Play Word
                  </Button>
                  <Button onClick={speakSentence} size="sm" className="bg-blue-500 hover:bg-blue-600 btn-bouncy flex-1 min-w-[120px]" title="Play the word">
                    <Volume2 className="w-4 h-4 mr-1" />
                    Play Sentence
                  </Button>
                  <Button onClick={handleReset} size="sm" variant="outline" className="btn-bouncy flex-1 min-w-[120px]" title="Reset input">
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                </div>
                
                <Button
                  onClick={handleLeave}
                  className="mt-3 w-full max-w-[200px] h-10 sm:h-12 bg-green-500 hover:bg-green-600 rounded-2xl btn-bouncy text-lg sm:text-xl"
                  size="lg"
                >
                  End Test
                </Button>
              </div>
            </div>

            {/* Center Column - Image + Input */}
            <div className="md:col-span-6 flex flex-col justify-center items-center">
              <div className="mb-4 sm:mb-6 w-full max-w-md px-4">
                <div className="aspect-square relative w-full max-w-[320px] mx-auto">
                  <ImageWithFallback
                    src={imageUrl}
                    alt={currentWord.word}
                    className="w-full h-full object-cover rounded-3xl border-4 border-yellow-400 shadow-2xl"
                  />
                  {/* Optional type badge */}
                  <div className="absolute -top-3 -right-3">
                    <span
                      className={`
                        px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg
                        ${((currentWord as any).type === 'real' && 'bg-green-400 text-green-900') || ''}
                        ${((currentWord as any).type === 'nonsense' && 'bg-purple-400 text-purple-900') || ''}
                        ${((currentWord as any).type === 'sight' && 'bg-blue-400 text-blue-900') || ''}
                      `}
                    >
                      {(currentWord as any).type === 'real' ? '📚' : ''}
                      {(currentWord as any).type === 'nonsense' ? '🎭' : ''}
                      {(currentWord as any).type === 'sight' ? '👁️' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mode UIs */}
              {isDragMode ? (
                <>
                  {/* Drop slots sized to phonemes */}
                  <div className="flex flex-wrap justify-center gap-2 mb-4 sm:mb-6 px-2">
                    {userPhonemes.map((letter, idx) => (
                      <DropZone key={idx} index={idx} letter={letter} onDrop={handleDropToSlot} />
                    ))}
                  </div>

                  {/* Letter pool */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-4 sm:mb-6 px-2 w-full max-w-2xl">
                    {letterPool.map((letter, idx) => (
                      <DraggableLetter key={`${letter}-${idx}`} letter={letter} poolIdx={idx} />
                    ))}
                  </div>

                  {/* Next */}
                  <Button
                    onClick={handleNextDrag}
                    disabled={userPhonemes.every((l) => !l) || isComplete}
                    className="mt-3 w-full max-w-[200px] h-10 sm:h-12 bg-green-500 hover:bg-green-600 rounded-2xl btn-bouncy text-lg sm:text-xl"
                    size="lg"
                  >
                    Next ➡️
                  </Button>
                </>
              ) : (
                <>
                  {/* Typing input */}
                  <div className="w-full max-w-md px-4">
                    <Input
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && userInput.trim() && handleNextTyping()}
                      placeholder="Type the word here..."
                      className="text-center text-lg sm:text-2xl p-3 sm:p-4 h-12 sm:h-16 border-4 border-purple-300 rounded-2xl"
                      disabled={isComplete}
                      autoFocus
                    />
                    <Button
                      onClick={handleNextTyping}
                      disabled={!userInput.trim() || isComplete}
                      className="mt-3 w-full h-10 sm:h-12 bg-purple-500 hover:bg-purple-600 rounded-2xl btn-bouncy text-lg sm:text-xl"
                      size="lg"
                    >
                      Next ➡️
                    </Button>
                  </div>
                </>
              )}
            </div>

            {/* Right Column - Phoneme Helper (for typing mode) */}
            {!isDragMode && showPhonemes && (
              <div className="md:col-span-3 flex flex-col justify-center">
                <div className="text-center w-full max-w-xs mx-auto">
                  <h4 className="text-base sm:text-lg font-bold text-purple-800 mb-2 sm:mb-3">Sound Helper:</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-1 gap-1 px-2">
                    {phoneme.map((phoneme: Phoneme, index: number) => (
                      <div
                        key={index}
                        className="p-1.5 sm:p-2 rounded-lg border-2 bg-purple-100 border-purple-300 text-purple-900 text-center transition-all duration-300 hover:scale-105"
                      >
                        <div className="text-xs opacity-70">{phoneme.sound}</div>
                        <div className="font-bold text-xs sm:text-sm">{phoneme.letters}</div>
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
