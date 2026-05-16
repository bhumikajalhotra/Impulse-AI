import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TERMINAL_LOGS = [
  "[SYS] Initializing financial reality engine...",
  "[NET] Bypassing retailer copium filters...",
  "[AI] Analyzing emotional damage vectors...",
  "[DB] Cross-referencing previous bad decisions...",
  "[CALC] Computing iced coffee equivalents...",
  "[SYS] Loading girl math algorithms...",
  "[AI] Preparing ruthless verdict...",
  "[WARN] Wallet life support critical..."
];

export const LoadingScreen: React.FC = () => {
  const [logIndex, setLogIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setLogIndex((prev) => (prev < TERMINAL_LOGS.length - 1 ? prev + 1 : prev));
    }, 800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md overflow-hidden font-sans">
      <div className="noise-overlay" />
      <div className="scanlines" />
      <div className="grid-bg opacity-20" />
      
      {/* Dramatic Cinematic Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
      
      <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-3xl px-8 w-full">
        
        {/* Animated Mascot Scanning Effect */}
        <div className="relative mb-12">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-48 h-48 md:w-64 md:h-64 relative z-10"
          >
            <img src="/mascot.png" alt="Loading Mascot" className="w-full h-full object-contain filter drop-shadow-[0_0_40px_rgba(225,255,0,0.4)] grayscale contrast-125" />
          </motion.div>
          {/* Scanner Line */}
          <motion.div 
            className="absolute top-0 left-0 w-full h-[2px] bg-primary shadow-[0_0_20px_rgba(225,255,0,1)] z-20"
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Brutalist Terminal Box */}
        <div className="w-full bg-black/80 border border-white/10 rounded-2xl p-6 text-left shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden h-48 flex flex-col justify-end">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
          <div className="absolute top-3 left-4 flex gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500/50" />
            <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
            <div className="w-2 h-2 rounded-full bg-green-500/50" />
          </div>
          
          <div className="flex flex-col gap-2 mt-6 overflow-hidden">
            <AnimatePresence>
              {TERMINAL_LOGS.slice(0, logIndex + 1).map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`text-xs md:text-sm font-mono font-bold tracking-wider ${i === logIndex ? 'text-primary drop-shadow-[0_0_5px_rgba(225,255,0,0.8)]' : 'text-white/30'}`}
                >
                  {log}
                  {i === logIndex && (
                    <motion.span 
                      animate={{ opacity: [1, 0, 1] }} 
                      transition={{ duration: 0.8, repeat: Infinity }}
                    >
                      _
                    </motion.span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Brutalist Progress Bar */}
        <div className="w-full mt-8 relative">
          <div className="h-1 w-full bg-white/5 overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              animate={{ width: ["0%", "100%"] }}
              transition={{ duration: Math.max(1, (logIndex / TERMINAL_LOGS.length) * 4), ease: "linear" }}
            />
          </div>
        </div>

      </div>
    </div>
  );
};
