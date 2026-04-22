import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, CheckCircle2, Circle, FileText, ChevronRight } from 'lucide-react';
import { TimelineItem, ItemType } from '../types';

interface TimelineViewProps {
  items: TimelineItem[];
}

export const TimelineView = ({ items }: TimelineViewProps) => {
  const [filterType, setFilterType] = useState<ItemType | 'all'>('all');
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');

  const filteredItems = items
    .filter(item => filterType === 'all' || item.type === filterType)
    .sort((a, b) => b.timestamp - a.timestamp);

  const getTypeIcon = (type: ItemType) => {
    switch (type) {
      case 'note': return <FileText size={16} />;
      case 'event': return <Calendar size={16} />;
      case 'task': return <CheckCircle2 size={16} />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'all': return 'Tất cả';
      case 'note': return 'Ghi chú';
      case 'event': return 'Sự kiện';
      case 'task': return 'Công việc';
      default: return type;
    }
  };

  const getTimeRangeName = (range: string) => {
    switch (range) {
      case 'day': return 'Ngày';
      case 'week': return 'Tuần';
      case 'month': return 'Tháng';
      default: return range;
    }
  };

  const getTypeColor = (type: ItemType) => {
    switch (type) {
      case 'note': return 'text-cyan-400';
      case 'event': return 'text-purple-400';
      case 'task': return 'text-emerald-400';
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900/10 overflow-hidden">
      {/* Timeline Controls - Responsive */}
      <div className="p-4 md:p-6 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between bg-slate-950/20 backdrop-blur-sm gap-4">
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar pb-2 sm:pb-0">
          {(['all', 'note', 'event', 'task'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 md:px-4 py-1.5 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                filterType === type 
                  ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                  : 'bg-slate-800/50 text-slate-500 hover:text-slate-300'
              }`}
            >
              {getTypeName(type)}
            </button>
          ))}
        </div>

        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800 w-full sm:w-auto">
          {(['day', 'week', 'month'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`flex-1 sm:flex-none px-3 md:px-4 py-1.5 rounded-md text-[9px] md:text-[10px] font-bold uppercase tracking-wider transition-all ${
                timeRange === range ? 'bg-slate-800 text-cyan-400' : 'text-slate-500'
              }`}
            >
              {getTimeRangeName(range)}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
        {/* Vertical Line */}
        <div className="absolute left-[31px] md:left-[47px] top-0 bottom-0 w-px bg-slate-800 z-0" />

        <div className="space-y-8 md:space-y-12 relative z-10">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: idx * 0.05 }}
                className="flex gap-4 md:gap-8 group"
              >
                {/* Time Indicator */}
                <div className="w-10 md:w-16 flex flex-col items-end pt-1 shrink-0">
                  <span className="text-[8px] md:text-[10px] font-mono text-slate-500 uppercase">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-[8px] md:text-[10px] font-mono text-slate-600 mt-1 whitespace-nowrap">
                    {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                {/* Node */}
                <div className="relative shrink-0">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center transition-all group-hover:border-cyan-500/50 ${getTypeColor(item.type)}`}>
                    {getTypeIcon(item.type)}
                  </div>
                </div>

                {/* Content Card */}
                <div className="flex-1 min-w-0">
                  <div className="glass-card hover:border-slate-700 transition-colors cursor-pointer group/card relative overflow-hidden p-3 md:p-4">
                    {item.priority === 'high' && (
                      <div className="absolute top-0 left-0 w-1 h-full bg-red-500/50" />
                    )}
                    
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex flex-col min-w-0">
                        <span className={`text-[8px] font-mono uppercase tracking-widest mb-0.5 ${getTypeColor(item.type)}`}>
                          {item.category}
                        </span>
                        <h4 className="text-xs md:text-sm font-semibold text-white truncate pr-2">
                          {item.title}
                        </h4>
                      </div>
                      {item.type === 'task' && (
                        <div className="text-slate-600 shrink-0">
                           {item.isCompleted ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Circle size={16} />}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-[10px] md:text-xs text-slate-400 leading-relaxed line-clamp-2">
                       {item.content}
                    </p>

                    <div className="mt-3 pt-3 border-t border-slate-800/50 flex items-center justify-between">
                       <span className="flex items-center gap-1 text-[8px] md:text-[10px] text-slate-500">
                          <Clock size={10} /> {item.type}
                       </span>
                       <ChevronRight size={12} className="text-slate-700 group-hover/card:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredItems.length === 0 && (
            <div className="text-center py-20">
              <p className="text-slate-500 text-xs font-light italic">No activities found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
