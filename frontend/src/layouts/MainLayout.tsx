import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, History, Skull, Heart, Settings, BarChart2, Zap, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [headerSavings, setHeaderSavings] = React.useState(() => {
    const saved = localStorage.getItem('impulse_savings');
    if (!saved) {
      localStorage.setItem('impulse_savings', '2450');
      return 2450;
    }
    return parseFloat(saved) || 2450;
  });

  const [headerVibe, setHeaderVibe] = React.useState(() => {
    return localStorage.getItem('impulse_vibe') || 'Savage';
  });

  const [headerAura, setHeaderAura] = React.useState(() => {
    const saved = localStorage.getItem('impulse_aura');
    if (!saved) {
      localStorage.setItem('impulse_aura', '15000');
      return 15000;
    }
    return parseInt(saved) || 15000;
  });

  React.useEffect(() => {
    const handleSavingsChange = () => {
      const updated = localStorage.getItem('impulse_savings') || '2450';
      setHeaderSavings(parseFloat(updated) || 2450);
    };

    const handleVibeChange = () => {
      const updated = localStorage.getItem('impulse_vibe') || 'Savage';
      setHeaderVibe(updated);
    };

    const handleAuraChange = () => {
      const updated = localStorage.getItem('impulse_aura') || '15000';
      setHeaderAura(parseInt(updated) || 15000);
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

  const NAV_ITEMS = [
    { name: 'Reality Check', path: '/dashboard', icon: ShieldAlert },
    { name: 'History', path: '/history', icon: History },
    { name: 'Personality', path: '/profile', icon: Skull, badge: 'NEW' },
    { name: 'Stats', path: '/stats', icon: BarChart2 },
    { name: 'Roast Wall', path: '/roast-wall', icon: Zap },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden relative font-sans selection:bg-primary/30 dark">
      {/* Background Systems */}
      <div className="vignette" />
      <div className="scanlines" />
      <div className="grid-bg opacity-30" />
      
      {/* Cinematic Lighting Backgrounds */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[200px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
      <div className="absolute top-[40%] right-[30%] w-[20%] h-[20%] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
      
      {/* Noise Overlay */}
      <div className="noise-overlay" />
      
      {/* Left Sidebar (Luxury Gaming Launcher Style) */}
      <aside className="w-24 md:w-80 m-4 lg:m-6 bg-[#07080a] border border-white/5 flex-col hidden md:flex z-20 shadow-[20px_0_40px_rgba(0,0,0,0.5)] transition-all duration-700 overflow-hidden relative rounded-3xl group/sidebar">
        {/* Inner glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
        
        {/* Brand */}
        <div className="px-8 pt-10 pb-6 flex flex-col items-start relative z-10 w-full">
          <div className="flex items-center gap-1">
            <span className="text-3xl font-display font-black tracking-[-0.06em] text-white">
              impulse<span className="text-[#E2FF00]">.ai</span>
            </span>
          </div>
          <div className="mt-2 text-left">
            <p className="text-[10px] text-white/40 font-medium leading-tight">
              your bank account's
            </p>
            <p className="text-[10px] text-[#E2FF00] font-black leading-tight uppercase tracking-wider">
              aggressively honest
            </p>
            <p className="text-[10px] text-white/40 font-medium leading-tight">
              best friend.
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-6 space-y-2 mt-4 relative z-10 w-full">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all font-black text-[10px] tracking-widest group relative overflow-hidden",
                  isActive 
                    ? "text-black shadow-[0_10px_30px_rgba(225,255,0,0.15)] font-black" 
                    : "text-white/40 hover:text-white"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active Indicator & Background */}
                  {isActive && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute inset-0 bg-[#E2FF00] z-0 rounded-2xl"
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}
                  {isActive && (
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] -translate-x-[150%] animate-[shimmer_2s_infinite] z-0" />
                  )}
                  
                  {/* Hover Background */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-white/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 z-0" />
                  )}
 
                  <item.icon className={cn("w-4.5 h-4.5 relative z-10 transition-transform duration-500", isActive ? "text-black" : "group-hover:scale-110")} />
                  <span className="uppercase relative z-10">{item.name}</span>

                  {item.badge && (
                    <span className="ml-auto bg-[#E2FF00] text-black text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider relative z-10 shadow-[0_0_8px_rgba(225,255,0,0.4)]">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom CTA & Profile Signature */}
        <div className="p-6 relative z-10 flex flex-col gap-4 mt-auto w-full">
          {/* Share Box */}
          <div className="bg-[#0B0D11]/60 border border-purple-500/10 rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden group/share shadow-[inset_0_2px_8px_rgba(255,255,255,0.02)]">
            <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-purple-500/5 rounded-full blur-xl group-hover/share:scale-150 transition-transform duration-700" />
            <h4 className="text-xs font-black text-white leading-none">Share your shame 😈</h4>
            <p className="text-[9px] text-white/40 leading-normal font-medium">Roast your friends with AI verdicts.</p>
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                navigator.clipboard.writeText(`impulse.ai got me acting all delulu. roast me besties! 💅💀`);
                toast.success('copied invite link bestie ⚡');
              }}
              className="w-full py-2.5 bg-[#E2FF00] hover:bg-[#d4f000] text-black rounded-xl font-black uppercase text-[9px] tracking-widest shadow-[0_8px_20px_rgba(226,255,0,0.15)] flex items-center justify-center gap-1.5 transition-all"
            >
              Share Now <span>⬆</span>
            </motion.button>
          </div>

          {/* User Credit */}
          <div className="flex items-center gap-3 py-2 px-1 border-t border-white/5">
            <img 
              src="/mascot.png" 
              alt="Mascot Avatar" 
              className="w-9 h-9 rounded-full object-cover border border-white/10 filter contrast-125"
            />
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black text-white/70 leading-none">Built with ❤️ by</span>
              <span className="text-[10px] font-black text-white leading-tight">Bhumika Jalhotra</span>
              <span className="text-[7px] font-bold text-white/30 uppercase tracking-widest mt-0.5">PWIOI BLR | CS 1st Year 🚀</span>
            </div>
          </div>

          <button 
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full py-2 text-white/30 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all font-bold text-[9px] uppercase tracking-widest"
          >
            <LogOut className="w-3 h-3" />
            System Exit
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative py-4 lg:py-6 pr-4 lg:pr-6 z-10 gap-4 lg:gap-6">
        
        {/* Topbar */}
        <header className="h-20 bg-[#07080a]/60 backdrop-blur-2xl border border-white/5 rounded-3xl flex items-center justify-between px-8 z-20 shrink-0 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
          <div className="flex-1 flex items-center h-full">
            {/* Left side spacer */}
          </div>

          <div className="flex items-center gap-6">
            {/* Vibe Status Badge */}
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-black/40 border border-[#E2FF00]/20 rounded-xl cursor-pointer hover:bg-black/60 transition-all group">
              {headerVibe === 'Savage' ? (
                <>
                  <Skull className="w-3.5 h-3.5 text-[#E2FF00] drop-shadow-[0_0_5px_rgba(226,255,0,0.5)]" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Savage Mode</span>
                </>
              ) : (
                <>
                  <Heart className="w-3.5 h-3.5 text-purple-400 fill-purple-400/20 drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]" />
                  <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Enabler Mode</span>
                </>
              )}
              <span className="text-[8px] text-white/40 ml-1 group-hover:translate-y-0.5 transition-transform">▼</span>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-4 pl-6 border-l border-white/5">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-white uppercase tracking-widest">{user?.displayName || 'Bhumika J.'}</p>
                <p className="text-[9px] text-[#E2FF00] font-black uppercase tracking-[0.1em] mt-0.5 flex items-center justify-end gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E2FF00] inline-block animate-pulse" />
                  ₹{headerSavings.toLocaleString()} saved
                </p>
                <p className="text-[8px] text-white/50 font-black uppercase tracking-[0.1em] mt-0.5 flex items-center justify-end gap-1">
                  ✨ {headerAura.toLocaleString()} aura points
                </p>
              </div>
              <motion.div 
                whileHover={{ scale: 1.05, rotate: -3 }}
                className="group relative"
              >
                <div className="absolute -inset-1 bg-[#E2FF00]/10 rounded-xl blur-[8px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <img 
                  src="/mascot.png" 
                  alt="Profile" 
                  className="w-10 h-10 rounded-xl border border-white/10 group-hover:border-[#E2FF00] object-cover cursor-pointer transition-colors shadow-2xl relative z-10 filter contrast-125"
                />
              </motion.div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto rounded-3xl relative z-10 flex flex-col bg-black/30 backdrop-blur-xl border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="flex-1 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(10px)" }}
                transition={{ duration: 0.4 }}
                className="h-full relative z-10"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};
