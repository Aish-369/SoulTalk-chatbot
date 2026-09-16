import React from 'react';
import { motion } from 'motion/react';
import { X, Sparkles, Lock, Check } from 'lucide-react';
import { CUSTOMIZATION_ITEMS } from '../data/companionData';
import { CustomizationItem } from '../types';

interface CustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLevel: number;
  equippedIds: string[];
  onToggleItem: (item: CustomizationItem) => void;
}

export const CustomizationModal: React.FC<CustomizationModalProps> = ({
  isOpen,
  onClose,
  userLevel,
  equippedIds,
  onToggleItem
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-50 text-amber-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-lg">Companion Wardrobe</h3>
              <p className="text-xs text-slate-400">Unlock cute accessories as you level up</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
          {CUSTOMIZATION_ITEMS.map(item => {
            const isUnlocked = userLevel >= item.unlockLevel;
            const isEquipped = equippedIds.includes(item.id);

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (isUnlocked) onToggleItem(item);
                }}
                className={`p-3.5 rounded-2xl border transition relative flex flex-col items-center text-center select-none ${
                  !isUnlocked
                    ? 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed'
                    : isEquipped
                    ? 'bg-indigo-50/50 border-indigo-400 ring-2 ring-indigo-400/20 cursor-pointer'
                    : 'border-slate-200 hover:border-indigo-200 hover:bg-slate-50 cursor-pointer'
                }`}
              >
                <div className="text-3xl my-1">{item.icon}</div>
                <h4 className="font-semibold text-xs text-slate-800 mt-1">{item.name}</h4>
                <span className="text-[10px] text-slate-400 capitalize">{item.category}</span>

                {isEquipped && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] shadow-xs">
                    <Check className="w-3 h-3" />
                  </div>
                )}

                {!isUnlocked && (
                  <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-full">
                    <Lock className="w-2.5 h-2.5" />
                    Lvl {item.unlockLevel}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
