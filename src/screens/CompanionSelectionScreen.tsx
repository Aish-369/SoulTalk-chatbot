import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Check, Volume2, ArrowRight } from 'lucide-react';
import { COMPANIONS_LIST } from '../data/companionData';
import { CompanionInfo } from '../types';
import { WolfieCharacter } from '../components/WolfieCharacter';
import { speakText } from '../utils/audioSynthesis';

interface CompanionSelectionScreenProps {
  onCompanionSelected: (companion: CompanionInfo, customName: string) => void;
}

export const CompanionSelectionScreen: React.FC<CompanionSelectionScreenProps> = ({
  onCompanionSelected
}) => {
  const [selectedCompanion, setSelectedCompanion] = useState<CompanionInfo>(COMPANIONS_LIST[0]);
  const [customName, setCustomName] = useState(COMPANIONS_LIST[0].defaultName);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  const handleSelect = (companion: CompanionInfo) => {
    setSelectedCompanion(companion);
    setCustomName(companion.defaultName);
  };

  const handlePlayVoice = (e: React.MouseEvent, quote: string) => {
    e.stopPropagation();
    setIsPlayingVoice(true);
    speakText(quote, {
      pitch: selectedCompanion.id === 'mochi_cat' ? 1.25 : selectedCompanion.id === 'buddy_dog' ? 1.15 : 1.05,
      rate: selectedCompanion.id === 'zen_panda' ? 0.85 : 0.95,
      onEnd: () => setIsPlayingVoice(false)
    });
  };

  const handleConfirm = () => {
    onCompanionSelected(selectedCompanion, customName.trim() || selectedCompanion.defaultName);
  };

  return (
    <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-slate-50 via-indigo-50/30 to-purple-50/20 max-w-4xl mx-auto flex flex-col justify-between">
      {/* Header */}
      <div className="text-center mb-6">
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
          Step 1 of Sanctuary Setup
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mt-2">
          Choose Your AI Companion
        </h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
          Every companion brings a unique personality and listening style to support your daily wellness.
        </p>
      </div>

      {/* Grid of Companions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {COMPANIONS_LIST.map(comp => {
          const isSelected = selectedCompanion.id === comp.id;
          return (
            <motion.div
              key={comp.id}
              whileHover={{ y: -3 }}
              onClick={() => handleSelect(comp)}
              className={`p-5 rounded-3xl border cursor-pointer transition relative flex flex-col items-center text-center ${
                isSelected
                  ? 'bg-white border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg'
                  : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}

              {/* Character Canvas */}
              <div className="my-2">
                <WolfieCharacter
                  emotion={isSelected ? "HAPPY" : "LISTENING"}
                  size="MEDIUM"
                  companionType={comp.id}
                  isInteractive={false}
                />
              </div>

              <h3 className="font-bold text-slate-800 text-base flex items-center gap-1.5 mt-2">
                <span>{comp.name}</span>
                <span className="text-base">{comp.avatarEmoji}</span>
              </h3>

              {/* Traits */}
              <div className="flex flex-wrap items-center justify-center gap-1 my-2">
                {comp.traits.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <p className="text-xs text-slate-500 line-clamp-2 mt-1 mb-3">
                {comp.introduction}
              </p>

              {/* Voice button */}
              <button
                type="button"
                onClick={(e) => handlePlayVoice(e, comp.voiceQuote)}
                className="mt-auto px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Hear Voice</span>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Companion Customization & Confirmation Card */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-50 max-w-xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-3xl">
            {selectedCompanion.avatarEmoji}
          </div>
          <div className="flex-1 w-full text-center sm:text-left">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Name your companion
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Wolfie, Mochi..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800 font-semibold text-sm"
            />
          </div>
        </div>

        <button
          onClick={handleConfirm}
          className="mt-5 w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition"
        >
          <span>Adopt {customName || selectedCompanion.defaultName} & Proceed</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
