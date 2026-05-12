import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

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
    } catch (error) {
      toast.error('Login failed. Try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center overflow-hidden">
      {/* Subtle dot pattern */}
      <div className="absolute inset-0 bg-dot-pattern opacity-40 dark:opacity-20 pointer-events-none" />
      
      {/* Ambient Glow Orbs */}
      <motion.div 
        animate={{ x: [0, 60, 0], y: [0, -60, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-pink-400/20 dark:bg-pink-500/15 rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div 
        animate={{ x: [0, -60, 0], y: [0, 60, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-purple-400/20 dark:bg-purple-500/15 rounded-full blur-[120px] pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="z-10 bg-card border border-border rounded-3xl p-10 md:p-14 shadow-xl max-w-md w-full"
      >
        <h1 className="text-5xl font-black tracking-tighter mb-3 leading-none">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Impulse</span>
          <span className="text-foreground">.ai</span>
        </h1>
        <p className="text-muted-foreground mb-10 font-medium">Your brutal financial reality check.</p>

        <button 
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="group relative w-full py-4 bg-foreground text-background font-bold rounded-2xl text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg"
        >
          {isLoggingIn ? (
            <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin"></div>
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

        <p className="text-xs text-muted-foreground mt-8 font-medium">
          Trusted by chronic overspenders worldwide 💅
        </p>
      </motion.div>
    </div>
  );
};
