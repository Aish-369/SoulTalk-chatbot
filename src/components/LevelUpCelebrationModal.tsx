import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Trophy, ArrowRight } from 'lucide-react';
import { WolfieCharacter } from './WolfieCharacter';
import { EVOLUTION_STAGES } from '../data/companionData';

interface LevelUpCelebrationModalProps {
  isOpen: boolean;
  newLevel: number;
  companionName: string;
  companionType: string;
  onClose: () => void;
}

export const LevelUpCelebrationModal: React.FC<LevelUpCelebrationModalProps> = ({
  isOpen,
  newLevel,
  companionName,
  companionType,
  onClose
}) => {
  if (!isOpen) return null;

  // Find stage matching new level
  const currentStage = [...EVOLUTION_STAGES].reverse().find(s => newLevel >= s.level) || EVOLUTION_STAGES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="relative w-full max-w-sm bg-gradient-to-b from-amber-50 via-white to-indigo-50 rounded-3xl p-6 text-center shadow-2xl border border-amber-100 overflow-hidden"
      >
        {/* Floating Sparks */}
        <div className="absolute top-4 left-6 text-2xl animate-bounce">✨</div>
        <div className="absolute top-8 right-6 text-2xl animate-bounce delay-150">🌟</div>

        <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center mb-3 shadow-inner">
          <Trophy className="w-7 h-7" />
        </div>

        <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Level Up!</h3>
        <p className="text-sm text-slate-500 mb-4">
          Your bond with <strong className="text-slate-800">{companionName}</strong> has flourished!
        </p>

        {/* Level badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-indigo-600 text-white font-bold text-base shadow-md mb-4">
          <Sparkles className="w-4 h-4" />
          Level {newLevel} • {currentStage.name}
        </div>

        {/* Companion celebrating */}
        <div className="my-2 flex justify-center">
          <WolfieCharacter
            emotion="CELEBRATING"
            size="MEDIUM"
            companionType={companionType}
          />
        </div>

        <p className="text-xs text-slate-600 bg-white/80 rounded-2xl p-3 border border-slate-100 mb-5">
          {currentStage.description}
        </p>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition"
        >
          <span>Keep Growing</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
};
