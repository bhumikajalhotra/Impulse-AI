import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LinkIcon, Zap, Skull, Heart, Clock, TrendingUp } from 'lucide-react';
import { BentoGrid } from '../components/BentoGrid';
import { AvatarSticker } from '../components/AvatarSticker';
import type { AvatarState } from '../components/AvatarSticker';
import { LoadingScreen } from '../components/LoadingScreen';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface AnalysisResult {
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

interface RecentRoastItem {
  id: string;
  title: string;
  price: string;
  score: number;
  image: string;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [avatarState, setAvatarState] = useState<AvatarState>('neutral');
  
  // Interactive Vibe Selection (Dynamic state that connects to Gemini and MainLayout)
  const [vibe, setVibe] = useState<'Savage' | 'Enabler'>(() => {
    return (localStorage.getItem('impulse_vibe') as 'Savage' | 'Enabler') || 'Savage';
  });

  // Dynamic Recent Roasts state matching the mockup!
  const [recentRoasts, setRecentRoasts] = useState<RecentRoastItem[]>(() => {
    const saved = localStorage.getItem('impulse_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed parsing history from localStorage", e);
      }
    }
    const defaults = [
      {
        id: '1',
        title: 'Sony WH-1000XM5',
        price: '₹29,990',
        score: 73,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&q=80'
      },
      {
        id: '2',
        title: 'Zara Black Dress',
        price: '₹3,590',
        score: 45,
        image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=150&q=80'
      },
      {
        id: '3',
        title: 'boAt Wave Call',
        price: '₹1,699',
        score: 82,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&q=80'
      }
    ];
    localStorage.setItem('impulse_history', JSON.stringify(defaults));
    return defaults;
  });

  // Live dynamic savings synced with localStorage and MainLayout header!
  const [savings, setSavings] = useState(() => {
    const saved = localStorage.getItem('impulse_savings');
    if (!saved) {
      localStorage.setItem('impulse_savings', '2450');
      return 2450;
    }
    return parseFloat(saved) || 2450;
  });

  // Live dynamic aura points synced with localStorage and MainLayout header!
  const [aura, setAura] = useState(() => {
    const saved = localStorage.getItem('impulse_aura');
    if (!saved) {
      localStorage.setItem('impulse_aura', '15000');
      return 15000;
    }
    return parseInt(saved) || 15000;
  });

  // Listen to outer events to keep savings and aura in perfect sync
  React.useEffect(() => {
    const handleSavingsChange = () => {
      const updated = localStorage.getItem('impulse_savings') || '2450';
      setSavings(parseFloat(updated) || 2450);
    };

    const handleVibeChange = () => {
      const updated = localStorage.getItem('impulse_vibe') || 'Savage';
      setVibe(updated as 'Savage' | 'Enabler');
    };

    const handleAuraChange = () => {
      const updated = localStorage.getItem('impulse_aura') || '15000';
      setAura(parseInt(updated) || 15000);
    };

    window.addEventListener('storage', handleSavingsChange);
    window.addEventListener('savingsUpdated', handleSavingsChange);
    window.addEventListener('storage', handleVibeChange);
    window.addEventListener('vibeUpdated', handleVibeChange);
    window.addEventListener('storage', handleAuraChange);
    window.addEventListener('auraUpdated', handleAuraChange);

    return () => {
      window.removeEventListener('storage', handleSavingsChange);
      window.removeEventListener('savingsUpdated', handleSavingsChange);
      window.removeEventListener('storage', handleVibeChange);
      window.removeEventListener('vibeUpdated', handleVibeChange);
      window.removeEventListener('storage', handleAuraChange);
      window.removeEventListener('auraUpdated', handleAuraChange);
    };
  }, []);

  const handleVibeChange = (newVibe: 'Savage' | 'Enabler') => {
    setVibe(newVibe);
    localStorage.setItem('impulse_vibe', newVibe);
    window.dispatchEvent(new Event('vibeUpdated'));
  };

  // Interactive Gen-Z Copium Quotes cycled dynamically!
  const COPIUM_AFFIRMATIONS = [
    "it's basically free if you don't look at your bank account 🙈",
    "copium level: max. abort mission immediately! 🛑",
    "aura points: -9999 if you buy this absolute trash 📉",
    "saving money is my new main character aesthetic 💅",
    "your wallet is screaming, can you hear it? 😭",
    "delusion level: premium subscription active 🎟",
    "iced coffee is a need, this is a literal crime ☕",
    "money comes and goes, but staying rich is forever 💸",
    "you wanted it, but let's be real, you'd forget it in 2 days 🥱",
    "it's not spending if you close the tab bestie! 👩‍💻"
  ];

  const [mascotQuote, setMascotQuote] = useState("Let's see if it's a need or just a want 💬");

  const handleMascotClick = () => {
    const randomIdx = Math.floor(Math.random() * COPIUM_AFFIRMATIONS.length);
    setMascotQuote(COPIUM_AFFIRMATIONS[randomIdx]);
    toast.success('mascot shared some brutal truth! 💅🔥', {
      icon: '💬',
    });
  };

  const handleAnalyze = async (overrideUrl?: string) => {
    const targetUrl = overrideUrl || url;
    if (!targetUrl) {
      toast.error('please enter a product link bestie! 💀');
      return;
    }
    setLoading(true);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: targetUrl, 
          userId: user?.uid,
          vibe: vibe 
        }),
      });

      if (!response.ok) throw new Error('Analysis failed');
      const data = await response.json();
      setResult(data);

      // Map analysis score to avatar expression state
      const scoreTotal = data.score?.total || 70;
      if (scoreTotal >= 80) setAvatarState('shocked');
      else if (scoreTotal >= 60) setAvatarState('disgusted');
      else if (scoreTotal <= 30) setAvatarState('impressed');
      else setAvatarState('neutral');
      
      // Prepend to history dynamically
      const newRoast: RecentRoastItem = {
        id: Date.now().toString(),
        title: data.product?.title || 'mysterious item',
        price: data.product?.price || '₹ Estimated Price',
        score: data.score?.total || 70,
        image: data.product?.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&q=80'
      };

      const updatedHistory = [newRoast, ...recentRoasts.slice(0, 2)];
      setRecentRoasts(updatedHistory);
      localStorage.setItem('impulse_history', JSON.stringify(updatedHistory));

      // Dynamically calculate price & increment savings!
      const priceClean = (data.product?.price || '').replace(/[^0-9]/g, '');
      const itemPrice = parseFloat(priceClean) || 999;
      const newSavingsTotal = savings + itemPrice;
      
      setSavings(newSavingsTotal);
      localStorage.setItem('impulse_savings', newSavingsTotal.toString());
      
      // Award Gen-Z Aura points based on cash saved!
      const auraGained = Math.max(100, Math.round(itemPrice * 0.15));
      const newAuraTotal = aura + auraGained;
      setAura(newAuraTotal);
      localStorage.setItem('impulse_aura', newAuraTotal.toString());
      
      // Dispatch events to update the layout instantly
      window.dispatchEvent(new Event('savingsUpdated'));
      window.dispatchEvent(new Event('auraUpdated'));
      
      toast.success(`reality check complete. +${auraGained} aura points unlocked! 💅✨`);
    } catch {
      toast.error('system overload. try again 💀');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAnalyze();
  };

  const handleTryBrand = (brandUrl: string) => {
    setUrl(brandUrl);
    handleAnalyze(brandUrl);
  };

  const getScoreColorClass = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen bg-black text-white font-sans selection:bg-primary/20 relative">
      <AnimatePresence>
        {loading && <LoadingScreen />}
      </AnimatePresence>

      {/* LEFT CONTENT AREA: Form + Output (takes 73% width) */}
      <div className={`flex-1 p-6 md:p-10 flex flex-col gap-8 overflow-y-auto max-w-[1200px] transition-all duration-500 ${!result && !loading ? 'justify-center min-h-[85vh]' : ''}`}>
        {/* Onboarding Mascot Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-6 bg-[#0B0D11]/40 border border-white/5 p-6 rounded-3xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent pointer-events-none" />
          
          {/* Anime character uncropped premium illustration */}
          <div 
            onClick={handleMascotClick}
            className="relative group shrink-0 cursor-pointer select-none z-10 -ml-2"
          >
            <div className="absolute -inset-2 bg-gradient-to-tr from-[#E2FF00]/10 to-purple-500/10 rounded-full blur-[12px] opacity-70 group-hover:opacity-90 transition-opacity" />
            <AvatarSticker 
              state={avatarState} 
              className="w-32 h-32 md:w-36 md:h-36" 
            />
            {/* Curved cute thought bubble next to her head */}
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              key={mascotQuote}
              className="absolute -top-6 -left-12 bg-black/95 border border-[#E2FF00]/40 text-white text-[9px] font-black px-3 py-2 rounded-2xl shadow-xl w-36 text-center leading-normal shadow-[#E2FF00]/10 hover:scale-105 transition-all"
            >
              {mascotQuote}
              <div className="absolute bottom-[-5px] right-8 w-2 h-2 bg-black border-r border-b border-[#E2FF00]/40 transform rotate-45" />
            </motion.div>
          </div>

          <div className="text-left">
            <h1 className="text-2xl md:text-3xl font-display font-black italic tracking-tight text-white flex items-center gap-2">
              REALITY CHECK INCOMING <span className="text-[#E2FF00]">⚡</span>
            </h1>
            <p className="text-xs text-white/50 font-semibold tracking-wide uppercase mt-1">
              Paste a product link and let AI decide your fate.
            </p>
          </div>
        </motion.div>

        {/* Big Search Input Field */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="w-full relative group"
        >
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative bg-[#07080a] border border-white/5 group-focus-within:border-[#E2FF00]/40 transition-all duration-300 rounded-3xl p-3 flex flex-col sm:flex-row items-center gap-3 shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
              <div className="flex-1 flex items-center w-full px-4">
                <LinkIcon className="w-5 h-5 text-white/30 mr-3" />
                <input 
                  type="url" 
                  required
                  placeholder="Paste any product link (Amazon, Myntra, boAt, etc.)"
                  className="w-full bg-transparent border-none text-white focus:outline-none py-4 text-sm font-black placeholder:text-white/20 uppercase tracking-widest"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full sm:w-auto bg-[#E2FF00] hover:bg-[#d4f000] text-black h-12 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-[0_5px_20px_rgba(226,255,0,0.15)] flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 fill-black" /> {loading ? 'hacking...' : 'Analyze'}
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Quick Brand Links */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center gap-3"
        >
          <span className="text-[9px] font-black uppercase text-white/30 tracking-widest">Try:</span>
          {[
            { name: 'Amazon', url: 'https://www.amazon.in/dp/B0BQRJ84G3' },
            { name: 'Myntra', url: 'https://www.myntra.com/dress/zara-black-dress' },
            { name: 'boAt', url: 'https://www.boat-lifestyle.com/products/wave-call' },
            { name: 'Nike', url: 'https://www.nike.com/t/air-force-1-07' },
            { name: 'Zara', url: 'https://www.zara.com/in/en/dress' }
          ].map((brand) => (
            <button 
              key={brand.name} 
              onClick={() => handleTryBrand(brand.url)} 
              className="px-4 py-2 rounded-xl border border-white/5 bg-[#0B0D11]/40 text-[9px] font-black text-white/50 uppercase tracking-widest hover:border-[#E2FF00]/40 hover:text-white transition-all shadow-sm flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white/20 inline-block" />
              {brand.name}
            </button>
          ))}
        </motion.div>

        {/* RESULTS SECTION (Renders inline below search bar!) */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <BentoGrid result={result} onReset={() => { setResult(null); setUrl(''); setAvatarState('neutral'); }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* RIGHT COLUMN WIDGETS PANEL: Savings + Personality + Recent Roasts (takes 27% width) */}
      <motion.div 
        initial={{ x: 30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-full lg:w-[350px] p-6 md:p-8 flex flex-col gap-6 bg-[#07080a] border-l border-white/5 relative z-10 shadow-[inset_20px_0_40px_rgba(0,0,0,0.2)] shrink-0"
      >
        {/* Widget 1: Money Saved Today */}
        <div className="bg-[#0B0D11]/90 border border-white/5 rounded-3xl p-6 relative overflow-hidden group shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent pointer-events-none" />
          <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.25em] mb-1">Money Saved Today</h4>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-display font-black text-white tracking-tight">₹{savings.toLocaleString()}</span>
            <span className="text-[10px] font-black text-green-400 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +23% from yesterday
            </span>
          </div>

          {/* Premium glowing SVG line chart */}
          <svg className="w-full h-12 mt-4 overflow-visible" viewBox="0 0 100 30">
            <defs>
              <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4ADE80" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#4ADE80" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,25 Q15,22 30,28 T60,12 T90,6 L100,2" fill="none" stroke="#4ADE80" strokeWidth="2.5" className="drop-shadow-[0_0_6px_rgba(74,222,128,0.5)]" />
            <path d="M0,25 Q15,22 30,28 T60,12 T90,6 L100,2 L100,30 L0,30 Z" fill="url(#chart-glow)" />
            <circle cx="100" cy="2" r="2.5" fill="#4ADE80" className="animate-ping" />
            <circle cx="100" cy="2" r="2" fill="#4ADE80" />
          </svg>
        </div>

        {/* Widget 2: AI Personality Vibe Choice */}
        <div className="bg-[#0B0D11]/90 border border-white/5 rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col gap-4">
          <div className="text-left">
            <h4 className="text-xs font-black text-white tracking-wide leading-none">AI Personality</h4>
            <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest mt-1 block">Choose your vibe</span>
          </div>

          <div className="flex flex-col gap-2.5">
            {/* Savage Selector */}
            <button 
              onClick={() => {
                handleVibeChange('Savage');
                toast.success('switched to savage bestie. prepare to cry 💀');
              }}
              title="prepare for emotional damage bestie 💀💅"
              className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all text-left relative overflow-hidden group/sav ${
                vibe === 'Savage' 
                  ? 'border border-[#E2FF00] bg-[#E2FF00]/5 shadow-[0_0_15px_rgba(226,255,0,0.1)]' 
                  : 'border border-white/5 bg-black/40 hover:bg-black/60'
              }`}
            >
              <div className={`p-2.5 rounded-xl ${vibe === 'Savage' ? 'bg-[#E2FF00]/15 text-[#E2FF00]' : 'bg-white/5 text-white/30'}`}>
                <Skull className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-1.5">
                  Savage Mode 
                  {vibe === 'Savage' && <span className="text-[8px] bg-[#E2FF00]/20 text-[#E2FF00] px-1 py-0.2 rounded font-mono animate-pulse">active</span>}
                </span>
                <span className="text-[9px] font-bold text-white/40 group-hover/sav:text-white/70 transition-colors">
                  {vibe === 'Savage' ? 'prepare for emotional damage 💀' : 'Brutal truth only'}
                </span>
              </div>
              {vibe === 'Savage' && (
                <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-[#E2FF00]" />
              )}
            </button>

            {/* Enabler Selector */}
            <button 
              onClick={() => {
                handleVibeChange('Enabler');
                toast.success('switched to enabler bestie. let\'s support delusions! ✨');
              }}
              title="let's validate your poor life choices together ✨💖"
              className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all text-left relative overflow-hidden group/ena ${
                vibe === 'Enabler' 
                  ? 'border border-purple-500 bg-purple-500/5 shadow-[0_0_15px_rgba(168,85,247,0.1)]' 
                  : 'border border-white/5 bg-black/40 hover:bg-black/60'
              }`}
            >
              <div className={`p-2.5 rounded-xl ${vibe === 'Enabler' ? 'bg-purple-500/15 text-purple-400' : 'bg-white/5 text-white/30'}`}>
                <Heart className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-1.5">
                  Enabler Mode
                  {vibe === 'Enabler' && <span className="text-[8px] bg-purple-500/20 text-purple-400 px-1 py-0.2 rounded font-mono animate-pulse">active</span>}
                </span>
                <span className="text-[9px] font-bold text-white/40 group-hover/ena:text-white/70 transition-colors">
                  {vibe === 'Enabler' ? 'let\'s support your delusions ✨' : 'Support your delusions'}
                </span>
              </div>
              {vibe === 'Enabler' && (
                <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-purple-400" />
              )}
            </button>
          </div>
        </div>

        {/* Widget 3: Recent Roasts list */}
        <div className="bg-[#0B0D11]/90 border border-white/5 rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col gap-4 flex-1">
          <div className="text-left pb-1 border-b border-white/5 flex items-center gap-2">
            <Clock className="w-4 h-4 text-white/35" />
            <h4 className="text-xs font-black text-white uppercase tracking-wider leading-none">Recent Roasts</h4>
          </div>

          <div className="flex flex-col gap-3.5 my-2">
            {recentRoasts.map((roast) => (
              <div key={roast.id} className="flex items-center justify-between gap-3 group/item">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-white rounded-xl p-1 flex items-center justify-center shrink-0 border border-white/10 shadow-sm transition-transform group-hover/item:scale-105">
                    <img src={roast.image} alt={roast.title} className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-[10px] font-black text-white leading-tight truncate w-32">{roast.title}</p>
                    <p className="text-[9px] font-bold text-white/30 mt-0.5">{roast.price}</p>
                  </div>
                </div>
                <div className={`text-[10px] font-black tracking-wider uppercase ${getScoreColorClass(roast.score)}`}>
                  {roast.score}/100
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-auto py-3 bg-black/40 border border-white/5 hover:border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all flex items-center justify-center gap-2">
            <Clock className="w-3.5 h-3.5 text-white/30" /> View All History
          </button>
        </div>
      </motion.div>
    </div>
  );
};
