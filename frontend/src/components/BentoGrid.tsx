import React from 'react';
import { motion } from 'framer-motion';
import { Share2, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AnalyzeResult {
  productName?: string;
  productImage?: string;
  price?: string;
  verdict?: string;
  impulseScore?: number;
  girlMath?: string;
  realityCheck?: string;
  prosCons?: string[];
}

export const BentoGrid: React.FC<{ result: AnalyzeResult; onReset: () => void }> = ({ result, onReset }) => {
  const verdict = result.verdict || "UNKNOWN";
  const isDrop = verdict.toLowerCase().includes('drop');
  const verdictGradient = isDrop ? 'from-red-500 to-orange-500' : 'from-green-400 to-emerald-600';
  const verdictNeon = isDrop ? 'neon-text-red' : 'neon-text-green';
  const score = result.impulseScore || 0;

  const handleShare = () => {
    const text = `Impulse.ai just gave my "${result.productName}" spree a ${score}/100 Impulse Score. 💅 ${result.girlMath}`;
    navigator.clipboard.writeText(text);
    toast.success('Verdict copied to clipboard!', {
      style: { background: '#333', color: '#fff', borderRadius: '10px' }
    });
  };

  return (
    <div className="min-h-screen relative p-4 md:p-8 max-w-6xl mx-auto flex flex-col pt-8 overflow-hidden">
      {/* Background Glowing Orb */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-600/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      
      <div className="flex justify-between items-center mb-8 z-10 w-full">
        <button 
          onClick={onReset}
          className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 font-medium bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Analysis
        </button>
        <button 
          onClick={handleShare}
          className="text-white flex items-center gap-2 font-medium bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-2 rounded-full shadow-lg hover:scale-105 hover:shadow-pink-500/20 transition-all duration-300"
        >
          <Share2 className="w-4 h-4" /> Share My Shame
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)] z-10">
        
        {/* Product Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-1 md:row-span-2 bg-white/5 backdrop-blur-xl hover:bg-white/10 rounded-3xl p-6 border border-white/10 hover:border-white/30 flex flex-col items-center justify-center text-center shadow-2xl hover:-translate-y-1 hover:shadow-white/5 transition-all duration-300 group"
        >
          <img 
            src={result.productImage || 'https://image.pollinations.ai/prompt/shopping%20product?width=400&height=400&nologo=true'} 
            alt={result.productName || "Product"} 
            onError={(e) => {
              e.currentTarget.src = "https://image.pollinations.ai/prompt/shopping%20product?width=400&height=400&nologo=true";
            }}
            className="w-full aspect-square object-contain bg-white rounded-2xl mb-6 shadow-lg p-4 group-hover:scale-105 transition-transform duration-500"
          />
          <h2 className="text-2xl font-bold mb-2 text-white/90">{result.productName || "Unknown Product"}</h2>
          <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">{result.price || "$0.00"}</p>
        </motion.div>

        {/* Verdict Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-2 bg-white/5 backdrop-blur-xl hover:bg-white/10 rounded-3xl p-8 border border-white/10 hover:border-white/30 flex flex-col justify-center items-center relative overflow-hidden shadow-2xl hover:-translate-y-1 hover:shadow-white/5 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          <p className="text-gray-400 uppercase tracking-widest font-semibold mb-2">Final Verdict</p>
          <h1 className={`text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r ${verdictGradient} text-center ${verdictNeon}`}>
            {verdict}
          </h1>
        </motion.div>

        {/* Impulse Score */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-xl hover:bg-white/10 rounded-3xl p-6 border border-white/10 hover:border-white/30 flex flex-col justify-center items-center shadow-2xl hover:-translate-y-1 hover:shadow-white/5 transition-all duration-300"
        >
          <p className="text-gray-400 uppercase tracking-wider text-sm font-semibold mb-4">Impulse Score</p>
          <div className="relative w-32 h-32 flex items-center justify-center drop-shadow-lg">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-white/10"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${score > 70 ? 'text-red-500' : 'text-purple-500'} drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]`}
                strokeWidth="3"
                strokeDasharray={`${score}, 100`}
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-black text-white/90">{score}</span>
            </div>
          </div>
        </motion.div>

        {/* Girl Math Justification */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-pink-900/40 to-purple-900/40 backdrop-blur-xl hover:from-pink-900/60 hover:to-purple-900/60 rounded-3xl p-6 border border-pink-500/30 hover:border-pink-500/60 flex flex-col justify-center shadow-2xl hover:-translate-y-1 hover:shadow-pink-500/20 transition-all duration-300"
        >
          <p className="text-pink-400 uppercase tracking-wider text-sm font-semibold mb-3 drop-shadow-md">Girl Math</p>
          <p className="text-lg leading-relaxed text-pink-50">{result.girlMath || "No justification provided."}</p>
        </motion.div>

        {/* Reality Check */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="md:col-span-1 bg-white/5 backdrop-blur-xl hover:bg-white/10 rounded-3xl p-6 border border-white/10 hover:border-white/30 flex flex-col justify-center shadow-2xl hover:-translate-y-1 hover:shadow-white/5 transition-all duration-300"
        >
          <p className="text-yellow-500 uppercase tracking-wider text-sm font-semibold mb-3 drop-shadow-md">Reality Check</p>
          <p className="text-lg leading-relaxed text-gray-300">{result.realityCheck || "You need this."}</p>
        </motion.div>

        {/* Pros & Cons */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="md:col-span-2 bg-white/5 backdrop-blur-xl hover:bg-white/10 rounded-3xl p-6 border border-white/10 hover:border-white/30 shadow-2xl hover:-translate-y-1 hover:shadow-white/5 transition-all duration-300"
        >
          <p className="text-gray-400 uppercase tracking-wider text-sm font-semibold mb-4">Pros & Cons</p>
          <ul className="space-y-3">
            {(result.prosCons || []).map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-purple-400 mt-1 drop-shadow-md">✦</span>
                <span className="text-gray-300">{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>

      </div>
    </div>
  );
};
