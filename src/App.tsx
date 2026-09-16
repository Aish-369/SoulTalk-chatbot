import React, { useState, useEffect } from 'react';
import {
  User,
  ScreenType,
  CompanionProgress,
  CompanionTheme,
  CompanionMemory,
  Achievement,
  MoodLog,
  VoiceMemory,
  CustomizationItem
} from './types';
import { COMPANION_THEMES, DEFAULT_ACHIEVEMENTS, EVOLUTION_STAGES } from './data/companionData';

// Screens
import { SplashScreen } from './screens/SplashScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { CompanionSelectionScreen } from './screens/CompanionSelectionScreen';
import { LoginSignupScreen } from './screens/LoginSignupScreen';
import { FirstMoodCheckInScreen } from './screens/FirstMoodCheckInScreen';
import { CompanionHomeScreen } from './screens/CompanionHomeScreen';
import { CompanionChatScreen } from './screens/CompanionChatScreen';
import { VoiceCompanionScreen } from './screens/VoiceCompanionScreen';
import { MoodTrackingHubScreen } from './screens/MoodTrackingHubScreen';
import { LifeTimelineScreen } from './screens/LifeTimelineScreen';
import { ProfileScreen } from './screens/ProfileScreen';

// Navigation & Modals
import { Navigation } from './components/Navigation';
import { BreathingExerciseModal } from './components/BreathingExerciseModal';
import { LevelUpCelebrationModal } from './components/LevelUpCelebrationModal';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
import { CustomizationModal } from './components/CustomizationModal';
import { EmergencyCrisisModal } from './components/EmergencyCrisisModal';
import { AnalyticsDashboardModal } from './components/AnalyticsDashboardModal';
import { analytics } from './utils/analytics';
import { authStorage, authenticatedFetch } from './utils/api';

