import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LOADING_TEXTS = [
  "Scanning product DNA...",
  "Calculating cost-per-use ratio...",
  "Judging your life choices...",
  "Consulting the girl math council...",
  "Checking your bank account...",
  "Summoning financial wisdom...",
  "Asking the AI therapist...",
];

export const LoadingScreen: React.FC = () => {
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % LOADING_TEXTS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const SkeletonCard = ({ className = "", delay = 0 }) => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`bg-card/50 border border-border rounded-3xl p-6 overflow-hidden relative shadow-sm ${className}`}
    >
      <motion.div 
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 dark:via-white/5 to-transparent skew-x-12"
      />
      <div className="space-y-4">
        <div className="h-4 bg-black/5 dark:bg-white/5 rounded-full w-2/3" />
        <div className="h-8 bg-black/5 dark:bg-white/5 rounded-2xl w-full" />
        <div className="h-4 bg-black/5 dark:bg-white/5 rounded-full w-1/2" />
      </div>
    </motion.div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col pt-4 overflow-visible">
      {/* Background Glowing Orb */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      
      <div className="flex justify-between items-center mb-8 w-full opacity-50">
        <div className="w-32 h-10 bg-black/5 dark:bg-white/5 rounded-full" />
        <div className="w-40 h-10 bg-black/5 dark:bg-white/5 rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(160px,auto)] z-10 w-full">
        <SkeletonCard className="md:col-span-1 md:row-span-2" delay={0} />
        <motion.div 
          className="md:col-span-2 bg-card/50 border border-border rounded-3xl p-12 flex flex-col items-center justify-center relative overflow-hidden shadow-sm"
        >
          <motion.div 
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 dark:via-white/10 to-transparent skew-x-12"
          />
          <AnimatePresence mode="wait">
            <motion.p
              key={textIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-2xl font-bold text-muted-foreground text-center z-10"
            >
              {LOADING_TEXTS[textIndex]}
            </motion.p>
          </AnimatePresence>
        </motion.div>
        
        <SkeletonCard delay={0.2} />
        <SkeletonCard delay={0.4} />
        <SkeletonCard className="md:col-span-2" delay={0.6} />
        <SkeletonCard delay={0.8} />
      </div>
    </div>
  );
};
