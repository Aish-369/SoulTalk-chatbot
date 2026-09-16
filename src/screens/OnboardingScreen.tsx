import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ArrowLeft, Sparkles, Heart, Shield, Compass } from 'lucide-react';
import { WolfieCharacter } from '../components/WolfieCharacter';
import { analytics } from '../utils/analytics';

interface OnboardingScreenProps {
  onFinish: () => void;
}

const ONBOARDING_PAGES = [
  {
    title: "A Safe Space For Your Thoughts",
    description: "Talk freely, reflect deeply, and explore your emotions with a gentle, non-judgmental AI companion.",
    icon: Heart,
    emotion: "SUPPORTIVE" as const,
    color: "from-purple-500 to-indigo-600",
    bgLight: "bg-purple-50"
  },
  {
    title: "Understand Your Emotional Journey",
    description: "Track your moods, discover psychological patterns, and explore your emotional weather over time.",
    icon: Compass,
    emotion: "THINKING" as const,
    color: "from-sky-500 to-indigo-600",
    bgLight: "bg-sky-50"
  },
  {
    title: "Grow Together Every Day",
    description: "Build mindful habits, practice guided diaphragmatic breathing, and watch your companion evolve.",
    icon: Shield,
    emotion: "HAPPY" as const,
    color: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-50"
  }
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinish }) => {
  const [currentPage, setCurrentPage] = useState(0);

  const page = ONBOARDING_PAGES[currentPage];
  const Icon = page.icon;

  const handleNext = () => {
    if (currentPage < ONBOARDING_PAGES.length - 1) {
      setCurrentPage(prev => prev + 1);
    } else {
      analytics.trackOnboardingCompletion('default_wolfie', ONBOARDING_PAGES.length);
      onFinish();
    }
  };

  const handleBack = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between p-6 bg-gradient-to-b from-white via-slate-50 to-indigo-50/30">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        {currentPage > 0 ? (
          <button
            onClick={handleBack}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <div />
        )}
        <button
          onClick={onFinish}
          className="text-xs font-semibold text-slate-400 hover:text-slate-700 transition px-3 py-1.5"
        >
          Skip
        </button>
      </div>

      {/* Main Content Carousel */}
      <div className="max-w-md mx-auto w-full my-auto text-center flex flex-col items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
          >
            {/* Animated Character & Icon */}
            <div className="relative mb-8">
              <div className={`w-36 h-36 rounded-3xl ${page.bgLight} flex items-center justify-center shadow-lg border border-white`}>
                <WolfieCharacter
                  emotion={page.emotion}
                  size="LARGE"
                  companionType="wolfie_guardian"
                />
              </div>
              <div className={`absolute -bottom-3 -right-3 p-3 rounded-2xl bg-gradient-to-r ${page.color} text-white shadow-md`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight mb-3">
              {page.title}
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-500 max-w-sm leading-relaxed mb-6">
              {page.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Indicators */}
        <div className="flex items-center gap-2 mt-4">
          {ONBOARDING_PAGES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentPage ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-200 hover:bg-slate-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="max-w-md mx-auto w-full mt-6">
        <button
          onClick={handleNext}
          className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition"
        >
          <span>{currentPage === ONBOARDING_PAGES.length - 1 ? 'Meet Your Companion' : 'Continue'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
