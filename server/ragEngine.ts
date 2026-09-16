import fs from 'fs';
import path from 'path';

export interface Exemplar {
  id: string;
  topic: string;
  emotion?: string;
  user_text: string;
  bot_reply: string;
  language: 'roman_marathi' | 'english' | 'mixed';
}

export interface KnowledgeSnippet {
  id: string;
  topic: string;
  title: string;
  technique: string;
  content: string;
  steps?: string[];
}

export interface RagResult {
  exemplars: Exemplar[];
  knowledge: KnowledgeSnippet[];
  detectedTopic: string;
  detectedEmotion: string;
  isMarathi: boolean;
  languageType: 'roman_marathi' | 'devanagari_marathi' | 'english' | 'mixed';
  isHighConfidence: boolean;
  topScore: number;
}

// Built-in non-diagnostic psychoeducation & emotional coping knowledge base
export const KNOWLEDGE_BASE: KnowledgeSnippet[] = [
  {
    id: 'kb_grounding_54321',
    topic: 'anxiety',
    title: '5-4-3-2-1 Sensory Grounding Technique',
    technique: 'Sensory grounding to detach from panic and reconnect to the immediate physical room.',
    content: 'Acknowledge 5 things you can see, 4 things you can physically touch, 3 sounds you can hear, 2 scents you can smell, and 1 taste. It gently halts the amygdala hijack.',
    steps: ['Name 5 visual objects', 'Feel 4 textures nearby', 'Listen for 3 distinct noises', 'Notice 2 ambient smells', 'Taste 1 sensation on your tongue']
  },
  {
    id: 'kb_box_breathing',
    topic: 'stress',
    title: '4-4-4-4 Box Breathing & Vagal Reset',
    technique: 'Diaphragmatic breathing to activate the parasympathetic nervous system.',
    content: 'Inhale through the nose for 4 counts, hold gently for 4 counts, exhale smoothly through the mouth for 4 counts, and hold the empty lung for 4 counts.',
    steps: ['Inhale 4s', 'Hold 4s', 'Exhale 4s', 'Hold 4s']
  },
  {
    id: 'kb_academic_burnout',
    topic: 'academic',
    title: 'Academic Overwhelm & Cognitive Chunking',
    technique: 'Break paralyzing syllabi into micro-commitments (Pomodoro / single-tasking).',
    content: 'Overwhelm happens when the brain treats the entire future workload as a simultaneous emergency. Narrowing focus to just the next 15 minutes restores executive control.',
    steps: ['Select 1 micro-task', 'Set a 15-minute timer', 'Permit all other subjects to wait', 'Celebrate completion of 1 step']
  },
  {
    id: 'kb_loneliness_validation',
    topic: 'loneliness',
    title: 'Validating Emotional Isolation',
    technique: 'Self-compassion without harsh self-blame during isolation.',
    content: 'Feeling lonely is not a defect or personal failure; it is an instinct signaling the human need for safe connection. Be as tender to yourself as you would to a wounded friend.',
    steps: ['Acknowledge the ache without shame', 'Engage in a warming physical ritual (tea, blanket)', 'Reach out with low-pressure check-in when ready']
  },
  {
    id: 'kb_sleep_anxiety',
    topic: 'sleep',
    title: 'Sleep Hygiene & Bedtime Worry Dumping',
    technique: 'Brain-dumping repetitive intrusive thoughts to clear cognitive load before bed.',
    content: 'Writing worry loops onto a notepad transfers them out of working memory, telling the subconscious that they are safely cataloged until tomorrow morning.',
    steps: ['Write thoughts on paper', 'Close the notebook', 'Dim blue-light devices', 'Take 5 gentle deep belly breaths']
  },
  {
    id: 'kb_relationship_grief',
    topic: 'relationships',
    title: 'Emotional Processing of Heartbreak & Distance',
    technique: 'Allowing grief waves without demanding immediate recovery.',
    content: 'Healing is non-linear. The pain of separation reflects the depth of care that existed. Give yourself permission to mourn at your own natural pace.',
    steps: ['Validate the sorrow', 'Avoid forcing instant optimism', 'Stay grounded in daily self-care basics']
  }
];

