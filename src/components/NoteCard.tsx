import { motion } from 'motion/react';
import { Calendar, FileText, ChevronRight } from 'lucide-react';
import { Note } from '../types';

export const NoteCard = ({ note }: { note: Note }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-5 hover:border-zinc-700 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="text-zinc-100 font-semibold leading-none">{note.title}</h3>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono mt-1 block">
              {note.category}
            </span>
          </div>
        </div>
        <div className="flex items-center text-zinc-500 text-xs">
          <Calendar size={12} className="mr-1" />
          {new Date(note.timestamp).toLocaleDateString()}
        </div>
      </div>
      
      <p className="text-zinc-400 text-sm line-clamp-3 leading-relaxed mb-4">
        {note.content}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50 mt-auto">
        <span className="text-[10px] text-zinc-600 font-mono">ID: {note.id.substring(0, 8)}</span>
        <ChevronRight size={16} className="text-zinc-700 group-hover:translate-x-1 group-hover:text-orange-500 transition-all" />
      </div>
    </motion.div>
  );
};
