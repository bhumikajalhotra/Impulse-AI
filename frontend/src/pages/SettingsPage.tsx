import React, { useState } from 'react';
import { Save, Zap, Coffee, Moon, Sun, Laptop } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'react-hot-toast';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  
  const [vibe, setVibe] = useState(() => localStorage.getItem('impulse_vibe') || 'Savage');
  const [budget, setBudget] = useState(() => localStorage.getItem('impulse_budget') || '5000');

  const handleSave = () => {
    localStorage.setItem('impulse_vibe', vibe);
    localStorage.setItem('impulse_budget', budget);
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Preferences</h1>
        <p className="text-muted-foreground">Customize your AI experience and app appearance.</p>
      </div>

      <div className="space-y-8">
        {/* Appearance Settings */}
        <section className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm">
          <h2 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
            <Sun className="w-5 h-5" /> Appearance
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => setTheme('light')}
              className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all ${
                theme === 'light' 
                  ? 'border-pink-500 bg-pink-500/10 text-pink-500' 
                  : 'border-border bg-background hover:bg-black/5 text-muted-foreground'
              }`}
            >
              <Sun className="w-8 h-8" />
              <span className="font-semibold">Light</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all ${
                theme === 'dark' 
                  ? 'border-pink-500 bg-pink-500/10 text-pink-500' 
                  : 'border-border bg-background hover:bg-white/5 text-muted-foreground'
              }`}
            >
              <Moon className="w-8 h-8" />
              <span className="font-semibold">Dark</span>
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all ${
                theme === 'system' 
                  ? 'border-pink-500 bg-pink-500/10 text-pink-500' 
                  : 'border-border bg-background hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground'
              }`}
            >
              <Laptop className="w-8 h-8" />
              <span className="font-semibold">System</span>
            </button>
          </div>
        </section>

        {/* AI Personality Settings */}
        <section className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm">
          <h2 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
            <Zap className="w-5 h-5" /> AI Personality
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setVibe('Savage')}
              className={`p-6 rounded-2xl border text-left transition-all ${
                vibe === 'Savage' 
                  ? 'border-red-500 bg-red-500/10' 
                  : 'border-border hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Zap className={vibe === 'Savage' ? 'text-red-500' : 'text-muted-foreground'} />
                <h3 className={`font-bold ${vibe === 'Savage' ? 'text-red-500' : 'text-foreground'}`}>Savage Mode</h3>
              </div>
              <p className="text-sm text-muted-foreground">Brutal honesty. Will roast you for poor financial decisions.</p>
            </button>

            <button
              onClick={() => setVibe('Enabler')}
              className={`p-6 rounded-2xl border text-left transition-all ${
                vibe === 'Enabler' 
                  ? 'border-green-500 bg-green-500/10' 
                  : 'border-border hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Coffee className={vibe === 'Enabler' ? 'text-green-500' : 'text-muted-foreground'} />
                <h3 className={`font-bold ${vibe === 'Enabler' ? 'text-green-500' : 'text-foreground'}`}>Enabler Mode</h3>
              </div>
              <p className="text-sm text-muted-foreground">Girl math justified. Treat yourself, you deserve it.</p>
            </button>
          </div>
        </section>

        {/* Financial Settings */}
        <section className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm">
          <h2 className="text-xl font-bold mb-6 text-foreground">Financial Parameters</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Monthly Discretionary Budget (₹)
              </label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-background border border-border text-foreground px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                placeholder="e.g. 5000"
              />
              <p className="text-xs text-muted-foreground mt-2">
                This helps the AI judge if a purchase is a significant percentage of your budget.
              </p>
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-foreground text-background font-bold px-8 py-3 rounded-xl hover:scale-105 transition-all shadow-lg"
          >
            <Save className="w-5 h-5" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

