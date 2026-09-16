import os
import json
import logging
from typing import List, Dict, Optional, Tuple

logger = logging.getLogger(__name__)

# Built-in non-diagnostic psychoeducational knowledge notes
KNOWLEDGE_NOTES = [
    {
        "id": "kb_grounding_54321",
        "topic": "anxiety",
        "title": "5-4-3-2-1 Sensory Grounding Technique",
        "technique": "Sensory grounding to detach from panic and reconnect to the immediate physical room.",
        "content": "Acknowledge 5 things you can see, 4 things you can physically touch, 3 sounds you can hear, 2 scents you can smell, and 1 taste. It gently halts the amygdala hijack.",
        "steps": ["Name 5 visual objects", "Feel 4 textures nearby", "Listen for 3 distinct noises", "Notice 2 ambient smells", "Taste 1 sensation on your tongue"]
    },
    {
        "id": "kb_box_breathing",
        "topic": "stress",
        "title": "4-4-4-4 Box Breathing & Vagal Reset",
        "technique": "Diaphragmatic breathing to activate the parasympathetic nervous system.",
        "content": "Inhale through the nose for 4 counts, hold gently for 4 counts, exhale smoothly through the mouth for 4 counts, and hold the empty lung for 4 counts.",
        "steps": ["Inhale 4s", "Hold 4s", "Exhale 4s", "Hold 4s"]
    },
    {
        "id": "kb_academic_burnout",
        "topic": "academic",
        "title": "Academic Overwhelm & Cognitive Chunking",
        "technique": "Break paralyzing syllabi into micro-commitments.",
        "content": "Overwhelm happens when the brain treats the entire future workload as a simultaneous emergency. Narrowing focus to just the next 15 minutes restores executive control.",
        "steps": ["Select 1 micro-task", "Set a 15-minute timer", "Permit all other subjects to wait", "Celebrate completion of 1 step"]
    },
    {
        "id": "kb_loneliness_validation",
        "topic": "loneliness",
        "title": "Validating Emotional Isolation",
        "technique": "Self-compassion without harsh self-blame during isolation.",
        "content": "Feeling lonely is not a defect or personal failure; it is an instinct signaling the human need for safe connection. Be as tender to yourself as you would to a wounded friend.",
        "steps": ["Acknowledge the ache without shame", "Engage in a warming physical ritual", "Reach out with low-pressure check-in"]
    }
]

class SoulTalkRAGRetriever:
    """
    RAG Retriever for SoulTalk:
    Dual-track retrieval for dialog exemplars (Roman Marathi & English) and psychological knowledge notes.
    """

    def __init__(self, dataset_dir: Optional[str] = None):
        if not dataset_dir:
            base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            dataset_dir = os.path.join(base, "dataset")
        
        self.dataset_dir = dataset_dir
        self.exemplars: List[Dict] = []
        self.inverted_index: Dict[str, List[int]] = {}
        self.is_loaded = False
        self._load_all()

    def _tokenize(self, text: str) -> List[str]:
        cleaned = "".join([c.lower() if c.isalnum() else " " for c in text])
        return [w for w in cleaned.split() if len(w) > 2]

    def _is_marathi(self, text: str) -> bool:
        marathi_cues = {
            'ahe', 'aahe', 'mala', 'tula', 'majha', 'tujha', 'kasa', 'kay', 'zala',
            'vatat', 'vatatay', 'bhandan', 'hotay', 'ghari', 'abhyas', 'mitra',
            'sobat', 'aaji', 'shikvte', 'karto', 'kartes', 'karu', 'pan', 'mag',
            'divas', 'khup', 'changla', 'vait', 'bhiti', 'gela', 'sagle', 'nahi'
        }
        tokens = self._tokenize(text)
        return any(t in marathi_cues for t in tokens)

    def _load_all(self):
        if self.is_loaded:
            return

        # 1. Load soultalk_dataset.json
        st_path = os.path.join(self.dataset_dir, "soultalk_dataset.json")
        if os.path.exists(st_path):
            try:
                with open(st_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if not line:
                            continue
                        try:
                            item = json.loads(line)
                            messages = item.get("messages", [])
                            for i in range(0, len(messages) - 1, 2):
                                u = messages[i].get("content")
                                b = messages[i+1].get("content")
                                if u and b:
                                    self.exemplars.append({
                                        "id": f"{item.get('id', 'ex')}_{i}",
                                        "topic": item.get("topic", "General"),
                                        "user_text": u,
                                        "bot_reply": b,
                                        "language": "roman_marathi"
                                    })
                        except Exception:
                            pass
            except Exception as e:
                logger.error(f"Error reading soultalk_dataset.json: {e}")

        # 2. Load conversations.json
        conv_path = os.path.join(self.dataset_dir, "conversations.json")
        if os.path.exists(conv_path):
            try:
                with open(conv_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        for i, item in enumerate(data):
                            u = item.get("user")
                            b = item.get("bot")
                            if u and b:
                                self.exemplars.append({
                                    "id": f"conv_{i}",
                                    "topic": item.get("category", "General"),
                                    "emotion": item.get("emotion"),
                                    "user_text": u,
                                    "bot_reply": b,
                                    "language": "roman_marathi" if self._is_marathi(u) else "english"
                                })
            except Exception as e:
                logger.error(f"Error reading conversations.json: {e}")

        # Build Inverted Index
        for idx, ex in enumerate(self.exemplars):
            text = f"{ex['user_text']} {ex.get('topic', '')} {ex.get('emotion', '')}"
            for tok in set(self._tokenize(text)):
                if tok not in self.inverted_index:
                    self.inverted_index[tok] = []
                self.inverted_index[tok].append(idx)

        self.is_loaded = True
        logger.info(f"SoulTalk RAG loaded {len(self.exemplars)} exemplars.")

    def retrieve(self, query: str, emotion: Optional[str] = None, top_k: int = 3) -> Dict:
        tokens = self._tokenize(query)
        is_marathi = self._is_marathi(query)
        scores: Dict[int, float] = {}

        for tok in tokens:
            if tok in self.inverted_index:
                indices = self.inverted_index[tok]
                idf = 1.0 + (len(self.exemplars) / max(1, len(indices)))
                for idx in indices:
                    scores[idx] = scores.get(idx, 0.0) + idf

        for idx, s in scores.items():
            ex = self.exemplars[idx]
            if is_marathi and ex.get("language") == "roman_marathi":
                scores[idx] *= 1.3
            if emotion and ex.get("emotion") and ex.get("emotion").lower() == emotion.lower():
                scores[idx] *= 1.25

        sorted_indices = sorted(scores.keys(), key=lambda x: scores[x], reverse=True)[:top_k]
        matched_exemplars = [self.exemplars[i] for i in sorted_indices]

        if not matched_exemplars and self.exemplars:
            matched_exemplars = self.exemplars[:top_k]

        matched_topic = matched_exemplars[0].get("topic", "General") if matched_exemplars else "General"
        
        # Match Knowledge Notes
        q_lower = query.lower()
        matched_notes = []
        for kn in KNOWLEDGE_NOTES:
            if kn["topic"] in q_lower or (emotion and emotion.lower() in kn["topic"]):
                matched_notes.append(kn)
        if not matched_notes:
            matched_notes = [KNOWLEDGE_NOTES[0]]

        return {
            "exemplars": matched_exemplars,
            "knowledge": matched_notes,
            "detected_topic": matched_topic,
            "is_marathi": is_marathi
        }

rag_retriever = SoulTalkRAGRetriever()
