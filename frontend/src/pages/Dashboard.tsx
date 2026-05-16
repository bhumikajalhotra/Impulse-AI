import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Target, Activity, LinkIcon, ArrowRight } from 'lucide-react';
import { BentoGrid } from '../components/BentoGrid';
import { LoadingScreen } from '../components/LoadingScreen';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null);
  const [currentAnalyzeUrl, setCurrentAnalyzeUrl] = useState('');

  const handleAnalyze = async (manualUrl?: string, manualName?: string, manualPrice?: string) => {
    const finalUrl = manualUrl || url;
    if (!finalUrl && !manualName) return;

    setLoading(true);
    setCurrentAnalyzeUrl(finalUrl);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));

      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: finalUrl, 
          userId: user?.uid,
          manualName,
          manualPrice
        }),
      });

      if (!response.ok) throw new Error('Analysis failed');
      
      const data = await response.json();
      setResult(data);
      toast.success('REALITY CHECK COMPLETE ⚡', {
        style: { background: '#E1FF00', color: '#000', border: 'none', fontWeight: 'bold' }
      });
    } catch {
      toast.error('AI IS TOO STUNNED TO SPEAK. TRY AGAIN 💀', {
        style: { background: '#000', color: '#ff3366', border: '1px solid #ff3366' }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAnalyze();
  };

  if (result) return (
    <AnimatePresence mode="wait">
      <motion.div
        key="results"
        initial={{ opacity: 0, filter: "blur(10px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, filter: "blur(10px)" }}
        transition={{ duration: 0.5 }}
        className="h-full"
      >
        <BentoGrid
          result={result}
          onReset={() => setResult(null)}
          onSubmitManual={(name, price) => handleAnalyze(currentAnalyzeUrl, name, price)}
        />
      </motion.div>
    </AnimatePresence>
  );

  const containerVariants: import('framer-motion').Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: import('framer-motion').Variants = {
    hidden: { opacity: 0, y: 50, rotateX: -20 },
    show: { opacity: 1, y: 0, rotateX: 0, transition: { type: "spring", stiffness: 80, damping: 20 } }
  };

  return (
    <div className="flex flex-col xl:flex-row w-full min-h-full text-white font-sans selection:bg-primary/30 relative">
      <AnimatePresence>
        {loading && <LoadingScreen />}
      </AnimatePresence>
      
      {/* ─── Hero Section (Left/Center) ─── */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 relative py-20 xl:py-0 overflow-visible">
        
        {/* Floating Mascot Elements (Asymmetrical, Overlapping) */}
        <motion.div 
          initial={{ opacity: 0, x: -100, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          className="absolute -top-10 -right-20 lg:-right-32 lg:-top-20 w-[400px] h-[400px] md:w-[600px] md:h-[600px] opacity-80 z-0 pointer-events-none drop-shadow-[0_20px_50px_rgba(225,255,0,0.2)]"
        >
          <motion.img 
            animate={{ y: [0, -20, 0], rotate: [0, 2, -2, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            src="/mascot.png" 
            alt="Impulse AI Mascot" 
            className="w-full h-full object-contain" 
          />
        </motion.div>

        {/* Decorative Grid Lines */}
        <div className="absolute left-10 top-0 bottom-0 w-[1px] bg-white/5 pointer-events-none hidden lg:block" />
        <div className="absolute left-[20%] top-0 bottom-0 w-[1px] bg-white/5 pointer-events-none hidden lg:block" />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6 sm:space-y-8 relative z-10 max-w-4xl pt-10 lg:pt-0"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-primary/50 bg-primary/10 text-primary text-xs font-black tracking-[0.3em] uppercase shadow-[0_0_20px_rgba(225,255,0,0.2)] backdrop-blur-md">
            <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <Zap className="w-4 h-4 fill-primary" />
            </motion.div>
            System Online
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-6xl sm:text-7xl md:text-[7rem] lg:text-[8rem] font-display font-black tracking-tighter leading-[0.85] uppercase text-white drop-shadow-2xl relative z-10">
            REALITY CHECK <br/>
            <span className="text-primary glow-text relative inline-block animate-glitch-text mt-2">
              INCOMING.
              <motion.div 
                className="absolute inset-0 bg-primary/20 blur-[30px] -z-10"
                animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-lg sm:text-xl md:text-2xl font-medium text-white/60 max-w-2xl tracking-tight leading-relaxed">
            Paste a product link and let AI decide your fate. <br className="hidden md:block"/>
            Financial ruin or a certified need? <span className="text-white/90 font-bold">Let's find out.</span>
          </motion.p>

          {/* ─── Brutalist Input Bar ─── */}
          <motion.div variants={itemVariants} className="w-full max-w-3xl mt-10 sm:mt-16 relative perspective-1000">
            <form onSubmit={handleSubmit} className="relative flex flex-col sm:flex-row items-center group gap-4 sm:gap-0 z-20">
              <div className="absolute inset-0 bg-primary/30 blur-[50px] opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 pointer-events-none hidden sm:block" />
              
              <div className="relative flex flex-col sm:flex-row items-center w-full bg-black/80 backdrop-blur-3xl border-2 border-white/10 group-focus-within:border-primary transition-all duration-500 rounded-3xl sm:rounded-full overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-3 sm:p-2">
                <div className="pl-6 text-primary hidden sm:block">
                  <LinkIcon className="w-7 h-7" />
                </div>
                <input 
                  type="url" 
                  required
                  placeholder="Paste product link to get roasted..."
                  className="w-full sm:flex-1 bg-transparent border-none text-white focus:outline-none py-5 sm:py-6 px-6 text-lg sm:text-xl font-bold placeholder:text-white/20 placeholder:font-medium text-center sm:text-left rounded-2xl sm:rounded-none bg-white/5 sm:bg-transparent"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <motion.button 
                  whileHover={{ scale: 1.02, backgroundColor: "#fff" }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-primary text-black sm:h-[calc(100%-16px)] sm:absolute right-2 py-5 sm:py-0 px-10 font-black text-sm uppercase tracking-[0.2em] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group/btn rounded-2xl sm:rounded-full shadow-[inset_0_-4px_0_rgba(0,0,0,0.2)]"
                >
                  {loading ? 'HACKING...' : 'GET THE TRUTH'}
                  {!loading && <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />}
                </motion.button>
              </div>
            </form>

            {/* Quick Chips - Asymmetrical layout */}
            <div className="flex flex-wrap gap-3 mt-8 justify-center sm:justify-start pl-0 sm:pl-6 relative z-10">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center mr-2">Or try:</span>
              {['Amazon', 'Myntra', 'boAt', 'Nike', 'Zara'].map((brand, i) => (
                <motion.button 
                  whileHover={{ scale: 1.05, y: -2, borderColor: "rgba(225,255,0,0.5)", color: "#E1FF00", backgroundColor: "rgba(225,255,0,0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + (i * 0.1) }}
                  key={brand} 
                  type="button" 
                  onClick={() => setUrl(`https://www.${brand.toLowerCase()}.com`)} 
                  className="px-5 py-2.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 transition-all text-xs font-black text-white/50 tracking-wider uppercase shadow-lg"
                >
                  {brand}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ─── Right Panel (Stats & Personality - Overlapping & Handcrafted) ─── */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.4, type: "spring" }}
        className="w-full xl:w-[450px] flex flex-col gap-6 xl:gap-8 xl:border-l border-white/5 mt-16 xl:mt-0 px-6 sm:px-12 xl:px-10 py-10 relative z-20 bg-black/20 backdrop-blur-xl"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 pointer-events-none" />
        
        {/* Money Saved Card (Overlapping layout) */}
        <motion.div 
          whileHover={{ scale: 1.02, y: -5 }}
          className="bg-gradient-to-br from-black/80 to-surface/80 border border-primary/20 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-[0_20px_40px_rgba(0,0,0,0.5)] cursor-default transform translate-x-0 xl:-translate-x-12 z-20"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-[50px] -mr-10 -mt-10 group-hover:bg-primary/20 transition-colors duration-700 pointer-events-none" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50 pointer-events-none" />
          
          <div className="flex items-center gap-4 mb-6 text-primary relative z-10">
            <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="font-black text-xs tracking-[0.2em] uppercase">Saved Today</h3>
          </div>
          <p className="text-5xl sm:text-6xl font-black font-display tracking-tighter relative z-10 text-white drop-shadow-md">₹12,450</p>
          <p className="text-sm text-white/50 mt-4 font-medium relative z-10">from 3 aborted impulse buys.</p>
        </motion.div>

        {/* AI Personality Selector */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-accent/5 border border-accent/20 rounded-[2.5rem] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.3)] relative z-10 backdrop-blur-md"
        >
          <div className="flex items-center gap-4 mb-8 text-accent">
            <div className="p-3 bg-accent/10 rounded-xl border border-accent/20">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-black text-xs tracking-[0.2em] uppercase">Current Vibe</h3>
          </div>
          <div className="space-y-4">
            <motion.div 
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-accent/20 to-accent/5 border border-accent/50 text-accent px-6 py-5 rounded-2xl text-xs font-black uppercase tracking-[0.1em] flex justify-between items-center cursor-pointer shadow-[0_10px_20px_rgba(139,92,246,0.2)]"
            >
              <span>Savage Reality Check</span>
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_10px_rgba(139,92,246,0.8)]" 
              />
            </motion.div>
            <motion.div 
              whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
              whileTap={{ scale: 0.98 }}
              className="bg-black/40 border border-white/5 text-white/30 px-6 py-5 rounded-2xl text-xs font-black uppercase tracking-[0.1em] flex justify-between items-center cursor-pointer transition-colors"
            >
              <span>Girl Math Enabler</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Recent Roasts */}
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="flex-1 bg-black/60 border border-white/5 rounded-[2.5rem] p-8 flex flex-col shadow-2xl relative z-0 transform translate-x-0 xl:translate-x-8"
        >
          <h3 className="font-black text-xs tracking-[0.2em] uppercase text-white/40 mb-8 flex items-center gap-4">
            <span className="w-8 h-[1px] bg-white/20" />
            Recent Roasts
          </h3>
          <div className="flex-1 flex flex-col gap-6">
            <motion.div whileHover={{ x: 5 }} className="border-l-4 border-red-500/80 pl-5 py-2 transition-transform cursor-default">
              <p className="text-sm text-white/80 font-medium leading-relaxed italic">"You don't need another mechanical keyboard. Your typing speed is still 40WPM."</p>
              <p className="text-[10px] text-red-400 mt-3 uppercase tracking-widest font-black">Keychron K2 • ₹8,999</p>
            </motion.div>
            <motion.div whileHover={{ x: 5 }} className="border-l-4 border-primary/80 pl-5 py-2 transition-transform cursor-default">
              <p className="text-sm text-white/80 font-medium leading-relaxed italic">"It's an investment in your mental health. Girl math approved."</p>
              <p className="text-[10px] text-primary/70 mt-3 uppercase tracking-widest font-black">Matcha Set • ₹2,499</p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

    </div>
  );
};
