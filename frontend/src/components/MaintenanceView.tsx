import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export const MaintenanceView: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-3xl p-10 shadow-lg max-w-md w-full"
      >
        <div className="bg-yellow-500/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-yellow-500/20">
          <AlertTriangle className="w-10 h-10 text-yellow-500" />
        </div>
        
        <h2 className="text-3xl font-black tracking-tight mb-3 text-foreground">Maintenance Mode</h2>
        <p className="text-muted-foreground font-medium mb-8 leading-relaxed">
          System is undergoing maintenance (API Error). We're polishing the AI's savage personality. Check back in a bit!
        </p>

        {onRetry && (
          <button 
            onClick={onRetry}
            className="flex items-center gap-2 bg-foreground text-background font-bold px-8 py-4 rounded-xl hover:scale-[1.03] transition-all mx-auto shadow-md"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
        )}
      </motion.div>
    </div>
  );
};