export const App: React.FC = () => {
  // Screen State
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('splash');

  // User State
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('soultalk_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      id: 'usr_guest',
      name: 'Kind Soul',
      email: 'guest@soultalk.app',
      language: 'en',
      companion_type: 'wolfie_guardian',
      companion_name: 'Wolfie',
      personality_type: 'Gentle Friend',
      created_at: Date.now()
    };
  });

  // Progression
  const [progress, setProgress] = useState<CompanionProgress>(() => {
    const saved = localStorage.getItem('soultalk_progress');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      level: 3,
      xp: 140,
      streakDays: 4,
      todayActivity: 'Active in Sanctuary',
      friendshipLevel: 'Warm Soul Connection'
    };
  });

  // Theme
  const [currentTheme, setCurrentTheme] = useState<CompanionTheme>(() => {
    const saved = localStorage.getItem('soultalk_theme');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return COMPANION_THEMES[0];
  });

  // Equipped Wardrobe Accessories
  const [equippedAccessories, setEquippedAccessories] = useState<string[]>(() => {
    const saved = localStorage.getItem('soultalk_accessories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return ['item_leaf', 'item_scarf'];
  });

  // Memories & Timeline
  const [memories, setMemories] = useState<CompanionMemory[]>(() => {
    const saved = localStorage.getItem('soultalk_memories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 1,
        title: 'Entered Sanctuary',
        description: 'Began the mindful emotional journey with Wolfie.',
        icon: '🌱',
        date: Date.now() - 86400000 * 3,
        category: 'milestone'
      },
      {
        id: 2,
        title: '3-Minute Breathing Wave',
        description: 'Completed diaphragmatic breath rhythm to ease tension.',
        icon: '🌊',
        date: Date.now() - 86400000 * 2,
        category: 'breathing'
      },
      {
        id: 3,
        title: 'Moonlight Whisper Reflection',
        description: 'Shared spoken thoughts in the quiet evening room.',
        icon: '🌙',
        date: Date.now() - 86400000 * 1,
        category: 'voice'
      }
    ];
  });

  // Mood Logs
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>(() => {
    const saved = localStorage.getItem('soultalk_moods');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: 1, mood: 'calm', emotion: 'Calm', score: 8, notes: 'Feeling peaceful and grounded after morning tea.', created_at: Date.now() - 86400000 * 3 },
      { id: 2, mood: 'happy', emotion: 'Happy', score: 9, notes: 'Had a wonderful conversation with a close friend.', created_at: Date.now() - 86400000 * 2 },
      { id: 3, mood: 'anxious', emotion: 'Anxious', score: 4, notes: 'Work deadlines felt heavy, but took a breath.', created_at: Date.now() - 86400000 * 1 },
      { id: 4, mood: 'calm', emotion: 'Calm', score: 7, notes: 'Restored inner calm in the sanctuary.', created_at: Date.now() }
    ];
  });

  // Voice Memories
  const [voiceMemories, setVoiceMemories] = useState<VoiceMemory[]>(() => {
    const saved = localStorage.getItem('soultalk_voice_memories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  // Achievements
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem('soultalk_achievements');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_ACHIEVEMENTS;
  });

  // Modals state
  const [isBreathingModalOpen, setIsBreathingModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isWardrobeModalOpen, setIsWardrobeModalOpen] = useState(false);
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const [isLevelUpModalOpen, setIsLevelUpModalOpen] = useState(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [celebrationLevel, setCelebrationLevel] = useState(progress.level);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Track screen feature usage
  useEffect(() => {
    if (currentScreen !== 'splash') {
      analytics.trackFeatureUsage(`screen_${currentScreen}`);
    }
  }, [currentScreen]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('soultalk_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('soultalk_progress', JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem('soultalk_theme', JSON.stringify(currentTheme));
  }, [currentTheme]);

  useEffect(() => {
    localStorage.setItem('soultalk_accessories', JSON.stringify(equippedAccessories));
  }, [equippedAccessories]);

  useEffect(() => {
    localStorage.setItem('soultalk_memories', JSON.stringify(memories));
  }, [memories]);

  useEffect(() => {
    localStorage.setItem('soultalk_moods', JSON.stringify(moodLogs));
  }, [moodLogs]);

  useEffect(() => {
    localStorage.setItem('soultalk_voice_memories', JSON.stringify(voiceMemories));
  }, [voiceMemories]);

  // XP & Level-Up Handler
  const handleAddXp = (amount: number) => {
    setProgress(prev => {
      const nextXp = prev.xp + amount;
      const targetXp = prev.level * 100;
      if (nextXp >= targetXp) {
        const newLvl = prev.level + 1;
        setCelebrationLevel(newLvl);
        setIsLevelUpModalOpen(true);
        return {
          ...prev,
          level: newLvl,
          xp: nextXp - targetXp
        };
      }
      return {
        ...prev,
        xp: nextXp
      };
    });
  };

  const handleAddMemory = (newMemory: CompanionMemory) => {
    setMemories(prev => [newMemory, ...prev]);
  };

  const handleToggleAccessory = (item: CustomizationItem) => {
    setEquippedAccessories(prev => {
      if (prev.includes(item.id)) {
        return prev.filter(id => id !== item.id);
      } else {
        return [...prev, item.id];
      }
    });
  };

  const handleSaveVoiceMemory = (mem: VoiceMemory) => {
    setVoiceMemories(prev => [mem, ...prev]);
    handleAddMemory({
      id: mem.id,
      title: mem.title,
      description: mem.reflection,
      icon: '🎙️',
      date: mem.created_at,
      category: 'voice'
    });
  };

  const handleFirstCheckInComplete = (log: MoodLog) => {
    setMoodLogs(prev => [log, ...prev]);
    handleAddMemory({
      id: Date.now(),
      title: `Checked in as ${log.emotion}`,
      description: log.notes || 'Recorded first emotional check-in.',
      icon: log.mood === 'happy' ? '😊' : '😌',
      date: Date.now(),
      category: 'checkin'
    });
    handleAddXp(30);
    setCurrentScreen('dashboard');
  };

  // Render Screens
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Navigation header (shown only when in main app screens) */}
      {currentScreen !== 'splash' &&
        currentScreen !== 'onboarding' &&
        currentScreen !== 'companion_select' &&
        currentScreen !== 'auth' &&
        currentScreen !== 'first_checkin' && (
          <>
            <Navigation
              currentScreen={currentScreen}
              onNavigate={(s) => setCurrentScreen(s)}
              onOpenCrisis={() => setIsCrisisModalOpen(true)}
              companionName={user.companion_name}
            />
            {isOffline && (
              <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-xs text-amber-800 flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Offline Sanctuary Mode active — your chats, breathing exercises, and mood logs are safely preserved locally.</span>
              </div>
            )}
          </>
        )}

      {/* Screen Views */}
      <main>
        {currentScreen === 'splash' && (
          <SplashScreen
            onEnter={() => setCurrentScreen('onboarding')}
          />
        )}

        {currentScreen === 'onboarding' && (
          <OnboardingScreen
            onFinish={() => setCurrentScreen('companion_select')}
          />
        )}

        {currentScreen === 'companion_select' && (
          <CompanionSelectionScreen
            onCompanionSelected={(companion, name) => {
              setUser(prev => ({
                ...prev,
                companion_type: companion.id,
                companion_name: name
              }));
              setCurrentScreen('auth');
            }}
          />
        )}

        {currentScreen === 'auth' && (
          <LoginSignupScreen
            companionName={user.companion_name}
            companionType={user.companion_type}
            onAuthSuccess={(authedUser) => {
              setUser(authedUser);
              setCurrentScreen('first_checkin');
            }}
          />
        )}

        {currentScreen === 'first_checkin' && (
          <FirstMoodCheckInScreen
            companionName={user.companion_name}
            companionType={user.companion_type}
            onCheckInCompleted={handleFirstCheckInComplete}
          />
        )}

        {(currentScreen === 'dashboard' || currentScreen === 'companion_home') && (
          <CompanionHomeScreen
            user={user}
            progress={progress}
            theme={currentTheme}
            memories={memories}
            achievements={achievements}
            equippedAccessories={equippedAccessories}
            onNavigate={(s) => setCurrentScreen(s)}
            onOpenBreathing={() => setIsBreathingModalOpen(true)}
            onOpenThemeModal={() => setIsThemeModalOpen(true)}
            onOpenWardrobeModal={() => setIsWardrobeModalOpen(true)}
            onAddMemory={handleAddMemory}
            onAddXp={handleAddXp}
          />
        )}

        {currentScreen === 'chat' && (
          <CompanionChatScreen
            user={user}
            onBack={() => setCurrentScreen('dashboard')}
            onOpenBreathing={() => setIsBreathingModalOpen(true)}
            onOpenCrisis={() => setIsCrisisModalOpen(true)}
            onAddXp={handleAddXp}
          />
        )}

        {currentScreen === 'voice' && (
          <VoiceCompanionScreen
            user={user}
            voiceMemories={voiceMemories}
            onBack={() => setCurrentScreen('dashboard')}
            onSaveVoiceMemory={handleSaveVoiceMemory}
            onAddXp={handleAddXp}
          />
        )}

        {currentScreen === 'mood_hub' && (
          <MoodTrackingHubScreen
            user={user}
            moodLogs={moodLogs}
            onBack={() => setCurrentScreen('dashboard')}
            onOpenCheckIn={() => setCurrentScreen('first_checkin')}
          />
        )}

        {currentScreen === 'timeline' && (
          <LifeTimelineScreen
            user={user}
            memories={memories}
            onBack={() => setCurrentScreen('dashboard')}
            onAddMemory={handleAddMemory}
          />
        )}

        {currentScreen === 'profile' && (
          <ProfileScreen
            user={user}
            progress={progress}
            onBack={() => setCurrentScreen('dashboard')}
            onUpdateUser={(updated) => setUser(updated)}
            onSwitchCompanion={() => setCurrentScreen('companion_select')}
            onOpenAnalytics={() => setIsAnalyticsModalOpen(true)}
            onLogout={() => {
              authStorage.clearToken();
              localStorage.removeItem('soultalk_user');
              setCurrentScreen('login');
            }}
            onResetData={async () => {
              try {
                await authenticatedFetch('/api/data/delete', { method: 'DELETE' });
              } catch (e) {}
              authStorage.clearToken();
              localStorage.clear();
              window.location.reload();
            }}
          />
        )}
      </main>

      {/* Global Modals */}
      <AnalyticsDashboardModal
        isOpen={isAnalyticsModalOpen}
        onClose={() => setIsAnalyticsModalOpen(false)}
      />
      <BreathingExerciseModal
        isOpen={isBreathingModalOpen}
        onClose={() => setIsBreathingModalOpen(false)}
        onComplete={(xp) => handleAddXp(xp)}
        companionName={user.companion_name}
        companionType={user.companion_type}
      />

      <LevelUpCelebrationModal
        isOpen={isLevelUpModalOpen}
        newLevel={celebrationLevel}
        companionName={user.companion_name}
        companionType={user.companion_type}
        onClose={() => setIsLevelUpModalOpen(false)}
      />

      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        currentThemeId={currentTheme.id}
        onSelectTheme={(theme) => setCurrentTheme(theme)}
        onClose={() => setIsThemeModalOpen(false)}
      />

      <CustomizationModal
        isOpen={isWardrobeModalOpen}
        userLevel={progress.level}
        equippedIds={equippedAccessories}
        onToggleItem={handleToggleAccessory}
        onClose={() => setIsWardrobeModalOpen(false)}
      />

      <EmergencyCrisisModal
        isOpen={isCrisisModalOpen}
        onClose={() => setIsCrisisModalOpen(false)}
      />
    </div>
  );
};
