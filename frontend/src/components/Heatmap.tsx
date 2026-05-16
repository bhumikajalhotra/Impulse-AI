import React from 'react';
import { motion } from 'framer-motion';

interface HeatmapProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  history: any[];
}

export const Heatmap: React.FC<HeatmapProps> = ({ history }) => {
  // Logic to process history into a calendar grid
  // Since we only have a limited amount of real history in the DB for the MVP, 
  // we'll build a simplified recent 30-day "Heatmap of Regret"

  // 1. Generate last 30 days
  const today = new Date();
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split('T')[0];
  });

  // 2. Count impulses per day
  const impulseCounts: Record<string, number> = {};
  history.forEach(item => {
    if (item.timestamp) {
      // Handle Firestore timestamp or ISO string
      const date = item.timestamp.toDate ? item.timestamp.toDate() : new Date(item.timestamp);
      const dateString = date.toISOString().split('T')[0];
      impulseCounts[dateString] = (impulseCounts[dateString] || 0) + 1;
    }
  });

  const getHeatmapColor = (count: number) => {
    if (count === 0) return 'bg-white/5';
    if (count === 1) return 'bg-primary/30';
    if (count === 2) return 'bg-primary/60';
    if (count >= 3) return 'bg-primary shadow-[0_0_10px_rgba(99,102,241,0.8)]';
    return 'bg-white/5';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-island rounded-[2rem] p-8 relative overflow-hidden shadow-2xl"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
      </div>
      
      <h3 className="text-xl font-display font-black tracking-tighter text-white lowercase">heatmap of regret</h3>
      <p className="text-[10px] text-slate-500 mb-8 font-black uppercase tracking-[0.2em] opacity-60">your impulsive activity over the last 30 days.</p>
      
      <div className="flex gap-2 items-end justify-center sm:justify-start overflow-x-auto pb-2 scrollbar-hide">
        {days.map((day) => {
          const count = impulseCounts[day] || 0;
          return (
            <div key={day} className="flex flex-col items-center gap-2 group relative">
              <motion.div 
                whileHover={{ scale: 1.2, rotate: 5 }}
                className={`w-5 h-5 sm:w-7 sm:h-7 rounded-lg transition-all duration-300 ${getHeatmapColor(count)} cursor-help border border-white/5`}
              />
              {/* Tooltip */}
              <div className="absolute bottom-full mb-3 hidden group-hover:block w-max bg-primary text-white text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-xl shadow-2xl z-10 pointer-events-none lowercase">
                {new Date(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: {count} {count === 1 ? 'urge' : 'urges'}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
