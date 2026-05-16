import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, History, Skull, Settings, BarChart2, Zap, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { SavingsTracker } from '../components/SavingsTracker';

export const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const NAV_ITEMS = [
    { name: 'Reality Check', path: '/dashboard', icon: ShieldAlert },
    { name: 'History', path: '/history', icon: History },
    { name: 'Personality', path: '/profile', icon: Skull },
    { name: 'Stats', path: '/stats', icon: BarChart2 },
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
      
      {/* Left Sidebar (Luxury Gaming Launcher) */}
      <aside className="w-24 md:w-80 m-4 lg:m-6 bg-black/40 backdrop-blur-3xl border-r border-white/5 flex-col hidden md:flex z-20 shadow-[20px_0_40px_rgba(0,0,0,0.5)] transition-all duration-700 overflow-hidden relative rounded-3xl group/sidebar">
        {/* Inner glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
        <div className="absolute -left-[50%] top-[20%] w-full h-[30%] bg-primary/10 blur-[100px] pointer-events-none opacity-50" />
        
        {/* Brand */}
        <div className="px-8 pt-12 pb-8 flex flex-col items-center relative z-10">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
            className="w-20 h-20 bg-gradient-to-br from-black to-surface border border-white/10 rounded-3xl flex items-center justify-center mb-6 cursor-pointer shadow-[inset_0_2px_10px_rgba(255,255,255,0.1),_0_10px_30px_rgba(225,255,0,0.15)] transition-all group/logo relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-primary/20 -translate-y-[100%] group-hover/logo:translate-y-0 transition-transform duration-500" />
            <Zap className="text-primary w-10 h-10 relative z-10 drop-shadow-[0_0_10px_rgba(225,255,0,0.8)]" />
          </motion.div>
          <h1 className="text-4xl font-display font-black tracking-[-0.08em] text-white animate-glitch-text">
            impulse<span className="text-primary glow-text">.ai</span>
          </h1>
          <div className="mt-4 text-center w-full">
            <p className="text-[9px] text-primary/70 font-black uppercase tracking-[0.4em] leading-relaxed relative">
              <span className="absolute -left-2 top-1/2 w-8 h-[1px] bg-primary/30 -translate-y-1/2" />
              system access
              <span className="absolute -right-2 top-1/2 w-8 h-[1px] bg-primary/30 -translate-y-1/2" />
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-6 space-y-3 mt-4 relative z-10">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-5 px-6 py-4 rounded-2xl transition-all font-black text-xs tracking-widest group relative overflow-hidden",
                  isActive 
                    ? "text-black shadow-[0_10px_30px_rgba(225,255,0,0.2)]" 
                    : "text-white/50 hover:text-white"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active Indicator & Background */}
                  {isActive && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary z-0 rounded-2xl"
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}
                  {isActive && (
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)] -translate-x-[150%] animate-[shimmer_2s_infinite] z-0" />
                  )}
                  
                  {/* Hover Background */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-white/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 z-0" />
                  )}

                  <item.icon className={cn("w-5 h-5 relative z-10 transition-transform duration-500", isActive ? "text-black" : "group-hover:scale-110")} />
                  <span className="uppercase relative z-10">{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom CTA & Sign Out */}
        <div className="p-6 relative z-10 flex flex-col gap-4">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 px-4 bg-gradient-to-r from-accent to-accent/80 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-[inset_0_2px_0_rgba(255,255,255,0.2),_0_10px_20px_rgba(139,92,246,0.3)] relative overflow-hidden group/share"
          >
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] -translate-x-[150%] group-hover/share:translate-x-[150%] transition-transform duration-700" />
            Share your shame 😈
          </motion.button>
          <button 
            onClick={logout}
            className="flex items-center justify-center gap-3 w-full px-4 py-3 text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest border border-transparent hover:border-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            System Exit
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative py-4 lg:py-6 pr-4 lg:pr-6 z-10 gap-4 lg:gap-6">
        
        {/* Topbar */}
        <header className="h-20 bg-black/20 backdrop-blur-2xl border border-white/5 rounded-3xl flex items-center justify-between px-8 z-20 shrink-0 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
          <div className="flex-1 flex items-center h-full">
            {location.pathname === '/dashboard' && (
              <SavingsTracker />
            )}
          </div>

          <div className="flex items-center gap-6">
            {/* User Profile */}
            <div className="flex items-center gap-5 pl-6 border-l border-white/5">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-white uppercase tracking-widest">{user?.displayName || 'USER'}</p>
                <p className="text-[9px] text-primary uppercase tracking-[0.2em] mt-1">{user?.email || 'broke_bestie@gmail.com'}</p>
              </div>
              <motion.div 
                whileHover={{ scale: 1.1, rotate: -5 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-primary rounded-xl blur-[15px] opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
                <img 
                  src={user?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user?.displayName || 'User')}&backgroundColor=8B5CF6`} 
                  alt="Profile" 
                  className="w-12 h-12 rounded-xl border-2 border-white/10 group-hover:border-primary object-cover cursor-pointer transition-colors shadow-2xl relative z-10"
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