function parseJsonObjects(rawText: string): any[] {
  const cleaned = rawText.trim();
  if (!cleaned) return [];
  if (cleaned.startsWith('[')) {
    try {
      return JSON.parse(cleaned);
    } catch (e) {
      // continue to chunk parsing
    }
  }

  // Attempt wrapped commas
  try {
    const wrapped = '[' + cleaned.replace(/\}\s*\{/g, '},{') + ']';
    return JSON.parse(wrapped);
  } catch (e) {
    // continue to scanner
  }

  // Bracket-counting scanner fallback
  const results: any[] = [];
  let depth = 0;
  let inString = false;
  let escapeNext = false;
  let startIndex = -1;

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    if (char === '\\') {
      escapeNext = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === '{') {
        if (depth === 0) {
          startIndex = i;
        }
        depth++;
      } else if (char === '}') {
        depth--;
        if (depth === 0 && startIndex !== -1) {
          const objStr = cleaned.slice(startIndex, i + 1);
          try {
            results.push(JSON.parse(objStr));
          } catch (err) {
            // ignore bad chunk
          }
          startIndex = -1;
        }
      }
    }
  }
  return results;
}

class RagEngine {
  private exemplars: Exemplar[] = [];
  private isLoaded = false;
  private termIndex: Map<string, number[]> = new Map();

  constructor() {
    this.loadDatasets();
  }

