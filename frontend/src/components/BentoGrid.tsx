import React from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Share2, Heart, Skull, Check, X, Quote } from 'lucide-react';
import { toast } from 'sonner';

interface AnalyzeResult {
  isFallback?: boolean;
  product?: {
    title: string;
    price: string;
    category: string;
    verdict: string;
    image?: string;
  };
  score?: { total: number; eco: number; };
  savageVerdict?: string[];
  girlMathVerdict?: string[];
  moneyComparison?: string[];
  memeQuotes?: string[];
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 25, stiffness: 120 } }
};

// Helper for bestie advice depending on the score
const getBestieAdvice = (score: number) => {
  if (score >= 90) return 'run, you are cooked 💀';
  if (score >= 70) return 'think twice bestie 😳';
  if (score >= 50) return 'tread carefully 🫣';
  return 'safe zone 💅';
};

export const BentoGrid: React.FC<{ result: AnalyzeResult; onReset?: () => void }> = ({ result }) => {
  const scoreTotal = result.score?.total || 73;
  const isBad = scoreTotal > 60;
  
  // SVG Circular Gauge Calculations
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scoreTotal / 100) * circumference;

  const handleShare = async () => {
    const productTitle = result.product?.title || 'this item';
    const message = `impulse.ai just annihilated my ego. i'm officially cooked for wanting ${productTitle}. 💀💸`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'impulse.ai // reality check',
          text: message,
          url: window.location.origin
        });
      } catch {
        // Silent catch
      }
    } else {
      navigator.clipboard.writeText(message);
      toast.success('shame message copied to clipboard ⚡');
    }
  };

  // Safe slice for bullet lists
  const girlMathList = result.girlMathVerdict && result.girlMathVerdict.length > 0 
    ? result.girlMathVerdict 
    : [
        "Noise cancellation = peace of mind = priceless",
        "Perfect for productivity = better career = more money",
        "Premium quality = lasts longer = saves money",
        "You deserve nice things, queen!"
      ];

  const savageList = result.savageVerdict && result.savageVerdict.length > 0
    ? result.savageVerdict
    : [
        "You have working headphones already",
        "That's 3 days of your mess expenses",
        "EMIs are not your friend",
        "Impulse buying won't heal you"
      ];

  const moneyComparisonList = result.moneyComparison && result.moneyComparison.length > 0
    ? result.moneyComparison
    : [
        `This is worth ${Math.round((parseFloat((result.product?.price || '').replace(/[^0-9]/g, '')) || 999) / 350)} Starbucks Iced Lattes ☕`,
        "You could have bought 4 days of groceries 🛒"
      ];

  const memeQuotesList = result.memeQuotes && result.memeQuotes.length > 0
    ? result.memeQuotes
    : [
        "Your bank account just flinched 📉",
        "Therapy is cheaper than this 🤡"
      ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full flex flex-col gap-6 font-sans relative z-10"
    >
      {/* ROW 1: Product card and Circular Verdict Score Gauge */}
      <motion.div 
        variants={itemVariants}
        className="bg-[#0B0D11]/90 border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_15px_40px_rgba(0,0,0,0.5)] relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-50 pointer-events-none" />
        
        {/* Left Side: Product Info */}
        <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
          {/* White backdropped clean product card thumbnail */}
          <div className="w-28 h-28 bg-white rounded-2xl p-2 flex items-center justify-center shrink-0 border border-white/10 shadow-[0_8px_24px_rgba(255,255,255,0.05)] transition-transform group-hover:scale-105 duration-500">
            <img 
              src={result.product?.image || '/mascot.png'} 
              alt={result.product?.title || 'Product Image'} 
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                // Fail-safe default
                e.currentTarget.src = 'https://api.dicebear.com/7.x/bottts/svg?seed=Sony';
              }}
            />
          </div>
          <div className="text-center sm:text-left flex-1 min-w-0">
            <h2 className="text-lg md:text-xl font-black text-white leading-tight tracking-tight mb-2 truncate max-w-md md:max-w-lg">
              {result.product?.title || 'Product Title'}
            </h2>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-2.5">
              <span className="bg-white/5 border border-white/10 text-white/50 text-[9px] font-black uppercase px-2 py-0.5 rounded flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" />
                {result.product?.category || 'lifestyle'}
              </span>
              <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider">
                {result.product?.category ? 'verified partner' : 'stealth guess'}
              </span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <span className="text-xl font-black text-white">{result.product?.price || '₹ Estimated Price'}</span>
              <span className="text-[9px] font-black text-[#E2FF00] bg-[#E2FF00]/10 border border-[#E2FF00]/20 px-1.5 py-0.5 rounded uppercase flex items-center gap-0.5 shadow-[0_0_8px_rgba(226,255,0,0.1)]">
                ✓ prime
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Verdict Score Ring Gauge */}
        <div className="flex items-center gap-6 shrink-0 bg-black/30 border border-white/5 px-6 py-4 rounded-2xl shadow-inner min-w-[200px] justify-center sm:justify-start">
          <div className="relative w-20 h-20">
            {/* Background Circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="stroke-white/[0.03]"
                strokeWidth="7"
                fill="transparent"
              />
              {/* Foreground Segment */}
              <motion.circle
                cx="40"
                cy="40"
                r={radius}
                className={isBad ? 'stroke-red-500' : 'stroke-[#E2FF00]'}
                strokeWidth="7"
                fill="transparent"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: strokeDashoffset }}
                transition={{ duration: 1, ease: 'easeOut' }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-black text-white leading-none">{scoreTotal}</span>
              <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest mt-0.5">/100</span>
            </div>
          </div>
          <div className="text-left">
            <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] block leading-none mb-1">verdict score</span>
            <span className="text-xs font-black text-white capitalize block leading-tight">{getBestieAdvice(scoreTotal)}</span>
            <button 
              onClick={handleShare}
              className="mt-2 text-[8px] font-black text-[#E2FF00] uppercase tracking-widest hover:underline flex items-center gap-1 leading-none transition-all"
            >
              <Share2 className="w-2.5 h-2.5 text-[#E2FF00]" /> broadcast shame
            </button>
          </div>
        </div>
      </motion.div>

      {/* ROW 2: Dual Verdict columns (Girl Math vs Savage) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Girl Math (Enabler) */}
        <motion.div 
          variants={itemVariants}
          className="bg-[#0B0D11]/90 border border-green-500/10 rounded-3xl p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden group shadow-[0_15px_30px_rgba(0,0,0,0.5)]"
        >
          {/* Background Illustration chibi sticker */}
          <div className="absolute right-2 bottom-0 w-28 h-28 pointer-events-none group-hover:scale-110 transition-transform duration-500 z-0">
            <img src="/mascot.png" alt="Anime Background" className="w-full h-full object-contain filter contrast-115 brightness-105 drop-shadow-[-4px_-4px_12px_rgba(0,0,0,0.5)] scale-x-[-1]" />
          </div>

          <div className="flex items-center justify-between border-b border-white/5 pb-4 relative z-10">
            <div className="flex items-center gap-2 text-green-500">
              <Heart className="w-4 h-4 fill-green-500/20" />
              <span className="font-black text-[9px] uppercase tracking-widest leading-none">GIRL MATH JUSTIFICATION</span>
            </div>
            <span className="bg-green-500/10 border border-green-500/20 text-green-500 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">
              ENABLER MODE
            </span>
          </div>

          {/* Bullet Justifications */}
          <ul className="flex flex-col gap-3.5 my-2 relative z-10 flex-1">
            {girlMathList.slice(0, 4).map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-xs text-white/80 font-medium leading-snug">
                <span className="w-4.5 h-4.5 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 text-green-400" />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {/* Bottom Progress details */}
          <div className="pt-4 border-t border-white/5 relative z-10 mt-auto">
            <div className="flex justify-between items-center text-[9px] font-black uppercase text-white/30 tracking-widest mb-2.5">
              <span>Justification Strength</span>
              <span className="text-green-400">85%</span>
            </div>
            <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '85%' }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="h-full bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.5)]"
              />
            </div>
          </div>
        </motion.div>

        {/* Savage Reality Check */}
        <motion.div 
          variants={itemVariants}
          className="bg-[#0B0D11]/90 border border-purple-500/10 rounded-3xl p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden group shadow-[0_15px_30px_rgba(0,0,0,0.5)]"
        >
          {/* Background Illustration chibi sticker */}
          <div className="absolute right-2 bottom-0 w-28 h-28 pointer-events-none group-hover:scale-110 transition-transform duration-500 z-0">
            <img src="/mascot.png" alt="Anime Background" className="w-full h-full object-contain filter contrast-125 saturate-110 drop-shadow-[-4px_-4px_12px_rgba(0,0,0,0.5)]" />
          </div>

          <div className="flex items-center justify-between border-b border-white/5 pb-4 relative z-10">
            <div className="flex items-center gap-2 text-purple-500">
              <Skull className="w-4 h-4" />
              <span className="font-black text-[9px] uppercase tracking-widest leading-none">SAVAGE REALITY CHECK</span>
            </div>
            <span className="bg-purple-500/10 border border-purple-500/20 text-purple-500 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">
              SAVAGE MODE
            </span>
          </div>

          {/* Bullet Justifications */}
          <ul className="flex flex-col gap-3.5 my-2 relative z-10 flex-1">
            {savageList.slice(0, 4).map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-xs text-white/80 font-medium leading-snug">
                <span className="w-4.5 h-4.5 rounded-full bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <X className="w-2.5 h-2.5 text-purple-400" />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {/* Bottom Progress details */}
          <div className="pt-4 border-t border-white/5 relative z-10 mt-auto">
            <div className="flex justify-between items-center text-[9px] font-black uppercase text-white/30 tracking-widest mb-2.5">
              <span>Financial Damage Level</span>
              <span className="text-purple-400">78%</span>
            </div>
            <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '78%' }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="h-full bg-purple-400 rounded-full shadow-[0_0_8px_rgba(192,132,252,0.5)]"
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* ROW 2.5: Bottom Insights Matrix (3 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Delusion & Copium Index */}
        <motion.div 
          variants={itemVariants}
          className="bg-[#0B0D11]/90 border border-[#E2FF00]/10 rounded-3xl p-6 flex flex-col gap-4 relative overflow-hidden group shadow-[0_15px_30px_rgba(0,0,0,0.5)]"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#E2FF00]/5 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between border-b border-white/5 pb-3 relative z-10">
            <div className="flex items-center gap-2 text-[#E2FF00]">
              <span className="text-sm">🔮</span>
              <span className="font-black text-[9px] uppercase tracking-widest leading-none">DELUSION INDEX</span>
            </div>
            <span className="bg-[#E2FF00]/10 border border-[#E2FF00]/25 text-[#E2FF00] text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider leading-none animate-pulse">
              {(scoreTotal * 1.25) > 85 ? 'CERTIFIED DELULU 🤡' : 'COPE OK'}
            </span>
          </div>

          <div className="flex flex-col gap-2 relative z-10 flex-1 justify-center">
            <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] block mb-0.5">Delusion Rating</span>
            <span className="text-4xl font-display font-black text-white tracking-tight">
              {Math.min(100, Math.round(scoreTotal * 0.95))}
              <span className="text-lg text-[#E2FF00] font-sans font-black ml-1">%</span>
            </span>
            <span className="text-[9px] font-bold text-white/40 leading-relaxed mt-1">
              {(scoreTotal * 1.25) > 85 ? 'delusion level: premium subscription active.' : 'acceptable cope limit.'}
            </span>
          </div>
        </motion.div>

        {/* Starbucks Coffee & Resource Value */}
        <motion.div 
          variants={itemVariants}
          className="bg-[#0B0D11]/90 border border-purple-500/10 rounded-3xl p-6 flex flex-col gap-4 relative overflow-hidden group shadow-[0_15px_30px_rgba(0,0,0,0.5)]"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between border-b border-white/5 pb-3 relative z-10">
            <div className="flex items-center gap-2 text-purple-400">
              <span className="text-sm">☕</span>
              <span className="font-black text-[9px] uppercase tracking-widest leading-none">RESOURCE VALUE</span>
            </div>
            <span className="bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">
              VALUE EQUAL
            </span>
          </div>

          <div className="flex flex-col gap-3 relative z-10 flex-1 justify-center">
            <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] block mb-0.5">Iced Coffee Equivalent</span>
            <div className="flex flex-col gap-2">
              {moneyComparisonList.slice(0, 1).map((item, idx) => (
                <div key={idx} className="text-xs font-semibold text-white/80 flex items-start gap-1.5 leading-snug">
                  <span className="text-sm shrink-0">☕</span>
                  <span>{item}</span>
                </div>
              ))}
              <div className="text-[9px] font-bold text-white/40 leading-relaxed">
                you could have bought 7 days of groceries instead.
              </div>
            </div>
          </div>
        </motion.div>

        {/* Aura Points Deduction */}
        <motion.div 
          variants={itemVariants}
          className="bg-[#0B0D11]/90 border border-red-500/10 rounded-3xl p-6 flex flex-col gap-4 relative overflow-hidden group shadow-[0_15px_30px_rgba(0,0,0,0.5)]"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between border-b border-white/5 pb-3 relative z-10">
            <div className="flex items-center gap-2 text-red-400">
              <span className="text-sm">📉</span>
              <span className="font-black text-[9px] uppercase tracking-widest leading-none">AURA DEDUCTION</span>
            </div>
            <span className="bg-red-500/10 border border-red-500/20 text-red-400 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">
              SHAMED
            </span>
          </div>

          <div className="flex flex-col gap-2 relative z-10 flex-1 justify-center">
            <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] block mb-0.5">Wallet Shamed Counter</span>
            <span className="text-2xl font-display font-black text-red-500 tracking-tight uppercase">
              -{(scoreTotal * 150).toLocaleString()} POINTS
            </span>
            <span className="text-[9px] font-bold text-white/40 leading-relaxed mt-1">
              {memeQuotesList[0]?.toLowerCase() || 'your bank account just flinched.'}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Marquee Scrolling Ticker */}
      <motion.div 
        variants={itemVariants}
        className="w-full bg-[#E2FF00] border-y border-black py-3.5 overflow-hidden whitespace-nowrap select-none relative z-10 rounded-2xl shadow-[0_8px_24px_rgba(226,255,0,0.12)]"
      >
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            display: inline-block;
            animation: marquee 25s linear infinite;
          }
        `}</style>
        <div className="animate-marquee uppercase font-display font-black text-[10px] tracking-[0.25em] text-black">
          YOUR BANK ACCOUNT JUST FLINCHED... THE VIBES ARE... CHEAP. ⚡ YOUR BANK ACCOUNT JUST FLINCHED... THE VIBES ARE... CHEAP. ⚡ YOUR BANK ACCOUNT JUST FLINCHED... THE VIBES ARE... CHEAP. ⚡ YOUR BANK ACCOUNT JUST FLINCHED... THE VIBES ARE... CHEAP. ⚡&nbsp;
        </div>
      </motion.div>

      {/* ROW 3: Bottom Horizontal Banner Quote */}
      <motion.div 
        variants={itemVariants}
        className="bg-[#0B0D11]/90 border border-white/5 rounded-3xl p-6 md:p-8 flex items-center gap-6 shadow-[0_15px_40px_rgba(0,0,0,0.5)] relative overflow-hidden group min-h-[100px]"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#E2FF00]/5 to-transparent opacity-30 pointer-events-none" />
        
        {/* Glowing quote icon */}
        <div className="p-3 bg-[#E2FF00]/10 border border-[#E2FF00]/20 rounded-2xl shrink-0 shadow-[0_0_15px_rgba(226,255,0,0.1)]">
          <Quote className="w-5 h-5 text-[#E2FF00] transform rotate-180" />
        </div>
        
        <p className="text-xs md:text-sm text-white/80 font-black italic tracking-wide leading-relaxed relative z-10 flex-1 pr-6">
          "Discipline is choosing between what you want now and what you want most. <span className="text-[#E2FF00] font-black uppercase not-italic tracking-widest ml-1">// impulse.ai</span>"
        </p>

        {/* Mascot premium avatar with crown on the right */}
        <div className="relative shrink-0 hidden sm:block pointer-events-none w-16 h-16 mr-2 z-10">
          <span className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 text-sm animate-bounce drop-shadow-[0_0_8px_rgba(226,255,0,0.8)]">👑</span>
          <img 
            src="/mascot.png" 
            alt="Mascot Avatar" 
            className="w-full h-full object-contain filter contrast-125 saturate-110 drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]" 
          />
        </div>
      </motion.div>
    </motion.div>
  );
};
