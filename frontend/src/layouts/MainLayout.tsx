import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, History, Settings, User, LogOut, Sun, Moon, Laptop } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';
import { SavingsTracker } from '../components/SavingsTracker';
import { Footer } from '../components/Footer';

export const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  const NAV_ITEMS = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'History', path: '/history', icon: History },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden relative">
      {/* Subtle dot pattern overlay */}
      <div className="absolute inset-0 bg-dot-pattern opacity-40 dark:opacity-20 pointer-events-none" />

      {/* Ambient Glow Orbs — positioned behind everything */}
      <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-pink-400/15 dark:bg-pink-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-purple-400/15 dark:bg-purple-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-violet-400/10 dark:bg-violet-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* ─── Sidebar ─── */}
      <aside className="w-72 m-3 bg-card border border-border rounded-2xl flex-col hidden md:flex z-20 shadow-sm">
        {/* Brand */}
        <div className="px-7 pt-8 pb-6">
          <h1 className="text-3xl font-black tracking-tighter">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Impulse</span>
            <span className="text-foreground">.ai</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-medium">your brutal financial reality check</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm",
                  isActive 
                    ? "bg-pink-500/10 text-pink-600 dark:text-pink-400" 
                    : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Sign Out */}
        <div className="p-3">
          <button 
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all font-semibold text-sm"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative py-3 pr-3 gap-3">
        
        {/* Topbar */}
        <header className="h-16 bg-card border border-border rounded-2xl flex items-center justify-between px-6 z-20 shrink-0 shadow-sm">
          <div className="flex-1 flex items-center h-full">
            {location.pathname === '/dashboard' && (
              <SavingsTracker />
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <div className="flex items-center bg-background p-1 rounded-full border border-border">
              <button onClick={() => setTheme('light')} className={cn("p-2 rounded-full transition-all", theme === 'light' ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
                <Sun className="w-4 h-4" />
              </button>
              <button onClick={() => setTheme('system')} className={cn("p-2 rounded-full transition-all", theme === 'system' ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
                <Laptop className="w-4 h-4" />
              </button>
              <button onClick={() => setTheme('dark')} className={cn("p-2 rounded-full transition-all", theme === 'dark' ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
                <Moon className="w-4 h-4" />
              </button>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-foreground">{user?.displayName || 'User'}</p>
                <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
              </div>
              <img 
                src={user?.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(user?.displayName || 'User')}&backgroundColor=ec4899`} 
                alt="Profile" 
                className="w-9 h-9 rounded-full border-2 border-border object-cover"
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto rounded-2xl relative z-10 flex flex-col">
          <div className="flex-1 p-6 md:p-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
          <Footer />
        </div>
      </main>
    </div>
  );
};
