import React, { useState } from 'react';
import GameCanvas from './components/GameCanvas';
import EvolutionChart from './components/EvolutionChart';
import { GameState } from './types';
import { Heart, Info, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    happinessPoints: 0,
    highestLevelReached: 1,
    gameOver: false,
    difficulty: 'medium',
  });

  const handleStateUpdate = React.useCallback((newState: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...newState }));
  }, []);

  const difficultyLevels: { id: Difficulty; label: string; desc: string; color: string }[] = [
    { id: 'easy', label: 'Hàn Vi', desc: 'Cơ bản (Cấp 1-2)', color: 'text-green-500' },
    { id: 'medium', label: 'Thăng Tiến', desc: 'Tiêu chuẩn (Cấp 1-3)', color: 'text-amber-500' },
    { id: 'hard', label: 'Chinh Phục', desc: 'Thử thách (Cấp 1-4)', color: 'text-orange-600' },
    { id: 'extreme', label: 'Thiên Mệnh', desc: 'Cực hạn (Cấp 1-5)', color: 'text-red-700' },
  ];

  return (
    <div className="min-h-screen bg-[#1a0f0a] flex flex-col items-center justify-center p-4">
      {/* Difficulty Selector (Always visible or show on reset) */}
      {!gameState.gameOver && gameState.happinessPoints === 0 && (
        <div className="w-full max-w-[400px] mb-6 flex flex-wrap justify-center gap-2">
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
              <div className="opacity-60 scale-75 origin-top">{level.desc}</div>
            </button>
          ))}
        </div>
      )}

      {/* Header Stat Bar */}
      <header className="w-full max-w-[400px] mb-4 flex items-center justify-between">
        <motion.div 
          key={gameState.happinessPoints}
          initial={{ scale: 1.2, color: '#FFD700' }}
          animate={{ scale: 1, color: '#FFFFFF' }}
          className="flex items-center gap-2 glass-panel py-2 px-4 shadow-2xl"
        >
          <div className="w-8 h-8 rounded-full bg-red-700 flex items-center justify-center shadow-inner">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-amber-500 tracking-widest">LONG KHÍ</span>
            <span className="text-xl font-serif font-black leading-none text-gold-bright">{gameState.happinessPoints}</span>
          </div>
        </motion.div>

        <h1 className="text-xl font-serif font-bold text-amber-600 hidden sm:block tracking-widest">ĐẾ CHẾ GIA TỘC</h1>

        <div className="flex gap-2">
           <button 
            className="p-3 bg-stone-800 rounded-full border border-amber-600 shadow-lg active:scale-90 transition-transform"
            onClick={() => window.location.reload()}
          >
            <RotateCcw className="w-5 h-5 text-amber-500" />
          </button>
        </div>
      </header>

      <main className="relative w-full flex items-center justify-center">
        {/* Evolution Chart (Sidebar on Desktop/Large screen) */}
        <div className="opacity-80">
          <EvolutionChart highestLevel={gameState.highestLevelReached} />
        </div>
        
        {/* Main Game Frame */}
        <div className="w-full flex justify-center">
          <GameCanvas 
            gameState={gameState}
            onStateUpdate={handleStateUpdate}
          />
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
