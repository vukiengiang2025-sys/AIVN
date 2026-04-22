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
  });

  const handleStateUpdate = (newState: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...newState }));
  };

  return (
    <div className="min-h-screen bg-warm-cream flex flex-col items-center justify-center p-4">
      {/* Header Stat Bar */}
      <header className="w-full max-w-[400px] mb-4 flex items-center justify-between">
        <motion.div 
          key={gameState.happinessPoints}
          initial={{ scale: 1.2, color: '#FFD27D' }}
          animate={{ scale: 1, color: '#44403c' }}
          className="flex items-center gap-2 glass-panel py-2 px-4 shadow-sm"
        >
          <Heart className="w-5 h-5 text-red-400 fill-red-400" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Hạnh Phúc</span>
            <span className="text-xl font-black leading-none">{gameState.happinessPoints}</span>
          </div>
        </motion.div>

        <h1 className="text-lg font-bold text-wood-brown hidden sm:block">Merge Family</h1>

        <div className="flex gap-2">
           <button 
            className="p-3 bg-white rounded-full shadow-sm active:scale-90 transition-transform"
            onClick={() => window.location.reload()}
          >
            <RotateCcw className="w-5 h-5 text-stone-600" />
          </button>
        </div>
      </header>

      <main className="relative w-full flex items-center justify-center">
        {/* Evolution Chart (Sidebar on Desktop/Large screen) */}
        <EvolutionChart highestLevel={gameState.highestLevelReached} />
        
        {/* Main Game Frame */}
        <div className="w-full flex justify-center">
          <GameCanvas 
            gameState={gameState}
            onStateUpdate={handleStateUpdate}
          />
        </div>
      </main>

      {/* Footer Info */}
      <footer className="w-full max-w-[400px] mt-6 px-4">
        <div className="flex items-start gap-3 opacity-60">
          <Info className="w-4 h-4 mt-1 shrink-0" />
          <p className="text-xs leading-relaxed italic">
            "Ghép những khoảnh khắc yêu thương để tạo nên một gia đình trọn vẹn. 
            Càng nhiều nụ cười, điểm hạnh phúc càng cao!"
          </p>
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
