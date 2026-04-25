/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Coins, 
  HelpCircle, 
  ArrowRight, 
  RefreshCcw, 
  Volume2, 
  CheckCircle2, 
  XCircle,
  Play,
  Settings,
  Info,
  Heart,
  PawPrint
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { animals } from './data/animals';

export default function App() {
  const [screen, setScreen] = useState<'menu' | 'playing'>('menu');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string[]>([]);
  const [shuffledLetters, setShuffledLetters] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'correct' | 'wrong'>('playing');
  const [showHint, setShowHint] = useState(false);
  const [level, setLevel] = useState(1);
  const [imgKey, setImgKey] = useState(0);

  const currentAnimal = animals[currentIndex];

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.pitch = 1.1;
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const playAnimalSound = () => {
    if (!currentAnimal) return;
    speak(`Ini adalah ${currentAnimal.name}. ${currentAnimal.clue}`);
  };

  const initLevel = useCallback(() => {
    if (!currentAnimal) return;
    const name = currentAnimal.name.toUpperCase();
    const letters = name.split('');
    
    // Decoy letters
    const pool = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const decoyCount = Math.max(2, 10 - letters.length);
    const decoys = Array.from({ length: decoyCount }, () => pool[Math.floor(Math.random() * pool.length)]);
    
    setShuffledLetters([...letters, ...decoys].sort(() => 0.5 - Math.random()));
    setUserAnswer(new Array(letters.length).fill(''));
    setGameState('playing');
    setShowHint(false);
  }, [currentAnimal]);

  useEffect(() => {
    if (screen === 'playing') {
      initLevel();
    }
  }, [initLevel, screen]);

  const handleLetterClick = (letter: string) => {
    if (gameState !== 'playing') return;

    const emptyIndex = userAnswer.indexOf('');
    if (emptyIndex !== -1) {
      const newAnswer = [...userAnswer];
      newAnswer[emptyIndex] = letter;
      setUserAnswer(newAnswer);

      if (newAnswer.join('') === currentAnimal.name.toUpperCase()) {
        setGameState('correct');
        setScore(s => s + 50);
        playAnimalSound();
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#FB923C', '#FDE047', '#4ADE80']
        });
      } else if (!newAnswer.includes('') && newAnswer.join('') !== currentAnimal.name.toUpperCase()) {
        setGameState('wrong');
      }
    }
  };

  const removeLetter = (index: number) => {
    if (gameState !== 'playing') return;
    const newAnswer = [...userAnswer];
    newAnswer[index] = '';
    setUserAnswer(newAnswer);
  };

  const nextLevel = () => {
    if (currentIndex < animals.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setLevel(prev => prev + 1);
      setImgKey(prev => prev + 1);
    } else {
      setCurrentIndex(0);
      setLevel(1);
      setScreen('menu');
    }
  };

  if (screen === 'menu') {
    return (
      <div className="min-h-screen bg-[#FFEDD5] flex flex-col items-center justify-center p-6 text-[#431407]">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-10 rounded-[50px] border-8 border-[#7C2D12] shadow-[20px_20px_0px_#C2410C] flex flex-col items-center max-w-sm w-full relative"
        >
          <div className="absolute -top-16 bg-[#FDBA74] p-4 rounded-3xl border-4 border-[#7C2D12] shadow-[8px_8px_0px_#7C2D12]">
            <span className="text-6xl">🦁</span>
          </div>
          
          <h1 className="font-black text-5xl text-center leading-[0.9] tracking-tighter mt-8 mb-4 uppercase">
            Tebak<br />Hewan!
          </h1>
          
          <p className="text-center font-black text-[#C2410C] mb-8 bg-[#FEF3C7] px-4 py-2 rounded-xl border-2 border-dashed border-[#C2410C]">
            400+ Hewan Lucu 🐾
          </p>

          <button
            onClick={() => setScreen('playing')}
            className="w-full bg-[#FB923C] text-white py-6 rounded-3xl border-4 border-[#7C2D12] shadow-[0_10px_0px_#7C2D12] font-black text-2xl flex items-center justify-center gap-4 active:translate-y-2 active:shadow-none transition-all"
          >
            <span>MAIN</span>
            <Play className="fill-current w-6 h-6 text-white" />
          </button>
        </motion.div>

        <div className="flex gap-4 mt-12">
          <button className="w-16 h-16 bg-[#38BDF8] border-4 border-[#0369A1] rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_#0369A1] text-white">
            <Settings className="w-8 h-8" />
          </button>
          <button className="w-16 h-16 bg-[#4ADE80] border-4 border-[#15803D] rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_#15803D] text-white">
            <Info className="w-8 h-8" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFEDD5] text-[#431407] font-sans flex flex-col p-4 md:p-8 select-none overflow-x-hidden">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 max-w-5xl mx-auto w-full">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setScreen('menu')}
            className="w-12 h-12 md:w-16 md:h-16 bg-[#FDBA74] border-4 border-[#C2410C] rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_#C2410C] hover:bg-[#FB923C]"
          >
            <span className="text-2xl md:text-4xl">🦁</span>
          </button>
          <div className="hidden sm:block">
            <h1 className="text-2xl font-black uppercase tracking-tighter text-[#7C2D12]">Tebak Hewan!</h1>
            <div className="flex items-center space-x-2">
              <div className="w-32 h-3 bg-white border-2 border-[#7C2D12] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(level / animals.length) * 100}%` }}
                  className="h-full bg-[#FB923C]"
                ></motion.div>
              </div>
              <span className="text-xs font-bold">{level} / {animals.length}</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <div className="bg-white border-4 border-[#7C2D12] rounded-full px-4 md:px-6 py-2 flex items-center space-x-2 shadow-[4px_4px_0px_#7C2D12]">
            <span className="text-xl">💎</span>
            <span className="text-lg font-black">{score}</span>
          </div>
          <button 
            onClick={() => setScreen('menu')}
            className="w-12 h-12 bg-[#F43F5E] border-4 border-[#881337] rounded-full flex items-center justify-center shadow-[4px_4px_0px_#881337] text-white"
          >
            <XCircle className="w-6 h-6 stroke-[3px]" />
          </button>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 flex flex-col items-center max-w-5xl mx-auto w-full">
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Controls Left (Desktop) */}
          <div className="hidden md:flex md:col-span-2 flex-col space-y-6">
            <button 
              onClick={() => setShowHint(!showHint)}
              className="w-full aspect-square bg-[#38BDF8] border-4 border-[#0369A1] rounded-3xl flex flex-col items-center justify-center shadow-[0_8px_0px_#0369A1] active:translate-y-2 active:shadow-none transition-all text-white"
            >
              <span className="text-4xl">💡</span>
              <span className="font-black mt-2">HINT</span>
            </button>
            <button 
              onClick={playAnimalSound}
              className="w-full aspect-square bg-[#4ADE80] border-4 border-[#15803D] rounded-3xl flex flex-col items-center justify-center shadow-[0_8px_0px_#15803D] active:translate-y-2 active:shadow-none transition-all text-white"
            >
              <Volume2 className="w-10 h-10 stroke-[3px]" />
              <span className="font-black mt-2 uppercase">SUARA</span>
            </button>
          </div>

          {/* Central Display */}
          <div className="md:col-span-8 flex flex-col items-center w-full">
            <motion.div 
              layoutId="animal-img"
              className="relative w-full max-w-[380px] aspect-square bg-white border-[10px] border-[#7C2D12] rounded-[60px] shadow-[15px_15px_0px_rgba(124,45,18,0.1)] flex items-center justify-center mb-12 overflow-hidden group"
            >
              {/* Using keyword-based search for clearer images */}
              <img 
                key={`${currentAnimal.id}-${imgKey}`}
                src={`https://loremflickr.com/400/400/${currentAnimal.slug},animal/all?lock=${currentAnimal.id}`}
                alt="Animal Guessing"
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                referrerPolicy="no-referrer"
                onLoad={(e) => {
                  (e.target as HTMLImageElement).style.opacity = '1';
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://via.placeholder.com/400/FFEDD5/7C2D12?text=${currentAnimal.name}`;
                }}
                style={{ opacity: 0, transition: 'opacity 0.5s ease-in-out' }}
              />
              
              <AnimatePresence>
                {gameState === 'correct' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 bg-[#4ADE80]/80 backdrop-blur-sm flex flex-col items-center justify-center z-20"
                  >
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 border-4 border-[#15803D]">
                      <CheckCircle2 className="w-12 h-12 text-[#15803D] stroke-[4px]" />
                    </div>
                    <p className="text-white text-3xl font-black uppercase tracking-tighter drop-shadow-lg">BAGUS!</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="absolute -bottom-6 bg-[#FDE047] border-4 border-[#7C2D12] px-6 py-2 rounded-2xl shadow-[4px_4px_0px_#7C2D12] font-black text-lg uppercase tracking-widest z-10">
                Hewan Apa Ini?
              </div>
            </motion.div>

            {/* Hint Box */}
            <AnimatePresence>
              {showHint && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-8 w-full max-w-md bg-white border-4 border-[#7C2D12] p-4 rounded-3xl shadow-[4px_4px_0px_#7C2D12] text-center"
                >
                  <p className="font-bold text-[#7C2D12] italic">" {currentAnimal.clue} "</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Answer Display */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8">
              {userAnswer.map((char, i) => (
                <motion.button
                  key={`ans-${i}`}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeLetter(i)}
                  className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl border-4 flex items-center justify-center text-2xl md:text-3xl font-black shadow-inner transition-all
                    ${char === '' 
                      ? 'bg-white border-dashed border-[#A8A29E]' 
                      : gameState === 'playing' ? 'bg-[#FB923C] border-[#7C2D12] text-white shadow-[0_4px_0px_#7C2D12]' : 
                        gameState === 'correct' ? 'bg-[#4ADE80] border-[#15803D] text-white shadow-[0_4px_0px_#15803D]' : 'bg-[#F43F5E] border-[#881337] text-white shadow-[0_4px_0px_#881337]'
                    }`}
                >
                  {char}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Right Controls (Desktop) */}
          <div className="hidden md:flex md:col-span-2 flex-col space-y-4">
            <div className="w-full bg-white border-4 border-[#7C2D12] rounded-3xl p-4 text-center shadow-[4px_4px_0px_#7C2D12]">
              <p className="text-xs font-bold uppercase opacity-50 mb-1">Kategori</p>
              <p className="font-black text-lg">UMUM</p>
            </div>
            <button 
              onClick={() => initLevel()}
              className="w-full aspect-square bg-[#FDE047] border-4 border-[#7C2D12] rounded-3xl flex flex-col items-center justify-center shadow-[0_8px_0px_#7C2D12] active:translate-y-2 active:shadow-none transition-all"
            >
              <RefreshCcw className="w-10 h-10 text-[#7C2D12] stroke-[4px]" />
              <span className="font-black text-[#7C2D12] mt-2 uppercase">RESET</span>
            </button>
          </div>
        </div>

        {/* Mobile Buttons */}
        <div className="md:hidden flex flex-wrap justify-center gap-3 mb-8">
          <button 
            onClick={() => setShowHint(!showHint)}
            className="px-4 py-2 bg-[#38BDF8] border-2 border-[#0369A1] rounded-xl text-white font-black text-sm shadow-[2px_2px_0px_#0369A1]"
          >
            HINT
          </button>
          <button 
            onClick={playAnimalSound}
            className="px-4 py-2 bg-[#4ADE80] border-2 border-[#15803D] rounded-xl text-white font-black text-sm shadow-[2px_2px_0px_#15803D]"
          >
            SUARA
          </button>
          <button 
            onClick={() => initLevel()}
            className="px-4 py-2 bg-[#FDE047] border-2 border-[#7C2D12] text-[#7C2D12] font-black text-sm shadow-[2px_2px_0px_#7C2D12]"
          >
            RESET
          </button>
        </div>

        {/* Keypad */}
        <div className="w-full flex justify-center mt-auto pb-6">
          {gameState === 'playing' ? (
            <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 md:gap-3 px-2">
              {shuffledLetters.map((char, index) => (
                <motion.button
                  key={`k-${index}-${char}`}
                  whileHover={{ backgroundColor: '#FDE047' }}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => handleLetterClick(char)}
                  className="w-10 h-10 md:w-14 md:h-14 bg-white border-4 border-[#7C2D12] rounded-xl font-black text-lg md:text-2xl shadow-[0_4px_0px_#7C2D12] flex items-center justify-center active:translate-y-1 active:shadow-none transition-all"
                >
                  {char}
                </motion.button>
              ))}
            </div>
          ) : (
            <motion.button 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              onClick={nextLevel}
              className={`w-full max-w-sm border-4 text-white py-5 rounded-3xl font-black text-2xl flex items-center justify-center gap-4 active:translate-y-2 active:shadow-none transition-all
                ${gameState === 'correct' ? 'bg-[#4ADE80] border-[#15803D] shadow-[0_10px_0px_#15803D]' : 'bg-[#F43F5E] border-[#881337] shadow-[0_10px_0px_#881337]'}`}
            >
              <span>{currentIndex < animals.length - 1 ? 'LANJUT!' : 'MENU UTAMA'}</span>
              <ArrowRight className="w-8 h-8 stroke-[4px]" />
            </motion.button>
          )}
        </div>
      </main>

      {/* Background Decor */}
      <div className="fixed -bottom-10 -right-10 opacity-5 pointer-events-none rotate-12">
        <PawPrint className="w-64 h-64 text-[#7C2D12]" />
      </div>
    </div>
  );
}
