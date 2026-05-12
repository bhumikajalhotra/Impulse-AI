import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { BentoGrid } from '../components/BentoGrid';
import { LoadingScreen } from '../components/LoadingScreen';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  const fetchHistory = async () => {
    if (user) {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        const response = await fetch(`${apiUrl}/api/history/${user.uid}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setHistory(data.slice(0, 5));
        } else {
          setHistory([]);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      }
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const handleAnalyze = async (analyzeUrl: string) => {
    const vibe = localStorage.getItem('impulse_vibe') || 'Savage';
    const budget = localStorage.getItem('impulse_budget') || '5000';
    
    setLoading(true);
    setResult(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const response = await fetch(`${apiUrl}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: analyzeUrl, 
          vibe, 
          userId: user?.uid,
          budget: parseFloat(budget)
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to analyze URL');

      // Handle both response shapes: direct object or { success, data } wrapper
      const analysisResult = data.data || data;
      setResult(analysisResult);
      setTimeout(fetchHistory, 1000);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) handleAnalyze(url);
  };

  if (loading) return <LoadingScreen />;
  if (result) return <BentoGrid result={result} onReset={() => setResult(null)} />;

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[75vh] text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[0.95]">
          Paste the link. <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
            Get the truth.
          </span>
        </h1>
        <p className="text-lg text-muted-foreground mb-12 font-medium max-w-xl mx-auto">
          Girl math genius move or total financial disaster? Let the AI decide.
        </p>

        <form onSubmit={handleSubmit} className="relative group mb-16 max-w-2xl mx-auto">
          {/* Glow behind input */}
          <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-20 transition duration-500"></div>
          
          <div className="relative flex items-center bg-card rounded-2xl p-2 border border-border shadow-lg">
            <div className="pl-4 text-pink-500">
              <Sparkles className="w-5 h-5" />
            </div>
            <input
              type="url"
              required
              placeholder="Paste Amazon, Myntra, or any product link..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-transparent border-none text-foreground px-4 py-4 focus:outline-none placeholder:text-muted-foreground text-base rounded-xl"
            />
            <button
              type="submit"
              className="bg-foreground text-background font-bold rounded-xl px-8 py-4 hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center gap-2 shadow-md shrink-0"
            >
              Analyze
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>

        {history.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full mt-8"
          >
            <div className="flex items-center gap-2 text-muted-foreground mb-6 text-sm font-bold uppercase tracking-widest justify-center">
              <Clock className="w-4 h-4 text-pink-500" />
              <span>Recent Impulses</span>
            </div>
            
            <div className="flex overflow-x-auto gap-4 pb-4 px-2 w-full snap-x scrollbar-hide justify-center">
              {history.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnalyze(item.url)}
                  className="flex flex-col items-start gap-3 bg-card hover:bg-card/80 border border-border rounded-2xl p-4 min-w-[200px] max-w-[200px] transition-all hover:scale-[1.03] hover:border-pink-500/30 text-left snap-start shadow-sm shrink-0 group"
                >
                  <div className="w-full h-24 bg-background rounded-xl overflow-hidden relative border border-border/50">
                    <img 
                      src={item.productImage || 'https://image.pollinations.ai/prompt/shopping?nologo=true'} 
                      alt={item.productName} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  </div>
                  <div className="w-full">
                    <h4 className="font-semibold text-foreground truncate w-full text-sm">{item.productName}</h4>
                    <div className="flex justify-between items-center mt-2 w-full">
                      <span className="text-pink-500 font-bold text-sm">{item.price}</span>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${item.verdict === 'BUY IT' ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                        {item.verdict}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
