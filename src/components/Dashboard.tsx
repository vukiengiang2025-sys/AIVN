import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Settings, Mic, PenTool, LayoutGrid, Zap, Terminal, Activity, ListTodo, History, Info, Key, X, Cpu, CloudLightning } from 'lucide-react';
import { MagicButton } from './MagicButton';
import { TimelineView } from './TimelineView';
import { TimelineItem } from '../types';
import { summarizeTranscript, generateProfessionalMessage, classifyDocument, getLocalNano } from '../services/aiService';

export default function Dashboard() {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('');
  const [writingInput, setWritingInput] = useState('');
  const [currentView, setCurrentView] = useState<'core' | 'timeline' | 'system' | 'history'>('core');
  const [showSettings, setShowSettings] = useState(false);
  const [customApiKey, setCustomApiKey] = useState('');
  const [isNanoAvailable, setIsNanoAvailable] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkNano = async () => {
      const nano = await getLocalNano();
      setIsNanoAvailable(!!nano);
    };
    checkNano();

    const savedNotes = localStorage.getItem('pocket_secretary_notes');
    const savedKey = localStorage.getItem('pocket_secretary_custom_api_key');
    if (savedKey) setCustomApiKey(savedKey);
    
    if (savedNotes) {
      setItems(JSON.parse(savedNotes));
    } else {
      const initial: TimelineItem[] = [
        {
          id: '1',
          title: 'Ghi chú họp Dự án',
          content: '• Ngày ra mắt: 12/10\n• Ngân sách đã duyệt ($50k)',
          category: 'Tóm tắt',
          timestamp: Date.now() - 120000,
          type: 'note'
        },
        {
          id: '2',
          title: 'Họp với nhóm UI/UX',
          content: 'Thảo luận về việc triển khai giao diện Geometric Balance.',
          category: 'Lịch trình',
          timestamp: Date.now() + 3600000,
          type: 'event'
        }
      ];
      setItems(initial);
      localStorage.setItem('pocket_secretary_notes', JSON.stringify(initial));
    }
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem('pocket_secretary_custom_api_key', customApiKey);
    setShowSettings(false);
    alert('Đã lưu cấu hình!');
  };

  const handleAIAction = async (type: 'summarize' | 'write' | 'classify', input?: string) => {
    setIsProcessing(true);
    setCurrentStatus('Đang khởi tạo Gemini...');

    try {
      if (type === 'summarize') {
        setCurrentStatus('Đang xử lý âm thanh...');
        await new Promise(r => setTimeout(r, 1500));
        const result = await summarizeTranscript("Họp với VinFast lúc 14:00. Thảo luận về việc cung ứng linh kiện.");
        addItem({
          id: Math.random().toString(36).substr(2, 9),
          title: 'Tóm tắt họp: VinFast',
          content: result || '',
          category: 'Tóm tắt',
          timestamp: Date.now(),
          type: 'note'
        });
      } else if (type === 'write') {
        const text = input || prompt("Nhập từ khóa:");
        if (!text) return;
        setCurrentStatus('Đang soạn thảo nội dung...');
        const result = await generateProfessionalMessage(text);
        addItem({
          id: Math.random().toString(36).substr(2, 9),
          title: 'AI Bản thảo: Phản hồi',
          content: result || '',
          category: 'Dự thảo Email',
          timestamp: Date.now(),
          type: 'note'
        });
        setWritingInput('');
      } else if (type === 'classify') {
        const docText = prompt("Dán nội dung cần quét:");
        if (!docText) return;
        setCurrentStatus('Đang quét ngữ cảnh...');
        const category = await classifyDocument(docText);
        addItem({
          id: Math.random().toString(36).substr(2, 9),
          title: 'Quét: ' + category,
          content: docText.substring(0, 50) + '...',
          category: 'Phân loại',
          timestamp: Date.now(),
          type: 'note'
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
      setCurrentStatus('');
    }
  };

  const addItem = (item: TimelineItem) => {
    const updated = [item, ...items].slice(0, 20);
    setItems(updated);
    localStorage.setItem('pocket_secretary_notes', JSON.stringify(updated));
  };

  return (
    <div className="fixed inset-0 bg-[#0A0C10] text-slate-200 font-sans overflow-hidden md:border-8 border-[#1A1D24]">
      {/* Header */}
      <header className="absolute top-0 left-0 w-full h-16 md:h-20 border-b border-slate-800 flex items-center justify-between px-6 md:px-10 bg-[#0A0C10]/80 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
            <Zap className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-sm md:text-xl font-bold tracking-tight text-white uppercase">THƯ KÝ AI</h1>
            <p className="hidden md:block text-[10px] text-cyan-500 font-mono tracking-widest uppercase">Trí tuệ nhân tạo bỏ túi</p>
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[8px] md:text-[10px] text-slate-500 uppercase">Quyền riêng tư</span>
            <span className="text-[10px] md:text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> NGOẠI TUYẾN
            </span>
          </div>
          <button 
            onClick={() => setShowSettings(true)}
            className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-slate-700 flex items-center justify-center hover:bg-slate-800 transition-colors"
          >
            <Settings size={16} />
          </button>
        </div>
      </header>

      {/* Responsive Layout */}
      <main className="mt-16 md:mt-20 h-[calc(100vh-64px)] md:h-[calc(100vh-104px)] flex md:grid md:grid-cols-12 overflow-hidden">
        
        {/* Desktop Left Sidebar (Hidden on Mobile) */}
        <section className="hidden md:flex col-span-3 border-r border-slate-800 p-8 flex-col gap-8">
          <div>
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Activity size={14} /> Chuyển đổi khung hình
            </h3>
            <div className="space-y-2">
              <button 
                onClick={() => setCurrentView('core')}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  currentView === 'core' ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400' : 'text-slate-400 hover:bg-white/5'
                }`}
              >
                <Zap size={18} />
                <span className="text-xs font-medium uppercase tracking-wider">Lõi Ma Thuật</span>
              </button>
              <button 
                onClick={() => setCurrentView('timeline')}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  currentView === 'timeline' ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400' : 'text-slate-400 hover:bg-white/5'
                }`}
              >
                <ListTodo size={18} />
                <span className="text-xs font-medium uppercase tracking-wider">Dòng thời gian</span>
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Terminal size={14} /> Trạng thái lõi
            </h3>
            <div className="glass-card">
              <div className="flex justify-between text-[11px] mb-2 font-mono">
                <span className="text-slate-400 tracking-wider">THỰC THI</span>
                <span className={`${isNanoAvailable ? 'text-emerald-400' : 'text-cyan-400'} uppercase tracking-widest flex items-center gap-1`}>
                   {isNanoAvailable ? <><Cpu size={12}/> CỤC BỘ (NANO)</> : <><CloudLightning size={12}/> ĐÁM MÂY</>}
                </span>
              </div>
              <div className="npu-bar">
                <motion.div initial={{ width: 0 }} animate={{ width: isNanoAvailable ? '100%' : '85%' }} className={`h-full ${isNanoAvailable ? 'bg-emerald-500' : 'bg-cyan-500'}`} />
              </div>
              <p className="mt-2 text-[9px] text-slate-500 italic">
                {isNanoAvailable ? "Dữ liệu không bao giờ rời khỏi thiết bị." : "Tối ưu hóa bằng Gemini Flash Cloud."}
              </p>
            </div>
          </div>
        </section>

        {/* Main Content Area (Full width on mobile, 6/12 on Desktop) */}
        <section className="flex-1 md:col-span-6 bg-slate-900/10 md:border-x border-slate-800 flex flex-col relative overflow-hidden pb-20 md:pb-0">
          <AnimatePresence mode="wait">
            {currentView === 'core' && (
              <motion.div key="core" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
                <MagicButton onAction={handleAIAction} />
                <div className="absolute bottom-24 md:bottom-12 left-6 right-6 md:left-12 md:right-12 z-20">
                  <div className="bg-slate-950/80 border border-slate-700 rounded-2xl p-2 flex shadow-2xl backdrop-blur-md">
                    <input 
                      type="text" 
                      placeholder="Viết một bản nháp..." 
                      className="bg-transparent flex-1 px-4 text-xs md:text-sm outline-none text-white font-sans"
                      value={writingInput}
                      onChange={(e) => setWritingInput(e.target.value)}
                    />
                    <button onClick={() => handleAIAction('write', writingInput)} className="bg-slate-800 px-4 md:px-6 py-2 md:py-3 rounded-xl text-[10px] md:text-xs font-bold hover:bg-slate-700 transition-colors uppercase tracking-widest text-cyan-400">
                      Xử lý
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
            {currentView === 'timeline' && (
              <motion.div key="timeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-hidden">
                <TimelineView items={items} />
              </motion.div>
            )}
            {currentView === 'history' && (
               <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto p-6">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Bản ghi gần đây</h3>
                  <div className="space-y-4">
                     {items.filter(i => i.type === 'note').map(note => (
                        <div key={note.id} className="glass-card">
                           <p className="text-[10px] text-cyan-400 font-mono mb-1">{note.category}</p>
                           <h4 className="text-sm font-bold text-white mb-2">{note.title}</h4>
                           <p className="text-xs text-slate-400 line-clamp-2">{note.content}</p>
                        </div>
                     ))}
                  </div>
               </motion.div>
            )}
            {currentView === 'system' && (
               <motion.div key="system" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col p-8 gap-8">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sức khỏe hệ thống</h3>
                  <div className="space-y-6">
                    <div className="glass-card">
                      <p className="text-[10px] text-slate-500 mb-2">LOẠI LÕI AI</p>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isNanoAvailable ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                          {isNanoAvailable ? <Cpu size={24}/> : <CloudLightning size={24}/>}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{isNanoAvailable ? "GEMINI NANO (ON-DEVICE)" : "GEMINI FLASH (CLOUD)"}</p>
                          <p className="text-[10px] text-slate-500">{isNanoAvailable ? "Tốc độ cực cao, không cần mạng, bảo mật 100%" : "Yêu cầu kết nối mạng để đạt độ chính xác tối đa"}</p>
                        </div>
                      </div>
                    </div>
                    <div className="glass-card">
                      <p className="text-[10px] text-slate-500 mb-2">KHIÊN BẢO MẬT</p>
                      <p className="text-sm text-emerald-400 font-mono">ĐÃ MÃ HÓA {isNanoAvailable ? "& CỤC BỘ" : "& AN TOÀN"}</p>
                    </div>
                  </div>
               </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Desktop Right Sidebar (Hidden on Mobile) */}
        <section className="hidden md:flex col-span-3 p-8 flex-col overflow-y-auto bg-slate-950/20">
          <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><History size={14}/> Bản ghi</h3>
          <div className="space-y-6 flex-1 pr-2">
            {items.filter(i => i.type === 'note').map((note, idx) => (
              <div key={note.id} className={`relative pl-6 border-l-2 ${idx === 0 ? 'border-cyan-500/50' : 'border-slate-800'}`}>
                {idx === 0 && <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,1)]" />}
                <p className={`text-[9px] font-mono mb-1 uppercase tracking-wider ${idx === 0 ? 'text-cyan-400' : 'text-slate-500'}`}>{note.category}</p>
                <h4 className="text-xs font-semibold text-white mb-2">{note.title}</h4>
                <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{note.content}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 flex items-center justify-around px-6 z-40">
        <button onClick={() => setCurrentView('core')} className={`flex flex-col items-center gap-1 ${currentView === 'core' ? 'text-cyan-400' : 'text-slate-600'}`}>
          <Zap size={20} />
          <span className="text-[8px] font-bold uppercase tracking-widest">Ma thuật</span>
        </button>
        <button onClick={() => setCurrentView('timeline')} className={`flex flex-col items-center gap-1 ${currentView === 'timeline' ? 'text-cyan-400' : 'text-slate-600'}`}>
          <ListTodo size={20} />
          <span className="text-[8px] font-bold uppercase tracking-widest">Lịch</span>
        </button>
        <button onClick={() => setCurrentView('history')} className={`flex flex-col items-center gap-1 ${currentView === 'history' ? 'text-cyan-400' : 'text-slate-600'}`}>
          <History size={20} />
          <span className="text-[8px] font-bold uppercase tracking-widest">Bản ghi</span>
        </button>
        <button onClick={() => setCurrentView('system')} className={`flex flex-col items-center gap-1 ${currentView === 'system' ? 'text-cyan-400' : 'text-slate-600'}`}>
          <Info size={20} />
          <span className="text-[8px] font-bold uppercase tracking-widest">Hệ thống</span>
        </button>
      </nav>

      {/* Global Processing HUD */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
            <div className="bg-slate-900 border border-cyan-500/30 p-6 md:p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 md:gap-6 w-full max-w-xs">
              <div className="relative">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin" />
                <Zap size={20} className="text-cyan-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-sm md:text-lg font-bold text-white uppercase tracking-tight">CỐT LÕI AI ĐANG CHẠY</p>
                <p className="text-[10px] md:text-xs text-cyan-400 font-mono tracking-widest mt-1 uppercase">{currentStatus}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                  <Settings size={18} className="text-cyan-400" /> Cấu hình hệ thống
                </h3>
                <button onClick={() => setShowSettings(false)} className="text-slate-500 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 flex items-center gap-2">
                    <Key size={14} className="text-cyan-500" /> Gemini API Key cá nhân
                  </label>
                  <input 
                    type="password"
                    placeholder="Nhập API Key của bạn..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50 transition-colors"
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                  />
                  <p className="mt-3 text-[10px] text-slate-500 leading-relaxed italic">
                    * Lưu ý: Nếu để trống, ứng dụng sẽ sử dụng API Key mặc định của hệ thống. 
                    Mọi xử lý vẫn đảm bảo tính riêng tư.
                  </p>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={handleSaveSettings}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-[0.98]"
                  >
                    LƯU CẤU HÌNH
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
