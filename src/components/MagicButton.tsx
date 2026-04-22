import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Mic, PenTool, FileSearch } from 'lucide-react';
import { useState } from 'react';

interface MagicButtonProps {
  onAction: (type: 'summarize' | 'write' | 'classify') => void;
}

export const MagicButton = ({ onAction }: MagicButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { id: 'summarize', label: 'Tóm tắt tức thì', icon: Mic },
    { id: 'write', label: 'Soạn thảo thông minh', icon: PenTool },
    { id: 'classify', label: 'Quét ngữ cảnh', icon: FileSearch },
  ] as const;

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative group text-center w-full flex flex-col items-center">
        {/* Decorative Rings - Scaled for mobile */}
        <div className="absolute top-[80px] md:top-1/2 left-1/2 -translate-x-1/2 md:-translate-y-1/2 pointer-events-none">
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-[200px] h-[200px] md:w-[300px] md:h-[300px] border border-cyan-500/10 rounded-full" 
          />
          <motion.div 
            animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160px] h-[160px] md:w-[240px] md:h-[240px] border border-cyan-500/20 rounded-full" 
          />
        </div>

        {/* Central Core */}
        <div className="relative z-10 w-32 h-32 md:w-48 md:h-48 bg-cyan-500/10 rounded-full flex items-center justify-center mt-4">
          <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-2xl animate-pulse" />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="w-28 h-28 md:w-40 md:h-40 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-full shadow-[0_0_30px_rgba(6,182,212,0.4)] flex flex-col items-center justify-center text-white border-2 md:border-4 border-white/20 z-20"
          >
            <Sparkles size={40} className="md:size-64 mb-1 md:mb-2" />
            <span className="text-[8px] md:text-[10px] font-bold tracking-[0.2em] uppercase">AI MAGIC</span>
          </motion.button>
        </div>

        {/* Option Arc - Scrollable on mobile if needed */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-8 md:mt-12 flex flex-col md:flex-row gap-3 w-full max-w-xs md:max-w-none px-4"
            >
              {actions.map((action, idx) => (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => {
                    onAction(action.id);
                    setIsOpen(false);
                  }}
                  className="bg-slate-900 border border-slate-700 px-4 py-3 rounded-2xl flex items-center gap-3 hover:bg-slate-800 hover:border-cyan-500/50 transition-all text-sm group/btn w-full"
                >
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                    <action.icon size={16} />
                  </div>
                  <span className="font-semibold text-slate-300 group-hover/btn:text-white uppercase tracking-widest text-[10px]">{action.label}</span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <h2 className="mt-8 md:mt-8 text-lg md:text-2xl font-light text-slate-300 px-6 italic">Tôi có thể giúp gì cho bạn?</h2>
        <p className="mt-2 text-[10px] md:text-sm text-slate-500 text-center max-w-[280px] md:max-w-sm mx-auto px-4 uppercase tracking-[0.1em]">
          Xử lý cục bộ • Bảo mật tuyệt đối • Riêng tư hoàn hảo.
        </p>
      </div>
    </div>
  );
};
