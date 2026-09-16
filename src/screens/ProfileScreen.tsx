import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  User as UserIcon,
  Sparkles,
  ArrowLeft,
  Settings,
  Shield,
  Download,
  Trash2,
  Globe,
  Bot,
  Heart,
  CheckCircle2,
  BarChart3,
  RefreshCw,
  FileText,
  Lock,
  Cpu
} from 'lucide-react';
import { User, CompanionProgress } from '../types';
import { WolfieCharacter } from '../components/WolfieCharacter';
import { PrivacyAndTermsModal } from '../components/PrivacyAndTermsModal';

interface ProfileScreenProps {
  user: User;
  progress: CompanionProgress;
  onBack: () => void;
  onUpdateUser: (updatedUser: User) => void;
  onSwitchCompanion: () => void;
  onOpenAnalytics?: () => void;
  onLogout?: () => void;
  onResetData?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  progress,
  onBack,
  onUpdateUser,
  onSwitchCompanion,
  onOpenAnalytics,
  onLogout,
  onResetData
}) => {
  const [name, setName] = useState(user.name);
  const [companionName, setCompanionName] = useState(user.companion_name);
  const [personality, setPersonality] = useState(user.personality_type || 'Gentle Friend');
  const [language, setLanguage] = useState(user.language || 'en');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [privacyModalTab, setPrivacyModalTab] = useState<'privacy' | 'terms' | 'datasafety'>('privacy');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: User = {
      ...user,
      name: name.trim() || user.name,
      companion_name: companionName.trim() || user.companion_name,
      personality_type: personality,
      language
    };
    onUpdateUser(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportData = () => {
    const backupData = {
      user,
      progress,
      exportedAt: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `soultalk-sanctuary-backup-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
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
              <span>Sanctuary Settings & Profile</span>
              <Settings className="w-5 h-5 text-indigo-600" />
            </h2>
            <p className="text-xs text-slate-500">Companion personality, language, and privacy settings</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Companion Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center gap-5">
          <div className="w-24 h-24 rounded-3xl bg-indigo-50 flex items-center justify-center shrink-0">
            <WolfieCharacter
              emotion="HAPPY"
              size="SMALL"
              companionType={user.companion_type}
            />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h3 className="font-bold text-slate-800 text-lg">{user.companion_name}</h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                Level {progress.level} Companion
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Friendship Bond: <strong className="text-indigo-600">{progress.friendshipLevel}</strong> • {progress.streakDays} Day Mindfulness Streak
            </p>

            <button
              onClick={onSwitchCompanion}
              className="mt-3 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 mx-auto sm:mx-0 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Change Companion Archetype</span>
            </button>
          </div>
        </div>

        {/* Profile & Tone Form */}
        <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-5">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-600" />
            <span>Companion Tuning</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Companion Name</label>
              <input
                type="text"
                value={companionName}
                onChange={(e) => setCompanionName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">AI Listening Style & Tone</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'Gentle Friend', desc: 'Warm, compassionate, validation focused' },
                { id: 'Calm Listener', desc: 'Quiet, reflective, space-holding' },
                { id: 'Motivational Coach', desc: 'Encouraging, action-oriented, uplifting' }
              ].map(tone => (
                <button
                  type="button"
                  key={tone.id}
                  onClick={() => setPersonality(tone.id)}
                  className={`p-3 rounded-2xl border text-left transition ${
                    personality === tone.id
                      ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <h4 className="font-bold text-xs text-slate-800">{tone.id}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{tone.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Language Preference</label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { code: 'en', name: 'English 🇬🇧' },
                { code: 'hi', name: 'हिन्दी (Hindi) 🇮🇳' },
                { code: 'mr', name: 'मराठी (Marathi) 🇮🇳' }
              ].map(lang => (
                <button
                  type="button"
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold transition ${
                    language === lang.code
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {savedSuccess ? (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Settings saved successfully!
              </span>
            ) : (
              <div />
            )}

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-200 transition"
            >
              Save Preferences
            </button>
          </div>
        </form>

        {/* Privacy, Export & Backup */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Sanctuary Privacy, Legal & Data Vault</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your emotional journey is completely private. Conversations are never sold or shared with advertisers. You have full ownership and control to export, audit, or permanently erase your data at any moment.
          </p>

          {/* Legal and Privacy Document Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => {
                setPrivacyModalTab('privacy');
                setShowPrivacyModal(true);
              }}
              className="p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-100 hover:border-indigo-200 text-left transition cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 group-hover:text-indigo-700">
                <Lock className="w-3.5 h-3.5 text-indigo-500" />
                <span>Privacy Policy</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Zero-ad data pledge & AI usage</p>
            </button>

            <button
              type="button"
              onClick={() => {
                setPrivacyModalTab('terms');
                setShowPrivacyModal(true);
              }}
              className="p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-100 hover:border-indigo-200 text-left transition cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 group-hover:text-indigo-700">
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                <span>Terms of Service</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Non-clinical disclaimer & guidelines</p>
            </button>

            <button
              type="button"
              onClick={() => {
                setPrivacyModalTab('datasafety');
                setShowPrivacyModal(true);
              }}
              className="p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-100 hover:border-indigo-200 text-left transition cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 group-hover:text-indigo-700">
                <Cpu className="w-3.5 h-3.5 text-emerald-500" />
                <span>Play Store Safety</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Data minimization & encryption</p>
            </button>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {onOpenAnalytics && (
              <button
                type="button"
                onClick={onOpenAnalytics}
                className="px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-xs"
              >
                <BarChart3 className="w-4 h-4 text-teal-600" />
                <span>Product & Growth Analytics</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportData}
              className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-indigo-600" />
              <span>Export Sanctuary JSON</span>
            </button>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <span>Log Out</span>
              </button>
            )}

            {onResetData && (
              <button
                type="button"
                onClick={() => setShowConfirmReset(true)}
                className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-rose-100"
              >
                <Trash2 className="w-4 h-4 text-rose-500" />
                <span>Delete Account & Data</span>
              </button>
            )}
          </div>

          {showConfirmReset && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-3 animate-fade-in">
              <p className="font-semibold">
                ⚠️ Permanent Action: This will permanently erase your chat history, journal memories, mood records, and account data from this device. This cannot be undone.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onResetData?.();
                    setShowConfirmReset(false);
                  }}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold"
                >
                  Confirm & Delete All
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmReset(false)}
                  className="px-3 py-1.5 bg-white text-slate-700 rounded-lg border border-slate-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      <PrivacyAndTermsModal
        isOpen={showPrivacyModal}
        initialTab={privacyModalTab}
        onClose={() => setShowPrivacyModal(false)}
      />
    </div>
  );
};
