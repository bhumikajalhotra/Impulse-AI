import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PiggyBank, TrendingDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const SavingsTracker: React.FC = () => {
  const [savings, setSavings] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    // Initial optimistic load from local storage
    const saved = localStorage.getItem('impulse_savings') || '0';
    setSavings(parseFloat(saved));

    const fetchSavings = async () => {
      if (user?.uid) {
        try {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4"
    >
      <div className="bg-green-500/10 p-3 rounded-xl border border-green-500/20">
        <PiggyBank className="w-6 h-6 text-green-500" />
      </div>
      <div className="text-left">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Potential Money Saved</p>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-foreground">₹{savings.toLocaleString()}</span>
          <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
            <TrendingDown className="w-3 h-3" />
            STAYING RICH
          </div>
        </div>
      </div>
    </motion.div>
  );
};
