import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Flame,
  Heart,
  Wind,
  MessageSquareHeart,
  Mic,
  BarChart3,
  BookOpen,
  Palette,
  Shirt,
  Trophy,
  Smile,
  Send,
  Feather,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { WolfieCharacter } from '../components/WolfieCharacter';
import {
  User,
  CompanionProgress,
  CompanionTheme,
  CompanionMemory,
  Achievement,
  CustomizationItem,
  ScreenType,
  WolfieEmotion
} from '../types';
import { EVOLUTION_STAGES } from '../data/companionData';

interface CompanionHomeScreenProps {
  user: User;
  progress: CompanionProgress;
  theme: CompanionTheme;
  memories: CompanionMemory[];
  achievements: Achievement[];
  equippedAccessories: string[];
  onNavigate: (screen: ScreenType) => void;
  onOpenBreathing: () => void;
  onOpenThemeModal: () => void;
  onOpenWardrobeModal: () => void;
  onAddMemory: (memory: CompanionMemory) => void;
  onAddXp: (xp: number) => void;
}

export const CompanionHomeScreen: React.FC<CompanionHomeScreenProps> = ({
  user,
  progress,
  theme,
  memories,
  achievements,
  equippedAccessories,
  onNavigate,
  onOpenBreathing,
  onOpenThemeModal,
  onOpenWardrobeModal,
  onAddMemory,
  onAddXp
}) => {
  const [companionEmotion, setCompanionEmotion] = useState<WolfieEmotion>('HAPPY');
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [unburdenText, setUnburdenText] = useState('');
  const [isUnburdening, setIsUnburdening] = useState(false);
  const [unburdenSuccess, setUnburdenSuccess] = useState(false);

  // Quick feelings state
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [echoResponse, setEchoResponse] = useState<string | null>(null);
  const [isEchoLoading, setIsEchoLoading] = useState(false);

  const companionQuotes = [
    `"I'm so glad you're here today, ${user.name}. How are you taking care of yourself?"`,
    `"Remember: you don't have to carry the weight of tomorrow right now."`,
    `"Even on quiet days, your presence makes the sanctuary brighter."`,
    `"Take a slow breath. Your pace is just right."`,
    `"I'm listening whenever you want to talk or whisper."`
  ];

  const currentStage = [...EVOLUTION_STAGES].reverse().find(s => progress.level >= s.level) || EVOLUTION_STAGES[0];
  const nextLevelXp = progress.level * 100;
  const xpPercentage = Math.min(100, Math.round((progress.xp / nextLevelXp) * 100));

  const handlePetCompanion = () => {
    setCompanionEmotion('CELEBRATING');
    setDialogueIndex((prev) => (prev + 1) % companionQuotes.length);
    onAddXp(5);
    setTimeout(() => {
      setCompanionEmotion('HAPPY');
    }, 2500);
  };

  const handleSelectFeeling = (feeling: string) => {
    setSelectedFeeling(feeling);
    setIsEchoLoading(true);
    setTimeout(() => {
      setIsEchoLoading(false);
      if (feeling === 'Overwhelmed') {
        setEchoResponse("I hear you. When things feel clouding, breathe deep and pick just one small element. You don't have to carry the whole world today. Let's rest here in safety.");
      } else if (feeling === 'Anxious') {
        setEchoResponse("Your heart is racing in anticipation. Place your hand gently upon your chest, inhale warmth, and exhale the future. Right here, right now, you are secure.");
      } else if (feeling === 'Tired') {
        setEchoResponse("Your energy is thin, and that is a direct, honest signal. Give yourself permission to pause. Rest is not something you have to earn; it is a sacred necessity.");
      } else if (feeling === 'Sad') {
        setEchoResponse("It is okay to grieve or feel quiet. Tears carry heavy words that are too painful to speak out loud. I am sitting alongside you through the silence.");
      } else {
        setEchoResponse("Such a wonderful state to hold. Breathe in this ease, anchor it deep within your memory. You can always retrieve this feeling when storms roll in later.");
      }
    }, 600);
  };

  const handleReleaseUnburden = () => {
    if (!unburdenText.trim()) return;
    setIsUnburdening(true);
    setTimeout(() => {
      setIsUnburdening(false);
      setUnburdenSuccess(true);
      setUnburdenText('');
      onAddXp(20);
      onAddMemory({
        id: Date.now(),
        title: "Unburdened A Heavy Thought",
        description: "Gently let go of an inner weight in the sanctuary scratchpad.",
        icon: "🕊️",
        date: Date.now(),
        category: "journal"
      });
      setTimeout(() => setUnburdenSuccess(false), 4000);
    }, 1200);
  };

  return (
    <div
      className="min-h-screen pb-24 transition-colors duration-500"
      style={{ backgroundColor: theme.backgroundColor }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Top Status & Progression Bar */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs"
              style={{ backgroundColor: theme.primaryColor + '20' }}
            >
              {theme.emoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-800 text-lg sm:text-xl">{user.companion_name}</h2>
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  Lvl {progress.level} • {currentStage.name}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Friendship: <strong className="text-indigo-600">{progress.friendshipLevel}</strong> • {progress.todayActivity}
              </p>
            </div>
          </div>

          {/* Quick controls: theme, wardrobe, streak */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{progress.streakDays} Day Streak</span>
            </div>

            <button
              onClick={onOpenWardrobeModal}
              className="p-2 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition"
              title="Companion Wardrobe"
            >
              <Shirt className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenThemeModal}
              className="p-2 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition"
              title="Change Sanctuary Atmosphere"
            >
              <Palette className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* XP Progress Sub-bar */}
        <div className="bg-white/80 rounded-2xl px-5 py-3 border border-slate-100 flex items-center justify-between gap-4 text-xs">
          <div className="flex-1">
            <div className="flex items-center justify-between text-slate-500 font-medium mb-1">
              <span>Next Evolution Progress</span>
              <span>{progress.xp} / {nextLevelXp} XP ({xpPercentage}%)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpPercentage}%` }}
                transition={{ duration: 0.8 }}
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Main Companion Sanctuary Stage */}
        <div className="relative bg-white/95 rounded-3xl p-6 sm:p-10 shadow-lg border border-indigo-50/50 flex flex-col items-center text-center overflow-hidden">
          {/* Subtle Ambient Background Gradient */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 40%, ${theme.primaryColor}, transparent 70%)`
            }}
          />

          {/* Speech Bubble */}
          <motion.div
            key={dialogueIndex}
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="relative z-10 max-w-md bg-white/90 backdrop-blur-md px-5 py-3.5 rounded-3xl shadow-sm border border-slate-100 mb-4"
          >
            <p className="text-sm font-medium text-slate-700 leading-relaxed italic">
              {companionQuotes[dialogueIndex]}
            </p>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-slate-100 rotate-45" />
          </motion.div>

          {/* Interactive Animated Wolfie / Companion */}
          <div className="relative z-10 my-3">
            <WolfieCharacter
              emotion={companionEmotion}
              size="LARGE"
              companionType={user.companion_type}
              equippedAccessories={equippedAccessories}
              onClick={handlePetCompanion}
            />
            <p className="text-[11px] text-slate-400 font-medium mt-1">Tap {user.companion_name} to pet & bond (+5 XP)</p>
          </div>

          {/* Core Action CTAs: 3 Key Paths */}
          <div className="z-10 mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full max-w-2xl">
            {/* Chat CTA */}
            <button
              onClick={() => onNavigate('chat')}
              className="p-4 rounded-2xl bg-indigo-50/70 hover:bg-indigo-50 border border-indigo-100 flex items-center gap-3 text-left transition group shadow-xs"
            >
              <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <MessageSquareHeart className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Companion Chat</h4>
                <p className="text-xs text-slate-500">Expressive AI dialogue & voice</p>
              </div>
            </button>

            {/* Voice Room CTA */}
            <button
              onClick={() => onNavigate('voice')}
              className="p-4 rounded-2xl bg-sky-50/70 hover:bg-sky-50 border border-sky-100 flex items-center gap-3 text-left transition group shadow-xs"
            >
              <div className="w-11 h-11 rounded-2xl bg-sky-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Whisper Room</h4>
                <p className="text-xs text-slate-500">Audio sanctuary & reflections</p>
              </div>
            </button>

            {/* Breathing Wave CTA */}
            <button
              onClick={onOpenBreathing}
              className="p-4 rounded-2xl bg-emerald-50/70 hover:bg-emerald-50 border border-emerald-100 flex items-center gap-3 text-left transition group shadow-xs"
            >
              <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <Wind className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Breathing Wave</h4>
                <p className="text-xs text-slate-500">3-minute mindful reset</p>
              </div>
            </button>
          </div>
        </div>

        {/* Empathetic Echo (Emotional Check-in section) */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <h3 className="font-bold text-slate-800 text-base">How does your soul feel right now?</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Tap a state for an immediate empathetic reflection from {user.companion_name}.
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {['Overwhelmed', 'Anxious', 'Tired', 'Sad', 'Peaceful'].map(feeling => {
              const isSelected = selectedFeeling === feeling;
              return (
                <button
                  key={feeling}
                  onClick={() => handleSelectFeeling(feeling)}
                  className={`px-4 py-2 rounded-2xl text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {feeling}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {selectedFeeling && (
              <motion.div
                key={selectedFeeling}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-slate-800 text-xs sm:text-sm leading-relaxed"
              >
                {isEchoLoading ? (
                  <div className="flex items-center gap-2 text-indigo-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                    <span>Listening closely to your heart...</span>
                  </div>
                ) : (
                  <div>
                    <div className="font-bold text-indigo-900 mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Empathetic Echo</span>
                    </div>
                    <p className="text-slate-700">{echoResponse}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Unburden Your Heart Scratchpad */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <Feather className="w-4 h-4 text-purple-600" />
            <h3 className="font-bold text-slate-800 text-base">Unburden Your Heart</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Type out anything weighing you down. As you release it, it gently fades away into the sanctuary without saving.
          </p>

          <div className="relative">
            <textarea
              value={unburdenText}
              onChange={(e) => setUnburdenText(e.target.value)}
              placeholder="I am holding onto..."
              rows={3}
              disabled={isUnburdening}
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 text-xs sm:text-sm resize-none disabled:opacity-50"
            />

            {unburdenText.trim() && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={handleReleaseUnburden}
                  disabled={isUnburdening}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-xs shadow-md shadow-purple-100 flex items-center gap-1.5 transition"
                >
                  {isUnburdening ? (
                    <span>Letting go gently...</span>
                  ) : (
                    <>
                      <span>Let It Go</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {unburdenSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Your thought has been released into peace. +20 XP awarded!</span>
            </motion.div>
          )}
        </div>

        {/* Memories & Milestones Split Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Memories */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-sm">Sanctuary Memories</h3>
              </div>
              <button
                onClick={() => onNavigate('timeline')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {memories.slice(0, 3).map((mem) => (
                <div key={mem.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <div className="text-xl p-1.5 bg-white rounded-xl shadow-xs">{mem.icon}</div>
                  <div>
                    <h4 className="font-semibold text-xs text-slate-800">{mem.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{mem.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-slate-800 text-sm">Growth Achievements</h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {achievements.filter(a => a.unlocked).length} / {achievements.length} Unlocked
              </span>
            </div>

            <div className="space-y-2.5">
              {achievements.slice(0, 3).map(ach => (
                <div
                  key={ach.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                    ach.unlocked
                      ? 'bg-amber-50/50 border-amber-100 text-slate-800'
                      : 'bg-slate-50 border-slate-100 text-slate-400 opacity-75'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{ach.icon}</span>
                    <div>
                      <h4 className="font-semibold text-xs text-slate-800">{ach.title}</h4>
                      <p className="text-[10px] text-slate-500 line-clamp-1">{ach.description}</p>
                    </div>
                  </div>
                  {ach.unlocked ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                      Unlocked
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-400">
                      {ach.progress}/{ach.maxProgress}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