  private tokenize(text: string): string[] {
    const stopwords = new Set([
      'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'for',
      'of', 'or', 'by', 'with', 'from', 'this', 'that', 'it', 'are', 'was',
      'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'but', 'if', 'so', 'me', 'my', 'myself', 'we', 'our', 'you', 'your',
      'he', 'him', 'she', 'her', 'they', 'them', 'what', 'who', 'how', 'when',
      'where', 'why', 'can', 'could', 'will', 'would', 'should', 'all', 'any',
      'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
      'nor', 'not', 'only', 'own', 'same', 'than', 'too', 'very', 'just',
      // roman marathi high frequency grammatical particles
      'pan', 'mag', 'ani', 'tar', 'ata', 'te', 'tya', 'ha', 'hi', 'he', 'to',
      'ti', 'jo', 'ji', 'je', 'kahi', 'sagla', 'sagale', 'karan'
    ]);

    return text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 2 && !stopwords.has(w));
  }

  public detectLanguageDetails(text: string): {
    isRomanMarathi: boolean;
    isDevanagari: boolean;
    isEnglish: boolean;
    isMixed: boolean;
    primary: 'roman_marathi' | 'devanagari_marathi' | 'english' | 'mixed';
  } {
    const hasDevanagari = /[\u0900-\u097F]/.test(text);
    const marathiKeywords = [
      'ahe', 'aahe', 'mala', 'tula', 'majha', 'tujha', 'kasa', 'kay', 'zala',
      'vatat', 'vatatay', 'bhandan', 'hotay', 'ghari', 'abhyas', 'mitra',
      'sobat', 'aaji', 'shikvte', 'karto', 'kartes', 'karu', 'pan', 'mag',
      'divas', 'khup', 'changla', 'vait', 'bhiti', 'gela', 'sagle', 'nahi',
      'ata', 'sadhyas', 'kadhich', 'rahila', 'jast', 'kami', 'bol', 'aik',
      'ekta', 'ekti', 'shant', 'taan', 'dukha', 'rad', 'samjat', 'bolaycha'
    ];

    const tokens = this.tokenize(text);
    const marathiMatchCount = tokens.filter(t => marathiKeywords.includes(t)).length;
    const hasEnglish = /[a-zA-Z]/.test(text);

    const isRomanMarathi = marathiMatchCount >= 1;
    const isDevanagari = hasDevanagari;
    const isMixed = (isRomanMarathi || isDevanagari) && hasEnglish && tokens.length > 2;

    let primary: 'roman_marathi' | 'devanagari_marathi' | 'english' | 'mixed' = 'english';
    if (isDevanagari) {
      primary = 'devanagari_marathi';
    } else if (isMixed) {
      primary = 'mixed';
    } else if (isRomanMarathi) {
      primary = 'roman_marathi';
    }

    return {
      isRomanMarathi,
      isDevanagari,
      isEnglish: !isRomanMarathi && !isDevanagari,
      isMixed,
      primary
    };
  }

  public detectTopic(query: string): string {
    const q = query.toLowerCase();

    // 1. LONELINESS / ISOLATION (High Priority to catch "bolavasa vatat nahi", "ekta", paraphrases)
    if (
      q.includes('lonely') || q.includes('lonley') || q.includes('alone') || q.includes('ekta') || q.includes('ekti') ||
      q.includes('isolated') || q.includes('nobody') || q.includes('bolavasa vatat nahi') ||
      q.includes('bolaychach nahi') || q.includes('bolaycha nahi') || q.includes('konashi bolaycha') ||
      q.includes('koni nahi') || q.includes('konich nahi') || q.includes('एकटा') || q.includes('एकटेपणा') ||
      q.includes('understand me') || q.includes('understands me') || q.includes('alienat') ||
      q.includes('disconnect') || q.includes('lokanmadhye') || q.includes('internally lonely') ||
      q.includes('unheard') || q.includes('unseen') || q.includes('koni samjun') || q.includes('vattay')
    ) {
      return 'loneliness';
    }

    // 2. CONFUSION / LOST / DIRECTIONLESS
    if (
      q.includes('samjat nahi') || q.includes('samjena') || q.includes('kahi samjat') ||
      q.includes('confused') || q.includes('lost') || q.includes('stuck') || q.includes('gondhal') ||
      q.includes("don't know what") || q.includes('dont know what') || q.includes('directionless') ||
      q.includes('kahi kalat nahi') || q.includes('kalat nahi') || q.includes('fog') ||
      q.includes('drifting') || q.includes('what choice') || q.includes('no idea') ||
      q.includes('chaos') || q.includes('rasta') || q.includes('questioning')
    ) {
      return 'confusion';
    }

    // 3. SADNESS / GRIEF / BAD DAY / MOOD OFF
    if (
      q.includes('bad day') || q.includes('mood off') || q.includes('off aahe') || q.includes('off ahe') ||
      q.includes('mood kharab') || q.includes('kharab') || q.includes('vait') || q.includes('dukha') ||
      q.includes('dukhta') || q.includes('sad') || q.includes('crying') || q.includes('cry') ||
      q.includes('hurt') || q.includes('pain') || q.includes('tears') || q.includes('hopeless') ||
      q.includes('heartbroken') || q.includes('grief') || q.includes('heavy heart') ||
      q.includes('man lagat nahi') || q.includes('kahi karavasa vatat nahi') ||
      q.includes('खराब') || q.includes('वाईट') || q.includes('दुःख')
    ) {
      return 'sadness';
    }

    // 4. STRESS / OVERWHELM / BURNOUT
    if (
      q.includes('stress') || q.includes('overwhelm') || q.includes('tension') || q.includes('taan') ||
      q.includes('exhaust') || q.includes('burnout') || q.includes('burned out') || q.includes('pressure') ||
      q.includes('thaklo') || q.includes('thakle') || q.includes('heavy') || q.includes('overloaded') ||
      q.includes('too much on my plate') || q.includes('zero energy') || q.includes('fried') ||
      q.includes('drowning') || q.includes('mountain of tasks') || q.includes('tasks') || q.includes('ताण') ||
      q.includes('load aalay') || q.includes('load ahe') || q.includes('load yetoy')
    ) {
      return 'stress';
    }

    // 5. ANXIETY / PANIC / FEAR / FUTURE WORRY
    if (
      q.includes('anxi') || q.includes('panic') || q.includes('bhiti') || q.includes('ghabar') ||
      q.includes('ghabrayla') || q.includes('palpitation') || q.includes('trembling') ||
      q.includes('future') || q.includes('bhavishya') || q.includes('worry') || q.includes('worried') ||
      q.includes('nervous') || q.includes('fear') || q.includes('overthinking') || q.includes('racing thoughts') ||
      q.includes('restless') || q.includes('tight') || q.includes('tightness') || q.includes('chest feels tight') ||
      q.includes('tomorrow') || q.includes('भिती') || q.includes('चिंता')
    ) {
      return 'anxiety';
    }

    // 6. ACADEMIC / WORK / CAREER
    if (
      q.includes('exam') || q.includes('abhyas') || q.includes('college') || q.includes('study') ||
      q.includes('studies') || q.includes('syllabus') || q.includes('professor') || q.includes('marks') ||
      q.includes('assignment') || q.includes('office') || q.includes('job') || q.includes('career') ||
      q.includes('deadline') || q.includes('head above water') || q.includes('test') || q.includes('fail')
    ) {
      return 'academic';
    }

    // 7. SLEEP / BEDTIME / NIGHT
    if (
      q.includes('sleep') || q.includes('zop') || q.includes('insomnia') || q.includes('bedtime') ||
      q.includes('awake') || q.includes('night') || q.includes('midnight') || q.includes('nightmare') ||
      q.includes('tossing and turning') || q.includes('zop yet nahi') || q.includes('dole ughade') ||
      q.includes('3 vajle') || q.includes('4 am')
    ) {
      return 'sleep';
    }

    // 8. RELATIONSHIPS / CONFLICT / BREAKUP
    if (
      q.includes('breakup') || q.includes('friend') || q.includes('mitra') || q.includes('mitri') ||
      q.includes('bhandan') || q.includes('relationship') || q.includes('partner') || q.includes('parents') ||
      q.includes('family') || q.includes('ghari') || q.includes('cheated') || q.includes('argument') ||
      q.includes('betray') || q.includes('toxic') || q.includes('unloved')
    ) {
      return 'relationships';
    }

    // 9. ANGER / FRUSTRATION
    if (
      q.includes('angry') || q.includes('raag') || q.includes('rag') || q.includes('chid') ||
      q.includes('mad') || q.includes('unfair') || q.includes('hate') || q.includes('frustrat') ||
      q.includes('furious') || q.includes('boundaries') || q.includes('scream') ||
      q.includes('disrespect') || q.includes('sanap')
    ) {
      return 'anger';
    }

    // 10. CALM / POSITIVE
    if (
      q.includes('calm') || q.includes('peace') || q.includes('shant') || q.includes('relaxed') ||
      q.includes('serene') || q.includes('feeling okay') || q.includes('feel okay') || q.includes('feeling good') ||
      q.includes('safe space') || q.includes('breathe') || q.includes('good day') || q.includes('mast vatala') ||
      q.includes('mast vatla') || q.includes('deep breath') || q.includes('resting quietly') ||
      q.includes('soothing walk') || q.includes('park')
    ) {
      return 'calm';
    }

    // 11. GREETING / CASUAL
    if (
      q.includes('hi ') || q === 'hi' || q.includes('hello') || q.includes('hey') ||
      q.includes('how are you') || q.includes('kasa ahes') || q.includes('kasa chalay') ||
      q.includes('just wanted to talk') || q.includes('bolaycha aahe') || q.includes('bolaycha ahe') ||
      q.includes('konashi tari bolaycha') || q.includes('namaskar') || q.includes('good evening') ||
      q.includes('good morning')
    ) {
      return 'greeting';
    }

    return 'general';
  }

  public loadDatasets() {
    if (this.isLoaded) return;
    const baseDir = process.cwd();
    const datasetDir = path.join(baseDir, 'backend', 'dataset');

    try {
      // 1. Load soultalk_dataset.json (Wolfie Roman Marathi dataset)
      const stPath = path.join(datasetDir, 'soultalk_dataset.json');
      if (fs.existsSync(stPath)) {
        const raw = fs.readFileSync(stPath, 'utf8');
        const lines = raw.split('\n').filter(l => l.trim().length > 0);
        for (const line of lines) {
          try {
            const item = JSON.parse(line);
            const messages = item.messages || [];
            for (let i = 0; i < messages.length - 1; i += 2) {
              const uMsg = messages[i]?.content;
              const bMsg = messages[i + 1]?.content;
              if (uMsg && bMsg) {
                this.exemplars.push({
                  id: `${item.id}_${i}`,
                  topic: item.topic || 'General',
                  user_text: uMsg,
                  bot_reply: bMsg,
                  language: 'roman_marathi'
                });
              }
            }
          } catch (e) {
            // ignore malformed line
          }
        }
      }

      // 2. Load conversations.json (Categorized dialogue pairs)
      const convPath = path.join(datasetDir, 'conversations.json');
      if (fs.existsSync(convPath)) {
        const raw = fs.readFileSync(convPath, 'utf8');
        try {
          const list = parseJsonObjects(raw);
          for (let i = 0; i < list.length; i++) {
            const item = list[i];
            if (Array.isArray(item)) {
              for (let k = 0; k < item.length; k++) {
                const subItem = item[k];
                if (subItem && subItem.user && subItem.bot) {
                  const langInfo = this.detectLanguageDetails(subItem.user);
                  this.exemplars.push({
                    id: `conv_${i}_${k}`,
                    topic: subItem.category || 'General',
                    emotion: subItem.emotion,
                    user_text: subItem.user,
                    bot_reply: subItem.bot,
                    language: langInfo.isRomanMarathi ? 'roman_marathi' : 'english'
                  });
                }
              }
            } else if (item && item.user && item.bot) {
              const langInfo = this.detectLanguageDetails(item.user);
              this.exemplars.push({
                id: `conv_${i}`,
                topic: item.category || 'General',
                emotion: item.emotion,
                user_text: item.user,
                bot_reply: item.bot,
                language: langInfo.isRomanMarathi ? 'roman_marathi' : 'english'
              });
            }
          }
        } catch (e) {
          console.warn('[RAG Engine] Notice reading conversations.json:', e);
        }
      }

      // 3. Load conversation_chains.json
      const chainsPath = path.join(datasetDir, 'conversation_chains.json');
      if (fs.existsSync(chainsPath)) {
        const raw = fs.readFileSync(chainsPath, 'utf8');
        try {
          const chains = parseJsonObjects(raw);
          for (const ch of chains) {
            const turns = ch.turns || [];
            for (let j = 0; j < turns.length; j++) {
              const turn = turns[j];
              if (turn.user && turn.bot) {
                this.exemplars.push({
                  id: `chain_${ch.chain_id || 1}_${j}`,
                  topic: ch.topic || 'loneliness',
                  user_text: turn.user,
                  bot_reply: turn.bot,
                  language: 'roman_marathi'
                });
              }
            }
          }
        } catch (e) {
          console.warn('[RAG Engine] Notice reading conversation_chains.json:', e);
        }
      }

      // Build inverted index for fast keyword/TF-IDF lookup
      for (let i = 0; i < this.exemplars.length; i++) {
        const ex = this.exemplars[i];
        const tokens = this.tokenize(`${ex.user_text} ${ex.topic} ${ex.emotion || ''}`);
        const uniqueTokens = new Set(tokens);
        uniqueTokens.forEach(tok => {
          if (!this.termIndex.has(tok)) {
            this.termIndex.set(tok, []);
          }
          this.termIndex.get(tok)!.push(i);
        });
      }

      this.isLoaded = true;
      console.log(`[RAG Engine] Successfully loaded and indexed ${this.exemplars.length} dialogue exemplars.`);
    } catch (err) {
      console.error('[RAG Engine] Error loading datasets:', err);
    }
  }

  public retrieve(query: string, emotion?: string, topK: number = 3): RagResult {
    this.loadDatasets();
    const queryTokens = this.tokenize(query);
    const langInfo = this.detectLanguageDetails(query);
    const detectedTopic = this.detectTopic(query);

    // Score all candidate exemplars using BM25-style frequency scoring
    const scores = new Map<number, number>();

    queryTokens.forEach(tok => {
      const matchIndices = this.termIndex.get(tok);
      if (matchIndices) {
        // IDF weighting: rarer tokens get higher weight
        const idf = Math.log(1 + (this.exemplars.length / matchIndices.length));
        matchIndices.forEach(idx => {
          scores.set(idx, (scores.get(idx) || 0) + idf);
        });
      }
    });

    // Language and topic alignment boost
    for (const [idx, score] of scores.entries()) {
      const ex = this.exemplars[idx];
      let finalScore = score;
      // Language must match
      if (langInfo.isRomanMarathi && ex.language === 'roman_marathi') {
        finalScore *= 1.4;
      } else if (!langInfo.isRomanMarathi && ex.language === 'english') {
        finalScore *= 1.4;
      } else {
        finalScore *= 0.1; // Penalize mismatched language exemplars
      }

      if (emotion && ex.emotion && ex.emotion.toLowerCase() === emotion.toLowerCase()) {
        finalScore *= 1.25;
      }
      if (ex.topic && ex.topic.toLowerCase().includes(detectedTopic)) {
        finalScore *= 1.50;
      }
      scores.set(idx, finalScore);
    }

    // Sort by descending score
    const sortedEntries = Array.from(scores.entries()).sort((a, b) => b[1] - a[1]);

    // EMPIRICAL CONFIDENCE THRESHOLD
    // If detected topic is 'general' or top score is below MIN_CONFIDENCE_SCORE (2.5), do NOT inject weak/unrelated exemplars!
    const MIN_CONFIDENCE_SCORE = 2.5;
    const topScore = sortedEntries.length > 0 ? sortedEntries[0][1] : 0;
    const isHighConfidence = detectedTopic !== 'general' && topScore >= MIN_CONFIDENCE_SCORE;

    let matchedExemplars: Exemplar[] = [];
    if (isHighConfidence) {
      const validIndices = sortedEntries
        .filter(entry => entry[1] >= MIN_CONFIDENCE_SCORE)
        .slice(0, topK)
        .map(entry => entry[0]);
      matchedExemplars = validIndices.map(idx => this.exemplars[idx]);
    }

    // Psychoeducational Knowledge Matching based on detected topic
    let matchedKnowledge = KNOWLEDGE_BASE.filter(k => {
      if (detectedTopic === 'anxiety' && k.topic === 'anxiety') return true;
      if (detectedTopic === 'stress' && k.topic === 'stress') return true;
      if (detectedTopic === 'loneliness' && k.topic === 'loneliness') return true;
      if (detectedTopic === 'academic' && k.topic === 'academic') return true;
      if (detectedTopic === 'sleep' && k.topic === 'sleep') return true;
      if (detectedTopic === 'relationships' && k.topic === 'relationships') return true;
      return false;
    });

    if (matchedKnowledge.length === 0) {
      if (detectedTopic === 'anxiety' || detectedTopic === 'stress') {
        matchedKnowledge = [KNOWLEDGE_BASE[0], KNOWLEDGE_BASE[1]];
      } else if (detectedTopic === 'loneliness') {
        matchedKnowledge = [KNOWLEDGE_BASE[3]];
      } else if (detectedTopic === 'academic') {
        matchedKnowledge = [KNOWLEDGE_BASE[2]];
      } else if (detectedTopic === 'sleep') {
        matchedKnowledge = [KNOWLEDGE_BASE[4]];
      } else {
        matchedKnowledge = [KNOWLEDGE_BASE[0]];
      }
    }

    return {
      exemplars: matchedExemplars,
      knowledge: matchedKnowledge,
      detectedTopic,
      detectedEmotion: emotion || 'supportive',
      isMarathi: langInfo.isRomanMarathi || langInfo.isDevanagari,
      languageType: langInfo.primary,
      isHighConfidence,
      topScore
    };
  }

  public generateLocalRagReply(
    query: string,
    emotion: string,
    userName: string = 'Friend',
    companionName: string = 'Wolfie',
    ragResult?: RagResult
  ): string {
    const rag = ragResult || this.retrieve(query, emotion, 3);
    const topic = rag.detectedTopic || this.detectTopic(query);

    // GREETINGS & CASUAL
    if (topic === 'greeting') {
      return `Hello ${userName}! ✨ Me ${companionName} aahe, tujha companion. Tula bhetun nehamich anand hoto. Aaj tujha divas kasa chalay aani kasa vatatay tula?`;
    }

    // CALM & PEACE
    if (topic === 'calm') {
      return `Tula aatta shant vatatay he aikun mala khup anand zala, ${userName}. 🌿 He shant kshan manat saathvun thev. Aaj divasbhar asa shantpana tikavnyacha prayatna kar.`;
    }

    // LONELINESS
    if (topic === 'loneliness') {
      return `Mala samajtay ki tula kiti lonely vatat aahe, ${userName}. 💙 Kadhi kadhi saglya lokanchya madhye asunhi ektepana janavto, pan to tujha dosh nahiye. Me right now tujhyasobat aahe. Shwas ghe aani manatla sang mala.`;
    }

    // STRESS / OVERWHELM
    if (topic === 'stress') {
      return `Tujha stress me purnpane samju shakto, ${userName}. 🌿 Sagla ekach veli sambhalaychi garaj nahiye. Chala ek deep breath gheu 4 counts sathi. Fakt pudhcha chota step ghe, tu khup chaan kartoy/kartes.`;
    }

    // ANXIETY / FUTURE WORRY
    if (topic === 'anxiety') {
      return `Future chi chinta aani anxiety khup heavy vatu shakte, ${userName}. 🌿 Pan ek lakshat thev—sagle prashna aajach sodvaychi garaj nahiye. Ek deep breath ghe. Tu aatta safe ahes.`;
    }

    // ACADEMIC / CAREER
    if (topic === 'academic') {
      return `Abhyasacha aani exam cha pressure kharach bhari padto, ${userName}. 📚 Pan tu swatahla ekadam strain nako karus. 15-minute cha ek chota timer laav, aani thoda thoda karun samjun ghe. Me sobat ahe!`;
    }

    // SLEEP ROUTINE
    if (topic === 'sleep') {
      return `Ratrichya veli vicharancha gondhal jast vadhava he agdi sahaj aahe, ${userName}. 🌙 Manatle vichar ekda kagadawar lihun thev aani screen band karun 5 deep breaths ghe. Shanti ghe.`;
    }

    // RELATIONSHIPS / CONFLICT / FRIENDSHIP
    if (topic === 'relationships') {
      return `Naatyatlya bhandanani kiwa mitranbarobarchya distance mule man khup dukhata, ${userName}. 💙 Me purn lakshya deun tujha aiktoy. Manat je kahi ahe te bindass sang mala.`;
    }

    // CONFUSION / LOST
    if (topic === 'confusion') {
      return `Kadhi kadhi life madhye kahi samjat nahi aani sagla confuse vatata, ${userName}. 🤍 He agdi normal aahe. Tu ekta nahi ahes. Manatla sankoch baher kadh.`;
    }

    // SADNESS / HURT / BAD DAY
    if (topic === 'sadness') {
      return `Tula vait vatat asel tar manavar dabav nako thevus, ${userName}. 😔 Feeling express kelyane man halka hota. Mi shantpane aiktot tujha pratyek shabda. Kay zala te sangshil ka?`;
    }

    // ANGER / CONFLICT
    if (topic === 'anger') {
      return `Tujha raag aani chid agdi natural aahe, ${userName}. 😤 Je ghadla te unfair vatla asnar. Thoda shant basun saavkaash sang mala kay zala, me non-judgmentally aikayla tayar ahe.`;
    }

    // JOY / HAPPY
    if (emotion === 'HAPPY' || emotion === 'EXCITED') {
      return `Tula itka anandit baghun mala khup chaan vatla, ${userName}! ✨ Asa anand aani positivity nehamich tujhyasobat raho. Mala aani sang kay vishesh ghadla aaj!`;
    }

    return `Me tujha bolna purn astitvane aiktot, ${userName}. 💙 Manat je kahi vichar yet aahet te nassankoch pane ithe share kar, ha tujha safe sanctuary ahe.`;
  }

  public getStats() {
    this.loadDatasets();
    return {
      totalExemplars: this.exemplars.length,
      totalKnowledgeNotes: KNOWLEDGE_BASE.length,
      indexedVocabulary: this.termIndex.size,
      status: 'operational'
    };
  }
}

export const ragEngine = new RagEngine();
