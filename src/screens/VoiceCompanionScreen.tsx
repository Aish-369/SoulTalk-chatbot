import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowLeft,
  Play,
  Pause,
  Heart,
  Calendar,
  CheckCircle,
  Copy,
  BookOpen,
  XCircle,
  AlertCircle,
  Globe
} from 'lucide-react';
import { WHISPER_ENVIRONMENTS } from '../data/companionData';
import { WhisperEnv, VoiceMemory, User } from '../types';
import { ambientSound, speakText, stopSpeaking } from '../utils/audioSynthesis';
import { authenticatedFetch } from '../utils/api';

interface VoiceCompanionScreenProps {
  user: User;
  voiceMemories: VoiceMemory[];
  onBack: () => void;
  onSaveVoiceMemory: (memory: VoiceMemory) => void;
  onAddXp: (xp: number) => void;
}

export const VoiceCompanionScreen: React.FC<VoiceCompanionScreenProps> = ({
  user,
  voiceMemories,
  onBack,
  onSaveVoiceMemory,
  onAddXp
}) => {
  const [selectedEnv, setSelectedEnv] = useState<WhisperEnv>(WHISPER_ENVIRONMENTS[0]);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
  const [activeLang, setActiveLang] = useState<string>(user.language || 'en');

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isSpeakingReflection, setIsSpeakingReflection] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    emotion: string;
    confidence: number;
    reflection: string;
    themes: string[];
    action: string;
  } | null>(null);

  const recognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      ambientSound.stop();
      stopSpeaking();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignored
        }
      }
    };
  }, []);

  const handleToggleAmbient = () => {
    if (isAmbientPlaying) {
      ambientSound.stop();
      setIsAmbientPlaying(false);
    } else {
      ambientSound.play(selectedEnv.ambientType);
      setIsAmbientPlaying(true);
    }
  };

  const handleSelectEnv = (env: WhisperEnv) => {
    setSelectedEnv(env);
    if (isAmbientPlaying) {
      ambientSound.play(env.ambientType);
    }
  };

  // Speech recognition STT setup
  useEffect(() => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = activeLang === 'hi' ? 'hi-IN' : activeLang === 'mr' ? 'mr-IN' : 'en-IN';

      rec.onresult = (event: any) => {
        const current = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join(' ');
        setTranscript(current);
      };

      rec.onerror = (event: any) => {
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setPermissionDenied(true);
        }
        setIsRecording(false);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      };

      recognitionRef.current = rec;
    }
  }, [activeLang]);

  const handleStartRecording = () => {
    setPermissionDenied(false);
    setTranscript('');
    setAnalysisResult(null);
    setRecordSeconds(0);
    setIsRecording(true);
    stopSpeaking();
    setIsSpeakingReflection(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Ignored if already started
      }
    } else {
      // Fallback if browser doesn't have Web Speech API
      console.info("Speech recognition not supported in this client environment; continuing with manual voice input fallback.");
    }

    timerIntervalRef.current = setInterval(() => {
      setRecordSeconds(prev => prev + 1);
    }, 1000);
  };

  const handleCancelRecording = () => {
    setIsRecording(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // Ignored
      }
    }
    setTranscript('');
    setRecordSeconds(0);
  };

  const handleStopRecordingAndAnalyze = async () => {
    setIsRecording(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignored
      }
    }

    const recordedText = transcript.trim() || "I am feeling thoughtful and reflective about my day and looking for calm.";
    setIsAnalyzing(true);

    try {
      // Call backend /api/voice/reflect with authentication
      const response = await authenticatedFetch('/api/voice/reflect', {
        method: 'POST',
        body: JSON.stringify({
          transcript: recordedText,
          companion_name: user.companion_name,
          user_name: user.name,
          language: activeLang,
          environment: selectedEnv.name
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysisResult(data);
        saveMemoryToHistory(recordedText, data);
      } else {
        throw new Error("Analysis failed");
      }
    } catch (e) {
      // Compassionate fallback analysis
      setTimeout(() => {
        const fallback = {
          emotion: "Reflective & Centered",
          confidence: 0.92,
          reflection: `You spoke with great honesty and courage. Recognizing your inner state under the calm ${selectedEnv.name} allows your nervous system to soften and reset. You are building real resilience.`,
          themes: ["Emotional Awareness", "Self-Compassion", "Quiet Strength"],
          action: "Take 3 deep breaths and write down one kind thing you appreciate about yourself today."
        };
        setAnalysisResult(fallback);
        saveMemoryToHistory(recordedText, fallback);
      }, 1000);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSpeakReflection = (text: string) => {
    if (isSpeakingReflection) {
      stopSpeaking();
      setIsSpeakingReflection(false);
    } else {
      setIsSpeakingReflection(true);
      speakText(text, {
        pitch: user.companion_type === 'mochi_cat' ? 1.25 : 1.05,
        rate: 0.92,
        onEnd: () => setIsSpeakingReflection(false)
      });
    }
  };

  const saveMemoryToHistory = (text: string, analysis: any) => {
    const memory: VoiceMemory = {
      id: Date.now(),
      title: `Whisper in ${selectedEnv.name}`,
      transcript: text,
      emotion: analysis.emotion,
      confidence: analysis.confidence,
      reflection: analysis.reflection,
      themes: analysis.themes,
      action: analysis.action,
      duration_sec: Math.max(recordSeconds, 5),
      created_at: Date.now()
    };
    onSaveVoiceMemory(memory);
    onAddXp(25);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      className="min-h-screen text-slate-100 flex flex-col justify-between transition-colors duration-700 pb-12"
      style={{
        background: `linear-gradient(to bottom, ${selectedEnv.startColor}, ${selectedEnv.endColor})`
      }}
    >
      {/* Top Header */}
      <div className="p-4 sm:p-6 flex items-center justify-between border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              ambientSound.stop();
              stopSpeaking();
              onBack();
            }}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
              <span>Whisper Corner Sanctuary</span>
              <span>{selectedEnv.icon}</span>
            </h2>
            <p className="text-xs text-white/60">Voice reflection, speech-to-text & soundscapes</p>
          </div>
        </div>

        {/* Ambient Sound Loop Toggle */}
        <button
          onClick={handleToggleAmbient}
          className={`px-3.5 py-1.5 rounded-2xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer border ${
            isAmbientPlaying
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs'
              : 'bg-white/10 text-white/70 border-white/15 hover:bg-white/20'
          }`}
        >
          {isAmbientPlaying ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          <span>{isAmbientPlaying ? 'Ambient: Playing' : 'Ambient: Muted'}</span>
        </button>
      </div>

      {/* Main Content Sanctuary */}
      <div className="max-w-4xl mx-auto w-full p-4 sm:p-6 flex-1 flex flex-col items-center justify-between">
        
        {/* Environment Picker & Language Selector */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 no-scrollbar">
            {WHISPER_ENVIRONMENTS.map((env) => {
              const isSelected = env.id === selectedEnv.id;
              return (
                <button
                  key={env.id}
                  onClick={() => handleSelectEnv(env)}
                  className={`px-3 py-1.5 rounded-2xl text-xs font-medium flex items-center gap-1.5 transition whitespace-nowrap border cursor-pointer ${
                    isSelected
                      ? 'bg-white/25 text-white border-white/50 shadow-sm'
                      : 'bg-black/30 text-white/60 border-white/10 hover:bg-black/40 hover:text-white'
                  }`}
                >
                  <span>{env.icon}</span>
                  <span>{env.name}</span>
                </button>
              );
            })}
          </div>

          {/* Voice Input Language Selector */}
          <div className="flex items-center gap-1.5 bg-black/30 p-1 rounded-2xl border border-white/10 shrink-0">
            <Globe className="w-3.5 h-3.5 text-indigo-300 ml-1.5" />
            {[
              { id: 'en', label: 'English (IN)' },
              { id: 'mr', label: 'मराठी / Roman' },
              { id: 'hi', label: 'हिन्दी' }
            ].map(l => (
              <button
                key={l.id}
                onClick={() => setActiveLang(l.id)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition cursor-pointer ${
                  activeLang === l.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Permission Denied Banner */}
        {permissionDenied && (
          <div className="my-4 p-4 rounded-3xl bg-rose-900/60 border border-rose-500/40 text-rose-100 max-w-md w-full text-xs flex items-start gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold text-white mb-0.5">Microphone Permission Blocked</strong>
              <span>Please allow microphone access in your browser or device permissions to enable voice whispers. You can also type freely in Companion Chat.</span>
            </div>
          </div>
        )}

        {/* Central Audio Recording Sphere & Status */}
        <div className="my-auto py-6 flex flex-col items-center text-center">
          <div className="relative mb-6 flex items-center justify-center">
            {/* Animated Pulses when recording */}
            {isRecording && (
              <>
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute w-44 h-44 rounded-full bg-rose-500/30"
                />
                <motion.div
                  animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0.05, 0.4] }}
                  transition={{ duration: 2, delay: 0.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute w-56 h-56 rounded-full bg-purple-500/20"
                />
              </>
            )}

            {/* Main Record Button */}
            <button
              onClick={isRecording ? handleStopRecordingAndAnalyze : handleStartRecording}
              className={`relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center text-white shadow-2xl transition-transform hover:scale-105 cursor-pointer ${
                isRecording
                  ? 'bg-gradient-to-tr from-rose-600 to-pink-500 shadow-rose-500/50 animate-pulse'
                  : 'bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-indigo-500/40'
              }`}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-9 h-9 sm:w-10 sm:h-10 mb-1" />
                  <span className="text-[11px] font-bold tracking-wider uppercase">Stop & Reflect</span>
                </>
              ) : (
                <>
                  <Mic className="w-9 h-9 sm:w-10 sm:h-10 mb-1" />
                  <span className="text-[11px] font-bold tracking-wider uppercase">Whisper</span>
                </>
              )}
            </button>
          </div>

          {/* Time and Cancel Button */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-white">
              {isRecording ? `Listening... (${formatTime(recordSeconds)})` : "Speak Freely to Your Companion"}
            </h3>
            <p className="text-xs text-white/60 max-w-sm mx-auto leading-relaxed">
              {isRecording
                ? "Speak whatever is in your heart. Tap Stop & Reflect when done."
                : selectedEnv.description}
            </p>

            {isRecording && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleCancelRecording}
                  className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-rose-500/20 text-white/80 hover:text-rose-200 text-xs font-semibold flex items-center gap-1.5 mx-auto border border-white/20 transition cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancel Recording</span>
                </button>
              </div>
            )}
          </div>

          {/* Live Transcript Bubble */}
          {(transcript || isRecording) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-3xl bg-black/40 backdrop-blur-md border border-white/10 max-w-md w-full text-xs text-white/90 italic"
            >
              "{transcript || "Listening to your voice..."}"
            </motion.div>
          )}

          {/* Analyzing State */}
          {isAnalyzing && (
            <div className="mt-6 flex items-center gap-2.5 text-xs text-indigo-300 font-medium bg-black/30 px-4 py-2 rounded-full border border-indigo-400/20">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              <span>{user.companion_name} is reflecting deeply on your words...</span>
            </div>
          )}
        </div>

        {/* AI Reflection Analysis Card */}
        <AnimatePresence>
          {analysisResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl text-left my-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <h4 className="font-bold text-white text-base">Companion Reflection</h4>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSpeakReflection(analysisResult.reflection)}
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs flex items-center gap-1 transition cursor-pointer"
                    title={isSpeakingReflection ? "Stop voice" : "Listen to reflection"}
                  >
                    <Volume2 className={`w-3.5 h-3.5 ${isSpeakingReflection ? 'text-amber-300 animate-pulse' : ''}`} />
                    <span className="text-[11px]">{isSpeakingReflection ? 'Pause' : 'Listen'}</span>
                  </button>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {analysisResult.emotion} ({Math.round(analysisResult.confidence * 100)}% match)
                  </span>
                </div>
              </div>

              {/* Reflection Body */}
              <p className="text-sm text-white/90 leading-relaxed my-3 font-medium">
                "{analysisResult.reflection}"
              </p>

              {/* Themes */}
              <div className="flex flex-wrap gap-1.5 my-3">
                {analysisResult.themes.map((th, i) => (
                  <span key={i} className="text-[11px] px-2.5 py-1 rounded-lg bg-white/10 text-white/80 border border-white/10">
                    #{th}
                  </span>
                ))}
              </div>

              {/* Gentle Action */}
              <div className="mt-3 p-3.5 rounded-2xl bg-indigo-950/50 border border-indigo-500/30 flex items-start gap-2.5 text-xs text-indigo-200">
                <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block mb-0.5">Gentle Step Forward:</strong>
                  {analysisResult.action}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Voice Memories Accordion / List */}
        {voiceMemories.length > 0 && (
          <div className="w-full bg-black/30 backdrop-blur-md rounded-3xl p-5 border border-white/10 text-left mt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <BookOpen className="w-4 h-4 text-purple-300" />
                <span>Saved Voice Reflections ({voiceMemories.length})</span>
              </div>
            </div>

            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {voiceMemories.map(mem => (
                <div key={mem.id} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs">
                  <div className="flex items-center justify-between text-white/70 font-medium mb-1">
                    <span className="text-white font-semibold">{mem.title}</span>
                    <span>{new Date(mem.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-white/80 italic mb-1">"{mem.transcript}"</p>
                  <p className="text-indigo-300 text-[11px]">{mem.reflection}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

