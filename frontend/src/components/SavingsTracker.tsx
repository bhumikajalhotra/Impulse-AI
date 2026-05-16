import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { PiggyBank, TrendingDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const SavingsTracker: React.FC = () => {
  const [savings, setSavings] = useState(() => {
    const saved = localStorage.getItem('impulse_savings') || '0';
    return parseFloat(saved) || 0;
  });
  const { user } = useAuth();

  useEffect(() => {

    const fetchSavings = async () => {
      if (user?.uid) {
        try {
          const apiUrl = import.meta.env.VITE_API_URL;
          const response = await fetch(`${apiUrl}/api/user/${user.uid}/savings`);
          const data = await response.json();
          if (data && typeof data.savings === 'number') {
            setSavings(data.savings);
            localStorage.setItem('impulse_savings', data.savings.toString());
          }
        } catch (err) {
          console.error("Failed to fetch savings from backend", err);
        }
      }
    };

    fetchSavings();

    const handleStorageChange = () => {
      const updated = localStorage.getItem('impulse_savings') || '0';
      setSavings(parseFloat(updated));
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('savingsUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('savingsUpdated', handleStorageChange);
    };
  }, [user]);

  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());

  useEffect(() => {
    const controls = animate(count, savings, { 
      duration: 1.5, 
      ease: "easeOut" 
    });
    return controls.stop;
  }, [savings, count]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4"
    >
      <div className="bg-primary/10 p-3 rounded-2xl border border-primary/20 shadow-lg shadow-primary/10">
        <PiggyBank className="w-6 h-6 text-primary" />
      </div>
      <div className="text-left">
        <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em] mb-0.5">potential wealth saved</p>
        <div className="flex items-center gap-2">
          <motion.span 
            key={savings}
            initial={{ scale: 1.5 }}
            animate={{ scale: 1 }}
            className="text-2xl font-black flex text-foreground"
          >
            ₹<motion.span>{rounded}</motion.span>
          </motion.span>
          <div className="flex items-center gap-1.5 text-[9px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 shadow-sm uppercase tracking-wider">
            <TrendingDown className="w-3 h-3" />
            staying rich
          </div>
        </div>
      </div>
    </motion.div>
  );
};
