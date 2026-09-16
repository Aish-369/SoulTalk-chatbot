import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Sun, CloudRain, Cloud, CloudLightning, Wind, ArrowRight, Heart } from 'lucide-react';
import { WolfieCharacter } from '../components/WolfieCharacter';
import { MoodLog } from '../types';

interface FirstMoodCheckInScreenProps {
  companionName: string;
  companionType: string;
  onCheckInCompleted: (firstLog: MoodLog) => void;
}

interface MoodOption {
  label: string;
  icon: string;
  moodKey: string;
  weatherName: string;
  weatherDesc: string;
  speechMessage: string;
  score: number;
  color: string;
}

const MOOD_OPTIONS: MoodOption[] = [
  {
    label: "Happy",
    icon: "😊",
    moodKey: "happy",
    weatherName: "☀️ Sunny Mind",
    weatherDesc: "Your skies are open and clear! A bright wave of energy is warming your path.",
    speechMessage: "You're glowing! It feels so wonderful to celebrate this moment with you.",
    score: 9,
    color: "from-amber-400 to-amber-500"
  },
  {
    label: "Calm",
    icon: "😌",
    moodKey: "calm",
    weatherName: "🌟 Flourishing",
    weatherDesc: "A serene tranquility has settled over your soul. Centered, relaxed, and clear.",
    speechMessage: "A peaceful mind is such a gift. Let's anchor this stillness deep in your heart.",
    score: 8,
    color: "from-emerald-400 to-teal-500"
  },
  {
    label: "Neutral",
    icon: "😐",
    moodKey: "neutral",
    weatherName: "⛅ Gentle Breeze",
    weatherDesc: "A quiet, steady baseline. An open canvas for whatever the day holds.",
    speechMessage: "Taking things one breath at a time. I am right here beside you.",
    score: 5,
    color: "from-slate-400 to-slate-500"
  },
  {
    label: "Anxious",
    icon: "😰",
    moodKey: "anxious",
    weatherName: "💨 Gusty Winds",
    weatherDesc: "Your thoughts are racing like fast clouds. Take a deep breath with me.",
    speechMessage: "Your heart is moving fast. Place your hand gently on your chest; you are safe right now.",
    score: 3,
    color: "from-sky-400 to-indigo-500"
  },
  {
    label: "Stressed",
    icon: "😣",
    moodKey: "stressed",
    weatherName: "⚡ Storm Clouds",
    weatherDesc: "Pressure is weighing heavy on your shoulders. Let's release the burden.",
    speechMessage: "You carry so much responsibility. Give yourself permission to pause for 3 minutes.",
    score: 3,
    color: "from-purple-400 to-purple-600"
  },
  {
    label: "Sad",
    icon: "😢",
    moodKey: "sad",
    weatherName: "🌧️ Soft Rain",
    weatherDesc: "A quiet drizzle inside. It's okay to feel tender and let the rain fall.",
    speechMessage: "Tears are just words the heart is too tired to speak. I will sit in the quiet with you.",
    score: 2,
    color: "from-blue-400 to-indigo-600"
  }
];

export const FirstMoodCheckInScreen: React.FC<FirstMoodCheckInScreenProps> = ({
  companionName = 'Wolfie',
  companionType = 'wolfie_guardian',
  onCheckInCompleted
}) => {
  const [selectedMood, setSelectedMood] = useState<MoodOption>(MOOD_OPTIONS[1]); // Default Calm
  const [notes, setNotes] = useState('');

  const handleFinish = () => {
    const log: MoodLog = {
      id: Date.now(),
      mood: selectedMood.moodKey,
      emotion: selectedMood.label,
      score: selectedMood.score,
      notes: notes.trim(),
      created_at: Date.now()
    };
    onCheckInCompleted(log);
  };

  return (
    <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-slate-50 via-indigo-50/30 to-purple-50/20 max-w-2xl mx-auto flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="text-center mb-6">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
            Step 2 of Sanctuary Setup
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mt-2">
            How is your soul feeling today?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {companionName} uses your check-ins to provide personalized care and track your emotional weather.
          </p>
        </div>

        {/* Mood Selection Pills Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 mb-6">
          {MOOD_OPTIONS.map(option => {
            const isSelected = selectedMood.moodKey === option.moodKey;
            return (
              <button
                key={option.moodKey}
                type="button"
                onClick={() => setSelectedMood(option)}
                className={`p-3 rounded-2xl border transition flex flex-col items-center text-center ${
                  isSelected
                    ? 'bg-white border-indigo-500 ring-2 ring-indigo-500/20 shadow-md scale-105'
                    : 'bg-white/70 border-slate-200 hover:bg-white hover:border-slate-300'
                }`}
              >
                <span className="text-2xl sm:text-3xl mb-1">{option.icon}</span>
                <span className="text-xs font-semibold text-slate-700">{option.label}</span>
              </button>
            );
          })}
        </div>

        {/* Companion Feedback Card */}
        <motion.div
          key={selectedMood.moodKey}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-indigo-50 mb-6"
        >
          <div className="flex items-start gap-4">
            <div className="shrink-0">
              <WolfieCharacter
                emotion={selectedMood.moodKey === 'happy' ? 'HAPPY' : selectedMood.moodKey === 'anxious' || selectedMood.moodKey === 'stressed' ? 'SUPPORTIVE' : 'LISTENING'}
                size="SMALL"
                companionType={companionType}
              />
            </div>
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-2">
                <span>{selectedMood.weatherName}</span>
              </div>
              <p className="text-sm font-medium text-slate-800 mb-1">
                "{selectedMood.speechMessage}"
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                {selectedMood.weatherDesc}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Optional Reflection Note */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Add a gentle thought or context (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What contributed to how you feel right now?..."
            rows={3}
            className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 text-xs sm:text-sm resize-none"
          />
        </div>
      </div>

      {/* Complete Button */}
      <div className="mt-6">
        <button
          onClick={handleFinish}
          className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition"
        >
          <span>Complete Check-In & Enter Sanctuary</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
