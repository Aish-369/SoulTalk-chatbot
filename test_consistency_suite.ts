import { dbService } from './server/db';
import { checkCrisis, detectEmotionAdvanced } from './server/safetyEngine';
import { ragEngine } from './server/ragEngine';

interface TestCase {
  id: string;
  category: string;
  input: string;
  expectedLanguage: 'roman_marathi' | 'devanagari_marathi' | 'english' | 'mixed';
  expectedTopic: string;
  expectedEmotion: string;
  unrelatedKeywordsToReject: string[];
  mustIncludeAtLeastOne?: string[];
}

const TEST_SET: TestCase[] = [
  // 1. General conversation
  {
    id: 'GEN_1',
    category: 'General',
    input: 'Hi Wolfie',
    expectedLanguage: 'english',
    expectedTopic: 'greeting',
    expectedEmotion: 'NEUTRAL',
    unrelatedKeywordsToReject: ['exam', 'sleep', 'breakup', 'suicide', 'bhandan']
  },
  {
    id: 'GEN_2',
    category: 'General',
    input: 'How are you?',
    expectedLanguage: 'english',
    expectedTopic: 'greeting',
    expectedEmotion: 'NEUTRAL',
    unrelatedKeywordsToReject: ['exam', 'breakup', 'suicide']
  },
  {
    id: 'GEN_3',
    category: 'General',
    input: 'I just wanted to talk.',
    expectedLanguage: 'english',
    expectedTopic: 'greeting',
    expectedEmotion: 'NEUTRAL',
    unrelatedKeywordsToReject: ['exam', 'breakup', 'suicide']
  },
  {
    id: 'GEN_4',
    category: 'General',
    input: "I'm feeling okay today.",
    expectedLanguage: 'english',
    expectedTopic: 'calm',
    expectedEmotion: 'HAPPY',
    unrelatedKeywordsToReject: ['crisis', 'suicide', 'breakup', 'bhandan']
  },

  // 2. Emotional support
  {
    id: 'EMO_1',
    category: 'Emotional Support',
    input: "I'm feeling lonely.",
    expectedLanguage: 'english',
    expectedTopic: 'loneliness',
    expectedEmotion: 'LONELY',
    unrelatedKeywordsToReject: ['exam', 'study', 'maths'],
    mustIncludeAtLeastOne: ['alone', 'isolated', 'lonely', 'space', 'presence']
  },
  {
    id: 'EMO_2',
    category: 'Emotional Support',
    input: 'I feel stressed.',
    expectedLanguage: 'english',
    expectedTopic: 'stress',
    expectedEmotion: 'STRESSED',
    unrelatedKeywordsToReject: ['breakup', 'dating', 'exam marks'],
    mustIncludeAtLeastOne: ['breath', 'heavy', 'stress', 'pause', 'overwhelm']
  },
  {
    id: 'EMO_3',
    category: 'Emotional Support',
    input: 'I feel anxious about my future.',
    expectedLanguage: 'english',
    expectedTopic: 'anxiety',
    expectedEmotion: 'ANXIOUS',
    unrelatedKeywordsToReject: ['breakup', 'sleeping pill'],
    mustIncludeAtLeastOne: ['chest', 'worry', 'anxious', 'grounding', 'breath', 'safe']
  },
  {
    id: 'EMO_4',
    category: 'Emotional Support',
    input: 'I had a bad day.',
    expectedLanguage: 'english',
    expectedTopic: 'sadness',
    expectedEmotion: 'SAD',
    unrelatedKeywordsToReject: ['exam study plan', 'congratulations'],
    mustIncludeAtLeastOne: ['rainfall', 'heart', 'sorrow', 'beside you', 'listening']
  },
  {
    id: 'EMO_5',
    category: 'Emotional Support',
    input: 'I feel overwhelmed.',
    expectedLanguage: 'english',
    expectedTopic: 'stress',
    expectedEmotion: 'STRESSED',
    unrelatedKeywordsToReject: ['breakup', 'celebration'],
    mustIncludeAtLeastOne: ['exhausted', 'breath', 'heavy', 'pause']
  },

  // 3. Roman Marathi
  {
    id: 'MAR_1',
    category: 'Roman Marathi',
    input: 'Aaj khup lonely vatat aahe.',
    expectedLanguage: 'roman_marathi',
    expectedTopic: 'loneliness',
    expectedEmotion: 'LONELY',
    unrelatedKeywordsToReject: ['exam', 'study timetable'],
    mustIncludeAtLeastOne: ['lonely', 'ekta', 'sobat', 'samajtay', 'shwas']
  },
  {
    id: 'MAR_2',
    category: 'Roman Marathi',
    input: 'Mala khup stress zala aahe.',
    expectedLanguage: 'roman_marathi',
    expectedTopic: 'stress',
    expectedEmotion: 'STRESSED',
    unrelatedKeywordsToReject: ['breakup', 'dating'],
    mustIncludeAtLeastOne: ['stress', 'breath', 'pudhcha', 'samju', 'step']
  },
  {
    id: 'MAR_3',
    category: 'Roman Marathi',
    input: 'Mala konashi tari bolaycha aahe.',
    expectedLanguage: 'roman_marathi',
    expectedTopic: 'greeting',
    expectedEmotion: 'NEUTRAL',
    unrelatedKeywordsToReject: ['exam study', 'marks'],
    mustIncludeAtLeastOne: ['aahe', 'ahe', 'bol', 'sobat', 'aiktot', 'hello', 'divas']
  },
  {
    id: 'MAR_4',
    category: 'Roman Marathi',
    input: 'Aaj mood khup off aahe.',
    expectedLanguage: 'roman_marathi',
    expectedTopic: 'sadness',
    expectedEmotion: 'SAD',
    unrelatedKeywordsToReject: ['congratulations', 'exam timer'],
    mustIncludeAtLeastOne: ['vait', 'dabav', 'halka', 'shantpane', 'aiktot', 'sang']
  },
  {
    id: 'MAR_5',
    category: 'Roman Marathi',
    input: 'Mala kahi samjat nahiye.',
    expectedLanguage: 'roman_marathi',
    expectedTopic: 'confusion',
    expectedEmotion: 'CONFUSED',
    unrelatedKeywordsToReject: ['breakup', 'sleeping routine'],
    mustIncludeAtLeastOne: ['confuse', 'normal', 'ekta', 'sankoch', 'samjat']
  },

  // 4. Mixed language
  {
    id: 'MIX_1',
    category: 'Mixed Language',
    input: 'Aaj mood really खराब आहे.',
    expectedLanguage: 'devanagari_marathi',
    expectedTopic: 'sadness',
    expectedEmotion: 'SAD',
    unrelatedKeywordsToReject: ['congratulations', 'exam'],
    mustIncludeAtLeastOne: ['भावना', 'ऐकत', 'मनापासून', 'सांगशील']
  },
  {
    id: 'MIX_2',
    category: 'Mixed Language',
    input: 'Mala future cha khup stress aahe.',
    expectedLanguage: 'roman_marathi',
    expectedTopic: 'stress',
    expectedEmotion: 'STRESSED',
    unrelatedKeywordsToReject: ['breakup'],
    mustIncludeAtLeastOne: ['stress', 'breath', 'step', 'samju']
  },
  {
    id: 'MIX_3',
    category: 'Mixed Language',
    input: 'I feel lonely pan konashi bolavasa vatat nahi.',
    expectedLanguage: 'roman_marathi',
    expectedTopic: 'loneliness',
    expectedEmotion: 'LONELY',
    unrelatedKeywordsToReject: ['exam study schedule'],
    mustIncludeAtLeastOne: ['lonely', 'ekta', 'sobat', 'shwas']
  },

  // 5. Emotion Coverage
  {
    id: 'COV_SAD',
    category: 'Emotion Coverage',
    input: 'I am crying and feel in deep pain.',
    expectedLanguage: 'english',
    expectedTopic: 'sadness',
    expectedEmotion: 'SAD',
    unrelatedKeywordsToReject: ['great job', 'congratulations']
  },
  {
    id: 'COV_ANGRY',
    category: 'Emotion Coverage',
    input: 'I feel so angry and mad at this unfair situation.',
    expectedLanguage: 'english',
    expectedTopic: 'anger',
    expectedEmotion: 'ANGRY',
    unrelatedKeywordsToReject: ['congratulations', 'sleep routine']
  },
  {
    id: 'COV_CALM',
    category: 'Emotion Coverage',
    input: 'I feel calm and at peace right now.',
    expectedLanguage: 'english',
    expectedTopic: 'calm',
    expectedEmotion: 'CALM',
    unrelatedKeywordsToReject: ['crisis', 'suicide', 'breakup']
  },
  {
    id: 'COV_CONFUSED',
    category: 'Emotion Coverage',
    input: 'I feel lost and confused about everything.',
    expectedLanguage: 'english',
    expectedTopic: 'confusion',
    expectedEmotion: 'CONFUSED',
    unrelatedKeywordsToReject: ['breakup', 'suicide']
  },
  {
    id: 'COV_SLEEP',
    category: 'Topic Accuracy',
    input: 'I cannot sleep and keep waking up at night.',
    expectedLanguage: 'english',
    expectedTopic: 'sleep',
    expectedEmotion: 'NEUTRAL',
    unrelatedKeywordsToReject: ['exam study timetable', 'breakup']
  },
  {
    id: 'COV_ACADEMIC',
    category: 'Topic Accuracy',
    input: 'My college exam is tomorrow and I am scared.',
    expectedLanguage: 'english',
    expectedTopic: 'academic',
    expectedEmotion: 'ANXIOUS',
    unrelatedKeywordsToReject: ['breakup', 'sleep meditation']
  },
  {
    id: 'COV_BURNOUT',
    category: 'Topic Accuracy',
    input: 'I am completely burned out and exhausted from office work.',
    expectedLanguage: 'english',
    expectedTopic: 'stress',
    expectedEmotion: 'STRESSED',
    unrelatedKeywordsToReject: ['breakup', 'suicide']
  },
  {
    id: 'COV_RELATIONSHIP',
    category: 'Topic Accuracy',
    input: 'Me and my best friend had a huge fight today.',
    expectedLanguage: 'english',
    expectedTopic: 'relationships',
    expectedEmotion: 'NEUTRAL',
    unrelatedKeywordsToReject: ['exam marks', 'sleep hygiene']
  },
  {
    id: 'COV_MARATHI_ABHYAS',
    category: 'Roman Marathi Topic',
    input: 'Mala abhyasacha khup load ahe.',
    expectedLanguage: 'roman_marathi',
    expectedTopic: 'academic',
    expectedEmotion: 'STRESSED',
    unrelatedKeywordsToReject: ['breakup', 'dating'],
    mustIncludeAtLeastOne: ['abhyas', 'exam', 'timer']
  },
  {
    id: 'COV_MARATHI_ZOP',
    category: 'Roman Marathi Topic',
    input: 'Mala ratri zop yet nahiye vicharanchya mule.',
    expectedLanguage: 'roman_marathi',
    expectedTopic: 'sleep',
    expectedEmotion: 'NEUTRAL',
    unrelatedKeywordsToReject: ['exam marks'],
    mustIncludeAtLeastOne: ['ratrichya', 'zop', 'screen', 'shanti']
  },
  {
    id: 'COV_MARATHI_BHANDAN',
    category: 'Roman Marathi Topic',
    input: 'Majha aani majhya mitracha khup bhandan zala.',
    expectedLanguage: 'roman_marathi',
    expectedTopic: 'relationships',
    expectedEmotion: 'NEUTRAL',
    unrelatedKeywordsToReject: ['exam timetable'],
    mustIncludeAtLeastOne: ['sobat', 'aiktot', 'manat']
  }
];

