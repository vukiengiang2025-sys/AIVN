import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EVOLUTION_LEVELS } from '../constants';
import { Trophy } from 'lucide-react';

interface EvolutionChartProps {
  highestLevel: number;
  customImages: Record<number, string>;
}

const EvolutionChart: React.FC<EvolutionChartProps> = ({ highestLevel, customImages }) => {
  return (
    <div className="flex flex-col w-full h-full z-10 sticky top-24">
      <div className="scroll-bg flex-1 flex flex-col gap-3 overflow-y-auto scrollbar-hide py-6 px-4 rounded-sm border-x-4 border-amber-900/10 shadow-inner">
        <div className="flex flex-col items-center mb-6 pb-4 border-b-2 border-amber-900/10">
          <Trophy className="w-8 h-8 text-amber-700 mb-2 drop-shadow-sm" />
          <h3 className="font-serif-royal font-bold text-amber-900 text-sm tracking-[0.2em] uppercase">Phả Hệ</h3>
          <span className="text-[9px] text-amber-800/60 font-serif italic">Gia Tộc Đế Chế</span>
        </div>
        
        {EVOLUTION_LEVELS.slice().sort((a, b) => b.level - a.level).map((level) => {
          const isReached = highestLevel >= level.level;
          const customImg = customImages[level.level];
          
          return (
            <motion.div
              key={level.level}
              initial={false}
              animate={{
                opacity: isReached ? 1 : 0.3,
                x: isReached ? 0 : -5,
              }}
              className={`flex items-center gap-3 p-3 rounded-md transition-all ${
                isReached ? 'bg-white/40 shadow-sm border border-amber-950/5' : 'bg-transparent'
              }`}
            >
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 border-[#D4AF37] shadow-xl text-xl overflow-hidden bg-black/20"
                style={{ backgroundColor: level.color }}
              >
                {customImg ? (
                  <img src={customImg} alt={level.name} className="w-full h-full object-cover" />
                ) : (
                  level.emoji
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className={`text-[11px] font-serif-royal font-black tracking-tight truncate ${isReached ? 'text-amber-950' : 'text-stone-400'}`}>
                  {level.name}
                </span>
                <p className={`text-[8px] font-serif italic leading-tight mt-0.5 line-clamp-2 ${isReached ? 'text-amber-800' : 'text-stone-300'}`}>
                  {level.lore}
                </p>
                <span className="text-[7px] uppercase font-bold text-amber-900/40 tracking-widest mt-1">Điểm: {level.points}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default EvolutionChart;
