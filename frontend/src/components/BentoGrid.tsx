import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, ArrowLeft, Leaf, Hourglass, XCircle, CheckCircle2, ShieldAlert, RefreshCw, ImageOff, Flame } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AnalyzeResult {
  error?: string;
  suggestedProductName?: string;
  productName?: string;
  productImage?: string;
  price?: string;
  verdict?: string;
  impulseScore?: number;
  girlMath?: string;
  realityCheck?: string;
  prosCons?: string[];
  sustainabilityScore?: number;
  waitTimeRecommendation?: string;
}

// Fallback image component with branded placeholder
const ProductImage: React.FC<{ src?: string | null; alt?: string }> = ({ src, alt }) => {
  const [imgError, setImgError] = useState(false);

  if (!src || imgError) {
    return (
      <div className="w-full aspect-square bg-background rounded-2xl mb-6 border border-border/50 flex flex-col items-center justify-center gap-3 p-6">
        <ImageOff className="w-12 h-12 text-muted-foreground/40" />
        <p className="text-xs text-muted-foreground font-medium text-center">Image unavailable</p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || 'Product'}
      onError={() => setImgError(true)}
      className="w-full aspect-square object-contain bg-white rounded-2xl mb-6 shadow-sm p-4 group-hover:scale-105 transition-transform duration-500 border border-border/50"
    />
  );
};

