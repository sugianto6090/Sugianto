import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Pause, 
  Play, 
  RotateCcw, 
  ArrowLeft, 
  ArrowRight, 
  ArrowDown, 
  RotateCw,
  Gamepad2,
  Trash2
} from 'lucide-react';
import { COLS, ROWS, TETROMINOS, randomTetromino, INITIAL_DROP_SPEED, MIN_DROP_SPEED, SPEED_INCREMENT, Tetromino } from './constants';

const createEmptyGrid = () => Array.from({ length: ROWS }, () => new Array(COLS).fill(0));

export default function App() {
  const [grid, setGrid] = useState<(string | number)[][]>(createEmptyGrid());
  const [activePiece, setActivePiece] = useState<{ pos: { x: number; y: number }; tetromino: Tetromino } | null>(null);
  const [nextPiece, setNextPiece] = useState<Tetromino>(randomTetromino());
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const calculateSpeed = (currLevel: number) => {
    return Math.max(MIN_DROP_SPEED, INITIAL_DROP_SPEED - (currLevel - 1) * SPEED_INCREMENT);
  };

  const checkCollision = (piece: { pos: { x: number; y: number }; tetromino: Tetromino }, moveX = 0, moveY = 0, rotatedShape?: (string | number)[][]) => {
    const shape = rotatedShape || piece.tetromino.shape;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] !== 0) {
          const newX = piece.pos.x + x + moveX;
          const newY = piece.pos.y + y + moveY;
          if (
            newX < 0 || 
            newX >= COLS || 
            newY >= ROWS ||
            (newY >= 0 && grid[newY][newX] !== 0)
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const spawnPiece = useCallback(() => {
    const freshPiece = nextPiece;
    const newNext = randomTetromino();
    setNextPiece(newNext);

    const pos = { x: Math.floor(COLS / 2) - 1, y: 0 };
    const newActive = { pos, tetromino: freshPiece };

    if (checkCollision(newActive)) {
      setGameOver(true);
      setPaused(true);
      return;
    }

    setActivePiece(newActive);
  }, [nextPiece, grid]);

  const drop = useCallback(() => {
    if (!activePiece || paused || gameOver) return;

    if (!checkCollision(activePiece, 0, 1)) {
      setActivePiece(prev => prev ? { ...prev, pos: { ...prev.pos, y: prev.pos.y + 1 } } : null);
    } else {
      // Lock piece
      const newGrid = [...grid.map(row => [...row])];
      activePiece.tetromino.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            const gridY = activePiece.pos.y + y;
            const gridX = activePiece.pos.x + x;
            if (gridY >= 0) newGrid[gridY][gridX] = activePiece.tetromino.id;
          }
        });
      });

      // Clear lines
      let linesCleared = 0;
      const filteredGrid = newGrid.filter(row => {
        if (row.every(cell => cell !== 0)) {
          linesCleared++;
          return false;
        }
        return true;
      });

      while (filteredGrid.length < ROWS) {
        filteredGrid.unshift(new Array(COLS).fill(0));
      }

      setGrid(filteredGrid);
      if (linesCleared > 0) {
        const linePoints = [0, 100, 300, 500, 800];
        setScore(prev => prev + linePoints[linesCleared] * level);
        setLines(prev => {
          const newTotal = prev + linesCleared;
          if (Math.floor(newTotal / 10) >= level) {
            if (level < 50) setLevel(l => l + 1);
          }
          return newTotal;
        });
      }
      spawnPiece();
    }
  }, [activePiece, grid, level, paused, gameOver, spawnPiece]);

  const move = (dir: number) => {
    if (!activePiece || paused || gameOver) return;
    if (!checkCollision(activePiece, dir, 0)) {
      setActivePiece(prev => prev ? { ...prev, pos: { ...prev.pos, x: prev.pos.x + dir } } : null);
    }
  };

  const rotate = () => {
    if (!activePiece || paused || gameOver) return;
    const shape = activePiece.tetromino.shape;
    const rotated = shape[0].map((_, index) => shape.map(col => col[index])).map(row => row.reverse());
    
    // Wall kick attempt
    if (!checkCollision(activePiece, 0, 0, rotated)) {
      setActivePiece(prev => prev ? { ...prev, tetromino: { ...prev.tetromino, shape: rotated } } : null);
    } else if (!checkCollision(activePiece, -1, 0, rotated)) {
      setActivePiece(prev => prev ? { pos: { ...prev.pos, x: prev.pos.x - 1 }, tetromino: { ...prev.tetromino, shape: rotated } } : null);
    } else if (!checkCollision(activePiece, 1, 0, rotated)) {
      setActivePiece(prev => prev ? { pos: { ...prev.pos, x: prev.pos.x + 1 }, tetromino: { ...prev.tetromino, shape: rotated } } : null);
    }
  };

  const hardDrop = () => {
    if (!activePiece || paused || gameOver) return;
    let yOffset = 0;
    while (!checkCollision(activePiece, 0, yOffset + 1)) {
      yOffset++;
    }
    setActivePiece(prev => prev ? { ...prev, pos: { ...prev.pos, y: prev.pos.y + yOffset } } : null);
  };

  const resetGame = () => {
    setGrid(createEmptyGrid());
    setScore(0);
    setLevel(1);
    setLines(0);
    setGameOver(false);
    setPaused(false);
    setGameStarted(true);
    setActivePiece(null);
    setNextPiece(randomTetromino());
  };

  useEffect(() => {
    if (gameStarted && !activePiece && !gameOver) {
      spawnPiece();
    }
  }, [gameStarted, activePiece, gameOver, spawnPiece]);

  useEffect(() => {
    if (paused || gameOver || !gameStarted) return;
    const interval = setInterval(() => {
      drop();
    }, calculateSpeed(level));
    return () => clearInterval(interval);
  }, [drop, level, paused, gameOver, gameStarted]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted || paused || gameOver) return;
      if (e.key === 'ArrowLeft') move(-1);
      if (e.key === 'ArrowRight') move(1);
      if (e.key === 'ArrowDown') drop();
      if (e.key === 'ArrowUp') rotate();
      if (e.key === ' ') hardDrop();
      if (e.key === 'p') setPaused(!paused);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePiece, paused, gameOver, gameStarted, drop]);

  const renderCell = (cellValue: string | number, x: number, y: number) => {
    let color = 'bg-white/50 border-white/20';
    let icon = null;

    if (cellValue !== 0) {
      const type = cellValue as string;
      color = TETROMINOS[type].color;
      icon = TETROMINOS[type].icon;
    }

    if (activePiece) {
      const { x: px, y: py } = activePiece.pos;
      const shape = activePiece.tetromino.shape;
      if (y >= py && y < py + shape.length && x >= px && x < px + shape[0].length) {
        const shapeVal = shape[y - py][x - px];
        if (shapeVal !== 0) {
          color = activePiece.tetromino.color;
          icon = activePiece.tetromino.icon;
        }
      }
    }

    return (
      <div 
        key={`${x}-${y}`} 
        className={`w-full aspect-square border ${color} rounded-sm flex items-center justify-center text-[10px] md:text-sm shadow-sm transition-colors duration-200`}
      >
        {icon}
      </div>
    );
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-[#FFF7ED] flex flex-col items-center justify-center p-6 text-[#1E293B] font-sans">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-10 rounded-[40px] shadow-2xl border-8 border-orange-100 flex flex-col items-center max-w-sm w-full text-center"
        >
          <div className="mb-6 bg-orange-100 p-6 rounded-full">
            <Gamepad2 className="w-20 h-20 text-orange-500" />
          </div>
          <h1 className="text-4xl font-black text-orange-600 mb-2 uppercase tracking-tighter leading-none">Tetris<br/>Anak Cerdas</h1>
          <p className="text-gray-500 font-medium mb-8">Game seru bertema hewan lucu untuk melatih otak!</p>
          
          <button 
            onClick={resetGame}
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
      {/* Header Info */}
      <div className="w-full max-w-lg mb-4 flex justify-between items-center bg-white p-4 rounded-3xl shadow-lg border-4 border-orange-100">
        <div className="flex flex-col items-center">
          <span className="text-xs font-black text-gray-400 uppercase">Skor</span>
          <span className="text-2xl font-black text-orange-600">{score.toLocaleString()}</span>
        </div>
        <div className="flex flex-col items-center px-6 border-x-2 border-orange-50">
          <span className="text-xs font-black text-gray-400 uppercase">Level</span>
          <span className="text-2xl font-black text-orange-600">{level}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs font-black text-gray-400 uppercase">Next</span>
          <div className="w-10 h-10 flex items-center justify-center bg-orange-50 rounded-xl mt-1">
            <span className="text-2xl">{nextPiece.icon}</span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-lg flex-1 flex flex-col items-center">
        {/* Main Grid */}
        <div className="w-full bg-white p-2 rounded-3xl shadow-xl border-8 border-orange-100 relative overflow-hidden mb-6">
          <div className="grid grid-cols-10 gap-[1px] bg-orange-50 rounded-2xl overflow-hidden border-2 border-orange-100">
            {grid.map((row, y) => row.map((value, x) => renderCell(value, x, y)))}
          </div>

          <AnimatePresence>
            {(paused || gameOver) && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 backdrop-blur-md bg-white/60 flex flex-col items-center justify-center p-6 text-center"
              >
                {gameOver ? (
                  <>
                    <div className="bg-red-100 p-6 rounded-full mb-4">
                      <Trash2 className="w-16 h-16 text-red-500" />
                    </div>
                    <h2 className="text-4xl font-black text-red-600 mb-2">GAME OVER!</h2>
                    <p className="text-gray-600 font-bold text-lg mb-8">Game Selesai. Kamu Hebat!</p>
                  </>
                ) : (
                  <>
                    <h2 className="text-4xl font-black text-orange-600 mb-2">PAUSE</h2>
                    <p className="text-gray-600 font-bold text-lg mb-8">Game Berhenti Sejenak</p>
                  </>
                )}
                
                <div className="flex flex-col gap-4 w-full max-w-[200px]">
                  {gameOver ? (
                    <button 
                      onClick={resetGame}
                      className="bg-orange-500 text-white font-black py-4 rounded-2xl shadow-[0_6px_0px_#C2410C] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-6 h-6" /> COBA LAGI
                    </button>
                  ) : (
                    <button 
                      onClick={() => setPaused(false)}
                      className="bg-orange-500 text-white font-black py-4 rounded-2xl shadow-[0_6px_0px_#C2410C] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
                    >
                      <Play className="fill-current w-6 h-6" /> LANJUT
                    </button>
                  )}
                  <button 
                    onClick={() => setGameStarted(false)}
                    className="bg-gray-100 text-gray-500 font-black py-4 rounded-2xl border-2 border-gray-200"
                  >
                    MENU UTAMA
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Controls */}
        <div className="w-full grid grid-cols-3 gap-2">
          <div />
          <button onClick={rotate} className="bg-orange-500 text-white h-16 rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform">
            <RotateCw className="w-8 h-8" />
          </button>
          <div />
          
          <button onClick={() => move(-1)} className="bg-orange-400 text-white h-16 rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform">
            <ArrowLeft className="w-8 h-8" />
          </button>
          <button onClick={drop} className="bg-orange-600 text-white h-16 rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform">
            <ArrowDown className="w-8 h-8" />
          </button>
          <button onClick={() => move(1)} className="bg-orange-400 text-white h-16 rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform">
            <ArrowRight className="w-8 h-8" />
          </button>

          <button onClick={() => setPaused(!paused)} className="bg-gray-200 text-gray-500 h-16 rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform">
            {paused ? <Play className="fill-current" /> : <Pause className="fill-current" />}
          </button>
          <button onClick={hardDrop} className="col-span-1 bg-yellow-500 text-white h-16 rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform text-xs font-black uppercase">
            DROP
          </button>
          <button onClick={resetGame} className="bg-orange-100 text-orange-600 h-16 rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform">
            <RotateCcw className="w-8 h-8" />
          </button>
        </div>
      </div>
    </div>
  );
}
