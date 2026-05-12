import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-6 px-6 border-t border-border/50 shrink-0">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-foreground">
            Impulse<span className="text-pink-500">.ai</span>
          </p>
          <span className="text-muted-foreground text-xs">•</span>
          <p className="text-xs text-muted-foreground">
            Judging your financial choices since 2024.
          </p>
        </div>
        
        <p className="text-xs text-muted-foreground font-medium">
          Built with ☕ and buyer's remorse.
        </p>
      </div>
    </footer>
  );
};
