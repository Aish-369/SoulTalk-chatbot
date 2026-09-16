import React from 'react';
import {
  Home,
  MessageSquareHeart,
  Mic,
  BarChart3,
  BookOpen,
  User,
  ShieldAlert
} from 'lucide-react';
import { ScreenType } from '../types';
import { SoulTalkLogo } from './SoulTalkLogo';

interface NavigationProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  onOpenCrisis: () => void;
  companionName?: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentScreen,
  onNavigate,
  onOpenCrisis,
  companionName = 'Wolfie'
}) => {
  const navItems: { id: ScreenType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Sanctuary', icon: Home },
    { id: 'chat', label: 'Chat', icon: MessageSquareHeart },
    { id: 'voice', label: 'Voice Room', icon: Mic },
    { id: 'mood_hub', label: 'Moods', icon: BarChart3 },
    { id: 'timeline', label: 'Journal', icon: BookOpen },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div
          onClick={() => onNavigate('dashboard')}
          className="cursor-pointer select-none py-1 group flex items-center"
          title="Return to SoulTalk Sanctuary"
        >
          <SoulTalkLogo size="sm" useImage={true} showText={true} showTagline={true} />
        </div>

        {/* Clean Center Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/60 p-1 rounded-2xl border border-slate-200/50">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id || (item.id === 'dashboard' && currentScreen === 'companion_home');
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
                }`}
              >
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Section: Emergency Assistance */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCrisis}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50/80 hover:bg-rose-100/80 text-rose-600 text-xs font-medium transition border border-rose-100/80 cursor-pointer shadow-xs"
            title="Crisis Helplines & Immediate Human Support"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            <span className="hidden sm:inline">Emergency Help</span>
          </button>
        </div>
      </div>

      {/* Clean Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 px-3 py-1.5 flex items-center justify-around shadow-sm">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id || (item.id === 'dashboard' && currentScreen === 'companion_home');
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition ${
                isActive ? 'text-purple-600 font-semibold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
