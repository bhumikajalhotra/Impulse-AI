import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, ExternalLink, Zap, Leaf } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const HistoryPage: React.FC = () => {
  const { user } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${apiUrl}/api/history/${user.uid}`);
        const data = await response.json();
        setHistory(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen relative bg-background">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6 relative bg-background">
        <div className="noise-overlay" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface border border-slate-200 dark:border-white/5 rounded-[3rem] p-16 shadow-2xl max-w-lg"
        >
          <div className="w-24 h-24 bg-surface-secondary rounded-3xl flex items-center justify-center mx-auto mb-8 border border-slate-200 dark:border-white/10">
            <Clock className="w-12 h-12 text-slate-400 dark:text-slate-800" />
          </div>
          <h2 className="text-4xl font-display font-black text-foreground mb-4 lowercase">no shame yet.</h2>
          <p className="text-slate-500 text-lg lowercase tracking-tight mb-8">go to the dashboard and let the algorithm analyze your first impulse.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pt-12 px-6 relative selection:bg-primary/30 min-h-screen">
      <div className="noise-overlay" />
      
      <header className="mb-16">
        <div className="inline-flex items-center gap-2 bg-surface px-4 py-2 rounded-full border border-slate-200 dark:border-white/5 text-primary font-black text-[9px] uppercase tracking-[0.4em] mb-6 shadow-2xl">
          <Clock className="w-3 h-3" />
          immutable history
        </div>
        <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter text-foreground lowercase">history of shame.</h1>
        <p className="text-slate-500 mt-4 text-xl font-medium lowercase tracking-tight">your past financial decisions, immortalized in the cloud.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
        {history.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="bg-surface border border-slate-200 dark:border-white/5 rounded-[3rem] overflow-hidden flex flex-col group/card hover:scale-[1.02] transition-all duration-500 shadow-2xl"
          >
            <div className="h-64 bg-slate-50 dark:bg-black relative border-b border-slate-200 dark:border-white/5 p-8 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-1000" />
              {item.product?.image || item.productImage ? (
                <img 
                  src={item.product?.image || item.productImage} 
                  alt={item.product?.title || item.productName} 
                  className="max-h-full object-contain relative z-10 filter drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] group-hover/card:scale-110 transition-transform duration-700" 
                  crossOrigin="anonymous"
                />
              ) : (
                <Zap className="w-12 h-12 text-slate-300 dark:text-slate-900" />
              )}
              <div className="absolute top-6 right-6 z-20">
                <span className={`text-[9px] font-black px-4 py-2 rounded-2xl uppercase border ${
                  (item.product?.verdict || item.verdict)?.toLowerCase().includes('cooked') || (item.product?.verdict || item.verdict)?.toLowerCase().includes('delulu') 
                  ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' 
                  : 'bg-primary/10 text-primary border-primary/20'
                }`}>
                  {item.product?.verdict || item.verdict}
                </span>
              </div>
            </div>
            
            <div className="p-8 flex-1 flex flex-col relative z-10">
              <h3 className="text-xl font-display font-black text-foreground line-clamp-2 mb-3 lowercase leading-tight group-hover/card:text-primary transition-colors">
                {item.product?.title || item.productName}
              </h3>
              <p className="text-3xl font-display font-black text-foreground mb-8">{item.product?.price || item.price}</p>
              
              <div className="mt-auto space-y-4 pt-6 border-t border-slate-200 dark:border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">impulse score</span>
                  <span className="text-lg font-display font-black text-foreground">{item.score?.total || item.impulseScore}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">eco index</span>
                  <div className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-emerald-500" />
                    <span className="text-lg font-display font-black text-emerald-500">{item.score?.eco || item.sustainabilityScore || 0}%</span>
                  </div>
                </div>
                
                <motion.a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-6 flex items-center justify-center gap-3 w-full py-4 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-foreground rounded-2xl transition-all text-[10px] font-black uppercase tracking-[0.3em] border border-slate-200 dark:border-white/5 group/link shadow-sm"
                >
                  view product <ExternalLink className="w-4 h-4 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                </motion.a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
