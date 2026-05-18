import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Share2, Heart, Skull, Check, X, Quote, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { AvatarSticker } from './AvatarSticker';
import type { AvatarState } from './AvatarSticker';

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
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 22, stiffness: 100 } }
};

const getBestieAdvice = (score: number) => {
  if (score >= 90) return 'run, you are cooked 💀';
  if (score >= 70) return 'think twice bestie 😳';
  if (score >= 50) return 'tread carefully 🫣';
  return 'safe zone 💅';
};

const getCategoryDefaults = (category: string) => {
  const cat = (category || 'lifestyle').toLowerCase();
  if (cat.includes('tech') || cat.includes('electronic') || cat.includes('boat')) {
    return { mult: 1.5, copium: 30, type: 'tech investment' };
  }
  if (cat.includes('clothing') || cat.includes('dress') || cat.includes('fashion') || cat.includes('zara')) {
    return { mult: 2.2, copium: 60, type: 'wardrobe essential' };
  }
  return { mult: 1.2, copium: 15, type: 'survival expense' };
};

export const BentoGrid: React.FC<{ result: AnalyzeResult; onReset?: () => void }> = ({ result, onReset }) => {
  const scoreTotal = result.score?.total || 73;
  
  // Dynamic interactive slider states
  const categoryDefaults = getCategoryDefaults(result.product?.category || '');
  const [delusionMultiplier, setDelusionMultiplier] = useState(categoryDefaults.mult);
  const [copiumBoost, setCopiumBoost] = useState(categoryDefaults.copium);
  
  // State-driven avatar expression
  const [avatarState, setAvatarState] = useState<AvatarState>('neutral');
  const timeoutRef = useRef<any>(null);

  // Set initial avatar state based on score
  useEffect(() => {
    if (scoreTotal >= 80) setAvatarState('shocked');
    else if (scoreTotal >= 60) setAvatarState('disgusted');
    else if (scoreTotal <= 30) setAvatarState('impressed');
    else setAvatarState('neutral');
  }, [scoreTotal]);

  // Clean slider defaults when product changes
  useEffect(() => {
    const defaults = getCategoryDefaults(result.product?.category || '');
    setDelusionMultiplier(defaults.mult);
    setCopiumBoost(defaults.copium);
  }, [result]);



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

  // Sticker Stamp text & colors based on score
  const getStampDetails = () => {
    if (scoreTotal >= 80) return { text: 'DROP IT 💀', color: 'text-red-500 border-red-500 shadow-red-500/20' };
    if (scoreTotal >= 60) return { text: 'COOKED 😒', color: 'text-orange-500 border-orange-500 shadow-orange-500/20' };
    if (scoreTotal <= 30) return { text: 'COP IT 💖', color: 'text-green-400 border-green-400 shadow-green-400/20' };
    return { text: 'MID RATING 😐', color: 'text-[#E2FF00] border-[#E2FF00] shadow-[#E2FF00]/20' };
  };

  const stamp = getStampDetails();

  // Slider change handler with thinking micro-animation trigger
  const handleSliderChange = (type: 'mult' | 'copium', val: number) => {
    if (type === 'mult') setDelusionMultiplier(val);
    else setCopiumBoost(val);

    setAvatarState('thinking');

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      // Revert back to proper expression after inactivity
      if (scoreTotal >= 80) setAvatarState('shocked');
      else if (scoreTotal >= 60) setAvatarState('disgusted');
      else if (scoreTotal <= 30) setAvatarState('impressed');
      else setAvatarState('neutral');
    }, 900);
  };

  // Live calculated scores based on sliders
  const liveDelusionRating = Math.min(100, Math.round(scoreTotal * 0.95 * delusionMultiplier));
  const liveAuraPoints = Math.round(scoreTotal * 150 * (1 - copiumBoost / 100));

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full flex flex-col gap-8 font-sans relative z-10 my-6"
    >
      {/* ROW 1: THE FINAL VERDICT STICKER (Illustrative Die-Cut Badge) */}
      <motion.div 
        variants={itemVariants}
        className="bg-[#0D0D0E] border-[6px] border-white rounded-[2.5rem] p-6 md:p-8 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-[12px_12px_0px_rgba(0,0,0,1)] relative overflow-hidden group rotate-[-1deg] transition-all duration-300 hover:rotate-[0deg] hover:scale-[1.01]"
      >
        {/* Background Grid Pattern within sticker */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
        
        {/* Left Section: Sticker Face & Product Info */}
        <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto relative z-10">
          {/* Close-up face of the reactive anime girl */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 bg-black/40 rounded-full border-4 border-white/80 overflow-hidden shrink-0 shadow-inner relative group-hover:scale-105 transition-transform duration-300">
            <AvatarSticker state={avatarState} className="w-full h-full scale-[1.05]" isStickerFace={true} />
          </div>

          <div className="text-center sm:text-left flex-1 min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5">
              <span className="bg-[#E2FF00]/10 border border-[#E2FF00]/30 text-[#E2FF00] text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-wider shadow-sm animate-pulse">
                VERDICT STICKER
              </span>
              <span className="text-[9px] text-white/30 font-bold uppercase tracking-wider">
                {result.product?.category ? 'tech verified partner' : 'stealth guess'}
              </span>
            </div>
            
            <h2 className="text-xl md:text-2xl font-display font-black text-white leading-tight tracking-tight mb-2 truncate max-w-md">
              {result.product?.title || 'Product Title'}
            </h2>
            
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <span className="text-2xl font-display font-black text-[#E2FF00]">{result.product?.price || '₹ Estimated Price'}</span>
              <span className="text-[9px] font-black text-white/40 border border-white/10 px-1.5 py-0.5 rounded uppercase">
                ✓ prime
              </span>
            </div>
          </div>
        </div>

        {/* Aggressive Tilted Graphic Stamp */}
        <div className="absolute top-[45%] left-1/2 lg:left-[55%] transform -translate-x-1/2 -translate-y-1/2 rotate-[-10deg] z-20 pointer-events-none select-none">
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: -10 }}
            transition={{ type: 'spring', damping: 10, delay: 0.3 }}
            className={`font-display font-black text-4xl md:text-5xl tracking-tighter uppercase ${stamp.color} border-[5px] px-6 py-2 rounded-2xl bg-black/95 drop-shadow-[0_10px_25px_rgba(0,0,0,0.9)]`}
          >
            {stamp.text}
          </motion.div>
        </div>

        {/* Right Section: Verdict Score Circular Gauge */}
        <div className="flex items-center gap-6 shrink-0 bg-black/50 border border-white/5 px-6 py-4 rounded-3xl shadow-inner min-w-[220px] justify-center sm:justify-start relative z-10">
          <div className="relative w-18 h-18">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="36" cy="36" r="30" className="stroke-white/[0.03]" strokeWidth="6" fill="transparent" />
              <motion.circle
                cx="36"
                cy="36"
                r="30"
                className={scoreTotal > 60 ? 'stroke-red-500' : 'stroke-[#E2FF00]'}
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 30}
                initial={{ strokeDashoffset: 2 * Math.PI * 30 }}
                animate={{ strokeDashoffset: (2 * Math.PI * 30) - (scoreTotal / 100) * (2 * Math.PI * 30) }}
                transition={{ duration: 1, ease: 'easeOut' }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base font-black text-white leading-none">{scoreTotal}</span>
              <span className="text-[7px] font-bold text-white/30 uppercase tracking-widest mt-0.5">/100</span>
            </div>
          </div>
          <div className="text-left">
            <span className="text-[7px] font-black text-white/20 uppercase tracking-[0.2em] block leading-none mb-1">verdict score</span>
            <span className="text-xs font-black text-white capitalize block leading-tight">{getBestieAdvice(scoreTotal)}</span>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <button 
                onClick={handleShare}
                className="text-[8px] font-black text-[#E2FF00] uppercase tracking-widest hover:underline flex items-center gap-1 leading-none transition-all"
              >
                <Share2 className="w-2.5 h-2.5 text-[#E2FF00]" /> broadcast shame
              </button>
              {onReset && (
                <button 
                  onClick={onReset}
                  className="text-[8px] font-black text-white/40 uppercase tracking-widest hover:text-white flex items-center gap-1 leading-none transition-all border-l border-white/10 pl-2"
                >
                  <RotateCcw className="w-2.5 h-2.5 text-white/40" /> reset check
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ROW 2: DUAL VERDICT COLUMNS (Girl Math Justification vs Savage Reality) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Girl Math Justification Card */}
        <motion.div 
          variants={itemVariants}
          className="bg-[#0B0D11]/90 border border-green-500/10 rounded-3xl p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden group shadow-[0_15px_30px_rgba(0,0,0,0.5)]"
        >
          {/* Flipped Background chibi sticker watermark */}
          <div className="absolute right-2 bottom-0 w-28 h-28 pointer-events-none group-hover:scale-105 transition-transform duration-500 z-0 opacity-70">
            <img src="/mascot.png" alt="Anime Background" className="w-full h-full object-contain filter contrast-115 brightness-105 scale-x-[-1]" />
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

        {/* Savage Reality Check Card */}
        <motion.div 
          variants={itemVariants}
          className="bg-[#0B0D11]/90 border border-purple-500/10 rounded-3xl p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden group shadow-[0_15px_30px_rgba(0,0,0,0.5)]"
        >
          {/* Background chibi sticker watermark */}
          <div className="absolute right-2 bottom-0 w-28 h-28 pointer-events-none group-hover:scale-105 transition-transform duration-500 z-0 opacity-70">
            <img src="/mascot.png" alt="Anime Background" className="w-full h-full object-contain filter contrast-125 saturate-110" />
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

      {/* ROW 3: FOUR-COLUMN BOTTOM INSIGHTS MATRIX (Delusion, Resource, Aura, and Interactive Math) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Column 1: Delusion & Copium Index */}
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
              {liveDelusionRating > 80 ? 'CERTIFIED DELULU 🤡' : 'COPE OK'}
            </span>
          </div>

          <div className="flex flex-col gap-2 relative z-10 flex-1 justify-center">
            <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] block mb-0.5">Delusion Rating</span>
            <span className="text-4xl font-display font-black text-white tracking-tight">
              {liveDelusionRating}
              <span className="text-lg text-[#E2FF00] font-sans font-black ml-1">%</span>
            </span>
            <span className="text-[9px] font-bold text-white/40 leading-relaxed mt-1">
              {liveDelusionRating > 80 ? 'delusion level: premium subscription active.' : 'acceptable cope limit.'}
            </span>
          </div>
        </motion.div>

        {/* Column 2: Starbucks Coffee & Resource Value */}
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

        {/* Column 3: Aura Points Deduction */}
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
            <span className="text-xl font-display font-black text-red-500 tracking-tight uppercase">
              -{liveAuraPoints.toLocaleString()} POINTS
            </span>
            <span className="text-[9px] font-bold text-white/40 leading-relaxed mt-1">
              {memeQuotesList[0]?.toLowerCase() || 'your bank account just flinched.'}
            </span>
          </div>
        </motion.div>

        {/* Column 4: 🧮 INTERACTIVE COPIUM MATH (NEW CARD WITH SLIDERS) */}
        <motion.div 
          variants={itemVariants}
          className="bg-[#0D0D0E]/90 border border-[#E2FF00]/20 rounded-3xl p-6 flex flex-col gap-4 relative overflow-hidden group shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#E2FF00]/5 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between border-b border-white/5 pb-3 relative z-10">
            <div className="flex items-center gap-2 text-[#E2FF00]">
              <span className="text-sm">🧮</span>
              <span className="font-black text-[9px] uppercase tracking-widest leading-none">INTERACTIVE MATH</span>
            </div>
            <span className="bg-[#E2FF00]/10 border border-[#E2FF00]/20 text-[#E2FF00] text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">
              Category: {categoryDefaults.type}
            </span>
          </div>

          <div className="flex flex-col gap-4 relative z-10 flex-1 justify-center text-left">
            {/* Slider 1: Delusion Multiplier */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-[9px] font-black uppercase text-white/40 tracking-wider">
                <span>Delusion Multiplier</span>
                <span className="text-[#E2FF00] font-mono">{delusionMultiplier.toFixed(1)}x</span>
              </div>
              <input 
                type="range" 
                min="1.0" 
                max="3.0" 
                step="0.1" 
                value={delusionMultiplier} 
                onChange={(e) => handleSliderChange('mult', parseFloat(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#E2FF00] outline-none"
              />
            </div>

            {/* Slider 2: Aura Copium Boost */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-[9px] font-black uppercase text-white/40 tracking-wider">
                <span>Aura Copium Boost</span>
                <span className="text-[#E2FF00] font-mono">{copiumBoost}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                step="5" 
                value={copiumBoost} 
                onChange={(e) => handleSliderChange('copium', parseInt(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#E2FF00] outline-none"
              />
            </div>

            <span className="text-[7.5px] font-bold text-white/30 leading-snug uppercase tracking-wider">
              ⚡ Sliding triggers character judgement
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

      {/* ROW 4: Bottom Horizontal Banner Quote */}
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