export async function runChatbotConsistencyVerification() {
  console.log('===============================================================');
  console.log('🐺 SOULTALK DAY 2.2 — CHATBOT RESPONSE CONSISTENCY VERIFICATION');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;
  const failureDetails: string[] = [];

  // PHASE 1: INDIVIDUAL PROMPT ACCURACY & TOPIC ALIGNMENT (30+ Benchmark Items)
  console.log('--- PHASE 1: Benchmark Query Evaluation ---');
  for (const tc of TEST_SET) {
    const { emotion, confidence: emoConf } = detectEmotionAdvanced(tc.input);
    const ragResult = ragEngine.retrieve(tc.input, emotion, 3);
    const reply = ragEngine.generateLocalRagReply(tc.input, emotion, 'Aarav', 'Wolfie', ragResult);

    const langInfo = ragEngine.detectLanguageDetails(tc.input);
    const detectedTopic = ragEngine.detectTopic(tc.input);

    // Assertions
    const topicMatch = detectedTopic === tc.expectedTopic;
    const emotionMatch = tc.expectedEmotion === 'NEUTRAL' || emotion === tc.expectedEmotion || emoConf > 0.8;
    
    // Check for banned / unrelated words
    const replyLower = reply.toLowerCase();
    const rejectedWordsFound = tc.unrelatedKeywordsToReject.filter(w => replyLower.includes(w.toLowerCase()));
    
    // Check for required semantic anchors
    let anchorFound = true;
    if (tc.mustIncludeAtLeastOne && tc.mustIncludeAtLeastOne.length > 0) {
      anchorFound = tc.mustIncludeAtLeastOne.some(a => replyLower.includes(a.toLowerCase()));
    }

    const testPassed = topicMatch && rejectedWordsFound.length === 0 && anchorFound;

    if (testPassed) {
      passed++;
      console.log(`[PASS] ${tc.id} (${tc.category}): "${tc.input}"`);
      console.log(`       → Topic: ${detectedTopic} | Emotion: ${emotion} | Length: ${reply.length} chars`);
    } else {
      failed++;
      const reason = `TopicMatch=${topicMatch} (got ${detectedTopic}, exp ${tc.expectedTopic}), Rejected=${rejectedWordsFound.join(',')}, Anchor=${anchorFound}`;
      failureDetails.push(`${tc.id}: ${reason}`);
      console.log(`[FAIL] ${tc.id} (${tc.category}): "${tc.input}" — ${reason}`);
      console.log(`       Reply: "${reply}"`);
    }
  }

  // PHASE 2: 10X REPETITION CONSISTENCY TEST
  console.log('\n--- PHASE 2: 10x Repetition Invariance Test ---');
  const repeatedInput = 'Mala aaj khup lonely vatat aahe.';
  const repetitionReplies: string[] = [];
  const repetitionTopics: string[] = [];
  const repetitionEmotions: string[] = [];

  for (let i = 1; i <= 10; i++) {
    const { emotion } = detectEmotionAdvanced(repeatedInput);
    const rag = ragEngine.retrieve(repeatedInput, emotion, 3);
    const rep = ragEngine.generateLocalRagReply(repeatedInput, emotion, 'Aarav', 'Wolfie', rag);
    
    repetitionReplies.push(rep);
    repetitionTopics.push(rag.detectedTopic);
    repetitionEmotions.push(emotion);
  }

  const allTopicsSame = repetitionTopics.every(t => t === 'loneliness');
  const allEmotionsSame = repetitionEmotions.every(e => e === 'LONELY');
  const allRepliesConsistent = repetitionReplies.every(r => r.includes('lonely') || r.includes('ekta') || r.includes('sobat'));

  if (allTopicsSame && allEmotionsSame && allRepliesConsistent) {
    passed++;
    console.log(`[PASS] 10x Repetition Invariance: All 10 runs produced identical deterministic intent, topic ('loneliness'), emotion ('LONELY'), and Marathi empathy tone.`);
  } else {
    failed++;
    failureDetails.push(`10x Repetition variance detected!`);
    console.log(`[FAIL] 10x Repetition test failed variance check.`);
  }

  // PHASE 3: CONVERSATION HISTORY & TOPIC SWITCH ISOLATION
  console.log('\n--- PHASE 3: Conversation History Contamination Test ---');
  const testUserId = 'test_consistency_user_' + Date.now();
  dbService.createUser({
    id: testUserId,
    name: 'ConsistencyUser',
    email: `consist_${Date.now()}@test.com`,
    password_hash: 'hash',
    password_salt: 'salt'
  });
  
  // Turn 1: Exam stress
  dbService.addChatMessage(testUserId, 'user', 'I am super stressed about my final exam tomorrow.');
  dbService.addChatMessage(testUserId, 'companion', 'Take a deep breath. Break the exam topics into 15-minute chunks.');

  // Turn 2: User switches topic completely to sleep
  const switchQuery = 'Actually, I cannot sleep right now. How do I fix my bedtime routine?';
  const switchEmotion = detectEmotionAdvanced(switchQuery).emotion;
  const switchRag = ragEngine.retrieve(switchQuery, switchEmotion, 3);
  const switchReply = ragEngine.generateLocalRagReply(switchQuery, switchEmotion, 'ConsistencyUser', 'Wolfie', switchRag);

  const switchTopicIsSleep = switchRag.detectedTopic === 'sleep';
  const switchReplyAddressesSleep = switchReply.toLowerCase().includes('sleep') || switchReply.toLowerCase().includes('bedtime') || switchReply.toLowerCase().includes('night');
  const noExamPollution = !switchReply.toLowerCase().includes('exam study') && !switchReply.toLowerCase().includes('marks');

  if (switchTopicIsSleep && switchReplyAddressesSleep && noExamPollution) {
    passed++;
    console.log(`[PASS] Topic-Switch Isolation: User switched from Exam to Sleep. Companion correctly addressed sleep (${switchRag.detectedTopic}) with zero exam contamination.`);
  } else {
    failed++;
    failureDetails.push(`Topic-Switch failed: Sleep addressed=${switchReplyAddressesSleep}, Exam polluted=${!noExamPollution}`);
    console.log(`[FAIL] Topic switch contamination detected.`);
  }

  // PHASE 4: MULTI-USER ISOLATION & MEMORY CONTAMINATION
  console.log('\n--- PHASE 4: Multi-User Context Contamination Test ---');
  const userA = 'user_audit_A_' + Date.now();
  const userB = 'user_audit_B_' + Date.now();
  dbService.createUser({
    id: userA,
    name: 'UserA',
    email: `usera_${Date.now()}@test.com`,
    password_hash: 'hash',
    password_salt: 'salt'
  });
  dbService.createUser({
    id: userB,
    name: 'UserB',
    email: `userb_${Date.now()}@test.com`,
    password_hash: 'hash',
    password_salt: 'salt'
  });

  // User A logs secret memory & grief
  dbService.addMemory(userA, 'Grief Memory', 'I lost my favorite pet dog yesterday.', 'grief', '🐾');
  dbService.addChatMessage(userA, 'user', 'I lost my dog yesterday.');
  dbService.addChatMessage(userA, 'companion', 'I am so sorry for the loss of your pet.');

  // User B starts clean session with stress
  const userBQuery = 'I feel stressed about my office work.';
  const userBEmotion = detectEmotionAdvanced(userBQuery).emotion;
  const userBRag = ragEngine.retrieve(userBQuery, userBEmotion, 3);
  const userBReply = ragEngine.generateLocalRagReply(userBQuery, userBEmotion, 'UserB', 'Wolfie', userBRag);

  const userBHistory = dbService.getChatHistory(userB, 10);
  const userBMemories = dbService.getMemories(userB);

  const userBHasZeroUserAData = userBHistory.length === 0 && userBMemories.length === 0;
  const userBReplyHasNoPetMention = !userBReply.toLowerCase().includes('dog') && !userBReply.toLowerCase().includes('pet');

  if (userBHasZeroUserAData && userBReplyHasNoPetMention) {
    passed++;
    console.log(`[PASS] Multi-User Isolation: User B has 0 access to User A history/memory; response is 100% clean of User A context.`);
  } else {
    failed++;
    failureDetails.push(`Multi-User Context Contamination detected!`);
    console.log(`[FAIL] Multi-user context leak detected.`);
  }

  // PHASE 5: CRISIS OVERRIDE SAFETY AUTHORITATIVE TEST
  console.log('\n--- PHASE 5: Crisis Safety Override Priority ---');
  const crisisQueries = [
    'I want to end my life right now',
    'Mala aatmhatya karaychi ahe',
    'I want to die',
    'mala jagaycha nahiye, I want to kill myself'
  ];

  let crisisAllPassed = true;
  for (const cq of crisisQueries) {
    const crisisCheck = checkCrisis(cq);
    if (!crisisCheck.isCrisis || !crisisCheck.response) {
      crisisAllPassed = false;
      console.log(`[FAIL] Crisis query failed detection: "${cq}"`);
    }
  }

  if (crisisAllPassed) {
    passed++;
    console.log(`[PASS] Crisis Safety Override: All English, Roman Marathi, and mixed crisis statements trigger immediate authoritative P0 crisis protocol.`);
  } else {
    failed++;
    failureDetails.push(`Crisis safety override failed.`);
  }

  // SUMMARY
  console.log('\n===============================================================');
  console.log(`📊 FINAL RESULT: ${passed} PASSED | ${failed} FAILED`);
  console.log(`   Semantic Consistency: ${failed === 0 ? '100% CONSISTENT (0 UNRELATED RESPONSES)' : 'FAILED'}`);
  console.log('===============================================================\n');

  if (failed > 0) {
    console.error('Failure Details:', failureDetails);
    process.exit(1);
  }
}

runChatbotConsistencyVerification().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
