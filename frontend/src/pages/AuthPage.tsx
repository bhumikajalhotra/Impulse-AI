import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const AuthPage: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await login();
      toast.success('Welcome to Impulse.ai!');
    } catch (err) { // eslint-disable-line @typescript-eslint/no-unused-vars
      toast.error('Login failed. Try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#020617] p-4 text-center overflow-hidden font-sans">
      {/* Subtle dot pattern */}
      <div className="absolute inset-0 bg-dot-pattern opacity-10 pointer-events-none" />
      
      {/* Ambient Glow Orbs */}
      <motion.div 
        animate={{ x: [0, 60, 0], y: [0, -60, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div 
        animate={{ x: [0, -60, 0], y: [0, 60, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-secondary/15 rounded-full blur-[120px] pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="z-10 glass-island rounded-[3rem] p-12 md:p-16 shadow-2xl max-w-md w-full relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
        
        <h1 className="text-6xl font-display font-black tracking-tighter mb-4 leading-none text-white lowercase">
          impulse<span className="text-primary">.ai</span>
        </h1>
        <p className="text-slate-500 mb-12 font-medium lowercase tracking-wide">your brutal financial reality check.</p>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="group relative w-full py-5 bg-primary text-white font-black rounded-2xl flex items-center justify-center gap-4 transition-all disabled:opacity-50 shadow-2xl shadow-primary/20 uppercase tracking-[0.2em] text-xs"
        >
          {isLoggingIn ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" className="opacity-70" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            </svg>
          )}
          {isLoggingIn ? 'authenticating...' : 'continue with google'}
        </motion.button>

        <p className="text-[10px] text-slate-600 mt-10 font-black uppercase tracking-[0.3em]">
          trusted by chronic overspenders worldwide 💅
        </p>
      </motion.div>
    </div>
  );
};
