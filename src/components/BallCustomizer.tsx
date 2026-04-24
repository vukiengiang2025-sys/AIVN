import React, { useState, useCallback } from 'react';
import { EVOLUTION_LEVELS } from '../constants';
import { Upload, X, Image as ImageIcon, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Cropper from 'react-easy-crop'
import type { Point, Area } from 'react-easy-crop'

interface BallCustomizerProps {
  customImages: Record<number, string>;
  onUpdateImage: (level: number, imageUrl: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const BallCustomizer: React.FC<BallCustomizerProps> = ({ customImages, onUpdateImage, isOpen, onClose }) => {
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [activeLevel, setActiveLevel] = useState<number | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      if (!url.startsWith('data:')) {
        image.setAttribute('crossOrigin', 'anonymous');
      }
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: Area): Promise<string | null> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) return resolve(null);
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => resolve(reader.result as string);
      }, 'image/jpeg');
    });
  };

  const handleFileChange = (level: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
        setActiveLevel(level);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCrop = async () => {
    if (imageToCrop && croppedAreaPixels && activeLevel !== null) {
      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
      if (croppedImage) {
        onUpdateImage(activeLevel, croppedImage);
      }
      setImageToCrop(null);
      setActiveLevel(null);
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
                      {(customImages[level.level] && customImages[level.level] !== "") ? (
                        <img src={customImages[level.level] || undefined} alt={level.name} className="w-full h-full object-cover" />
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
                        onClick={(e) => (e.currentTarget.value = '')}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>

            {/* Cropping Modal */}
            <AnimatePresence>
              {imageToCrop && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-black/90 p-4"
                >
                  <div className="relative w-full max-w-lg aspect-square bg-stone-900 rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-900/40">
                    <Cropper
                      image={imageToCrop}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      cropShape="round"
                      onCropChange={setCrop}
                      onCropComplete={onCropComplete}
                      onZoomChange={setZoom}
                    />
                  </div>
                  
                  <div className="mt-8 flex flex-col items-center gap-6 w-full max-w-lg">
                    <div className="w-full flex flex-col gap-2">
                       <span className="text-[10px] text-amber-500 font-black uppercase tracking-widest text-center">Phóng to / Thu nhỏ</span>
                       <input
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        aria-labelledby="Zoom"
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>

                    <div className="flex gap-4 w-full">
                      <button
                        onClick={() => {
                          setImageToCrop(null);
                          setActiveLevel(null);
                        }}
                        className="flex-1 py-4 bg-stone-800 text-stone-300 font-serif-royal font-bold rounded-xl active:scale-95 transition-all border border-stone-700"
                      >
                        HỦY
                      </button>
                      <button
                        onClick={handleSaveCrop}
                        className="flex-2 py-4 bg-gradient-to-r from-amber-500 to-amber-700 text-white font-serif-royal font-black tracking-widest rounded-xl shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all border border-amber-400/30"
                      >
                        <Check className="w-5 h-5" />
                        XÁC NHẬN CẮT
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
