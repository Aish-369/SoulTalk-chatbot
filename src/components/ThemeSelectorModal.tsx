import React from 'react';
import { motion } from 'motion/react';
import { X, Check, Palette } from 'lucide-react';
import { COMPANION_THEMES } from '../data/companionData';
import { CompanionTheme } from '../types';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeId: string;
  onSelectTheme: (theme: CompanionTheme) => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  onClose,
  currentThemeId,
  onSelectTheme
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
            <div className="p-2 rounded-2xl bg-purple-50 text-purple-600">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-lg">Sanctuary Atmosphere</h3>
              <p className="text-xs text-slate-400">Choose your companion's calming environment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {COMPANION_THEMES.map(theme => {
            const isSelected = theme.id === currentThemeId;
            return (
              <div
                key={theme.id}
                onClick={() => {
                  onSelectTheme(theme);
                  onClose();
                }}
                style={{ backgroundColor: isSelected ? `${theme.backgroundColor}` : undefined }}
                className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                  isSelected
                    ? 'border-indigo-500 shadow-xs ring-2 ring-indigo-500/20'
                    : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs"
                    style={{ backgroundColor: theme.primaryColor + '20' }}
                  >
                    {theme.emoji}
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800 text-sm flex items-center gap-2">
                      {theme.name}
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: theme.primaryColor }}
                      />
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{theme.description}</p>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3.5 h-3.5" />
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
