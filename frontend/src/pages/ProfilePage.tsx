import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Mail, Sparkles } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  
  const currentSavings = parseFloat(localStorage.getItem('impulse_savings') || '0');

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="bg-card border border-border rounded-3xl p-8 shadow-sm flex flex-col items-center text-center">
        <div className="relative mb-6">
          <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur opacity-40"></div>
          <img 
            src={user?.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(user?.displayName || 'User')}&backgroundColor=ec4899`} 
            alt="Profile" 
            className="relative w-32 h-32 rounded-full border-4 border-card shadow-xl object-cover"
          />
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-1">{user?.displayName || 'Valued User'}</h1>
        <p className="text-muted-foreground flex items-center justify-center gap-2 mb-8">
          <Mail className="w-4 h-4" />
          {user?.email || 'No email provided'}
        </p>

        <div className="grid grid-cols-1 w-full gap-4 mb-8">
          <div className="bg-background border border-border rounded-2xl p-6 flex flex-col items-center">
            <Sparkles className="w-8 h-8 text-green-500 mb-2" />
            <h3 className="text-muted-foreground text-sm font-semibold uppercase tracking-wider mb-1">Total Savings</h3>
            <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
              ₹{currentSavings.toLocaleString()}
            </p>
          </div>
        </div>

        <button 
          onClick={logout}
          className="w-full py-4 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Sign Out of Impulse.ai
        </button>
      </div>
    </div>
  );
};