// ─── Scraper Blocked Error Card ───
const ScraperBlockedCard: React.FC<{
  result: AnalyzeResult;
  onReset: () => void;
  onSubmitManual?: (name: string, price: string) => void;
}> = ({ result, onReset, onSubmitManual }) => {
  // Pre-fill with suggestedProductName from URL slug extraction
  const [manualName, setManualName] = useState(result.suggestedProductName || '');
  const [manualPrice, setManualPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) {
      toast.error('Please enter the product name!');
      return;
    }
    if (!manualPrice.trim()) {
      toast.error('Price is required to roast this properly 💅');
      return;
    }
    if (onSubmitManual) {
      setIsSubmitting(true);
      onSubmitManual(manualName.trim(), manualPrice.trim());
    }
  };

  const isApiKeyError = result.realityCheck?.includes('API key');

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-card border border-border rounded-3xl p-10 shadow-lg w-full"
      >
        {/* Icon */}
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 border ${isApiKeyError ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-pink-500/10 border-pink-500/20'}`}>
          <ShieldAlert className={`w-10 h-10 ${isApiKeyError ? 'text-yellow-500' : 'text-pink-500'}`} />
        </div>

        <h2 className="text-3xl font-black tracking-tight mb-3 text-foreground">
          {isApiKeyError ? 'API Key Issue' : 'Retailer Shield Detected'}
        </h2>
        <p className="text-muted-foreground font-medium mb-8 max-w-md mx-auto leading-relaxed">
          {result.realityCheck || "They blocked our scraper, but we can't be stopped. Enter the details manually."}
        </p>

        {!isApiKeyError && (
          <>
            {/* Pre-fill hint banner */}
            {result.suggestedProductName && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-xl px-4 py-3 mb-6 text-left"
              >
                <span className="text-purple-500 text-lg">✨</span>
                <div>
                  <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide">Guess & Confirm</p>
                  <p className="text-sm text-foreground">
                    We detected <strong>"{result.suggestedProductName}"</strong> from the URL. Confirm or edit below.
                  </p>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="bg-background rounded-2xl p-6 border border-border mb-8 text-left space-y-4">
              <p className="text-sm font-bold text-foreground flex items-center gap-2 mb-2">
                <span className="text-pink-500">⚡</span> Quick Entry
              </p>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Those overpriced sneakers"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-pink-500 transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                  Price (₹)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 12000"
                  value={manualPrice}
                  onChange={(e) => setManualPrice(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-pink-500 transition-colors text-sm"
                />
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold px-6 py-4 rounded-xl transition-all shadow-md mt-2 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                <Flame className="w-5 h-5" />
                {isSubmitting ? 'Roasting...' : 'Roast It Anyway'}
              </motion.button>
            </form>
          </>
        )}

        <div className="flex gap-4 justify-center">
          <button
            type="button"
            onClick={onReset}
            className="text-muted-foreground font-semibold px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Try Another Link
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main BentoGrid ───
export const BentoGrid: React.FC<{
  result: AnalyzeResult;
  onReset: () => void;
  onSubmitManual?: (name: string, price: string) => void;
}> = ({ result, onReset, onSubmitManual }) => {
  // Route to blocked card if error
  if (result.error === 'SCRAPER_BLOCKED' || result.verdict === 'TRY AGAIN') {
    return <ScraperBlockedCard result={result} onReset={onReset} onSubmitManual={onSubmitManual} />;
  }

  const [hasDeclined, setHasDeclined] = useState(false);
  const verdict = result.verdict || 'UNKNOWN';
  const isDrop = verdict.toLowerCase().includes('drop');
  const verdictGradient = isDrop ? 'from-red-500 to-orange-500' : 'from-green-400 to-emerald-600';
  const verdictNeon = isDrop ? 'neon-text-red' : 'neon-text-green';
  const score = result.impulseScore || 0;

  const handleShare = () => {
    const text = `Impulse.ai just gave my "${result.productName}" spree a ${score}/100 Impulse Score. 💅 ${result.girlMath}`;
    navigator.clipboard.writeText(text);
    toast.success('Verdict copied to clipboard!');
  };

  const handleDecline = async () => {
    const priceNum = parseFloat((result.price || '0').replace(/[^0-9.]/g, ''));
    if (!isNaN(priceNum) && priceNum > 0) {
      const currentSavings = parseFloat(localStorage.getItem('impulse_savings') || '0');
      localStorage.setItem('impulse_savings', (currentSavings + priceNum).toString());
      window.dispatchEvent(new Event('savingsUpdated'));

      const authData = localStorage.getItem('impulse_auth');
      if (authData) {
        try {
          const user = JSON.parse(authData);
          if (user?.uid) {
            const apiUrl = import.meta.env.VITE_API_URL;
            await fetch(`${apiUrl}/api/user/${user.uid}/savings`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ amount: priceNum }),
            });
          }
        } catch (e) {
          console.error('Failed to parse auth data for savings', e);
        }
      }

      setHasDeclined(true);
      toast.success('Money saved! Your future self thanks you. 💅', { icon: '💰' });
    }
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto flex flex-col pt-4 overflow-visible">
      {/* Background Glowing Orb */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 z-10 w-full gap-4">
        <button
          onClick={onReset}
          className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 font-medium bg-card hover:bg-black/5 dark:hover:bg-white/5 px-4 py-2 rounded-full border border-border backdrop-blur-md shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Analysis
        </button>

        <div className="flex gap-3">
          {!hasDeclined && (
            <button
              onClick={handleDecline}
              className="text-red-500 flex items-center gap-2 font-medium bg-card hover:bg-red-500/10 border border-border hover:border-red-500/50 px-6 py-2 rounded-full transition-all duration-300 shadow-sm"
            >
              <XCircle className="w-4 h-4" /> I won't buy it
            </button>
          )}
          {hasDeclined && (
            <div className="flex items-center gap-2 font-medium bg-green-500/10 border border-green-500/30 px-6 py-2 rounded-full text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-4 h-4" /> Saved ₹{(parseFloat((result.price || '0').replace(/[^0-9.]/g, ''))).toLocaleString()}
            </div>
          )}
          <button
            onClick={handleShare}
            className="text-white flex items-center gap-2 font-medium bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-2 rounded-full shadow-lg hover:scale-105 hover:shadow-pink-500/20 transition-all duration-300"
          >
            <Share2 className="w-4 h-4" /> Share My Shame
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(160px,auto)] z-10">

        {/* Product Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-1 md:row-span-2 bg-card hover:bg-black/5 dark:hover:bg-white/5 rounded-3xl p-6 border border-border flex flex-col items-center justify-center text-center shadow-md hover:-translate-y-1 transition-all duration-300 group"
        >
          <ProductImage src={result.productImage} alt={result.productName} />
          <h2 className="text-xl font-bold mb-2 text-foreground truncate w-full">{result.productName || 'Unknown Product'}</h2>
          <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">{result.price || '₹0.00'}</p>
        </motion.div>

        {/* Verdict Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-2 bg-card hover:bg-black/5 dark:hover:bg-white/5 rounded-3xl p-8 border border-border flex flex-col justify-center items-center relative overflow-hidden shadow-md hover:-translate-y-1 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/5 dark:from-white/5 to-transparent pointer-events-none" />
          <p className="text-muted-foreground uppercase tracking-widest font-semibold mb-2">Final Verdict</p>
          <h1 className={`text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r ${verdictGradient} text-center ${verdictNeon}`}>
            {verdict}
          </h1>
        </motion.div>

        {/* Girl Math Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="md:col-span-1 bg-pink-500/5 dark:bg-pink-900/20 rounded-3xl p-6 border border-pink-500/20 shadow-md transition-all duration-300"
        >
          <p className="text-pink-600 dark:text-pink-400 uppercase tracking-wider text-sm font-semibold mb-3">Girl Math</p>
          <p className="text-lg leading-relaxed text-foreground italic">"{result.girlMath}"</p>
        </motion.div>

        {/* Impulse Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-3xl p-6 border border-border flex flex-col justify-center items-center shadow-md"
        >
          <p className="text-muted-foreground uppercase tracking-wider text-xs font-semibold mb-4">Impulse Score</p>
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-black/10 dark:text-white/10" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className={`${score > 70 ? 'text-red-500' : 'text-purple-500'}`} strokeWidth="3" strokeDasharray={`${score}, 100`} stroke="currentColor" fill="none" strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <span className="absolute text-3xl font-black text-foreground">{score}</span>
          </div>
        </motion.div>

        {/* Sustainability Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-3xl p-6 border border-border flex flex-col justify-center items-center shadow-md"
        >
          <Leaf className="w-8 h-8 text-green-500 mb-2" />
          <p className="text-muted-foreground uppercase tracking-wider text-xs font-semibold mb-2">Eco Score</p>
          <span className="text-4xl font-black text-green-500">{result.sustainabilityScore || 0}%</span>
        </motion.div>

        {/* Wait Time Recommendation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="md:col-span-2 bg-blue-500/5 dark:bg-blue-900/20 rounded-3xl p-6 border border-blue-500/20 flex items-center gap-6 shadow-md"
        >
          <div className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20">
            <Hourglass className="w-8 h-8 text-blue-500 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-blue-600 dark:text-blue-400 uppercase tracking-wider text-sm font-semibold mb-1">Patience Protocol</p>
            <p className="text-2xl font-bold text-foreground">{result.waitTimeRecommendation || 'Wait 24 hours'}</p>
          </div>
        </motion.div>

        {/* Reality Check */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="md:col-span-1 bg-card rounded-3xl p-6 border border-border flex flex-col justify-center shadow-md"
        >
          <p className="text-yellow-600 dark:text-yellow-500 uppercase tracking-wider text-sm font-semibold mb-3">Reality Check</p>
          <p className="text-lg leading-relaxed text-foreground font-medium">{result.realityCheck}</p>
        </motion.div>

      </div>
    </div>
  );
};
