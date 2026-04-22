import React, { useState, useRef } from 'react';
import GameCanvas, { GameCanvasHandle } from './components/GameCanvas';
import EvolutionChart from './components/EvolutionChart';
import { GameState, Difficulty } from './types';
import { Heart, Info, RotateCcw, Trophy, Hammer, Magnet } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { EVOLUTION_LEVELS } from './constants';

export default function App() {
  const gameRef = useRef<GameCanvasHandle>(null);
  const [gameState, setGameState] = useState<GameState>(() => {
    // Try to load high score from localStorage
    const savedHighScore = typeof window !== 'undefined' ? localStorage.getItem('familyEmpire_highScore') : '0';
    return {
      happinessPoints: 0,
      highestLevelReached: 1,
      highScore: parseInt(savedHighScore || '0', 10),
      comboCount: 0,
      gameOver: false,
      difficulty: 'medium',
      powerUps: {
        hammer: 2,
        magnet: 2
      },
      achievements: []
    };
  });

  const handleUsePowerUp = (type: 'hammer' | 'magnet') => {
    if (gameState.gameOver || gameState.powerUps[type] <= 0) return;
    
    let success = false;
    if (type === 'hammer') success = gameRef.current?.useHammer() || false;
    if (type === 'magnet') success = gameRef.current?.useMagnet() || false;

    if (success) {
      setGameState(prev => ({
        ...prev,
        powerUps: {
          ...prev.powerUps,
          [type]: prev.powerUps[type] - 1
        }
      }));
    }
  };

  const handleStateUpdate = React.useCallback((newState: Partial<GameState>) => {
    setGameState(prev => {
      const updated = { ...prev, ...newState };
      if (typeof window !== 'undefined' && updated.highScore > prev.highScore) {
        localStorage.setItem('familyEmpire_highScore', updated.highScore.toString());
      }
      return updated;
    });
  }, []);

  const difficultyLevels: { id: Difficulty; label: string; desc: string; color: string }[] = [
    { id: 'easy', label: 'Hàn Vi', desc: 'Cơ bản (Cấp 1-2)', color: 'text-green-500' },
    { id: 'medium', label: 'Thăng Tiến', desc: 'Tiêu chuẩn (Cấp 1-3)', color: 'text-amber-500' },
    { id: 'hard', label: 'Chinh Phục', desc: 'Thử thách (Cấp 1-4)', color: 'text-orange-600' },
    { id: 'extreme', label: 'Thiên Mệnh', desc: 'Cực hạn (Cấp 1-5)', color: 'text-red-700' },
  ];

  return (
    <div className="min-h-screen bg-[#1a0f0a] flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none opacity-30 mix-blend-soft-light" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")' }} />

      {/* Header Stat Bar */}
      <header className="w-full max-w-[400px] mb-4 flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <motion.div 
            key={gameState.happinessPoints}
            className="flex items-center gap-2 glass-panel py-2 px-3"
          >
            <div className="w-6 h-6 rounded-full bg-red-700 flex items-center justify-center">
              <Heart className="w-3 h-3 text-white fill-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] uppercase font-bold text-amber-500/80 tracking-widest">ĐIỂM</span>
              <span className="text-lg font-serif-royal font-black leading-none text-gold-bright">{gameState.happinessPoints}</span>
            </div>
          </motion.div>

          <div className="flex items-center gap-2 glass-panel py-2 px-3 border-amber-900/30">
            <div className="flex flex-col">
              <span className="text-[8px] uppercase font-bold text-stone-500 tracking-widest text-nowrap">KỶ LỤC</span>
              <span className="text-lg font-serif-royal font-black leading-none text-stone-300">{gameState.highScore}</span>
            </div>
          </div>
        </div>

        <button 
          className="p-2.5 bg-stone-900/80 rounded-full border border-amber-600 shadow-lg active:scale-90 transition-transform flex items-center justify-center"
          onClick={() => window.location.reload()}
        >
          <RotateCcw className="w-4 h-4 text-amber-500" />
        </button>
      </header>
      
      {/* Combo Indicator */}
      <div className="h-8 mb-2 flex items-center justify-center">
        <AnimatePresence>
          {gameState.comboCount > 1 && (
            <motion.div
              initial={{ scale: 0, rotate: -20, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="px-4 py-1 bg-amber-500 text-black font-black font-serif-royal italic rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)] z-50 text-sm"
            >
              COMBO x{gameState.comboCount}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <main className="flex-1 w-full max-w-[1200px] mx-auto flex items-start justify-center gap-12 relative px-4">
        {/* Evolution Chart (Sidebar on Desktop/Large screen) */}
        <EvolutionChart highestLevel={gameState.highestLevelReached} />
        
        {/* Main Game Frame */}
        <div className="flex flex-col items-center">
          {/* Power-ups Toolbar */}
          {!gameState.gameOver && gameState.happinessPoints > 0 && (
            <div className="flex gap-4 mb-4">
              <button 
                onClick={() => handleUsePowerUp('hammer')}
                disabled={gameState.powerUps.hammer <= 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${
                  gameState.powerUps.hammer > 0 
                  ? 'bg-amber-900/40 border-amber-600 text-amber-100 hover:scale-105 active:scale-95' 
                  : 'bg-black/20 border-stone-800 text-stone-600 grayscale'
                }`}
              >
                <Hammer className="w-4 h-4" />
                <span className="font-serif-royal font-bold text-xs">BÚA ({gameState.powerUps.hammer})</span>
              </button>

              <button 
                onClick={() => handleUsePowerUp('magnet')}
                disabled={gameState.powerUps.magnet <= 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${
                  gameState.powerUps.magnet > 0 
                  ? 'bg-amber-900/40 border-amber-600 text-amber-100 hover:scale-105 active:scale-95' 
                  : 'bg-black/20 border-stone-800 text-stone-600 grayscale'
                }`}
              >
                <Magnet className="w-4 h-4" />
                <span className="font-serif-royal font-bold text-xs">NAM CHÂM ({gameState.powerUps.magnet})</span>
              </button>
            </div>
          )}

          {/* Difficulty Selector (Always visible or show on reset) */}
          {!gameState.gameOver && gameState.happinessPoints === 0 && (
            <div className="w-full max-w-[400px] mb-6 flex flex-wrap justify-center gap-2 animate-in fade-in slide-in-from-top-4 duration-700">
              {difficultyLevels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => handleStateUpdate({ difficulty: level.id })}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-serif-royal border transition-all ${
                    gameState.difficulty === level.id 
                    ? 'bg-amber-900/40 border-amber-500 text-amber-100 shadow-[0_0_10px_rgba(212,175,55,0.3)]' 
                    : 'bg-black/20 border-stone-800 text-stone-500 hover:border-stone-600'
                  }`}
                >
                  <div className={`font-bold ${gameState.difficulty === level.id ? level.color : ''}`}>{level.label}</div>
                </button>
              ))}
            </div>
          )}

          <div className="relative group">
            <GameCanvas 
              ref={gameRef}
              gameState={gameState}
              onStateUpdate={handleStateUpdate}
            />

            {/* Game Over Overlay */}
            <AnimatePresence>
              {gameState.gameOver && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center rounded-3xl"
                >
                  <motion.div
                    initial={{ scale: 0.8, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="oriental-frame p-8 flex flex-col items-center gap-6 w-full max-w-[320px] bg-[#1a0f0a]"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-amber-900/20 flex items-center justify-center mb-4 border border-amber-500/30">
                        <Trophy className="w-8 h-8 text-gold-bright" />
                      </div>
                      <h2 className="text-3xl font-serif-royal font-black text-white tracking-widest mb-1">KẾT THÚC</h2>
                      <span className="text-amber-500 font-serif italic text-xs uppercase tracking-tighter">Gia tộc đã viên mãn</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 w-full">
                      <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                        <span className="block text-[8px] text-stone-500 uppercase tracking-widest mb-1">Điểm số</span>
                        <span className="text-xl font-serif font-black text-amber-200">{gameState.happinessPoints}</span>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                        <span className="block text-[8px] text-stone-500 uppercase tracking-widest mb-1">Kỷ lục</span>
                        <span className="text-xl font-serif font-black text-gold-bright">{gameState.highScore}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center -mt-2">
                       <span className="text-[8px] text-stone-500 uppercase tracking-widest mb-2">Thành tựu cao nhất</span>
                       <div className="flex items-center gap-2 px-4 py-2 bg-amber-900/30 rounded-full border border-amber-600/30">
                          <span className="text-xl">{EVOLUTION_LEVELS[gameState.highestLevelReached - 1].emoji}</span>
                          <span className="text-xs font-serif-royal font-bold text-amber-200 uppercase">{EVOLUTION_LEVELS[gameState.highestLevelReached - 1].name}</span>
                       </div>
                    </div>

                    <button 
                      className="mt-2 px-8 py-3 bg-gradient-to-br from-amber-600 to-amber-900 text-white font-serif-royal font-black tracking-widest rounded-xl shadow-2xl active:scale-95 transition-all w-full border border-amber-500/40 text-sm"
                      onClick={() => window.location.reload()}
                    >
                      XÂY LẠI GIA TỘC
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="w-full max-w-[400px] mt-8">
        <div className="glass-panel text-stone-400 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-900/10 -rotate-45 translate-x-8 -translate-y-8" />
          <div className="flex items-start gap-4 relative z-10">
            <Info className="w-5 h-5 text-amber-600/50 mt-1 shrink-0" />
            <p className="text-[11px] font-serif italic leading-relaxed text-amber-100/40 group-hover:text-amber-100/80 transition-colors">
              "Ghép những khoảnh khắc yêu thương để tạo nên một gia đình trọn vẹn. 
              Mỗi bước tiến hóa là một minh chứng cho sự thịnh vượng của dòng tộc."
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Sparkles Background Effects (CSS Only) */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-1/4 left-10 w-2 h-2 bg-pink-200 rounded-full animate-ping opacity-20" />
        <div className="absolute top-3/4 left-1/4 w-3 h-3 bg-yellow-100 rounded-full animate-pulse opacity-30" />
        <div className="absolute top-1/2 right-20 w-2 h-2 bg-pink-100 rounded-full animate-bounce opacity-20" />
      </div>
    </div>
  );
}
