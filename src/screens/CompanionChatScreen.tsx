import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Wind,
  ShieldAlert,
  ArrowLeft,
  Heart,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { WolfieCharacter } from '../components/WolfieCharacter';
import { ChatMessage, User, WolfieEmotion } from '../types';
import { speakText, stopSpeaking } from '../utils/audioSynthesis';
import { isCrisisKeyword } from '../data/emergencyResources';
import { analytics } from '../utils/analytics';
import { authenticatedFetch } from '../utils/api';

interface CompanionChatScreenProps {
  user: User;
  onBack: () => void;
  onOpenBreathing: () => void;
  onOpenCrisis: () => void;
  onAddXp: (xp: number) => void;
}

export const CompanionChatScreen: React.FC<CompanionChatScreenProps> = ({
  user,
  onBack,
  onOpenBreathing,
  onOpenCrisis,
  onAddXp
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: 'companion',
      message: `Hello ${user.name}! 🌸 I'm right here with you. Whatever you're holding today—whether it's heavy, quiet, or hopeful—you can share it safely with me. How are you feeling right now?`,
      emotion: 'SUPPORTIVE',
      created_at: Date.now()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [autoSpeechEnabled, setAutoSpeechEnabled] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Load User-Isolated Chat History from Backend
  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      try {
        const res = await authenticatedFetch('/api/chat/history');
        if (res.ok) {
          const history = await res.json();
          if (isMounted && Array.isArray(history) && history.length > 0) {
            setMessages(history);
          }
        }
      } catch (err) {
        // Fallback to local memory if offline
      }
    };
    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [user.id]);

  const handleClearChat = async () => {
    stopSpeaking();
    try {
      await authenticatedFetch('/api/data/delete', { method: 'DELETE' });
    } catch (e) {}
    setMessages([
      {
        id: Date.now(),
        role: 'companion',
        message: `Chat history cleared. 🌸 I am here with a fresh, safe space whenever you wish to talk.`,
        emotion: 'SUPPORTIVE',
        created_at: Date.now()
      }
    ]);
    setShowClearConfirm(false);
  }; // Disabled by default as per user preference
  const [companionEmotion, setCompanionEmotion] = useState<WolfieEmotion>('LISTENING');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Speech Recognition STT setup with unmount cleanup
  useEffect(() => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = user.language === 'hi' ? 'hi-IN' : user.language === 'mr' ? 'mr-IN' : 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInputText(transcript);
      };

      recognition.onend = () => {
        setIsVoiceRecording(false);
      };

      recognition.onerror = () => {
        setIsVoiceRecording(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      stopSpeaking();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignored
        }
      }
    };
  }, [user.language]);

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser. Please type your message.");
      return;
    }

    if (isVoiceRecording) {
      recognitionRef.current.stop();
      setIsVoiceRecording(false);
    } else {
      setInputText('');
      setIsVoiceRecording(true);
      analytics.trackVoiceUsage('stt_mic');
      recognitionRef.current.start();
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const rawText = (textToSend || inputText).trim();
    if (!rawText || isTyping) return;

    // Enforce 2,000 char maximum
    const text = rawText.length > 2000 ? rawText.substring(0, 2000) : rawText;

    // Analytics: track message sent
    analytics.trackMessageSent(text.length, isVoiceRecording);

    // Check crisis keyword
    if (isCrisisKeyword(text)) {
      analytics.trackFeatureUsage('emergency_crisis_keyword_interception');
      onOpenCrisis();
    }

    const userMsg: ChatMessage = {
      id: Date.now(),
      role: 'user',
      message: text,
      created_at: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    setCompanionEmotion('THINKING');

    onAddXp(10);

    const startTime = Date.now();
    // Setup 8-second timeout controller for offline / slow network handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      // Call backend API /api/chat with user authentication
      const response = await authenticatedFetch('/api/chat', {
        method: 'POST',
        signal: controller.signal,
        body: JSON.stringify({
          message: text,
          companion_name: user.companion_name,
          companion_type: user.companion_type,
          personality_type: user.personality_type,
          user_name: user.name,
          language: user.language
        })
      });

      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();

        // P0 SAFETY: If backend identifies crisis, immediately trigger Emergency Crisis Modal
        if (data.is_crisis) {
          analytics.trackFeatureUsage('emergency_crisis_backend_flag_interception');
          onOpenCrisis();
        }

        const companionMsg: ChatMessage = {
          id: data.message_id || Date.now() + 1,
          role: 'companion',
          message: data.reply || data.message || "I hear you deeply. Take a gentle breath with me.",
          emotion: data.emotion || 'SUPPORTIVE',
          confidence: data.confidence,
          created_at: Date.now()
        };

        // Analytics: track successful AI response
        analytics.trackSuccessfulAiResponse(latencyMs, data.exemplars?.length || 3, data.emotion || 'SUPPORTIVE');

        setMessages(prev => [...prev, companionMsg]);
        setCompanionEmotion(data.emotion === 'HAPPY' ? 'HAPPY' : 'SUPPORTIVE');

        if (autoSpeechEnabled) {
          analytics.trackVoiceUsage('tts_playback');
          speakText(companionMsg.message, {
            pitch: user.companion_type === 'mochi_cat' ? 1.25 : 1.05,
            rate: 0.92
          });
        }
      } else {
        analytics.trackApiFailure('/api/chat', response.status, `Server returned ${response.status}`);
        throw new Error(`Server returned status ${response.status}`);
      }
    } catch (e: any) {
      clearTimeout(timeoutId);
      analytics.trackApiFailure('/api/chat', 0, e?.message || 'Network/Timeout failure');
      // Gentle empathetic fallback when server is down, offline, or times out
      setTimeout(() => {
        const textLower = text.toLowerCase();
        const marathiKeywords = ['ahe', 'aahe', 'mala', 'tula', 'vatat', 'vatatay', 'stress', 'tension', 'ekta', 'ekti', 'bhandan', 'abhyas', 'khup', 'nahi', 'kasa', 'kay', 'zala', 'taan', 'dukha'];
        const isMarathi = marathiKeywords.some(kw => textLower.includes(kw));

        let fallbackReply = '';
        if (isMarathi) {
          if (textLower.includes('lonely') || textLower.includes('ekta') || textLower.includes('ekti')) {
            fallbackReply = `Mala samajtay ki tula kiti lonely vatat aahe, ${user.name}. 💙 Me ithech tujhyasobat aahe. Ek deep breath ghe, tu ekta/ekti nahis.`;
          } else if (textLower.includes('stress') || textLower.includes('tension') || textLower.includes('abhyas')) {
            fallbackReply = `Tujha stress me samju shakto, ${user.name}. 🌿 Sagla ekdam sambhalaychi garaj nahi. 4 counts cha shwas ghe, me sobat ahe.`;
          } else if (textLower.includes('vait') || textLower.includes('sad') || textLower.includes('dukha')) {
            fallbackReply = `Tula vait vatat asel tar dabav nako thevus. 😔 Man halka karayla ithe share kar, me aiktot.`;
          } else {
            fallbackReply = `Me tujha bolna purn astitvane aiktot, ${user.name}. 💙 Ha tujha safe space ahe, manatla sang mala.`;
          }
        } else {
          fallbackReply = `I'm listening closely to your words, ${user.name}. Whatever you're experiencing is completely valid. Would it feel soothing to take 3 slow diaphragmatic breaths together right now?`;
          if (textLower.includes('anxious') || textLower.includes('overwhelm') || textLower.includes('stress')) {
            fallbackReply = `I hear how heavy things feel right now. Place a gentle hand over your chest, breathe in slowly for 4 seconds, and let the future wait. You are safe in this sanctuary.`;
          } else if (textLower.includes('tired') || textLower.includes('exhaust')) {
            fallbackReply = `Your soul has been working so hard. Rest isn't a reward you have to earn; it is a sacred gift. Let's take today one soft step at a time.`;
          } else if (textLower.includes('happy') || textLower.includes('good') || textLower.includes('great')) {
            fallbackReply = `That warms my heart so much! 🌟 Let's bottle up this lovely feeling so you can return to its warmth whenever you need it.`;
          }
        }

        const fallbackMsg: ChatMessage = {
          id: Date.now() + 1,
          role: 'companion',
          message: fallbackReply,
          emotion: 'SUPPORTIVE',
          created_at: Date.now()
        };

        setMessages(prev => [...prev, fallbackMsg]);
        setCompanionEmotion('SUPPORTIVE');

        if (autoSpeechEnabled) {
          analytics.trackVoiceUsage('tts_playback');
          speakText(fallbackReply, {
            pitch: user.companion_type === 'mochi_cat' ? 1.25 : 1.05,
            rate: 0.92
          });
        }
      }, 400);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const handleSpeakSingleMessage = (msg: string) => {
    analytics.trackVoiceUsage('tts_playback');
    speakText(msg, {
      pitch: user.companion_type === 'mochi_cat' ? 1.25 : 1.05,
      rate: 0.92
    });
  };

  const handleBackWithAnalytics = () => {
    if (inputText.trim().length > 3) {
      analytics.trackChatAbandonment(inputText.trim().length);
    }
    onBack();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Chat Top Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackWithAnalytics}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <WolfieCharacter
                emotion={companionEmotion}
                size="SMALL"
                companionType={user.companion_type}
                isInteractive={false}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 text-sm">{user.companion_name}</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[11px] text-slate-400">Mindful AI Emotional Companion</p>
            </div>
          </div>
        </div>

        {/* Header Tools: Breathing, TTS toggle, Crisis */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenBreathing}
            className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            title="Start Guided Breathing"
          >
            <Wind className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Breathe</span>
          </button>

          {/* Voice Readout Toggle */}
          <button
            onClick={() => {
              if (autoSpeechEnabled) {
                stopSpeaking();
                setAutoSpeechEnabled(false);
              } else {
                setAutoSpeechEnabled(true);
              }
            }}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition cursor-pointer border ${
              autoSpeechEnabled
                ? 'bg-purple-100/90 text-purple-700 border-purple-200 shadow-xs'
                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
            }`}
            title={autoSpeechEnabled ? "Voice Readout is ON (Click to turn off)" : "Voice Readout is OFF (Click to turn on)"}
          >
            {autoSpeechEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
                <span className="hidden sm:inline">Voice: On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Voice: Off</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowClearConfirm(true)}
            className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer border border-slate-200"
            title="Clear Chat History (Private Sanctuary)"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenCrisis}
            className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition cursor-pointer border border-rose-100"
            title="Crisis Helplines"
          >
            <ShieldAlert className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showClearConfirm && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-2.5 flex items-center justify-between text-xs text-rose-800 animate-fade-in z-20">
          <span>Are you sure you want to clear your current conversation?</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearChat}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition"
            >
              Clear Now
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-2.5 py-1 bg-white text-slate-700 border border-slate-200 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Messages Stream */}
      <div className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 space-y-4 overflow-y-auto">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-end gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs shrink-0 mb-1">
                  🌸
                </div>
              )}

              <div className="max-w-[82%] sm:max-w-[70%]">
                <div
                  className={`p-4 rounded-3xl text-sm leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-xs shadow-sm'
                      : 'bg-white text-slate-800 rounded-bl-xs border border-slate-100 shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                </div>

                {/* Companion Action Footer */}
                {!isUser && (
                  <div className="flex items-center gap-2 mt-1 px-2 text-[11px] text-slate-400">
                    {msg.emotion && (
                      <span className="capitalize text-indigo-500 font-medium">
                        ● {msg.emotion.toLowerCase()}
                      </span>
                    )}
                    <button
                      onClick={() => handleSpeakSingleMessage(msg.message)}
                      className="hover:text-slate-700 transition flex items-center gap-1"
                      title="Replay Voice"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Listen</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
            <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
            </div>
            <span>{user.companion_name} is reflecting...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="max-w-3xl w-full mx-auto px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {[
          "I feel overwhelmed with work today",
          "Can you guide me through a 3-minute breath?",
          "I feel lonely and need a friend",
          "Help me let go of overthinking"
        ].map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickPrompt(prompt)}
            className="px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 text-xs whitespace-nowrap transition shadow-2xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="bg-white border-t border-slate-200 p-3 sm:p-4 sticky bottom-0 z-30">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="max-w-3xl mx-auto flex items-center gap-2"
        >
          {/* Voice input mic button */}
          <button
            type="button"
            onClick={toggleVoiceRecording}
            className={`p-3 rounded-2xl transition ${
              isVoiceRecording
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
            title={isVoiceRecording ? "Listening... (tap to finish)" : "Hold or Tap to Speak"}
          >
            {isVoiceRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isVoiceRecording ? "Listening to your voice..." : `Message ${user.companion_name}...`}
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 text-sm"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-200"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
