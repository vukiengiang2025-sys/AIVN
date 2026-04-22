import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EVOLUTION_LEVELS } from '../constants';
import { Trophy } from 'lucide-react';

interface EvolutionChartProps {
  highestLevel: number;
}

const EvolutionChart: React.FC<EvolutionChartProps> = ({ highestLevel }) => {
  return (
    <div className="absolute left-6 top-24 bottom-6 w-16 md:w-56 hidden sm:flex flex-col z-10">
      <div className="scroll-bg h-full flex flex-col gap-3 overflow-y-auto scrollbar-hide py-6 px-4 rounded-sm border-x-4 border-amber-900/10 shadow-inner">
        <div className="flex flex-col items-center mb-6 pb-4 border-b-2 border-amber-900/10">
          <Trophy className="w-8 h-8 text-amber-700 mb-2 drop-shadow-sm" />
          <h3 className="font-serif-royal font-bold text-amber-900 text-sm tracking-[0.2em] uppercase hidden md:block">Phả Hệ</h3>
          <span className="text-[9px] text-amber-800/60 font-serif italic hidden md:block">Gia Tộc Đế Chế</span>
        </div>
        
        {EVOLUTION_LEVELS.sort((a, b) => b.level - a.level).map((level) => {
          const isReached = highestLevel >= level.level;
          
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
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 border-[#D4AF37] shadow-xl text-xl"
                style={{ backgroundColor: level.color }}
              >
                {level.emoji}
              </div>
              <div className="hidden md:flex flex-col min-w-0">
                <span className={`text-[11px] font-serif-royal font-black tracking-tight truncate ${isReached ? 'text-amber-950' : 'text-stone-400'}`}>
                  {level.name}
                </span>
                <span className="text-[10px] font-serif italic text-amber-900/60 leading-none">Ưu thế: {level.points}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default EvolutionChart;
