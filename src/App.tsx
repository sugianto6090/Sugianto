import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Lightbulb, 
  Eraser, 
  RotateCcw, 
  HelpCircle,
  Play,
  CheckCircle2,
  AlertCircle,
  Home
} from 'lucide-react';
import { animals, Animal } from './data/animals';

// Constants for game logic
const SCORE_CORRECT = 50;
const COST_HINT_LETTER = 10;
const COST_HINT_REMOVE = 20;
const LETTER_BANK_SIZE = 12;

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentAnimal, setCurrentAnimal] = useState<Animal | null>(null);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [letterBank, setLetterBank] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState<'correct' | 'wrong' | null>(null);
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
  const [removedIndices, setRemovedIndices] = useState<number[]>([]);

  // Initialize a new round
  const startNewRound = useCallback(() => {
    const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
    setCurrentAnimal(randomAnimal);
    setGuessedLetters(new Array(randomAnimal.name.replace(/\s/g, '').length).fill(''));
    setRevealedIndices([]);
    setRemovedIndices([]);
    setShowResult(null);

    // Create letter bank (correct letters + random distractor letters)
    const nameUpper = randomAnimal.name.toUpperCase().replace(/\s/g, '');
    const chars = [...new Set(nameUpper.split(''))];
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    // Fill up to LETTER_BANK_SIZE with distractors
    while (chars.length < LETTER_BANK_SIZE) {
      const randomChar = alphabet[Math.floor(Math.random() * alphabet.length)];
      if (!chars.includes(randomChar)) {
        chars.push(randomChar);
      }
    }

    // Shuffle letter bank
    setLetterBank(chars.sort(() => Math.random() - 0.5));
  }, []);

  const startGame = () => {
    setScore(100); // Start with some points for hints
    setGameStarted(true);
    startNewRound();
  };

  const resetGame = () => {
    setGameStarted(false);
    setScore(0);
  };

  // Handle letter click
  const handleLetterSelect = (letter: string, bankIndex: number) => {
    if (showResult || removedIndices.includes(bankIndex)) return;

    const nextEmptyIndex = guessedLetters.findIndex((char, idx) => char === '' && !revealedIndices.includes(idx));
    if (nextEmptyIndex === -1) return;

    const newGuessed = [...guessedLetters];
    newGuessed[nextEmptyIndex] = letter;
    setGuessedLetters(newGuessed);

    // Check if full
    const isFull = newGuessed.every(char => char !== '');
    if (isFull) {
      const finalGuess = newGuessed.join('');
      const actualName = currentAnimal?.name.toUpperCase().replace(/\s/g, '');
      
      if (finalGuess === actualName) {
        setShowResult('correct');
        setScore(prev => prev + SCORE_CORRECT);
        setTimeout(() => {
          startNewRound();
        }, 2000);
      } else {
        setShowResult('wrong');
        setTimeout(() => {
          // Clear non-revealed guesses
          setGuessedLetters(prev => prev.map((char, idx) => revealedIndices.includes(idx) ? char : ''));
          setShowResult(null);
        }, 1500);
      }
    }
  };

  // Hint 1: Show one letter
  const useHintShowLetter = () => {
    if (!currentAnimal || score < COST_HINT_LETTER || showResult) return;

    const actualName = currentAnimal.name.toUpperCase().replace(/\s/g, '');
    const hiddenIndices = [];
    for (let i = 0; i < actualName.length; i++) {
      if (!revealedIndices.includes(i)) {
        hiddenIndices.push(i);
      }
    }

    if (hiddenIndices.length === 0) return;

    const randomIndex = hiddenIndices[Math.floor(Math.random() * hiddenIndices.length)];
    const correctLetter = actualName[randomIndex];

    setRevealedIndices(prev => [...prev, randomIndex]);
    setGuessedLetters(prev => {
      const next = [...prev];
      next[randomIndex] = correctLetter;
      return next;
    });
    setScore(prev => prev - COST_HINT_LETTER);
  };

  // Hint 2: Remove wrong letters
  const useHintRemoveLetters = () => {
    if (!currentAnimal || score < COST_HINT_REMOVE || showResult) return;

    const actualName = currentAnimal.name.toUpperCase().replace(/\s/g, '');
    const wrongIndices: number[] = [];

    letterBank.forEach((char, idx) => {
      if (!actualName.includes(char) && !removedIndices.includes(idx)) {
        wrongIndices.push(idx);
      }
    });

    if (wrongIndices.length === 0) return;

    // Remove half of the wrong ones or at least 1
    const toRemoveCount = Math.max(1, Math.floor(wrongIndices.length / 2));
    const randomWrong = wrongIndices.sort(() => Math.random() - 0.5).slice(0, toRemoveCount);

    setRemovedIndices(prev => [...prev, ...randomWrong]);
    setScore(prev => prev - COST_HINT_REMOVE);
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-[#FFF7ED] flex flex-col items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-10 rounded-[40px] shadow-2xl border-8 border-orange-100 flex flex-col items-center max-w-sm w-full text-center"
        >
          <div className="mb-6 bg-orange-100 p-6 rounded-full">
            <Trophy className="w-20 h-20 text-orange-500" />
          </div>
          <h1 className="text-4xl font-black text-orange-600 mb-2 uppercase tracking-tighter leading-none">Tebak Hewan<br/>Anak Cerdas</h1>
          <p className="text-gray-500 font-medium mb-8">Uji pengetahuanmu tentang dunia hewan yang seru!</p>
          
          <button 
            onClick={startGame}
            className="w-full bg-orange-500 text-white text-2xl font-black py-5 rounded-3xl shadow-[0_10px_0px_#C2410C] active:translate-y-2 active:shadow-none transition-all flex items-center justify-center gap-3"
          >
            <Play className="fill-current w-8 h-8" />
            MULAI MAIN
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF7ED] flex flex-col items-center p-4 md:p-8 select-none font-sans text-[#1E293B]">
      {/* Header Stats */}
      <div className="w-full max-w-lg mb-6 flex justify-between items-center bg-white p-4 rounded-3xl shadow-lg border-4 border-orange-100">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-100 p-2 rounded-full shadow-inner">
            <Trophy className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase leading-none">Skor Kamu</span>
            <span className="text-xl font-black text-orange-600">{score}</span>
          </div>
        </div>
        <button 
          onClick={resetGame}
          className="p-3 bg-gray-100 rounded-2xl text-gray-400 hover:text-red-500 transition-colors"
        >
          <Home className="w-6 h-6" />
        </button>
      </div>

      <div className="w-full max-w-lg flex-1 flex flex-col items-center">
        {/* Animal Illustration Container */}
        <div className="w-full bg-white p-4 rounded-[40px] shadow-xl border-8 border-orange-100 mb-6 flex flex-col items-center relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentAnimal?.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="flex flex-col items-center w-full"
            >
              <div className="w-full aspect-square max-w-[280px] bg-orange-50 rounded-[32px] flex items-center justify-center mb-4 overflow-hidden shadow-inner border-2 border-orange-100">
                {currentAnimal && (
                  <img 
                    src={`https://loremflickr.com/400/400/${currentAnimal.slug}?lock=${currentAnimal.id}`}
                    alt={currentAnimal.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
              
              <div className="bg-blue-50 p-4 rounded-2xl border-2 border-blue-100 w-full shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <HelpCircle className="w-4 h-4 text-blue-500" />
                  <span className="text-[10px] font-black text-blue-400 uppercase">Petunjuk Hewan</span>
                </div>
                <p className="text-sm font-bold text-blue-800 leading-tight">
                  "{currentAnimal?.clue}"
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Feedback Overlay */}
          <AnimatePresence>
            {showResult && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className={`absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm z-10 ${
                  showResult === 'correct' ? 'bg-green-500/30' : 'bg-red-500/30'
                }`}
              >
                <div className={`p-8 rounded-full shadow-2xl ${
                  showResult === 'correct' ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {showResult === 'correct' ? (
                    <CheckCircle2 className="w-20 h-20 text-white" />
                  ) : (
                    <AlertCircle className="w-20 h-20 text-white" />
                  )}
                </div>
                <h2 className="text-5xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] mt-4 uppercase italic">
                  {showResult === 'correct' ? 'YEYY!' : 'UPS!'}
                </h2>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Guess Slots */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {guessedLetters.map((char, idx) => (
            <motion.div 
              key={idx}
              animate={revealedIndices.includes(idx) ? { scale: [1, 1.1, 1] } : {}}
              className={`w-10 h-12 md:w-12 md:h-14 flex items-center justify-center text-2xl font-black rounded-xl shadow-md border-b-4 transition-all duration-300 ${
                revealedIndices.includes(idx) 
                  ? 'bg-yellow-400 text-white border-yellow-600' 
                  : char !== '' 
                    ? 'bg-white text-orange-600 border-orange-300' 
                    : 'bg-orange-100/50 text-transparent border-orange-100'
              }`}
            >
              {char}
            </motion.div>
          ))}
        </div>

        {/* Letter Bank */}
        <div className="w-full grid grid-cols-4 md:grid-cols-6 gap-2 mb-8 bg-white/50 p-4 rounded-3xl border-2 border-orange-50 shadow-inner">
          {letterBank.map((letter, idx) => {
            const isRemoved = removedIndices.includes(idx);
            return (
              <button
                key={idx}
                disabled={isRemoved || !!showResult}
                onClick={() => handleLetterSelect(letter, idx)}
                className={`h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-lg active:scale-95 transition-all ${
                  isRemoved 
                    ? 'bg-gray-100 text-gray-300 shadow-none scale-90 cursor-not-allowed' 
                    : 'bg-white text-gray-700 hover:bg-orange-50 active:bg-orange-100 border-b-4 border-gray-100'
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>

        {/* Hint Options */}
        <div className="w-full grid grid-cols-2 gap-4">
          <button 
            onClick={useHintShowLetter}
            disabled={score < COST_HINT_LETTER || !!showResult}
            className={`flex flex-col items-center justify-center py-4 rounded-[32px] border-4 transition-all shadow-xl active:translate-y-1 active:shadow-none ${
              score >= COST_HINT_LETTER 
                ? 'bg-blue-500 border-blue-600 text-white' 
                : 'bg-gray-200 border-gray-300 text-gray-400'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb className="w-5 h-5 fill-current" />
              <span className="font-black text-sm uppercase">Satu Huruf</span>
            </div>
            <span className="text-xs font-bold bg-blue-700/30 px-3 py-1 rounded-full">-{COST_HINT_LETTER} Poin</span>
          </button>

          <button 
            onClick={useHintRemoveLetters}
            disabled={score < COST_HINT_REMOVE || !!showResult}
            className={`flex flex-col items-center justify-center py-4 rounded-[32px] border-4 transition-all shadow-xl active:translate-y-1 active:shadow-none ${
              score >= COST_HINT_REMOVE 
                ? 'bg-purple-500 border-purple-600 text-white' 
                : 'bg-gray-200 border-gray-300 text-gray-400'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Eraser className="w-5 h-5" />
              <span className="font-black text-sm uppercase">Hapus Salah</span>
            </div>
            <span className="text-xs font-bold bg-purple-700/30 px-3 py-1 rounded-full">-{COST_HINT_REMOVE} Poin</span>
          </button>
        </div>

        <button 
          onClick={startNewRound}
          className="mt-8 flex items-center gap-2 text-orange-500/60 font-bold hover:text-orange-500 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          <span className="text-sm">Ganti Hewan Lain</span>
        </button>
      </div>
    </div>
  );
}
