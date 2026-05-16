import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Mail, Sparkles } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  
  const currentSavings = parseFloat(localStorage.getItem('impulse_savings') || '0');

  return (
    <div className="max-w-4xl mx-auto pt-12 px-6 relative selection:bg-primary/30">
      <div className="noise-overlay" />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="bg-surface border border-slate-200 dark:border-white/5 rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-16 opacity-5">
          <Sparkles className="w-64 h-64 text-primary" />
        </div>

        <div className="flex flex-col md:flex-row items-center gap-16 mb-20 relative z-10">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-48 h-48 rounded-[3rem] bg-surface-secondary border border-slate-200 dark:border-white/10 p-1.5 shadow-2xl relative group/avatar"
          >
            <div className="absolute inset-0 bg-primary/10 blur-3xl opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-700" />
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
              alt="avatar"
              className="w-full h-full rounded-[2.5rem] bg-slate-100 dark:bg-black object-cover relative z-10"
            />
          </motion.div>
          
          <div className="text-center md:text-left space-y-6">
            <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter text-foreground lowercase leading-none">
              {user?.displayName || 'impulse user'}
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="px-6 py-2.5 bg-surface-secondary rounded-2xl border border-slate-200 dark:border-white/10 flex items-center gap-3 backdrop-blur-xl">
                <Mail className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{user?.email}</span>
              </div>
              <div className="px-6 py-2.5 bg-surface-secondary rounded-2xl border border-slate-200 dark:border-white/5 flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">gatekeeper elite</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 relative z-10">
          <div className="bg-surface-secondary border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center group/stat">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-4 group-hover/stat:text-primary transition-colors">total wealth saved</p>
            <p className="text-5xl md:text-6xl font-display font-black text-foreground">
              ₹{currentSavings.toLocaleString()}
            </p>
          </div>
          <div className="bg-surface-secondary border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center group/stat">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-4 group-hover/stat:text-secondary transition-colors">roast level</p>
            <p className="text-5xl md:text-6xl font-display font-black text-foreground">savage</p>
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(244, 63, 94, 0.05)' }}
          whileTap={{ scale: 0.98 }}
          onClick={logout}
          className="w-full py-7 bg-surface-secondary text-slate-600 hover:text-rose-500 font-black rounded-[2rem] transition-all flex items-center justify-center gap-4 uppercase tracking-[0.5em] text-[10px] border border-slate-200 dark:border-white/5 hover:border-rose-500/20 group/logout"
        >
          <LogOut className="w-5 h-5 group-hover/logout:-translate-x-1 transition-transform" />
          sign out of impulse.ai
        </motion.button>
      </motion.div>
    </div>
  );
};
