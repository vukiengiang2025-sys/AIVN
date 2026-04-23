import React, { useState, useRef } from 'react';
import GameCanvas, { GameCanvasHandle } from './components/GameCanvas';
import EvolutionChart from './components/EvolutionChart';
import BallCustomizer from './components/BallCustomizer';
import { GameState, Difficulty } from './types';
import { Heart, Info, RotateCcw, Trophy, Hammer, Magnet, Settings as SettingsIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { EVOLUTION_LEVELS } from './constants';

const TITLES = [
  { minPoints: 0, title: 'Dân Thường' },
  { minPoints: 5000, title: 'Địa Chủ' },
  { minPoints: 20000, title: 'Quan Phủ' },
  { minPoints: 100000, title: 'Công Tước' },
  { minPoints: 500000, title: 'Đại Vương' },
  { minPoints: 1000000, title: 'Hoàng Đế' },
];

export default function App() {
  const gameRef = useRef<GameCanvasHandle>(null);
  const [isCustomizing, setIsCustomizing] = useState(false);
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
      achievements: [],
      customImages: {},
      holdLevel: null,
      currency: 0,
      currentTitle: 'Dân Thường',
      isZenMode: false,
      weather: 'clear'
    };
  });

  const handleUpdateCustomImage = (level: number, imageUrl: string) => {
    setGameState(prev => ({
      ...prev,
      customImages: {
        ...prev.customImages,
        [level]: imageUrl
      }
    }));
  };

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

  const handleHold = () => {
    if (gameState.gameOver || gameState.happinessPoints === 0) return;
    const oldNext = gameRef.current?.useHold();
    if (oldNext !== undefined) {
      setGameState(prev => ({ ...prev, holdLevel: oldNext }));
    }
  };

  const buyPowerUp = (type: 'hammer' | 'magnet') => {
    const cost = 2000;
    if (gameState.currency >= cost) {
      setGameState(prev => ({
        ...prev,
        currency: prev.currency - cost,
        powerUps: {
          ...prev.powerUps,
          [type]: prev.powerUps[type] + 1
        }
      }));
    }
  };

  const updateTitle = (points: number) => {
    const titleObj = TITLES.slice().reverse().find(t => points >= t.minPoints);
    return titleObj?.title || 'Dân Thường';
  };

  const handleStateUpdate = React.useCallback((newState: Partial<GameState>) => {
    setGameState(prev => {
      const updated = { ...prev, ...newState };

      // Update Title & Currency if points increased
      if (newState.happinessPoints && newState.happinessPoints > prev.happinessPoints) {
        const diff = newState.happinessPoints - prev.happinessPoints;
        updated.currency = Math.floor(prev.currency + diff);
        updated.currentTitle = updateTitle(updated.happinessPoints);
      }

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
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden relative transition-colors duration-1000 ${
      gameState.weather === 'snow' ? 'bg-[#0f172a]' : gameState.weather === 'windy' ? 'bg-[#1e293b]' : 'bg-[#1a0f0a]'
    }`}>
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none opacity-30 mix-blend-soft-light" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")' }} />

      <BallCustomizer 
        isOpen={isCustomizing}
        onClose={() => setIsCustomizing(false)}
        customImages={gameState.customImages}
        onUpdateImage={handleUpdateCustomImage}
      />
      
      {/* Horizontal Layout Main Container */}
      <main className="w-full max-w-[1400px] flex flex-col sm:flex-row items-stretch justify-center gap-4 relative z-10 px-2 py-4 h-full sm:h-[90vh]">
        
        {/* COLUMN 1: Evolution Hierarchy (Sidebar Left) */}
        <div className="hidden md:flex w-56 flex-col gap-4 shrink-0 h-full overflow-hidden">
           <EvolutionChart 
              highestLevel={gameState.highestLevelReached} 
              customImages={gameState.customImages}
            />
        </div>

        {/* COLUMN 2: Central Game Area */}
        <div className="flex flex-col items-center shrink-0 justify-center">
          <header className="w-full max-w-[400px] mb-4 flex items-center justify-between gap-2">
            <div className="flex gap-2">
              <motion.div 
                key={gameState.happinessPoints}
                className="flex items-center gap-2 glass-panel py-2 px-3"
              >
                <div className="w-6 h-6 rounded-full bg-red-700 flex items-center justify-center shadow-lg">
                  <Heart className="w-3 h-3 text-white fill-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] uppercase font-black text-amber-500/80 tracking-widest">ĐIỂM</span>
                  <span className="text-xl font-serif-royal font-black leading-none text-white">{gameState.happinessPoints.toLocaleString()}</span>
                </div>
              </motion.div>

              <div className="flex items-center gap-2 glass-panel py-2 px-3 border-amber-900/30">
                <div className="flex flex-col text-nowrap pr-1">
                  <span className="text-[8px] uppercase font-bold text-stone-500 tracking-widest">KỶ LỤC</span>
                  <span className="text-lg font-serif-royal font-black leading-none text-stone-400">{gameState.highScore.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                className={`p-2.5 rounded-full border shadow-lg transition-all flex items-center justify-center ${gameState.isZenMode ? 'bg-green-900/60 border-green-500 text-green-400' : 'bg-stone-900/80 border-stone-600 text-stone-500'}`}
                onClick={() => handleStateUpdate({ isZenMode: !gameState.isZenMode })}
                title={gameState.isZenMode ? "Chế độ Bất Tử: BẬT" : "Chế độ Bất Tử: TẮT"}
              >
                <SettingsIcon className="w-4 h-4" />
              </button>
              
              <button 
                className="p-2.5 bg-stone-900/80 rounded-full border border-amber-600 shadow-lg active:scale-95 transition-all flex items-center justify-center hover:bg-stone-800"
                onClick={() => setIsCustomizing(true)}
                title="Tùy chỉnh hình ảnh"
              >
                <SettingsIcon className="w-4 h-4 text-amber-500" />
              </button>
            </div>
          </header>

          <div className="relative group ring-4 ring-amber-900/20 rounded-[32px] p-2 bg-[#2C1810]/40 backdrop-blur-sm">
            {/* Combo Indicator */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-full flex justify-center h-10 pointer-events-none">
              <AnimatePresence>
                {gameState.comboCount > 1 && (
                  <motion.div
                    initial={{ scale: 0, rotate: -20, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="px-6 py-2 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-black font-serif-royal italic rounded-full shadow-[0_0_25px_rgba(245,158,11,0.6)] z-50 text-base whitespace-nowrap border-2 border-white"
                  >
                    COMBO x{gameState.comboCount}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

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
                    <Trophy className="w-12 h-12 text-gold-bright" />
                    <h2 className="text-3xl font-serif-royal font-black text-white tracking-widest uppercase">Gia Tộc Viên Mãn</h2>
                    
                    <div className="grid grid-cols-2 gap-4 w-full">
                       <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                          <span className="text-[8px] text-stone-500 block uppercase tracking-widest">Điểm số</span>
                          <span className="text-xl font-black text-amber-200">{gameState.happinessPoints.toLocaleString()}</span>
                       </div>
                       <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                          <span className="text-[8px] text-stone-500 block uppercase tracking-widest">Kỷ lục</span>
                          <span className="text-xl font-black text-amber-500">{gameState.highScore.toLocaleString()}</span>
                       </div>
                    </div>

                    <button 
                      className="px-8 py-4 bg-gradient-to-br from-amber-500 to-amber-800 text-white font-serif-royal font-black tracking-widest rounded-xl shadow-2xl active:scale-95 transition-all w-full border border-amber-400/30"
                      onClick={() => window.location.reload()}
                    >
                      XÂY LẠI GIA TỘC
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Difficulty & Weather Toggles within central console */}
          <div className="mt-4 flex flex-col gap-3 w-full max-w-[400px]">
            <div className="flex bg-stone-900/80 p-1.5 rounded-2xl border border-amber-900/30 justify-center backdrop-blur-md">
              {(['clear', 'windy', 'snow'] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => handleStateUpdate({ weather: w })}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all flex-1 ${
                    gameState.weather === w ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'text-stone-500 hover:text-stone-300'
                  }`}
                >
                  {w === 'clear' ? 'Trời Nắng' : w === 'windy' ? 'Nổi Gió' : 'Tuyết Rơi'}
                </button>
              ))}
            </div>
            
            {!gameState.gameOver && gameState.happinessPoints === 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {difficultyLevels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => handleStateUpdate({ difficulty: level.id })}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black tracking-wider border transition-all ${
                      gameState.difficulty === level.id 
                      ? 'bg-amber-900/60 border-amber-500 text-white shadow-lg' 
                      : 'bg-black/20 border-stone-800 text-stone-600 hover:border-stone-600'
                    }`}
                  >
                    {level.label.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 3: Imperial Dashboard (Right Sidebar) */}
        <div className="flex-1 flex flex-col gap-4 w-full sm:max-w-[220px] md:max-w-xs h-full overflow-y-auto custom-scrollbar pr-1 scrollbar-hide">
          
          {/* Noble Title Section */}
          <div className="bg-stone-900/80 p-6 rounded-[2rem] border-2 border-amber-900/30 flex flex-col items-center shadow-2xl backdrop-blur-md">
             <div className="text-amber-600 text-[10px] uppercase font-black tracking-[0.5em] mb-3 opacity-80">Tước Hiệu Hiệu Triệu</div>
             <motion.div 
               key={gameState.currentTitle}
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               className="text-3xl font-serif-royal font-black text-white text-center tracking-widest drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] mb-6"
             >
               {gameState.currentTitle}
             </motion.div>
             <div className="w-full flex items-center justify-between px-6 py-4 bg-black/60 rounded-2xl border border-amber-900/20 shadow-inner">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center shadow-lg">
                      <Trophy className="w-5 h-5 text-amber-950" />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[9px] text-stone-500 font-black uppercase">Tài sản gia bảo</span>
                      <span className="text-xs font-bold text-stone-300">Xu vàng tích lũy</span>
                   </div>
                </div>
                <span className="text-2xl font-black text-amber-400 font-mono tracking-tighter">{gameState.currency.toLocaleString()}</span>
             </div>
          </div>

          {/* Action Center: Powerups & Hold */}
          <div className="bg-stone-900/80 p-6 rounded-[2rem] border-2 border-amber-900/30 shadow-2xl backdrop-blur-md">
            <div className="text-[10px] font-black text-amber-600/60 uppercase tracking-[0.3em] mb-5 border-b border-amber-900/20 pb-2">Hành Động Chiến Thuật</div>
            <div className="flex items-stretch gap-6">
               {/* Hold Slot */}
               <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={handleHold}
                    className="w-20 h-20 bg-black/80 border-4 border-amber-600/50 rounded-3xl flex items-center justify-center relative overflow-hidden transition-all active:scale-90 hover:border-amber-400 hover:shadow-[0_0_30px_rgba(217,119,6,0.3)] group"
                  >
                    {gameState.holdLevel ? (
                      <div className="w-full h-full flex items-center justify-center text-4xl transform group-hover:scale-110 transition-transform">
                        {gameState.customImages[gameState.holdLevel] ? (
                          <img src={gameState.customImages[gameState.holdLevel]} className="w-full h-full object-cover" />
                        ) : (
                          EVOLUTION_LEVELS[gameState.holdLevel - 1].emoji
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                         <RotateCcw className="w-6 h-6 text-amber-600" />
                         <span className="text-[9px] font-black text-amber-600 uppercase">Dự trữ</span>
                      </div>
                    )}
                  </button>
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest mt-1">Hoán Đổi</span>
               </div>

               {/* Powerups Shop Area */}
               <div className="flex-1 flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleUsePowerUp('hammer')}
                      disabled={gameState.powerUps.hammer <= 0}
                      className="flex-1 h-14 bg-amber-900/40 border-2 border-amber-600/50 rounded-2xl flex items-center justify-center gap-3 text-white font-black hover:bg-amber-900 transition-all disabled:opacity-20 shadow-lg"
                    >
                      <Hammer className="w-5 h-5 text-amber-400" />
                      <span className="text-xl">{gameState.powerUps.hammer}</span>
                    </button>
                    <button 
                       onClick={() => buyPowerUp('hammer')}
                       disabled={gameState.currency < 2000}
                       className="w-12 h-14 rounded-2xl bg-amber-600 hover:bg-amber-500 flex items-center justify-center text-black font-black text-2xl shadow-lg disabled:opacity-20 transition-all"
                    >+</button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleUsePowerUp('magnet')}
                      disabled={gameState.powerUps.magnet <= 0}
                      className="flex-1 h-14 bg-amber-900/40 border-2 border-amber-600/50 rounded-2xl flex items-center justify-center gap-3 text-white font-black hover:bg-amber-900 transition-all disabled:opacity-20 shadow-lg"
                    >
                      <Magnet className="w-5 h-5 text-amber-400" />
                      <span className="text-xl">{gameState.powerUps.magnet}</span>
                    </button>
                    <button 
                       onClick={() => buyPowerUp('magnet')}
                       disabled={gameState.currency < 2000}
                       className="w-12 h-14 rounded-2xl bg-amber-600 hover:bg-amber-500 flex items-center justify-center text-black font-black text-2xl shadow-lg disabled:opacity-20 transition-all"
                    >+</button>
                  </div>
                  <div className="text-[9px] text-stone-500 font-bold uppercase tracking-tight text-center">Tư hữu thêm: 2000 Xu / Lễ</div>
               </div>
            </div>
          </div>

          {/* Daily Quests Center */}
          <div className="bg-stone-900/80 p-6 rounded-[2rem] border-2 border-amber-900/30 shadow-2xl backdrop-blur-md flex-1">
             <div className="text-[10px] font-black text-amber-600/60 uppercase tracking-[0.3em] mb-6 border-b border-amber-900/20 pb-2">Nhiệm Vụ Dòng Tộc</div>
             <div className="flex flex-col gap-6">
                {[
                  { label: "Kiến tạo Tổ Ấm (Cấp 10)", goal: 10, current: gameState.highestLevelReached },
                  { label: "Đại Phú Hào (50.000 Xu)", goal: 50000, current: gameState.happinessPoints },
                  { label: "Bậc Thầy Combo (x5)", goal: 5, current: gameState.comboCount }
                ].map((q, idx) => (
                  <div key={idx} className="flex flex-col gap-2.5">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tight">
                       <span className="text-amber-100">{q.label}</span>
                       <span className={q.current >= q.goal ? 'text-green-500' : 'text-amber-600'}>
                         {q.current >= q.goal ? 'ĐÃ XONG ✓' : `${q.current >= 1000 ? (q.current/1000).toFixed(1)+'k' : q.current} / ${q.goal >= 1000 ? (q.goal/1000).toFixed(0)+'k' : q.goal}`}
                       </span>
                    </div>
                    <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-white/5">
                       <motion.div 
                         className="h-full bg-gradient-to-r from-amber-700 to-amber-500"
                         initial={{ width: 0 }}
                         animate={{ width: `${Math.min((q.current / q.goal) * 100, 100)}%` }}
                         transition={{ duration: 1.5, ease: "easeOut" }}
                       />
                    </div>
                  </div>
                ))}
             </div>
          </div>
          
        </div>
      </main>

      {/* Floating Sparkles Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden opacity-50">
        <div className="absolute top-1/4 left-10 w-2 h-2 bg-pink-200 rounded-full animate-ping" />
        <div className="absolute top-3/4 left-1/4 w-3 h-3 bg-yellow-100 rounded-full animate-pulse" />
        <div className="absolute top-1/2 right-20 w-2 h-2 bg-pink-100 rounded-full animate-bounce" />
      </div>
    </div>
  );
}
