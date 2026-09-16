export interface EmergencyResource {
  name: string;
  description: string;
  contact: string;
  available: string;
}

export const EMERGENCY_RESOURCES: {
  helplines: EmergencyResource[];
  guidance: string[];
  crisisTemplate: {
    opening: string;
    support: string;
    action: string;
    grounding: string;
  };
} = {
  helplines: [
    {
      name: "KIRAN Mental Health Helpline",
      description: "24/7 mental health support by Government of India",
      contact: "1800-599-0019",
      available: "24/7 Free & Confidential"
    },
    {
      name: "AASRA Helpline",
      description: "Suicide prevention & compassionate crisis emotional support",
      contact: "+91-9820466726",
      available: "24/7 Available"
    },
    {
      name: "iCALL Psychosocial Support Helpline",
      description: "Confidential emotional counseling & mental health services",
      contact: "9152987821",
      available: "Mon - Sat: 8 AM - 10 PM"
    },
    {
      name: "Vandrevala Foundation",
      description: "Free 24/7 crisis intervention & mental health helpline",
      contact: "9999 666 555",
      available: "24/7 Free"
    },
    {
      name: "Tele-MANAS",
      description: "National Tele Mental Health Programme of India",
      contact: "14416 / 1800-891-4416",
      available: "24/7 Toll-Free Multi-lingual"
    },
    {
      name: "International Lifeline (US/Global)",
      description: "Suicide & Crisis Lifeline (US & International forwarding)",
      contact: "988 (US) or +1-800-273-8255",
      available: "24/7 Free"
    }
  ],
  guidance: [
    "If you or someone you know is in immediate danger, please call your local emergency services (112, 100, 108 or 911) right away.",
    "SoulTalk is an empathetic companion AI for reflection and mindfulness, not a clinical replacement for professional medical therapy or emergency intervention.",
    "Take slow, gentle breaths: inhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds.",
    "Reach out to someone you trust—a friend, family member, or trusted counselor."
  ],
  crisisTemplate: {
    opening: "I hear how much pain and heaviness you are carrying right now. 😔",
    support: "You are not alone, and your life has deep value. I am sitting right here with you.",
    action: "Please reach out to a trusted professional or support helpline right now.",
    grounding: "Place a hand over your heart, take a slow deep breath with me. There is always hope and support."
  }
};

export function isCrisisKeyword(text: string): boolean {
  const t = text.toLowerCase();
  const keywords = [
    "suicide", "kill myself", "end my life", "want to die",
    "self-harm", "self harm", "cut myself", "cutting myself", "hurt myself",
    "overdose", "jump off", "hang myself", "take my life", "end it all",
    "marun jau", "maraycha ahe", "jagne nako", "aatmhatya", "jeevan sampva",
    "swatahla marnar", "khudkushi", "jaan lena chahta", "mar jaana chahta"
  ];
  return keywords.some(k => t.includes(k));
}
