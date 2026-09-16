export const CrisisLevel = {
  NONE: 'none',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  SEVERE: 'severe'
} as const;

export type CrisisLevelType = typeof CrisisLevel[keyof typeof CrisisLevel];

export interface CrisisCheckResult {
  isCrisis: boolean;
  level: CrisisLevelType;
  confidence: number;
  response?: string;
  matchedKeywords: string[];
  resources: {
    primary: string;
    secondary: string;
    emergency: string;
    icall: string;
  };
}

export const HELPLINE_RESOURCES = {
  teleManas: 'Tele MANAS — 14416 or 1-800-891-4416 (Govt. of India, 24x7, Free & Toll-Free, 20+ Languages)',
  vandrevala: 'Vandrevala Foundation — 1860-266-2345 / 9999 666 555 (24x7 Free Support)',
  aasra: 'AASRA — +91-9820466726 (24x7 Suicide Prevention & Crisis Support)',
  icall: 'iCALL (TISS Mumbai) — 9152987821 (Mon–Sat 10:00 AM – 8:00 PM)',
  emergency: '112 (National Emergency Number, India)'
};

const SEVERE_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'want to die', 'no reason to live',
  'better off dead', 'end it all', 'take my own life', 'commit suicide',
  'plan to die', 'plan to kill myself', 'plan to suicide', 'suicide plan', 'suicidal plan',
  'sleep forever and never wake up', 'never wake up', 'want to sleep forever',
  'hurt myself', 'hurting myself', 'self harm', 'self-harm', 'harm myself', 'harming myself',
  'cut myself', 'cutting myself', 'overdose', 'swatahla hurt', 'swatala hurt', 'swatahala hurt',
  'dont want to live', "don't want to live", 'dont wanna live', 'not want to live',
  'hang myself', 'jump off', 'marun jau', 'jagne nako', 'maraycha ahe', 'maraycha aahe', 'marun zava',
  'aatmhatya', 'aatmahatya', 'jeevan sampva', 'jeevan nako', 'swatahla marnar', 'khallas karaycha',
  'khudkushi', 'mar jaana chahta', 'jaan lena chahta', 'jagaycha nahiye', 'jagaycha nahi',
  'आत्महत्या', 'जगायचे नाही', 'जगावेसे वाटत नाही', 'स्वतःला संपवायचे', 'जीवन संपवायचे', 'स्वतःला इजा'
];

const FIGURATIVE_NEGATIONS = [
  "don't want to die", "dont want to die", "do not want to die", "not wanting to die",
  "dying to ", "killing it", "killing time", "deadly good", "deadly funny",
  "dying of laughter", "dying of curiosity", "dying from boredom", "dying of boredom",
  "exam is killing me", "work is killing me", "assignment is killing me"
];

const HIGH_KEYWORDS = [
  'giving up on life', 'everyone better off without me', 'burden to everyone',
  'no hope left to live', 'end the pain forever', 'kahi vatat nahi jagaycha'
];

const MEDIUM_KEYWORDS = [
  'hopeless', 'worthless', 'giving up', "can't go on", 'cant go on',
  'want to disappear', 'severe depression', 'anxiety attack', 'panic attack',
  'overwhelmed', "can't cope", 'falling apart', 'breaking down',
  'mental breakdown', 'losing control', 'scared of myself', 'ghabarli'
];

