import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Clock, Settings, LogIn, User, Zap, Coffee } from 'lucide-react';

interface LandingPageProps {
  onAnalyze: (url: string) => void;
  isAuthenticated: boolean;
  onLogin: () => void;
  vibe: string;
  setVibe: (vibe: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onAnalyze, isAuthenticated, onLogin, vibe, setVibe }) => {
  const [url, setUrl] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('impulse_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onAnalyze(url);
    }
  };

  const handleMockLogin = () => {
    setIsLoggingIn(true);
    setTimeout(() => {
      setIsLoggingIn(false);
      onLogin();
    }, 1500);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-4 text-center overflow-hidden">
      {/* Ambient Glow Orbs */}
      <motion.div 
        animate={{ x: [0, 50, 0], y: [0, -50, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"
      />
      <motion.div 
        animate={{ x: [0, -50, 0], y: [0, 50, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] bg-pink-600/20 rounded-full blur-[120px] pointer-events-none"
      />

      {/* Top Bar: Profile & Settings */}
      <div className="absolute top-6 right-6 flex items-center gap-4 z-50">
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full backdrop-blur-md transition-all hover:scale-110"
        >
          <Settings className="w-5 h-5 text-gray-300" />
        </button>

        {isAuthenticated && (
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full pl-2 pr-4 py-1.5 backdrop-blur-md">
            <img 
              src="https://api.dicebear.com/7.x/notionists/svg?seed=Bhumika&backgroundColor=ec4899" 
              alt="Bhumika" 
              className="w-8 h-8 rounded-full border border-pink-500/50"
            />
            <span className="font-medium text-sm text-gray-200">Bhumika</span>
          </div>
        )}
      </div>

      {/* Settings Modal (Vibe Toggle) */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-20 right-6 w-64 bg-[#111]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl z-50 text-left"
          >
            <h3 className="font-bold text-lg mb-4 text-white">AI Personality</h3>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setVibe('Savage')}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${vibe === 'Savage' ? 'bg-pink-500/20 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)]' : 'border-white/5 hover:bg-white/5'}`}
              >
                <Zap className={`w-5 h-5 ${vibe === 'Savage' ? 'text-pink-400' : 'text-gray-400'}`} />
                <div className="text-sm">
                  <p className={`font-bold ${vibe === 'Savage' ? 'text-white' : 'text-gray-400'}`}>Savage</p>
                  <p className="text-gray-500 text-xs">Brutal reality checks</p>
                </div>
              </button>
              
              <button 
                onClick={() => setVibe('Enabler')}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${vibe === 'Enabler' ? 'bg-purple-500/20 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'border-white/5 hover:bg-white/5'}`}
              >
                <Coffee className={`w-5 h-5 ${vibe === 'Enabler' ? 'text-purple-400' : 'text-gray-400'}`} />
                <div className="text-sm">
                  <p className={`font-bold ${vibe === 'Enabler' ? 'text-white' : 'text-gray-400'}`}>Enabler</p>
                  <p className="text-gray-500 text-xs">Toxic shopping bestie</p>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl w-full z-10 mt-12"
      >
        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-6 drop-shadow-2xl">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
            Impulse
          </span>
          .ai
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 mb-12 font-medium">
          Drop the link. We'll tell you if it's a girl math genius move or a financial disaster.
        </p>

        {!isAuthenticated ? (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex justify-center">
            <button 
              onClick={handleMockLogin}
              disabled={isLoggingIn}
              className="group relative px-8 py-4 bg-white text-black font-bold rounded-full text-lg flex items-center gap-3 hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] disabled:opacity-50"
            >
              {isLoggingIn ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              {isLoggingIn ? 'Authenticating...' : 'Continue with Google'}
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="relative group mb-16 max-w-2xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
            <div className="relative flex items-center bg-[#111]/80 backdrop-blur-xl rounded-full p-2 ring-1 ring-white/20 shadow-2xl">
              <div className="pl-6 text-pink-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <input
                type="url"
                required
                placeholder="Paste Amazon, Myntra, or any product link..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-transparent border-none text-white px-4 py-4 focus:outline-none placeholder-gray-500 text-lg rounded-full"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-full px-8 py-4 hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shrink-0"
              >
                Analyze
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        )}

        {/* Persistent Search History */}
        {isAuthenticated && history.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center w-full max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-2 text-gray-400 mb-6 text-sm font-bold uppercase tracking-widest">
              <Clock className="w-4 h-4" />
              <span>Recently Judged</span>
            </div>
            
            {/* Horizontal Scroll List */}
            <div className="flex overflow-x-auto gap-4 pb-4 px-4 w-full snap-x scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
              {history.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => onAnalyze(item.url)}
                  className="flex flex-col items-start gap-3 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-4 min-w-[200px] max-w-[200px] transition-all hover:scale-105 hover:border-white/30 text-left snap-start shadow-xl shrink-0 group"
                >
                  <div className="w-full h-24 bg-white rounded-xl overflow-hidden mb-1 relative">
                    <img 
                      src={item.thumbnail || 'https://image.pollinations.ai/prompt/shopping?nologo=true'} 
                      alt={item.productName} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                  </div>
                  
                  <div className="w-full">
                    <h4 className="font-semibold text-gray-200 truncate w-full text-sm">{item.productName}</h4>
                    <div className="flex justify-between items-center mt-2 w-full">
                      <span className="text-pink-400 font-black text-sm">{item.price}</span>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${item.verdict === 'BUY IT' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                        {item.verdict}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
