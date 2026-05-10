import { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { LandingPage } from './components/LandingPage';
import { LoadingScreen } from './components/LoadingScreen';
import { BentoGrid } from './components/BentoGrid';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [vibe, setVibe] = useState('Savage');

  const handleAnalyze = async (url: string) => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:5001/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, vibe }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze URL');
      }

      setResult(data);

      // Save to Search History
      const history = JSON.parse(localStorage.getItem('impulse_history') || '[]');
      const newEntry = {
        url,
        productName: data.productName,
        price: data.price,
        verdict: data.verdict,
        thumbnail: data.productImage
      };
      // Keep only last 10 for the horizontal scroll
      const updatedHistory = [newEntry, ...history.filter((h: any) => h.url !== url)].slice(0, 10);
      localStorage.setItem('impulse_history', JSON.stringify(updatedHistory));

    } catch (err: any) {
      toast.error(err.message, {
        style: {
          background: '#333',
          color: '#fff',
          borderRadius: '10px',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white selection:bg-pink-500/30 overflow-x-hidden">
      <Toaster position="top-center" />
      
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoadingScreen />
          </motion.div>
        ) : result ? (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
            <BentoGrid result={result} onReset={() => setResult(null)} />
          </motion.div>
        ) : (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LandingPage 
              onAnalyze={handleAnalyze} 
              isAuthenticated={isAuthenticated} 
              onLogin={() => setIsAuthenticated(true)}
              vibe={vibe}
              setVibe={setVibe}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
