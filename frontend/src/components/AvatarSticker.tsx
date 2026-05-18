import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type AvatarState = 'neutral' | 'shocked' | 'disgusted' | 'impressed' | 'thinking';

interface AvatarStickerProps {
  state: AvatarState;
  className?: string;
  isStickerFace?: boolean; // If true, crops closer to her face for the badge sticker look
}

const emojiParticles: Record<AvatarState, string[]> = {
  neutral: ['💬', '💅', '⚡'],
  shocked: ['🤯', '☠️', '🛑', '💥'],
  disgusted: ['😒', '👎', '🤮', '🙄'],
  impressed: ['💖', '✨', '🔥', '👑'],
  thinking: ['🤔', '❓', '🔮', '🌀']
};

export const AvatarSticker: React.FC<AvatarStickerProps> = ({ state, className = '', isStickerFace = false }) => {
  // Motion settings based on avatar mood state
  const getMotionProps = (): any => {
    switch (state) {
      case 'shocked':
        return {
          animate: {
            x: [0, -4, 4, -4, 4, 0],
            y: [0, 2, -2, 2, -2, 0],
            scale: [1, 1.08, 1.08, 1.05, 1],
          },
          transition: {
            repeat: Infinity,
            duration: 0.4,
            ease: 'easeInOut'
          }
        };
      case 'disgusted':
        return {
          animate: {
            rotate: [-2, 2, -2],
            scale: 0.95,
          },
          transition: {
            repeat: Infinity,
            repeatType: 'reverse' as const,
            duration: 2,
            ease: 'easeInOut'
          }
        };
      case 'impressed':
        return {
          animate: {
            y: [0, -8, 0],
            scale: 1.05,
          },
          transition: {
            repeat: Infinity,
            duration: 0.8,
            ease: 'easeOut'
          }
        };
      case 'thinking':
        return {
          animate: {
            rotate: [0, 3, -3, 0],
            y: [0, -3, 0],
          },
          transition: {
            repeat: Infinity,
            duration: 1.5,
            ease: 'easeInOut'
          }
        };
      case 'neutral':
      default:
        return {
          animate: {
            y: [0, -4, 0],
          },
          transition: {
            repeat: Infinity,
            duration: 3,
            ease: 'easeInOut'
          }
        };
    }
  };

  // Image filters to match mood
  const getFilterClass = () => {
    switch (state) {
      case 'shocked':
        return 'contrast-125 brightness-110 saturate-120 drop-shadow-[0_0_12px_rgba(239,68,68,0.6)]';
      case 'disgusted':
        return 'contrast-115 grayscale-[20%] hue-rotate-[280deg] saturate-75 drop-shadow-[0_0_10px_rgba(147,51,234,0.5)]';
      case 'impressed':
        return 'contrast-110 brightness-105 saturate-125 drop-shadow-[0_0_15px_rgba(226,255,0,0.7)]';
      case 'thinking':
        return 'contrast-100 brightness-95 saturate-100 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]';
      case 'neutral':
      default:
        return 'contrast-110 saturate-105 drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)]';
    }
  };

  return (
    <div className={`relative select-none flex items-center justify-center shrink-0 ${className}`}>
      {/* Dynamic Background Glow Halo */}
      <div 
        className={`absolute -inset-2 rounded-full blur-[16px] opacity-40 transition-all duration-500 pointer-events-none ${
          state === 'shocked' ? 'bg-red-500' :
          state === 'disgusted' ? 'bg-purple-500' :
          state === 'impressed' ? 'bg-[#E2FF00]' :
          state === 'thinking' ? 'bg-blue-500' :
          'bg-gradient-to-tr from-[#E2FF00] to-purple-500'
        }`} 
      />

      {/* Floating Mood Emoji Particles */}
      <div className="absolute inset-0 pointer-events-none z-20">
        <AnimatePresence>
          {emojiParticles[state].map((emoji, idx) => (
            <motion.span
              key={`${state}-${idx}`}
              initial={{ opacity: 0, scale: 0.5, y: 10 }}
              animate={{ 
                opacity: [0, 1, 1, 0],
                scale: [0.6, 1.1, 1],
                y: [-10, -35 - (idx * 8)],
                x: [0, (idx % 2 === 0 ? 15 : -15)]
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 2 + (idx * 0.4),
                repeat: Infinity,
                delay: idx * 0.5
              }}
              className="absolute text-sm font-sans drop-shadow-md"
              style={{
                top: idx % 2 === 0 ? '10%' : '20%',
                left: idx % 2 === 0 ? '15%' : '75%'
              }}
            >
              {emoji}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {/* The Mascot Character Image */}
      <motion.div
        {...getMotionProps()}
        className={`relative z-10 w-full h-full ${
          isStickerFace ? 'overflow-hidden rounded-full border-4 border-white' : ''
        }`}
      >
        <img 
          src="/mascot.png" 
          alt={`mascot streetwear girl ${state}`} 
          className={`w-full h-full object-contain transition-all duration-300 ${getFilterClass()} ${
            isStickerFace ? 'scale-[1.6] translate-y-[15%] translate-x-[-5%]' : ''
          }`} 
        />
      </motion.div>
    </div>
  );
};

export default AvatarSticker;
