import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LOADING_PHRASES = [
  "checking your horoscope to see why you're like this...",
  "asking chatgpt if it's embarrassed for you...",
  "calculating how many days of ramen this costs...",
  "preparing the emotional damage...",
  "finding out if this is giving 'main character' or just 'broke'...",
  "consulting the girl math oracle...",
  "searching for your common sense (result: 404)...",
];

export const SkeletonLoader: React.FC = () => {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center py-20 gap-8">
      {/* Aura Animated Loading Orb */}
      <div className="relative w-40 h-40 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-[2rem] border-t-2 border-l-2 border-primary opacity-80"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-4 rounded-[1.5rem] border-b-2 border-r-2 border-secondary opacity-60"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-16 h-16 bg-primary rounded-full blur-2xl"
        />
      </div>

      {/* Rotating Phrases */}
      <div className="h-8 relative w-full flex justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={phraseIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-primary absolute font-sans"
          >
            {LOADING_PHRASES[phraseIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Skeleton Blocks */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-6 opacity-30">
        <motion.div 
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="col-span-1 md:col-span-4 h-96 glass-island rounded-[2.5rem]"
        />
        <div className="col-span-1 md:col-span-8 flex flex-col gap-6">
          <motion.div 
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            className="h-32 glass-island rounded-[2.5rem]"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 h-full">
             <motion.div 
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
              className="h-full min-h-[200px] glass-island rounded-[2.5rem]"
            />
             <motion.div 
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
              className="h-full min-h-[200px] glass-island rounded-[2.5rem]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