export function checkCrisis(text: string): CrisisCheckResult {
  const t = text.toLowerCase();
  const matchedKeywords: string[] = [];

  for (const kw of SEVERE_KEYWORDS) {
    if (t.includes(kw)) {
      // Check for negations or figurative false positive idioms
      if (kw === 'want to die' && (t.includes("don't want to die") || t.includes("dont want to die") || t.includes("do not want to die"))) {
        continue; // Ignored as negation
      }
      matchedKeywords.push(kw);
    }
  }

  if (matchedKeywords.length > 0) {
    return {
      isCrisis: true,
      level: CrisisLevel.SEVERE,
      confidence: 0.98,
      matchedKeywords,
      response: `I hear that you're in deep, heavy pain right now, and I want you to know that your life matters deeply to me and the world. ❤️ Please reach out to someone who can help you this very second. You can call ${HELPLINE_RESOURCES.teleManas}, call ${HELPLINE_RESOURCES.vandrevala}, or call ${HELPLINE_RESOURCES.emergency}. You are not alone, and you don't have to carry this storm alone.`,
      resources: {
        primary: HELPLINE_RESOURCES.teleManas,
        secondary: HELPLINE_RESOURCES.vandrevala,
        emergency: HELPLINE_RESOURCES.emergency,
        icall: HELPLINE_RESOURCES.icall
      }
    };
  }

  for (const kw of HIGH_KEYWORDS) {
    if (t.includes(kw)) {
      matchedKeywords.push(kw);
    }
  }

  if (matchedKeywords.length > 0) {
    return {
      isCrisis: true,
      level: CrisisLevel.HIGH,
      confidence: 0.85,
      matchedKeywords,
      response: `I can hear how exhausting and dark everything feels right now, and I want you to know that your feelings are heard. 💙 This heavy cloud feels permanent, but you do not have to walk through it without support. Please connect with ${HELPLINE_RESOURCES.teleManas} or reach out to a trusted companion or professional. You deserve safety, warmth, and care.`,
      resources: {
        primary: HELPLINE_RESOURCES.teleManas,
        secondary: HELPLINE_RESOURCES.vandrevala,
        emergency: HELPLINE_RESOURCES.emergency,
        icall: HELPLINE_RESOURCES.icall
      }
    };
  }

  for (const kw of MEDIUM_KEYWORDS) {
    if (t.includes(kw)) {
      matchedKeywords.push(kw);
    }
  }

  if (matchedKeywords.length > 0) {
    return {
      isCrisis: false,
      level: CrisisLevel.MEDIUM,
      confidence: 0.70,
      matchedKeywords,
      resources: {
        primary: HELPLINE_RESOURCES.teleManas,
        secondary: HELPLINE_RESOURCES.vandrevala,
        emergency: HELPLINE_RESOURCES.emergency,
        icall: HELPLINE_RESOURCES.icall
      }
    };
  }

  return {
    isCrisis: false,
    level: CrisisLevel.NONE,
    confidence: 0.0,
    matchedKeywords: [],
    resources: {
      primary: HELPLINE_RESOURCES.teleManas,
      secondary: HELPLINE_RESOURCES.vandrevala,
      emergency: HELPLINE_RESOURCES.emergency,
      icall: HELPLINE_RESOURCES.icall
    }
  };
}

