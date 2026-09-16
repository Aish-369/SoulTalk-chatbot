import {
  CompanionInfo,
  CompanionTheme,
  EvolutionStage,
  CustomizationItem,
  Achievement,
  WhisperEnv,
  TimelineEvent
} from '../types';

export const COMPANIONS_LIST: CompanionInfo[] = [
  {
    id: "wolfie_guardian",
    name: "Wolfie",
    defaultName: "Wolfie",
    traits: ["Protective", "Loyal", "Wise", "Empathetic"],
    accentColor: "#6366F1", // Indigo
    introduction: "I'm Wolfie! I walk beside you through stormy days and celebrate every single step forward.",
    description: "Wolfie is your gentle guardian companion. With keen ears, a warm heart, and intuitive empathy, Wolfie helps you face anxiety, ground your racing thoughts, and grow in resilience.",
    voiceQuote: "Awooo! Welcome, friend! I promise to stay by your side no matter how dark the path gets.",
    avatarEmoji: "🐺"
  },
  {
    id: "mochi_cat",
    name: "Mochi Cat",
    defaultName: "Mochi",
    traits: ["Calm", "Friendly", "Comforting", "Zen"],
    accentColor: "#10B981", // Emerald
    introduction: "Hi, I'm Mochi. I'll be here whenever you need a quiet, peaceful space.",
    description: "Mochi is a master of peaceful presence. Best suited for deep listening, quiet companionship, and grounding your thoughts when things move too fast.",
    voiceQuote: "Purr... Hello! I'm Mochi. I am so glad to meet you. Let's rest our minds together.",
    avatarEmoji: "🐱"
  },
  {
    id: "buddy_dog",
    name: "Buddy Dog",
    defaultName: "Buddy",
    traits: ["Energetic", "Loyal", "Supportive", "Optimistic"],
    accentColor: "#0284C7", // Sky Blue
    introduction: "Hi, I'm Buddy! We'll celebrate every single victory, big or small, together.",
    description: "Buddy brings a warm spark of active optimism. Perfect for starting positive habits, celebrating steps, and gently encouraging you through heavy days.",
    voiceQuote: "Woof! Hi friend! You did incredible just getting through today. We make the best team!",
    avatarEmoji: "🐶"
  },
  {
    id: "nova_fox",
    name: "Nova Fox",
    defaultName: "Nova",
    traits: ["Curious", "Smart", "Playful", "Insightful"],
    accentColor: "#8B5CF6", // Purple
    introduction: "Hi, I'm Nova! Let's discover new strengths and fresh perspectives together.",
    description: "Nova is playful, smart, and loves cognitive exploration. Best for creative distraction, daily mindfulness prompts, and finding light perspectives.",
    voiceQuote: "Hello there! I'm Nova. The world is full of secret beauty, let's go find some of it together.",
    avatarEmoji: "🦊"
  },
  {
    id: "zen_panda",
    name: "Zen Panda",
    defaultName: "Bao",
    traits: ["Mindful", "Patient", "Grounded", "Gentle"],
    accentColor: "#059669", // Green
    introduction: "Greetings. I am Bao. Together we shall practice stilling the mind like water.",
    description: "Bao is rooted in mindfulness and stillness. Perfect for guided breathing, slowing down overthinking, and finding inner peace.",
    voiceQuote: "Breathe in peace, exhale tension. All things find their rhythm in time.",
    avatarEmoji: "🐼"
  }
];

export const EVOLUTION_STAGES: EvolutionStage[] = [
  {
    level: 1,
    name: "Tiny Companion",
    description: "Just awakened. Shy, curious, and excited to get to know you.",
    scale: 0.85,
    accessories: ["Leaf Pin"]
  },
  {
    level: 5,
    name: "Growing Companion",
    description: "Building confidence. Smiles more often and remembers your daily routine.",
    scale: 0.95,
    accessories: ["Leaf Pin", "Red Cozy Scarf"]
  },
  {
    level: 10,
    name: "Healthy Companion",
    description: "Stronger bond. Gives deeper reflections and suggests mindful pauses.",
    scale: 1.05,
    accessories: ["Leaf Pin", "Red Cozy Scarf", "Smart Glasses"]
  },
  {
    level: 20,
    name: "Thriving Companion",
    description: "A seasoned buddy. Celebrates milestones and brings luminous energy.",
    scale: 1.15,
    accessories: ["Leaf Pin", "Red Cozy Scarf", "Smart Glasses", "Explorer Hat"]
  },
  {
    level: 30,
    name: "Soul Guardian",
    description: "An eternal bond. Radiates a subtle calming aura and unlocks mystical traits.",
    scale: 1.25,
    accessories: ["Leaf Pin", "Red Cozy Scarf", "Smart Glasses", "Explorer Hat", "Starlight Crown", "Angel Wings"]
  }
];

