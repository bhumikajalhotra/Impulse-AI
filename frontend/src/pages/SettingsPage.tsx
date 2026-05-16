import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Zap, Coffee, Moon, Laptop, ShieldCheck, Sparkles } from 'lucide-react';
// import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'sonner';

export const SettingsPage: React.FC = () => {
  // const { theme, setTheme } = useTheme();
  
  const [vibe, setVibe] = useState(() => localStorage.getItem('impulse_vibe') || 'Savage');
  const [budget, setBudget] = useState(() => localStorage.getItem('impulse_budget') || '5000');

  const handleSave = () => {
    localStorage.setItem('impulse_vibe', vibe);
    localStorage.setItem('impulse_budget', budget);
    toast.success('configuration synchronized.');
  };

  return (
    <div className="max-w-4xl mx-auto pt-12 px-6 relative selection:bg-primary/30 min-h-screen">
      <div className="noise-overlay" />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full"
      >
        <header className="mb-16">
          <div className="inline-flex items-center gap-2 bg-surface px-4 py-2 rounded-full border border-slate-200 dark:border-white/5 text-primary font-black text-[9px] uppercase tracking-[0.4em] mb-6 shadow-2xl">
            <ShieldCheck className="w-3 h-3" />
            gatekeeper settings
          </div>
          <h1 className="text-6xl md:text-7xl font-display font-black tracking-tighter text-foreground lowercase leading-tight">settings.</h1>
          <p className="text-slate-500 mt-4 text-xl font-medium lowercase tracking-tight">calibrate the algorithm's ruthlessness.</p>
        </header>

        <div className="space-y-10">
          {/* Vibe Selection */}
          <section className="bg-surface border border-slate-200 dark:border-white/5 rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5">
              <Zap className="w-32 h-32 text-primary" />
            </div>
            
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] mb-12 text-slate-500 relative z-10 flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-primary" /> ai personality vibe
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              {['Enabler', 'Middle Child', 'Savage'].map((v) => (
                <motion.button
                  key={v}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setVibe(v)}
                  className={`px-8 py-10 rounded-[2.5rem] text-center transition-all duration-500 flex flex-col items-center gap-4 border ${
                    vibe === v 
                    ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20' 
                    : 'bg-surface-secondary border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 text-slate-500 hover:text-foreground'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${vibe === v ? 'bg-white/20' : 'bg-white/10 dark:bg-white/5'}`}>
                    {v === 'Enabler' && <Coffee className="w-6 h-6" />}
                    {v === 'Middle Child' && <Laptop className="w-6 h-6" />}
                    {v === 'Savage' && <Zap className="w-6 h-6" />}
                  </div>
                  <span className={`text-lg font-black tracking-tight lowercase ${vibe === v ? 'text-white' : 'text-slate-500'}`}>
                    {v}
                  </span>
                </motion.button>
              ))}
            </div>
          </section>

          {/* Budget Setting */}
          <section className="bg-surface border border-slate-200 dark:border-white/5 rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] mb-12 text-slate-500 flex items-center gap-3">
              <Moon className="w-4 h-4 text-secondary" /> monthly patience budget
            </h2>
            
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 w-full">
                <input 
                  type="range" min="1000" max="50000" step="1000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full h-2 bg-slate-200 dark:bg-white/5 rounded-full appearance-none cursor-pointer accent-primary"
                />
              </div>
              <div className="w-full md:w-48 bg-surface-secondary border border-slate-200 dark:border-white/5 rounded-3xl p-6 text-center shadow-sm">
                <span className="text-3xl font-display font-black text-foreground">₹{parseInt(budget).toLocaleString()}</span>
              </div>
            </div>
          </section>

          <motion.button 
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="w-full py-8 bg-primary text-white font-black rounded-[2.5rem] transition-all flex items-center justify-center gap-4 uppercase tracking-[0.5em] text-[10px] shadow-xl shadow-primary/20"
          >
            <Save className="w-5 h-5" />
            save configuration
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