export function detectEmotionAdvanced(text: string): { emotion: string; confidence: number } {
  const t = text.toLowerCase();

  // 1. HAPPY / JOY
  if (
    t.includes('happy') || t.includes('joy') || t.includes('glad') || t.includes('smile') ||
    t.includes('mast') || t.includes('changla') || t.includes('chhan') || t.includes('छान') ||
    t.includes('आनंद') || t.includes('sahi') || t.includes('dream job') || t.includes('offer') ||
    t.includes('jinklo') || t.includes('celebrate') || t.includes('great') || t.includes('wonderful') ||
    t.includes('feeling good') || t.includes('feeling okay') || t.includes('feel okay') || t.includes('mast vatat')
  ) {
    return { emotion: 'HAPPY', confidence: 0.95 };
  }

  // 2. EXCITED
  if (
    t.includes('excite') || t.includes('hyped') || t.includes('awesome') || t.includes('amazing') ||
    t.includes('thrill') || t.includes('cant wait') || t.includes("can't wait")
  ) {
    return { emotion: 'EXCITED', confidence: 0.96 };
  }

  // 3. CALM / PEACEFUL
  if (
    t.includes('calm') || t.includes('peace') || t.includes('shant') || t.includes('शांत') ||
    t.includes('relaxed') || t.includes('chill') || t.includes('halke vatat') || t.includes('serene')
  ) {
    return { emotion: 'CALM', confidence: 0.92 };
  }

  // 4. LONELY
  if (
    t.includes('lonely') || t.includes('alone') || t.includes('isolated') || t.includes('ekta') ||
    t.includes('ekti') || t.includes('ektech') || t.includes('ektatav') || t.includes('एकटा') ||
    t.includes('nobody') || t.includes('ignore') || t.includes('unseen') || t.includes('konashi bolavasa') ||
    t.includes('konich nahi') || t.includes('koni nahi')
  ) {
    return { emotion: 'LONELY', confidence: 0.94 };
  }

  // 5. ANXIOUS / PANIC / FEAR
  if (
    t.includes('anxious') || t.includes('anxiety') || t.includes('worry') || t.includes('worried') ||
    t.includes('fear') || t.includes('nervous') || t.includes('bhiti') || t.includes('ghabar') ||
    t.includes('panic') || t.includes('chinta') || t.includes('भिती') || t.includes('चिंता') ||
    t.includes('future') || t.includes('bhavishya') || t.includes('dhad dhad') || t.includes('palpitation')
  ) {
    return { emotion: 'ANXIOUS', confidence: 0.93 };
  }

  // 6. STRESSED / OVERWHELMED / BURNOUT
  if (
    t.includes('stress') || t.includes('overwhelm') || t.includes('exhaust') || t.includes('tension') ||
    t.includes('burnout') || t.includes('pressure') || t.includes('thaklo') || t.includes('thakle') ||
    t.includes('deadline') || t.includes('abhyas') || t.includes('exam') || t.includes('taan') ||
    t.includes('ताण') || t.includes('workload') || t.includes('heavy')
  ) {
    return { emotion: 'STRESSED', confidence: 0.93 };
  }

  // 7. ANGRY / FRUSTRATED
  if (
    t.includes('angry') || t.includes('mad') || t.includes('hate') || t.includes('annoy') ||
    t.includes('frustrat') || t.includes('bhandan') || t.includes('unfair') || t.includes('rag yetoy') ||
    t.includes('raag') || t.includes('chid') || t.includes('संताप') || t.includes('राग')
  ) {
    return { emotion: 'ANGRY', confidence: 0.91 };
  }

  // 8. CONFUSED / LOST
  if (
    t.includes('confused') || t.includes('lost') || t.includes('samjat nahi') || t.includes('samjena') ||
    t.includes('kahi samjat') || t.includes('stuck') || t.includes('karan samjat nahi') || t.includes('gondhal')
  ) {
    return { emotion: 'CONFUSED', confidence: 0.90 };
  }

  // 9. SAD / GRIEF / HURT
  if (
    t.includes('sad') || t.includes('cry') || t.includes('grief') || t.includes('pain') ||
    t.includes('vait vatat') || t.includes('vait') || t.includes('dukhta') || t.includes('breakup') ||
    t.includes('miss karto') || t.includes('heartbroke') || t.includes('hurt') || t.includes('tears') ||
    t.includes('hopeless') || t.includes('grey') || t.includes('mood kharab') || t.includes('kharab') ||
    t.includes('depress') || t.includes('bad day') || t.includes('off aahe') || t.includes('off ahe') ||
    t.includes('खराब') || t.includes('वाईट') || t.includes('दुःख')
  ) {
    return { emotion: 'SAD', confidence: 0.94 };
  }

  // 10. MOTIVATED
  if (
    t.includes('motivat') || t.includes('goal') || t.includes('focus') || t.includes('ready') ||
    t.includes('try karto') || t.includes('jit') || t.includes('win')
  ) {
    return { emotion: 'MOTIVATED', confidence: 0.89 };
  }

  return { emotion: 'NEUTRAL', confidence: 0.82 };
}
