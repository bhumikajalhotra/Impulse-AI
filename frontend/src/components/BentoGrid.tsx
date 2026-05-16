import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Share2, ArrowLeft, Heart, Skull, Zap, AlertTriangle, Terminal } from 'lucide-react';
import { toast } from 'sonner';

interface AnalyzeResult {
  error?: string;
  message?: string;
  suggestedProductName?: string;
  isManualMode?: boolean;
  originalUrl?: string;
  product?: {
    title: string;
    price: string;
    category: string;
    verdict: string;
    image?: string;
  };
  score?: {
    total: number;
    eco: number;
  };
  savageVerdict?: string[];
  girlMathVerdict?: string[];
  moneyComparison?: string[];
  memeQuotes?: string[];
  mascotMood?: string;
}

// ─── Tilt Card Wrapper (3D - Enhanced) ───
const TiltCard: React.FC<{ children: React.ReactNode; className?: string; variants?: Variants; onClick?: () => void }> = ({ children, className, variants, onClick }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-100, 100], [7, -7]), { stiffness: 400, damping: 40 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-7, 7]), { stiffness: 400, damping: 40 });

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      variants={variants}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className={`relative group ${className}`}
    >
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </motion.div>
  );
};

// Smart fallback image component
const SmartImage: React.FC<{ src?: string | null; alt?: string }> = ({ src, alt }) => {
  const [imgError, setImgError] = useState(false);

  if (!src || imgError) {
    return (
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="w-full aspect-square rounded-[2rem] bg-black/40 border border-white/5 flex flex-col items-center justify-center p-6 shadow-inner backdrop-blur-md"
      >
        <Zap className="w-16 h-16 text-white/10 animate-pulse" />
      </motion.div>
    );
  }

  return (
    <motion.div 
      whileHover={{ scale: 1.02, rotate: [0, -1, 1, 0] }}
      transition={{ duration: 0.5 }}
      className="relative w-full aspect-square rounded-[2rem] overflow-hidden border border-white/5 bg-white/5 p-4 md:p-8 group-hover:border-primary/30 group-hover:bg-primary/5 transition-all shadow-2xl backdrop-blur-md"
    >
      <img
        src={src}
        alt={alt || 'Product'}
        onError={() => setImgError(true)}
        className="w-full h-full object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-transform duration-700 group-hover:scale-105"
        crossOrigin="anonymous"
      />
    </motion.div>
  );
};

