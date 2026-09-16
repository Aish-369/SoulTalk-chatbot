import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Wind, CheckCircle2 } from 'lucide-react';
import { WolfieCharacter } from './WolfieCharacter';

interface BreathingExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (xpGained: number) => void;
  companionName?: string;
  companionType?: string;
}

type BreathPhase = 'Inhale' | 'Hold' | 'Exhale' | 'Rest';

export const BreathingExerciseModal: React.FC<BreathingExerciseModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  companionName = 'Wolfie',
  companionType = 'wolfie_guardian'
}) => {
  const [phase, setPhase] = useState<BreathPhase>('Inhale');
  const [secondsLeft, setSecondsLeft] = useState(180); // 3 minutes total
  const [phaseTimer, setPhaseTimer] = useState(4);
  const [isCompleted, setIsCompleted] = useState(false);
  const [cyclesCount, setCyclesCount] = useState(0);

  useEffect(() => {
    if (!isOpen || isCompleted) return;

    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          setIsCompleted(true);
          onComplete(35); // 35 XP gained
          return 0;
        }
        return prev - 1;
      });

      setPhaseTimer(prev => {
        if (prev <= 1) {
          // Transition to next phase
          if (phase === 'Inhale') {
            setPhase('Hold');
            return 4;
          } else if (phase === 'Hold') {
            setPhase('Exhale');
            return 4;
          } else if (phase === 'Exhale') {
            setPhase('Rest');
            return 2;
          } else {
            setPhase('Inhale');
            setCyclesCount(c => c + 1);
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, phase, isCompleted, onComplete]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const phaseInstruction = {
    Inhale: 'Breathe in slowly through your nose...',
    Hold: 'Gently hold this peaceful breath...',
    Exhale: 'Release and blow away the tension...',
    Rest: 'Rest and prepare for the next wave...'
  }[phase];

  const scaleValue = phase === 'Inhale' ? 1.4 : phase === 'Hold' ? 1.4 : phase === 'Exhale' ? 0.9 : 1.0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        className="relative w-full max-w-md bg-white rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden border border-indigo-50"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-indigo-50 text-indigo-600">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-lg">3-Minute Breathing Wave</h3>
              <p className="text-xs text-slate-400">Sync with {companionName} for inner calm</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isCompleted ? (
          <div className="py-6 flex flex-col items-center justify-center text-center">
            {/* Visual Breathing Wave Sphere */}
            <div className="relative my-6 flex items-center justify-center w-56 h-56">
              {/* Outer expanding ripple */}
              <motion.div
                animate={{ scale: scaleValue, opacity: phase === 'Inhale' ? 0.4 : 0.15 }}
                transition={{ duration: phase === 'Inhale' || phase === 'Exhale' ? 4 : 2, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-200 via-sky-200 to-teal-100"
              />

              {/* Inner Soft Gradient Ring */}
              <motion.div
                animate={{ scale: scaleValue * 0.85 }}
                transition={{ duration: phase === 'Inhale' || phase === 'Exhale' ? 4 : 2, ease: "easeInOut" }}
                className="absolute w-40 h-40 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 shadow-inner flex items-center justify-center"
              />

              {/* Companion in center */}
              <div className="relative z-10">
                <WolfieCharacter
                  emotion="MEDITATING"
                  size="SMALL"
                  companionType={companionType}
                  isInteractive={false}
                />
              </div>
            </div>

            {/* Phase Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 font-medium text-sm mb-2 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              {phase} ({phaseTimer}s)
            </div>

            {/* Instructions */}
            <p className="text-slate-700 font-medium text-base h-6 transition-all duration-300">
              {phaseInstruction}
            </p>

            {/* Time & Stats */}
            <div className="mt-6 flex items-center justify-between w-full px-6 py-3 bg-slate-50 rounded-2xl text-xs text-slate-500">
              <span>Time Remaining: <strong className="text-slate-800 text-sm font-semibold">{timeFormatted}</strong></span>
              <span>Cycles: <strong className="text-indigo-600 font-semibold">{cyclesCount}</strong></span>
            </div>
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-slate-800 mb-2">Beautiful Breathing Session!</h4>
            <p className="text-sm text-slate-500 max-w-xs mb-6">
              You completed your diaphragmatic mindfulness wave. Your nervous system is grounded and centered.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 text-amber-700 font-semibold text-sm mb-6 border border-amber-200">
              <Sparkles className="w-4 h-4 text-amber-500" />
              +35 Companion XP Awarded
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-200 transition"
            >
              Return to Sanctuary
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
