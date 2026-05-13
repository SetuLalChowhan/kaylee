import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Bot, AlertCircle, RotateCcw, Home, Trophy, Zap, Gauge, Box, Triangle, Square, Circle } from 'lucide-react';

const OBSTACLE_TYPES = [
  { icon: Box, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { icon: Triangle, color: 'text-red-500', bg: 'bg-red-500/10' },
  { icon: Square, color: 'text-yellow-500', bg: 'bg-yellow-500/10' }
];

const NotFound = () => {
  const navigate = useNavigate();
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(parseInt(localStorage.getItem('botHighScore')) || 0);
  const [countdown, setCountdown] = useState(null);
  const [gameSpeed, setGameSpeed] = useState(1.4);

  // Physics States
  const [yPos, setYPos] = useState(0);
  const [obstacle, setObstacle] = useState({ pos: 110, type: 0 });

  // High-precision physics refs
  const physicsRef = useRef({ y: 0, velocity: 0, isJumping: false });
  const requestRef = useRef();
  const gravity = 0.8;
  const jumpStrength = 15;

  // Progressive Speed Logic
  useEffect(() => {
    if (score > 0 && score % 4 === 0) {
      setGameSpeed(prev => Math.min(prev + 0.12, 4));
    }
  }, [score]);

  const startCountdown = () => {
    if (gameOver) restartGame();
    else if (!gameStarted) {
      setCountdown(3);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setGameStarted(true);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const jump = () => {
    if (!gameStarted && countdown === null) {
      startCountdown();
      return;
    }
    if (gameOver) {
      restartGame();
      return;
    }
    // Strict jump check: only jump if on ground and not already jumping
    if (!physicsRef.current.isJumping && physicsRef.current.y === 0 && gameStarted && !gameOver) {
      physicsRef.current.velocity = jumpStrength;
      physicsRef.current.isJumping = true;
    }
  };

  const restartGame = () => {
    setGameOver(false);
    setGameStarted(false);
    setScore(0);
    setYPos(0);
    physicsRef.current = { y: 0, velocity: 0, isJumping: false };
    setObstacle({ pos: 110, type: Math.floor(Math.random() * OBSTACLE_TYPES.length) });
    setGameSpeed(1.4);
    startCountdown();
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, gameOver, countdown]);

  // Game Loop
  useEffect(() => {
    if (gameStarted && !gameOver) {
      const update = () => {
        // 1. Update Physics (Vertical)
        const p = physicsRef.current;
        p.velocity -= gravity;
        p.y += p.velocity;

        if (p.y <= 0) {
          p.y = 0;
          p.velocity = 0;
          p.isJumping = false;
        }

        // Sync to state for rendering
        setYPos(p.y);

        // 2. Update Obstacle (Horizontal)
        setObstacle(prev => {
          let nextPos = prev.pos - gameSpeed;
          let nextType = prev.type;

          if (nextPos < -10) {
            setScore(s => s + 1);
            nextPos = 110;
            nextType = Math.floor(Math.random() * OBSTACLE_TYPES.length);
          }

          // 3. Precise Collision Detection
          const botHitbox = { left: 20, right: 28, bottom: p.y };
          const obsHitbox = { left: nextPos, right: nextPos + 6 };

          if (
            obsHitbox.left < botHitbox.right &&
            obsHitbox.right > botHitbox.left &&
            botHitbox.bottom < 15
          ) {
            setGameOver(true);
          }

          return { pos: nextPos, type: nextType };
        });

        requestRef.current = requestAnimationFrame(update);
      };
      requestRef.current = requestAnimationFrame(update);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameStarted, gameOver, gameSpeed]);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('botHighScore', score);
    }
  }, [score, highScore]);

  const CurrentObstacle = OBSTACLE_TYPES[obstacle.type];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 md:p-6 font-sans overflow-hidden">
      <div className="max-w-4xl w-full">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-12 gap-6 md:gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-center md:text-left flex-1"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-Primary/5 rounded-full mb-4 md:mb-6 border border-Primary/10">
              <Zap className="w-3.5 h-3.5 md:w-4 md:h-4 text-Primary" />
              <span className="text-[9px] md:text-[10px] font-black text-Primary uppercase tracking-[0.2em]">System Bypass</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-[#1A1A1A] mb-3 md:mb-4 tracking-tighter leading-none">
              4<span className="text-Primary">0</span>4
            </h1>
            <p className="text-gray-400 text-sm md:text-lg font-medium leading-relaxed max-w-md mx-auto md:mx-0">
              Our bot took a wrong turn into the void. Help it jump back into the system!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex gap-3 md:gap-4 w-full md:w-auto"
          >
            <div className="flex-1 md:flex-none p-4 md:p-6 bg-white rounded-2xl md:rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/40 text-center">
              <Trophy className="w-5 h-5 md:w-6 md:h-6 text-yellow-500 mx-auto mb-2" />
              <p className="text-[8px] md:text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Max Score</p>
              <p className="text-xl md:text-3xl font-black text-[#1A1A1A] tabular-nums leading-none">{highScore}</p>
            </div>
            <div className="flex-1 md:flex-none p-4 md:p-6 bg-Primary text-white rounded-2xl md:rounded-[32px] shadow-xl shadow-Primary/30 text-center">
              <Gauge className="w-5 h-5 md:w-6 md:h-6 text-white/60 mx-auto mb-2" />
              <p className="text-[8px] md:text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Current Sync</p>
              <p className="text-xl md:text-3xl font-black tabular-nums leading-none">Lvl {Math.floor(gameSpeed * 2)}</p>
            </div>
          </motion.div>
        </div>

        {/* Game Area */}
        <div
          onClick={jump}
          className="relative w-full h-56 md:h-80 bg-white border border-gray-100 rounded-[32px] md:rounded-[48px] overflow-hidden cursor-pointer shadow-2xl shadow-gray-200/50 group"
        >
          {/* Ground Grid */}
          <div className="absolute bottom-0 left-0 right-0 h-12 md:h-16 bg-[#F8FAFC]/50" />
          <div className="absolute bottom-12 md:bottom-16 left-0 right-0 h-px bg-gray-100" />

          {/* Bot */}
          <div
            className="absolute left-[15%] md:left-[20%] z-20"
            style={{ bottom: `${(window.innerWidth < 768 ? 48 : 64) + yPos}px` }}
          >
            <motion.div
              animate={{
                rotate: yPos > 0 ? -15 : (gameStarted && !gameOver ? [-2, 2, -2] : 0),
                scale: gameStarted && !gameOver ? [1, 1.02, 1] : 1
              }}
              transition={{
                rotate: { duration: 0.1, repeat: yPos > 0 ? 0 : Infinity },
                scale: { duration: 0.2, repeat: Infinity }
              }}
            >
              <div className="relative">
                <Bot className="w-10 h-10 md:w-14 md:h-14 text-Primary drop-shadow-2xl" fill="currentColor" fillOpacity={0.15} />
                {yPos > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.5, 0], opacity: [1, 0.5, 0] }}
                    transition={{ duration: 0.4, repeat: Infinity }}
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-3 md:w-6 md:h-4 bg-Primary/20 rounded-full blur-sm"
                  />
                )}
              </div>
            </motion.div>
          </div>

          {/* Obstacle */}
          {gameStarted && !gameOver && (
            <motion.div
              className="absolute w-8 h-8 md:w-12 md:h-12 flex items-center justify-center"
              style={{
                left: `${obstacle.pos}%`,
                bottom: `${window.innerWidth < 768 ? 48 : 64}px`
              }}
            >
              <div className={`p-1.5 md:p-2.5 rounded-lg md:rounded-xl ${CurrentObstacle.bg} border border-white shadow-sm`}>
                <CurrentObstacle.icon className={`w-4 h-4 md:w-6 md:h-6 ${CurrentObstacle.color}`} />
              </div>
            </motion.div>
          )}

          {/* Overlays */}
          <AnimatePresence mode="wait">
            {countdown !== null && (
              <motion.div
                key="countdown"
                initial={{ opacity: 0, scale: 2 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute inset-0 z-40 flex items-center justify-center bg-white/40 backdrop-blur-sm"
              >
                <span className="text-6xl md:text-8xl font-black text-Primary italic tracking-tighter">{countdown}</span>
              </motion.div>
            )}

            {(!gameStarted && countdown === null || gameOver) && (
              <motion.div
                key="state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center z-30 p-6 md:p-8"
              >
                {gameOver ? (
                  <div className="text-center">
                    <motion.div
                      initial={{ y: 20 }}
                      animate={{ y: 0 }}
                      className="inline-block p-3 md:p-4 bg-red-50 rounded-full mb-4 md:mb-6 border border-red-100"
                    >
                      <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
                    </motion.div>
                    <h3 className="text-2xl md:text-4xl font-black text-[#1A1A1A] mb-2 tracking-tight">BOT CRASHED</h3>
                    <p className="text-[10px] md:text-sm font-bold text-gray-400 mb-6 md:mb-8 uppercase tracking-widest">Protocol Failed at {score} Syncs</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); restartGame(); }}
                      className="bg-Primary text-white px-8 md:px-10 py-3 md:py-4 rounded-2xl md:rounded-3xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-Primary/40 flex items-center gap-3 mx-auto"
                    >
                      <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
                      Reboot System
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <motion.div
                      animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="mb-6 md:mb-8"
                    >
                      <Bot className="w-16 h-16 md:w-20 md:h-20 text-Primary/10 mx-auto" />
                    </motion.div>
                    <button className="bg-Primary text-white px-10 md:px-12 py-4 md:py-5 rounded-2xl md:rounded-[32px] font-black text-lg md:text-xl uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-Primary/40">
                      Initiate Link
                    </button>
                    <p className="mt-4 md:mt-6 text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Sync via Space or Click</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* HUD Overlay */}
          <div className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-4 z-20">
            <div className="flex flex-col">
              <span className="text-[8px] md:text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Sync Status</span>
              <span className="text-2xl md:text-4xl font-black text-[#1A1A1A] tabular-nums leading-none">{score}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-10 md:mt-16 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 pt-8 border-t border-gray-100">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              onClick={() => navigate('/')}
              className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-white border border-gray-100 rounded-2xl md:rounded-3xl font-black text-xs uppercase tracking-widest text-[#1A1A1A] hover:bg-gray-50 transition-all shadow-xl shadow-gray-200/40"
            >
              <Home className="w-5 h-5 text-gray-400" />
              Go Homepage
            </button>
          </div>

          <div className="hidden md:flex items-center gap-8 text-gray-400">
            <div className="flex items-center gap-3">
              <kbd className="px-3 py-2 bg-white border border-gray-100 rounded-xl font-black text-[10px] shadow-sm">SPACE</kbd>
              <span className="text-[10px] font-black uppercase tracking-widest">Boost</span>
            </div>
            <div className="flex items-center gap-3">
              <kbd className="px-3 py-2 bg-white border border-gray-100 rounded-xl font-black text-[10px] shadow-sm">CLICK</kbd>
              <span className="text-[10px] font-black uppercase tracking-widest">Jump</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Background */}
      <div className="fixed top-0 right-0 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-Primary/5 rounded-full blur-[80px] md:blur-[120px] translate-x-1/3 -translate-y-1/3 -z-10" />
      <div className="fixed bottom-0 left-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-Primary/5 rounded-full blur-[60px] md:blur-[100px] -translate-x-1/3 translate-y-1/3 -z-10" />
    </div>
  );
};

export default NotFound;
