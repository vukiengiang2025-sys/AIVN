import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EVOLUTION_LEVELS, ICON_MAP } from '../constants';
import { Trophy } from 'lucide-react';

interface EvolutionChartProps {
  highestLevel: number;
}

const EvolutionChart: React.FC<EvolutionChartProps> = ({ highestLevel }) => {
  return (
    <div className="absolute left-4 top-24 bottom-4 w-16 md:w-48 hidden sm:flex flex-col gap-2 z-10">
      <div className="glass-panel flex flex-col gap-2 overflow-y-auto scrollbar-hide py-3">
        <div className="flex items-center gap-2 px-2 pb-2 border-b border-stone-200">
          <Trophy className="w-5 h-5 text-warm-gold" />
          <span className="text-xs font-bold uppercase tracking-wider hidden md:block">Tiến Hóa</span>
        </div>
        
        {EVOLUTION_LEVELS.sort((a, b) => b.level - a.level).map((level) => {
          const Icon = ICON_MAP[level.icon as keyof typeof ICON_MAP];
          const isReached = highestLevel >= level.level;
          
          return (
            <motion.div
              key={level.level}
              initial={false}
              animate={{
                opacity: isReached ? 1 : 0.4,
                scale: isReached ? 1 : 0.9,
              }}
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                isReached ? 'bg-white/60 shadow-sm' : 'bg-transparent'
              }`}
            >
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center p-1.5 shrink-0"
                style={{ backgroundColor: level.color, border: `2px solid ${level.color}` }}
              >
                <Icon className={`w-full h-full ${isReached ? 'text-stone-800' : 'text-stone-400'}`} />
              </div>
              <div className="hidden md:flex flex-col min-w-0">
                <span className={`text-xs font-semibold truncate ${!isReached && 'text-stone-400'}`}>
                  {level.name}
                </span>
                <span className="text-[10px] text-stone-500">{level.points} pts</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default EvolutionChart;
