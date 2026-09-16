import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Heart } from 'lucide-react';
import { SoulTalkLogo } from '../components/SoulTalkLogo';

interface SplashScreenProps {
  onEnter: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onEnter }) => {
  const [showEnterButton, setShowEnterButton] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowEnterButton(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Ambient floating particles canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const colors = ['#A78BFA', '#38BDF8', '#34D399', '#F472B6', '#FDE047'];
    const particles = Array.from({ length: 30 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: Math.random() * 0.4 + 0.2,
      sway: Math.random() * 2 + 0.5,
      phase: Math.random() * Math.PI * 2,
    }));

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.02;
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.y -= p.speedY;
        if (p.y < -10) p.y = height + 10;
        const xOffset = Math.sin(t * p.sway + p.phase) * 15;

        ctx.beginPath();
        ctx.arc(p.x + xOffset, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + '30';
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-6 overflow-hidden bg-gradient-to-b from-slate-50 via-purple-50/20 to-slate-100 select-none">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      <div className="z-10 w-full flex justify-end">
        <span className="text-xs font-medium px-3 py-1 rounded-full bg-white/90 text-purple-600 shadow-xs border border-purple-50">
          SoulTalk Sanctuary v2.0
        </span>
      </div>

      {/* Center Branding & Logo */}
      <div className="z-10 flex flex-col items-center text-center max-w-md my-auto">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative mb-3 flex flex-col items-center"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-pink-500/30 via-purple-600/30 to-indigo-500/30 blur-xl opacity-60 animate-pulse" />
          <SoulTalkLogo variant="official-card" size="md" />
        </motion.div>

        {/* Pillars */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex items-center gap-2.5 mt-2 text-slate-500 font-medium text-xs sm:text-sm"
        >
          <span>Deep Empathy</span>
          <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
          <span>Mindful Grounding</span>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          <span>Inner Peace</span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-3 text-xs sm:text-sm text-slate-500 max-w-xs leading-relaxed"
        >
          Your safe emotional sanctuary for empathetic listening, mindful grounding, and compassionate companionship.
        </motion.p>
      </div>

      {/* Enter Sanctuary Button */}
      <div className="z-10 w-full max-w-xs mb-6">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showEnterButton ? 1 : 0.7, y: 0 }}
          transition={{ duration: 0.4 }}
          onClick={onEnter}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium text-sm shadow-md shadow-purple-200 flex items-center justify-center gap-2 transition group cursor-pointer"
        >
          <Heart className="w-4 h-4 fill-rose-300 text-rose-300 group-hover:scale-110 transition-transform" />
          <span>Enter Sanctuary</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>
    </div>
  );
};
