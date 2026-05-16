import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-6 px-6 border-t border-slate-200 dark:border-white/5 shrink-0">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-foreground">
            Impulse<span className="text-primary">.ai</span>
          </p>
          <span className="text-slate-400 dark:text-slate-600 text-xs">•</span>
          <p className="text-xs text-slate-500">
            Judging your financial choices since 2024.
          </p>
        </div>
        
        <p className="text-xs text-slate-500 font-medium">
          Built with ☕ and buyer's remorse.
        </p>
      </div>
    </footer>
  );
};
