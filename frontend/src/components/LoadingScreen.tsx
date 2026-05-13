import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Cpu, Database, CheckCircle2 } from 'lucide-react';

const PHASES = [
  { icon: Shield,    label: 'Bypassing retailer shields...',    color: 'text-pink-500',   bg: 'bg-pink-500' },
  { icon: Cpu,       label: 'Waiting for page to render...',    color: 'text-purple-500', bg: 'bg-purple-500' },
  { icon: Database,  label: 'Extracting product data...',       color: 'text-blue-500',   bg: 'bg-blue-500' },
  { icon: CheckCircle2, label: 'Running AI analysis...',        color: 'text-emerald-500',bg: 'bg-emerald-500' },
];

// Individual shimmer skeleton card
const SkeletonCard: React.FC<{ className?: string; delay?: number; rows?: number[] }> = ({
  className = '',
  delay = 0,
  rows = [0.6, 1, 0.4],
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className={`relative rounded-3xl border border-border overflow-hidden ${className}`}
    style={{ background: 'var(--card)' }}
  >
    {/* Shimmer sweep */}
    <motion.div
      animate={{ x: ['-110%', '210%'] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: 'linear', delay }}
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.06] dark:via-white/[0.04] to-transparent skew-x-12 z-10 pointer-events-none"
    />
    <div className="p-6 space-y-4">
      {rows.map((w, i) => (
        <div
          key={i}
          className="h-4 rounded-full bg-black/[0.06] dark:bg-white/[0.06]"
          style={{ width: `${w * 100}%` }}
        />
      ))}
      {/* Big block placeholder */}
      <div className="h-16 rounded-2xl bg-black/[0.04] dark:bg-white/[0.04] mt-2" />
    </div>
  </motion.div>
);

// Large verdict skeleton with animated dots
const VerdictSkeleton: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.15, duration: 0.4 }}
    className="md:col-span-2 relative rounded-3xl border border-border overflow-hidden flex flex-col items-center justify-center p-12"
    style={{ background: 'var(--card)' }}
  >
    <motion.div
      animate={{ x: ['-110%', '210%'] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
      className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/[0.06] to-transparent skew-x-12 z-10 pointer-events-none"
    />

    {/* Pulsing dots row */}
    <div className="flex gap-3 mb-6">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.25 }}
          className="w-3 h-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
        />
      ))}
    </div>
    <div className="h-5 rounded-full bg-black/[0.06] dark:bg-white/[0.06] w-48 mb-3" />
    <div className="h-3 rounded-full bg-black/[0.04] dark:bg-white/[0.04] w-32" />
  </motion.div>
);

// Product image skeleton
const ProductSkeleton: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0, duration: 0.4 }}
    className="md:col-span-1 md:row-span-2 relative rounded-3xl border border-border overflow-hidden flex flex-col items-center justify-center p-6"
    style={{ background: 'var(--card)' }}
  >
    <motion.div
      animate={{ x: ['-110%', '210%'] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent skew-x-12 z-10 pointer-events-none"
    />
    {/* Square image placeholder */}
    <div className="w-full aspect-square rounded-2xl bg-black/[0.06] dark:bg-white/[0.06] mb-4 flex items-center justify-center">
      <motion.div
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/30 to-purple-500/30"
      />
    </div>
    <div className="h-4 rounded-full bg-black/[0.06] dark:bg-white/[0.06] w-3/4 mb-2" />
    <div className="h-6 rounded-full bg-black/[0.06] dark:bg-white/[0.06] w-1/2" />
  </motion.div>
);

export const LoadingScreen: React.FC = () => {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const phaseTimer = setInterval(() => {
      setPhaseIndex(prev => (prev + 1) % PHASES.length);
    }, 3000);
    const elapsedTimer = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);
    return () => {
      clearInterval(phaseTimer);
      clearInterval(elapsedTimer);
    };
  }, []);

  const currentPhase = PHASES[phaseIndex];
  const PhaseIcon = currentPhase.icon;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col pt-4 overflow-visible">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Phase status bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8 w-full"
      >
        {/* Left: phase indicator */}
        <div className="flex items-center gap-3 bg-card border border-border rounded-2xl px-5 py-3 shadow-sm">
          {/* Pulsing status dot */}
          <div className="relative flex items-center justify-center w-4 h-4">
            <motion.div
              animate={{ scale: [1, 1.8, 1], opacity: [1, 0, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className={`absolute w-4 h-4 rounded-full ${currentPhase.bg} opacity-30`}
            />
            <div className={`w-2 h-2 rounded-full ${currentPhase.bg}`} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={phaseIndex}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2"
            >
              <PhaseIcon className={`w-4 h-4 ${currentPhase.color}`} />
              <span className={`text-sm font-semibold ${currentPhase.color}`}>
                {currentPhase.label}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: elapsed time + estimate */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium bg-card border border-border rounded-full px-4 py-2 shadow-sm">
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ⏱
          </motion.span>
          <span>{elapsed}s elapsed · ~10–15s total</span>
        </div>
      </motion.div>

      {/* Phase progress dots */}
      <div className="flex items-center gap-2 mb-8 justify-center">
        {PHASES.map((phase, i) => (
          <div key={i} className="flex items-center gap-2">
            <motion.div
              animate={{
                scale: i === phaseIndex ? 1.3 : 1,
                opacity: i <= phaseIndex ? 1 : 0.3,
              }}
              className={`w-2 h-2 rounded-full ${phase.bg}`}
            />
            {i < PHASES.length - 1 && (
              <div className={`w-8 h-[2px] rounded-full transition-all duration-500 ${i < phaseIndex ? phase.bg : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Skeleton Bento Grid — mirrors actual BentoGrid layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(160px,auto)] z-10 w-full">
        {/* Product image skeleton — col-span-1, row-span-2 */}
        <ProductSkeleton />

        {/* Verdict skeleton — col-span-2 */}
        <VerdictSkeleton />

        {/* Girl Math skeleton */}
        <SkeletonCard delay={0.3} rows={[0.4, 0.9, 0.6]} />

        {/* Impulse Score skeleton */}
        <SkeletonCard delay={0.45} rows={[0.5, 0.7]} />

        {/* Eco Score skeleton */}
        <SkeletonCard delay={0.55} rows={[0.4, 0.6]} />

        {/* Wait Time skeleton — col-span-2 */}
        <SkeletonCard
          className="md:col-span-2"
          delay={0.65}
          rows={[0.3, 0.8, 0.5]}
        />

        {/* Reality Check skeleton */}
        <SkeletonCard delay={0.75} rows={[0.5, 1, 0.7, 0.4]} />
      </div>
    </div>
  );
};
