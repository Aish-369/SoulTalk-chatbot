export interface User {
  id: number | string;
  name: string;
  email: string;
  language: string;
  companion_type: string;
  companion_name: string;
  personality_type: string;
  created_at?: number;
}

export interface CompanionProgress {
  level: number;
  xp: number;
  stage: string;
  streakDays: number;
  totalSessions: number;
  friendshipLevel: string;
  todayActivity: string;
}

export interface EvolutionStage {
  level: number;
  name: string;
  description: string;
  scale: number;
  accessories: string[];
}

export interface CompanionTheme {
  id: string;
  name: string;
  emoji: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  description: string;
}

export interface CompanionMemory {
  id: number | string;
  title: string;
  description: string;
  icon: string;
  date: number;
  category: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number | null;
  progress: number;
  maxProgress: number;
}

export interface CustomizationItem {
  id: string;
  name: string;
  icon: string;
  category: 'head' | 'neck' | 'back' | 'accessory' | 'special';
  unlocked: boolean;
  unlockLevel: number;
  equipped?: boolean;
}

export interface MoodLog {
  id: number | string;
  mood: string;
  emotion: string;
  score: number;
  notes?: string;
  created_at: number;
}

export interface EmotionalWeather {
  id: number | string;
  weather: string;
  score: number;
  generated_at: number;
}

export interface ChatMessage {
  id: number | string;
  role: 'user' | 'companion';
  message: string;
  emotion?: string;
  confidence?: number;
  created_at: number;
}

export interface VoiceMemory {
  id: number | string;
  title: string;
  transcript: string;
  emotion: string;
  confidence: number;
  reflection: string;
  themes: string[];
  action: string;
  duration_sec: number;
  created_at: number;
}

export type TimelineEventType = 
  | 'FIRST_ENTRY'
  | 'JOURNAL_MOMENT'
  | 'CHAT_BREAKTHROUGH'
  | 'BREATHING_SESSION'
  | 'VOICE_REFLECTION'
  | 'EMOTIONAL_RECOVERY'
  | 'ACHIEVEMENT';

export interface TimelineEvent {
  id: number | string;
  eventType: TimelineEventType;
  date: number;
  emotion: string;
  emotionIcon: string;
  title: string;
  description: string;
  aiReflection: string;
  emotionalWeather: string;
}

export interface AIInsights {
  weekly_summary: string;
  achievements: string[];
  growth_areas: string[];
  personalized_encouragement: string;
  insights: string[];
  most_common_emotion: string;
  best_day_of_week: string;
  most_positive_time: string;
  stress_triggers: string;
  mood_improvement_factors: string;
}

export type ScreenType = 
  | 'splash'
  | 'onboarding'
  | 'companion_select'
  | 'login'
  | 'auth'
  | 'first_mood'
  | 'first_checkin'
  | 'dashboard'
  | 'companion_home'
  | 'chat'
  | 'voice'
  | 'mood_hub'
  | 'timeline'
  | 'profile'
  | 'settings';

export type WolfieEmotion =
  | 'LISTENING'
  | 'THINKING'
  | 'HAPPY'
  | 'CELEBRATING'
  | 'MEDITATING'
  | 'SLEEPING'
  | 'TYPING'
  | 'SUPPORTIVE';

export type WolfieSize = 'SMALL' | 'MEDIUM' | 'LARGE';

export interface CompanionInfo {
  id: string;
  name: string;
  defaultName: string;
  traits: string[];
  accentColor: string;
  introduction: string;
  description: string;
  voiceQuote: string;
  avatarEmoji: string;
}

export interface WhisperEnv {
  id: string;
  name: string;
  icon: string;
  startColor: string;
  endColor: string;
  description: string;
  ambientType: 'rain' | 'ocean' | 'night' | 'forest' | 'clouds';
}
