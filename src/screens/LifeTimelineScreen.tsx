import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Sparkles,
  ArrowLeft,
  Play,
  Pause,
  Plus,
  Heart,
  Calendar,
  Feather,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { CompanionMemory, User } from '../types';
import { WolfieCharacter } from '../components/WolfieCharacter';

interface LifeTimelineScreenProps {
  user: User;
  memories: CompanionMemory[];
  onBack: () => void;
  onAddMemory: (memory: CompanionMemory) => void;
}

export const LifeTimelineScreen: React.FC<LifeTimelineScreenProps> = ({
  user,
  memories,
  onBack,
  onAddMemory
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isStoryMode, setIsStoryMode] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);
  const [isPlayingStory, setIsPlayingStory] = useState(false);

  // New Journal Entry state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newIcon, setNewIcon] = useState('🌱');

  // AI Growth Summary state
  const [growthSummary, setGrowthSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const filteredMemories = memories.filter(m => {
    if (selectedCategory === 'all') return true;
    return m.category === selectedCategory;
  });

  const handleGenerateAISummary = () => {
    setIsGeneratingSummary(true);
    setTimeout(() => {
      setIsGeneratingSummary(false);
      setGrowthSummary(
        `Over the past milestones, ${user.name}, you have cultivated authentic self-compassion. From your diaphragmatic breathing practices to honest emotional reflections, you are creating a reliable sanctuary within yourself. Your companion ${user.companion_name} celebrates how thoughtfully you nurture your mind.`
      );
    }, 900);
  };

  const handleCreateMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const entry: CompanionMemory = {
      id: Date.now(),
      title: newTitle.trim(),
      description: newDesc.trim() || 'A peaceful moment recorded in the sanctuary timeline.',
      icon: newIcon,
      date: Date.now(),
      category: 'journal'
    };

    onAddMemory(entry);
    setNewTitle('');
    setNewDesc('');
    setShowAddModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-100 px-4 sm:px-6 py-4 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-bold text-slate-800 text-lg sm:text-xl flex items-center gap-2">
              <span>Sanctuary Journal & Timeline</span>
              <BookOpen className="w-5 h-5 text-indigo-600" />
            </h2>
            <p className="text-xs text-slate-500">Every milestone, voice reflection, and mindful memory</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-200 transition"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Reflection</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* AI Growth Summary Banner */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" />
                <span>AI Growth Reflection</span>
              </div>
              <h3 className="font-bold text-lg text-white">Your Emotional Timeline Story</h3>
              <p className="text-xs text-indigo-200 mt-1 max-w-lg">
                Generate an AI synthesis of your mental wellness journey and milestones.
              </p>
            </div>

            <button
              onClick={handleGenerateAISummary}
              disabled={isGeneratingSummary}
              className="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold flex items-center gap-2 transition backdrop-blur-md shrink-0 border border-white/20"
            >
              {isGeneratingSummary ? (
                <span>Synthesizing...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Synthesize Journey</span>
                </>
              )}
            </button>
          </div>

          {growthSummary && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-2xl bg-white/10 border border-white/20 text-xs sm:text-sm text-indigo-100 leading-relaxed italic"
            >
              "{growthSummary}"
            </motion.div>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: 'all', label: 'All Moments' },
              { id: 'checkin', label: 'Check-Ins' },
              { id: 'voice', label: 'Voice Whispers' },
              { id: 'breathing', label: 'Breathing' },
              { id: 'journal', label: 'Personal Notes' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-semibold transition whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            {filteredMemories.length} Memories
          </span>
        </div>

        {/* Timeline Stream */}
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {filteredMemories.map((mem, idx) => (
            <motion.div
              key={mem.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="relative"
            >
              {/* Timeline marker icon */}
              <div className="absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white border-2 border-indigo-500 flex items-center justify-center text-xs sm:text-sm shadow-xs">
                {mem.icon}
              </div>

              {/* Memory Card */}
              <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 hover:border-slate-200 transition">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="font-semibold uppercase tracking-wider text-indigo-600 text-[10px] bg-indigo-50 px-2 py-0.5 rounded-md">
                    {mem.category}
                  </span>
                  <span>{new Date(mem.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm mt-1">{mem.title}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{mem.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Add Reflection Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-800 text-base">Record a Journal Reflection</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMemory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. A Quiet Morning Walk"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Reflection Note</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="What feelings or insights emerged?..."
                  rows={4}
                  className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 text-xs sm:text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Pick an Icon</label>
                <div className="flex gap-2">
                  {['🌱', '🌸', '🕊️', '☀️', '🌊', '🌙', '☕', '📖'].map(emoji => (
                    <button
                      type="button"
                      key={emoji}
                      onClick={() => setNewIcon(emoji)}
                      className={`text-xl p-2 rounded-xl border transition ${
                        newIcon === emoji ? 'bg-indigo-50 border-indigo-500 scale-110' : 'border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-200 transition"
                >
                  Save Reflection
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