export const COMPANION_THEMES: CompanionTheme[] = [
  {
    id: "cloud_garden",
    name: "Cloud Garden",
    emoji: "☁️",
    primaryColor: "#A78BFA",
    secondaryColor: "#C4B5FD",
    backgroundColor: "#F5F3FF",
    description: "Soft lavender breezes and floating clouds"
  },
  {
    id: "blossom_meadow",
    name: "Blossom Meadow",
    emoji: "🌸",
    primaryColor: "#F472B6",
    secondaryColor: "#FBCFE8",
    backgroundColor: "#FDF2F8",
    description: "Gentle sakura petals dancing on sunny fields"
  },
  {
    id: "forest_retreat",
    name: "Forest Retreat",
    emoji: "🌲",
    primaryColor: "#34D399",
    secondaryColor: "#A7F3D0",
    backgroundColor: "#ECFDF5",
    description: "Lush green pine trails with quiet chirping birds"
  },
  {
    id: "moonlight_haven",
    name: "Moonlight Haven",
    emoji: "🌙",
    primaryColor: "#60A5FA",
    secondaryColor: "#93C5FD",
    backgroundColor: "#EFF6FF",
    description: "Starry serene night bathed in calm lunar light"
  },
  {
    id: "cozy_cabin",
    name: "Cozy Cabin",
    emoji: "☕",
    primaryColor: "#F59E0B",
    secondaryColor: "#FDE68A",
    backgroundColor: "#FFFBEB",
    description: "Warm amber fireplace with aromatic tea vibes"
  }
];

export const CUSTOMIZATION_ITEMS: CustomizationItem[] = [
  { id: "item_leaf", name: "Sprout Leaf Pin", icon: "🌱", category: "head", unlocked: true, unlockLevel: 1 },
  { id: "item_scarf", name: "Warm Wool Scarf", icon: "🧣", category: "neck", unlocked: false, unlockLevel: 3 },
  { id: "item_glasses", name: "Round Scholar Glasses", icon: "👓", category: "head", unlocked: false, unlockLevel: 7 },
  { id: "item_hat", name: "Explorer Straw Hat", icon: "👒", category: "head", unlocked: false, unlockLevel: 12 },
  { id: "item_backpack", name: "Adventure Backpack", icon: "🎒", category: "back", unlocked: false, unlockLevel: 16 },
  { id: "item_wings", name: "Seraphic Angel Wings", icon: "🪽", category: "back", unlocked: false, unlockLevel: 22 },
  { id: "item_crown", name: "Starlight Gold Crown", icon: "👑", category: "head", unlocked: false, unlockLevel: 30 }
];

export const ACHIEVEMENTS_DATA: Achievement[] = [
  {
    id: "first_breath",
    title: "First Breath",
    description: "Completed your first 3-minute diaphragmatic breathing wave",
    icon: "🫁",
    unlocked: true,
    unlockedAt: Date.now() - 86400000 * 2,
    progress: 1,
    maxProgress: 1
  },
  {
    id: "heart_unburdened",
    title: "Heart Unburdened",
    description: "Released 3 heavy thoughts in the Unburden Journal",
    icon: "🕊️",
    unlocked: true,
    unlockedAt: Date.now() - 86400000,
    progress: 3,
    maxProgress: 3
  },
  {
    id: "whisper_soul",
    title: "Whisper Soul",
    description: "Saved your first spoken audio memory in the Whisper Sanctuary",
    icon: "🎙️",
    unlocked: false,
    unlockedAt: null,
    progress: 0,
    maxProgress: 1
  },
  {
    id: "streak_master",
    title: "Mindful 7-Day Journey",
    description: "Checked in with your companion for 7 consecutive days",
    icon: "🔥",
    unlocked: false,
    unlockedAt: null,
    progress: 4,
    maxProgress: 7
  },
  {
    id: "zen_master",
    title: "True Harmony",
    description: "Reach Companion Level 10 and unlock the Smart Glasses",
    icon: "✨",
    unlocked: false,
    unlockedAt: null,
    progress: 3,
    maxProgress: 10
  }
];

