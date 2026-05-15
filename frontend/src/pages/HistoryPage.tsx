import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const HistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${apiUrl}/api/history/${user.uid}`);
        const data = await response.json();
        setHistory(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <Clock className="w-16 h-16 mb-4 opacity-50" />
        <h2 className="text-2xl font-bold mb-2 text-foreground">No History Yet</h2>
        <p>Go to the dashboard and analyze your first product!</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Analysis History</h1>
        <p className="text-muted-foreground">Your past financial decisions, immortalized.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:border-pink-500/30 transition-all group flex flex-col"
          >
            <div className="h-48 bg-white/5 relative border-b border-border p-4 flex items-center justify-center">
              {item.productImage ? (
                <img 
                  src={item.productImage} 
                  alt={item.productName} 
                  className="max-h-full object-contain group-hover:scale-105 transition-transform duration-500" 
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground/40">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="2" x2="22" y1="2" y2="22"/><path d="M10.41 10.41a2 2 0 1 1-2.83-2.83"/><line x1="13.5" x2="6" y1="13.5" y2="21"/><line x1="18" x2="21" y1="12" y2="15"/><path d="M3.59 3.59A1.99 1.99 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.05-.22 1.41-.59"/><path d="M21 15V5a2 2 0 0 0-2-2H9"/></svg>
                </div>
              )}
              <div className="absolute top-4 right-4">
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase shadow-lg backdrop-blur-md ${item.verdict === 'BUY IT' ? 'bg-green-500/20 text-green-500 border border-green-500/30' : 'bg-red-500/20 text-red-500 border border-red-500/30'}`}>
                  {item.verdict}
                </span>
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="font-semibold text-foreground line-clamp-2 mb-2">{item.productName}</h3>
              <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-4">{item.price}</p>
              
              <div className="mt-auto space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Impulse Score:</span>
                  <span className="font-bold text-foreground">{item.impulseScore}/100</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Eco Score:</span>
                  <span className="font-bold text-green-500">{item.sustainabilityScore || 0}%</span>
                </div>
                
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-black/5 dark:bg-white/5 hover:bg-pink-500/10 text-foreground rounded-lg transition-colors text-sm font-medium border border-border"
                >
                  View Product <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