// ─── Cinematic Access Denied Screen (Scraper Blocked) ───
const ScraperBlockedCard: React.FC<{
  result: AnalyzeResult;
  onSubmitManual?: (name: string, price: string) => void;
  onReset: () => void;
}> = ({ result, onSubmitManual, onReset }) => {
  const [manualName, setManualName] = useState(result.suggestedProductName || '');
  const [manualPrice, setManualPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualPrice.trim()) return;
    if (onSubmitManual) {
      setIsSubmitting(true);
      onSubmitManual(manualName.trim(), manualPrice.trim());
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-10rem)] flex flex-col xl:flex-row items-center justify-center gap-10 xl:gap-20 relative p-6">
      
      {/* Background Warning Glow */}
      <motion.div 
        animate={{ opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 bg-red-600/10 pointer-events-none mix-blend-color-burn" 
      />
      
      {/* LEFT: Dramatic Mascot */}
      <motion.div 
        initial={{ opacity: 0, x: -100, rotate: -10 }}
        animate={{ opacity: 1, x: 0, rotate: 0 }}
        transition={{ duration: 1, type: "spring" }}
        className="hidden xl:flex w-1/3 flex-col items-center justify-center relative"
      >
        <div className="absolute inset-0 bg-red-500/20 blur-[100px] rounded-full" />
        <img src="/mascot.png" alt="Disappointed Mascot" className="w-[500px] object-contain relative z-10 drop-shadow-[0_0_30px_rgba(239,68,68,0.5)] grayscale contrast-150" />
        
        {/* Sarcastic Bubble */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute top-20 -right-20 bg-black border border-red-500/50 p-6 rounded-[2rem] rounded-bl-none shadow-[0_10px_30px_rgba(239,68,68,0.3)] z-20"
        >
          <p className="text-sm font-black text-red-500 uppercase tracking-widest mb-2">System Message</p>
          <p className="text-lg font-bold text-white italic">"Retailer said no 💀<br/>Guess they’re hiding your bad decisions."</p>
        </motion.div>
      </motion.div>

      {/* CENTER & RIGHT: Elegant Fallback & Form */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-2xl flex flex-col relative z-10"
      >
        <div className="text-center xl:text-left mb-10">
          <Terminal className="w-8 h-8 text-white/50 mx-auto xl:mx-0 mb-6" />
          <h2 className="text-4xl sm:text-5xl font-display font-black text-white mb-4 leading-tight">
            We couldn't fully fetch the product.
          </h2>
          <p className="text-lg text-white/50 uppercase tracking-[0.2em]">Drop details manually and we’ll still judge you.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-black/60 backdrop-blur-2xl border-l-4 border-red-500 p-8 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(239,68,68,0.05)_50%,transparent_75%)] bg-[length:10px_10px]" />
          
          <div className="relative z-10 space-y-6">
            <div>
              <label className="block text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-2">Item Name (Be Honest)</label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="text"
                required
                placeholder="e.g. Useless RGB Keyboard"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                className="w-full bg-black/50 border-b-2 border-white/10 px-4 py-4 text-white focus:outline-none focus:border-red-500 transition-all font-bold placeholder:font-normal placeholder:text-white/20 text-xl"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-2">Price (Damage)</label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="text"
                required
                placeholder="e.g. 5000"
                value={manualPrice}
                onChange={(e) => setManualPrice(e.target.value)}
                className="w-full bg-black/50 border-b-2 border-white/10 px-4 py-4 text-white focus:outline-none focus:border-red-500 transition-all font-bold placeholder:font-normal placeholder:text-white/20 text-xl"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-8">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button" 
                onClick={onReset} 
                className="px-8 py-5 bg-white/5 text-white font-black uppercase text-xs tracking-[0.2em] hover:bg-white/10 transition-colors border border-white/10"
              >
                Retreat
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                disabled={isSubmitting} 
                className="flex-1 bg-gradient-to-r from-red-600 to-red-800 text-white font-black py-5 uppercase tracking-[0.2em] text-sm hover:from-red-500 hover:to-red-700 transition-all shadow-[inset_0_2px_0_rgba(255,255,255,0.2),_0_10px_20px_rgba(239,68,68,0.4)] disabled:opacity-50 relative overflow-hidden group/hack"
              >
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] -translate-x-[150%] group-hover/hack:translate-x-[150%] transition-transform duration-700" />
                {isSubmitting ? 'OVERRIDING...' : 'INITIATE ROAST'}
              </motion.button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ─── Main Dashboard Result (BentoGrid) ───
export const BentoGrid: React.FC<{
  result: AnalyzeResult;
  onReset: () => void;
  onSubmitManual?: (name: string, price: string) => void;
}> = ({ result, onReset, onSubmitManual }) => {
  const [excuse, setExcuse] = useState('');
  const [rebuttal, setRebuttal] = useState('');
  const [isArguing, setIsArguing] = useState(false);

  if (result.error === 'SCRAPER_BLOCKED' || result.product?.verdict === 'TRY AGAIN') {
    return <ScraperBlockedCard result={result} onReset={onReset} onSubmitManual={onSubmitManual} />;
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 25, stiffness: 100 } }
  };

  const handleShare = async () => {
    const shareMessage = `Impulse.ai Reality Check: ${result.product?.title || 'Unknown Item'} - ${result.product?.verdict || 'cooked'}. 💀`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Impulse.ai Roast', text: shareMessage, url: window.location.origin });
      } catch {
        // ignore
      }
    } else {
      await navigator.clipboard.writeText(shareMessage);
      toast.success('ROAST COPIED TO CLIPBOARD ⚡', { style: { background: '#E1FF00', color: '#000' }});
    }
  };

  const handleArgue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!excuse.trim()) return;
    setIsArguing(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/api/argue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ excuse, productContext: result }),
      });
      const data = await response.json();
      setRebuttal(data.rebuttal);
      setExcuse('');
    } catch {
      toast.error('AI IS TOO STUNNED TO SPEAK 💀', { style: { background: '#000', color: '#ff3366', border: '1px solid #ff3366' } });
    } finally {
      setIsArguing(false);
    }
  };

  const safeScore = result.score?.total || 73;
  const title = result.product?.title || result.suggestedProductName || 'Unknown Item';
  const price = result.product?.price || '₹ Unavailable';
  const image = result.product?.image || null;
  const girlMath = result.girlMathVerdict?.[0] || "It's not an expense, it's a lifestyle upgrade ✨";
  const realityCheck = result.savageVerdict?.[0] || "Let's be real bestie. You don't need this 💀";
  const quotes = result.memeQuotes || [];
  const comparisons = result.moneyComparison || [];

  const circumference = 2 * Math.PI * 60;
  const strokeDashoffset = circumference - (safeScore / 100) * (circumference / 2);

  return (
    <div className="relative w-full max-w-[1500px] mx-auto flex flex-col pb-12 px-6 sm:px-10">
      
      {/* Top Nav (Asymmetrical) */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-end mb-10 gap-6 relative z-30"
      >
        <motion.button
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReset}
          className="flex items-center justify-center gap-3 px-4 py-3 bg-transparent rounded-full text-white/50 transition-colors font-black text-xs uppercase tracking-widest border-b border-transparent hover:border-white/20"
        >
          <ArrowLeft className="w-4 h-4" /> Reset Reality
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(225,255,0,0.3)" }}
          whileTap={{ scale: 0.98 }}
          onClick={handleShare}
          className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-primary text-black rounded-xl font-black text-xs uppercase tracking-widest shadow-[0_5px_15px_rgba(225,255,0,0.1)]"
        >
          <Share2 className="w-4 h-4" /> Broadcast Shame
        </motion.button>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col lg:flex-row gap-8 relative"
      >
        {/* ─── LEFT: PRODUCT SHOWCASE ─── */}
        <div className="w-full lg:w-[350px] xl:w-[400px] flex-shrink-0 z-20 lg:sticky lg:top-8 self-start">
          <TiltCard variants={itemVariants} className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 flex flex-col items-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-50" />
            <div className="w-full mb-6 relative">
              <SmartImage src={image} alt={title} />
            </div>
            <div className="text-center w-full">
              <span className="text-[9px] text-primary/70 font-black uppercase tracking-[0.3em] mb-3 block">Target Acquired</span>
              <h2 className="text-xl lg:text-2xl font-display font-black text-white leading-tight mb-4 line-clamp-3">{title}</h2>
              <div className="inline-block px-6 py-3 bg-black/80 rounded-xl border border-white/5 shadow-inner">
                <span className="text-3xl font-display font-black text-primary">{price}</span>
              </div>
            </div>

            {/* Score Meter */}
            <div className="mt-8 w-full bg-white/[0.02] rounded-[1.5rem] border border-white/5 p-6 flex flex-col items-center relative overflow-hidden">
              <span className="text-[9px] text-white/50 font-black uppercase tracking-[0.2em] mb-4 relative z-10">Impulse Level</span>
              <div className="relative w-48 h-24 overflow-hidden flex items-end justify-center z-10">
                <svg className="absolute top-0 w-48 h-48 -rotate-180">
                  <circle cx="96" cy="96" r="60" stroke="rgba(255,255,255,0.05)" strokeWidth="10" fill="transparent" />
                  <motion.circle cx="96" cy="96" r="60" stroke="#E1FF00" strokeWidth="10" fill="transparent"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
                  />
                </svg>
                <div className="absolute bottom-0 flex flex-col items-center">
                  <span className="text-5xl font-display font-black text-white">{safeScore}<span className="text-lg text-white/30">/100</span></span>
                </div>
              </div>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-[10px] font-black text-primary uppercase tracking-widest relative z-10 text-center bg-black/50 px-3 py-1.5 rounded-full"
              >
                {safeScore > 80 ? 'CRITICAL DANGER 🚨' : safeScore > 50 ? 'THINK TWICE 🤨' : 'SAFE TO BUY ✨'}
              </motion.p>
            </div>
          </TiltCard>
        </div>

        {/* ─── RIGHT: AI ANALYSIS CARDS ─── */}
        <div className="flex-1 flex flex-col gap-6 z-10">
          
          {/* Card 1: Savage Reality Check */}
          <TiltCard variants={itemVariants} className="w-full">
            <div className="relative overflow-hidden bg-[#0a0a0a] border border-red-500/20 rounded-[2rem] p-8 lg:p-10 shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="flex flex-col lg:flex-row-reverse gap-8 items-start relative z-10">
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-3 text-red-500">
                    <Skull className="w-5 h-5" />
                    <h3 className="font-black text-[10px] tracking-widest uppercase">Savage Reality</h3>
                  </div>
                  
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-display font-black text-white leading-tight">
                    "{realityCheck}"
                  </p>
                  
                  {comparisons.length > 0 && (
                    <div className="pt-4 space-y-3">
                      {comparisons.map((c, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-red-500/5 rounded-xl border border-red-500/10">
                          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          <span className="text-white/80 font-bold text-sm">{c}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <motion.div 
                  className="w-32 h-32 lg:w-48 lg:h-48 shrink-0 relative order-first lg:order-last"
                >
                  <img src="/mascot.png" alt="Savage Mascot" className="w-full h-full object-contain relative z-10 grayscale brightness-125 drop-shadow-[0_10px_20px_rgba(239,68,68,0.3)] transform -scale-x-100" />
                </motion.div>
              </div>
            </div>
          </TiltCard>

          {/* Card 2: Girl Math Enabler */}
          <TiltCard variants={itemVariants} className="w-full">
            <div className="relative overflow-hidden bg-[#0a0a0a] border border-secondary/20 rounded-[2rem] p-8 lg:p-10 shadow-xl">
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="flex flex-col lg:flex-row gap-8 items-start relative z-10">
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-3 text-secondary">
                    <Heart className="w-5 h-5 fill-secondary" />
                    <h3 className="font-black text-[10px] tracking-widest uppercase">Girl Math Logic</h3>
                  </div>
                  
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-display font-black text-white leading-tight">
                    "{girlMath}"
                  </p>
                  
                  {quotes.length > 0 && (
                    <div className="pt-4 space-y-3">
                      {quotes.map((q, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-secondary/5 rounded-xl border border-secondary/10">
                          <Zap className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                          <span className="text-white/80 font-bold text-sm">{q}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <motion.div 
                  className="w-32 h-32 lg:w-48 lg:h-48 shrink-0 relative order-first lg:order-last"
                >
                  <img src="/mascot.png" alt="Happy Mascot" className="w-full h-full object-contain relative z-10 drop-shadow-[0_10px_20px_rgba(204,255,0,0.2)]" />
                </motion.div>
              </div>
            </div>
          </TiltCard>

          {/* Argue Section (API Re-connected, Cyberpunk styling) */}
          <TiltCard variants={itemVariants} className="w-full">
            <div className="relative overflow-hidden bg-black/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 lg:p-10 shadow-xl">
              <div className="flex items-center gap-4 mb-8 relative z-10">
                <Terminal className="w-6 h-6 text-primary" />
                <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight">Defend Your Aura</h3>
              </div>
              
              <AnimatePresence>
                {rebuttal && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, height: "auto", scale: 1 }} 
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-8 p-6 bg-primary/5 border border-primary/20 rounded-xl relative z-10"
                  >
                    <span className="text-[9px] font-black text-primary/70 uppercase tracking-widest mb-2 block">System Rebuttal</span>
                    <p className="text-lg text-white font-medium italic leading-relaxed">"{rebuttal}"</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleArgue} className="flex flex-col sm:flex-row gap-4 relative z-10">
                <input 
                  type="text" 
                  placeholder="Enter defense argument..." 
                  value={excuse} 
                  onChange={(e) => setExcuse(e.target.value)} 
                  className="flex-1 bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-primary transition-all font-bold placeholder:font-normal placeholder:text-white/30 text-sm" 
                />
                <motion.button 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }} 
                  disabled={isArguing || !excuse.trim()}
                  className="w-full sm:w-auto bg-primary text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs disabled:opacity-50 transition-transform"
                >
                  {isArguing ? 'PROCESSING...' : 'EXECUTE'}
                </motion.button>
              </form>
            </div>
          </TiltCard>

        </div>
      </motion.div>
    </div>
  );
};
