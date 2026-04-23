import React from 'react';
import { EVOLUTION_LEVELS } from '../constants';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BallCustomizerProps {
  customImages: Record<number, string>;
  onUpdateImage: (level: number, imageUrl: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const BallCustomizer: React.FC<BallCustomizerProps> = ({ customImages, onUpdateImage, isOpen, onClose }) => {
  const handleFileChange = (level: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateImage(level, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="oriental-frame bg-[#1a0f0a] w-full max-w-2xl max-h-[80vh] flex flex-col p-6 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6 border-b border-amber-900/30 pb-4">
              <div className="flex items-center gap-3">
                <ImageIcon className="text-amber-500 w-6 h-6" />
                <h2 className="text-2xl font-serif-royal font-black text-white tracking-widest">TÙY CHỈNH HÌNH ẢNH</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-stone-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar grid grid-cols-1 md:grid-cols-2 gap-4">
              {EVOLUTION_LEVELS.map((level) => (
                <div 
                  key={level.level}
                  className="bg-stone-900/50 rounded-xl p-4 border border-amber-900/20 flex items-center gap-4 group hover:border-amber-600/50 transition-all shadow-inner"
                >
                  <div className="relative">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-[#D4AF37] shadow-lg  overflow-hidden bg-black/40"
                    >
                      {customImages[level.level] ? (
                        <img src={customImages[level.level]} alt={level.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">{level.emoji}</span>
                      )}
                    </div>
                    {customImages[level.level] && (
                      <button 
                        onClick={() => onUpdateImage(level.level, '')}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif-royal font-bold text-amber-100 text-sm">{level.name}</h4>
                    <p className="text-[10px] text-stone-500 mb-2">Cấp độ {level.level}</p>
                    <label className="cursor-pointer flex items-center gap-2 px-3 py-1.5 bg-amber-900/30 hover:bg-amber-900/50 border border-amber-600/30 rounded-lg text-[10px] text-amber-200 font-bold transition-all w-fit">
                      <Upload className="w-3 h-3" />
                      TẢI ẢNH LÊN
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={(e) => handleFileChange(level.level, e)} 
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={onClose}
              className="mt-6 w-full py-4 bg-gradient-to-br from-amber-600 to-amber-900 text-white font-serif-royal font-black tracking-widest rounded-xl shadow-2xl active:scale-95 transition-all border border-amber-500/50"
            >
              HOÀN TẤT
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BallCustomizer;