export const DEFAULT_ACHIEVEMENTS = ACHIEVEMENTS_DATA;

export const WHISPER_ENVIRONMENTS: WhisperEnv[] = [
  {
    id: "moonlight",
    name: "Moonlight Room",
    icon: "🌙",
    startColor: "#070A1E",
    endColor: "#131535",
    description: "Twinkling star cluster with soft clouds drifting",
    ambientType: "night"
  },
  {
    id: "rain",
    name: "Rain Window",
    icon: "🌧",
    startColor: "#0B101D",
    endColor: "#1F243A",
    description: "Droplets rippling gently upon quiet window frames",
    ambientType: "rain"
  },
  {
    id: "ocean",
    name: "Ocean Waves",
    icon: "🌊",
    startColor: "#030E1A",
    endColor: "#0D253D",
    description: "Slow golden-tide oceans swelling with soothing rhythm",
    ambientType: "ocean"
  },
  {
    id: "forest",
    name: "Forest Retreat",
    icon: "🌲",
    startColor: "#05120B",
    endColor: "#122C1A",
    description: "Floating moss fireflies ascending in dark pine woods",
    ambientType: "forest"
  },
  {
    id: "cloud",
    name: "Cloud Garden",
    icon: "☁️",
    startColor: "#0E0B1F",
    endColor: "#261D3A",
    description: "Soft lavender garden with warm soothing sakura breezes",
    ambientType: "clouds"
  }
];

export const INITIAL_TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 1,
    eventType: "FIRST_ENTRY",
    date: Date.now() - 86400000 * 5,
    emotion: "Hopeful",
    emotionIcon: "🌱",
    title: "Stepped Into Sanctuary",
    description: "Created your safe space with Wolfie and chose to dedicate time to your emotional well-being.",
    aiReflection: "Every grand journey begins with the brave choice to listen to oneself.",
    emotionalWeather: "Clear Morning Light"
  },
  {
    id: 2,
    eventType: "BREATHING_SESSION",
    date: Date.now() - 86400000 * 4,
    emotion: "Calm",
    emotionIcon: "🌊",
    title: "Ocean Wave Breath",
    description: "Completed 3 minutes of rhythmic breathing to release workday tension.",
    aiReflection: "Breath is your anchor. No storm can move you when you are grounded in the present.",
    emotionalWeather: "Gentle Breeze"
  },
  {
    id: 3,
    eventType: "JOURNAL_MOMENT",
    date: Date.now() - 86400000 * 3,
    emotion: "Reflective",
    emotionIcon: "📝",
    title: "Unburdened Overthinking",
    description: "Released racing thoughts about future deadlines and felt the weight lift.",
    aiReflection: "Naming your fears takes away their invisible power over you.",
    emotionalWeather: "Partly Cloudy Skies"
  },
  {
    id: 4,
    eventType: "CHAT_BREAKTHROUGH",
    date: Date.now() - 86400000 * 2,
    emotion: "Relieved",
    emotionIcon: "💡",
    title: "Kindness Toward Self",
    description: "Discussed perfectionism with Wolfie and realized that taking breaks is part of productivity.",
    aiReflection: "Self-compassion is not weakness; it is the ultimate fuel for resilience.",
    emotionalWeather: "Warm Sunbeams"
  },
  {
    id: 5,
    eventType: "ACHIEVEMENT",
    date: Date.now() - 86400000,
    emotion: "Proud",
    emotionIcon: "⭐",
    title: "Heart Unburdened Badge",
    description: "Reached level 3 with Wolfie and unlocked the Sprout Leaf Pin accessory!",
    aiReflection: "Celebrate your gentle progress. You are growing stronger each day.",
    emotionalWeather: "Golden Sunset"
  }
];
