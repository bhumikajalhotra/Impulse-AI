import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LOADING_TEXTS = [
  "Scanning product DNA...",
  "Calculating cost-per-use ratio...",
  "Judging your life choices...",
  "Consulting the girl math council...",
  "Checking your bank account's feelings...",
  "Summoning financial wisdom...",
  "Asking the AI therapist...",
];

export const LoadingScreen: React.FC = () => {
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % LOADING_TEXTS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 relative overflow-hidden">
      {/* Ambient orbs */}
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-[400px] h-[400px] bg-purple-600/30 rounded-full blur-[100px] pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1.3, 1, 1.3], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-[300px] h-[300px] bg-pink-600/30 rounded-full blur-[80px] pointer-events-none"
      />

      {/* Logo pulse */}
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="mb-12 text-5xl font-black tracking-tighter z-10"
      >
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
          Impulse
        </span>
        <span className="text-white">.ai</span>
      </motion.div>

      {/* Spinning ring */}
      <div className="relative w-24 h-24 mb-10 z-10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-pink-500 border-r-purple-500"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-400 border-l-pink-400 opacity-60"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-4 h-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 shadow-[0_0_20px_rgba(236,72,153,0.8)]"
          />
        </div>
      </div>

      {/* Animated text */}
      <div className="h-10 flex items-center justify-center z-10">
        <AnimatePresence mode="wait">
          <motion.p
            key={textIndex}
            initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
            transition={{ duration: 0.4 }}
            className="text-xl font-medium text-gray-300 text-center"
          >
            {LOADING_TEXTS[textIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2 mt-10 z-10">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
            className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
          />
        ))}
      </div>
    </div>
  );
};
