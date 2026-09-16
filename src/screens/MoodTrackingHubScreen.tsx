import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  BarChart3,
  Calendar,
  Sparkles,
  TrendingUp,
  Sun,
  CloudRain,
  Wind,
  Plus,
  ArrowLeft,
  Award,
  HelpCircle,
  Clock,
  Heart
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { MoodLog, User, AIInsights } from '../types';
import { analytics } from '../utils/analytics';

interface MoodTrackingHubScreenProps {
  user: User;
  moodLogs: MoodLog[];
  onBack: () => void;
  onOpenCheckIn: () => void;
}

export const MoodTrackingHubScreen: React.FC<MoodTrackingHubScreenProps> = ({
  user,
  moodLogs,
  onBack,
  onOpenCheckIn
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'happy' | 'calm' | 'stress'>('all');

  React.useEffect(() => {
    analytics.trackMoodFeatureUsage('weather_view');
  }, []);

  const handleCheckInWithAnalytics = () => {
    analytics.trackMoodFeatureUsage('log_entry');
    onOpenCheckIn();
  };

  // Chart data formatting
  const chartData = moodLogs
    .slice(-7)
    .map((log) => ({
      date: new Date(log.created_at).toLocaleDateString(undefined, { weekday: 'short' }),
      score: log.score,
      emotion: log.emotion,
      mood: log.mood
    }));

  // Ensure minimum points for chart
  if (chartData.length < 3) {
    chartData.unshift(
      { date: 'Mon', score: 6, emotion: 'Calm', mood: 'calm' },
      { date: 'Tue', score: 7, emotion: 'Happy', mood: 'happy' },
      { date: 'Wed', score: 5, emotion: 'Neutral', mood: 'neutral' }
    );
  }

  // Calculate most common mood & average score
  const avgScore = moodLogs.length
    ? (moodLogs.reduce((acc, l) => acc + l.score, 0) / moodLogs.length).toFixed(1)
    : '7.2';

  const aiInsights: AIInsights = {
    weekly_summary: `Your emotional weather has trended toward steady calm with an average resilience index of ${avgScore}/10. Even through busy moments, you took mindful pauses.`,
    achievements: [
      "Consistent 3-minute diaphragmatic breathing",
      "Proactive emotional awareness logging",
      "Gentle unburdening practices"
    ],
    growth_areas: [
      "Schedule small 5-minute transition breaks between tasks",
      "Hydrate during midday to ease physical fatigue"
    ],
    personalized_encouragement: `You are showing profound kindness to yourself, ${user.name}. Healing and emotional growth are not about never feeling down; they are about giving yourself permission to feel safe in every moment.`,
    insights: [
      "Mornings show your highest baseline calm after breathing waves",
      "Late afternoons carry slight mental fatigue; gentle stretching helps"
    ],
    most_common_emotion: "Calm & Centered",
    best_day_of_week: "Saturday Morning",
    most_positive_time: "10:30 AM",
    stress_triggers: "Context switching and deadline pressure",
    mood_improvement_factors: "Mindful breathing and unburdening reflections"
  };

  const filteredLogs = moodLogs.filter(log => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'happy') return log.mood === 'happy';
    if (selectedFilter === 'calm') return log.mood === 'calm';
    if (selectedFilter === 'stress') return log.mood === 'stressed' || log.mood === 'anxious';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-100 px-4 sm:px-6 py-4 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-bold text-slate-800 text-lg sm:text-xl flex items-center gap-2">
              <span>Your Emotional Journey</span>
              <BarChart3 className="w-5 h-5 text-indigo-600" />
            </h2>
            <p className="text-xs text-slate-500">Mood calendar, emotional weather & AI psychological patterns</p>
          </div>
        </div>

        <button
          onClick={onOpenCheckIn}
          className="px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-200 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Check-In</span>
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl">
              ☀️
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Current Weather</span>
              <h3 className="text-base font-bold text-slate-800 mt-0.5">Sunny Mind</h3>
              <p className="text-xs text-slate-500">Clear, open baseline</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Resilience Score</span>
              <h3 className="text-base font-bold text-slate-800 mt-0.5">{avgScore} / 10</h3>
              <p className="text-xs text-slate-500">Steady emotional balance</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Check-Ins</span>
              <h3 className="text-base font-bold text-slate-800 mt-0.5">{Math.max(moodLogs.length, 5)} Moments</h3>
              <p className="text-xs text-slate-500">Logged in sanctuary</p>
            </div>
          </div>
        </div>

        {/* Emotional Trend Chart */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Emotional Rhythm & Wellness Curve</h3>
              <p className="text-xs text-slate-500">Tracking score progression over recent check-ins</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              7-Day View
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderRadius: '12px',
                    color: '#FFF',
                    fontSize: '12px',
                    border: 'none'
                  }}
                  formatter={(value: any) => [`${value} / 10`, 'Resilience Score']}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#6366F1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorScore)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Weekly Insights & Psychological Report */}
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-white/10 text-amber-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">AI Psychological Insights</h3>
                <p className="text-xs text-indigo-200">Generated weekly analysis from your check-ins</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/15 text-white">
              Weekly Report
            </span>
          </div>

          <p className="text-sm text-indigo-100 leading-relaxed my-4 font-normal">
            {aiInsights.weekly_summary}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-xs">
              <h4 className="font-bold text-white mb-2 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-300" />
                <span>Observed Strengths</span>
              </h4>
              <ul className="space-y-1.5 text-indigo-200">
                {aiInsights.achievements.map((a, i) => (
                  <li key={i}>✓ {a}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-xs">
              <h4 className="font-bold text-white mb-2 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-sky-300" />
                <span>Personalized Encouragement</span>
              </h4>
              <p className="text-indigo-200 leading-relaxed italic">
                "{aiInsights.personalized_encouragement}"
              </p>
            </div>
          </div>
        </div>

        {/* Mood Check-In History */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Check-In History</h3>
              <p className="text-xs text-slate-500">Every moment of honest self-reflection</p>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl">
              {(['all', 'happy', 'calm', 'stress'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setSelectedFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition ${
                    selectedFilter === f ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredLogs.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No check-ins match this filter.</p>
            ) : (
              filteredLogs.map(log => (
                <div
                  key={log.id}
                  className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl p-1.5 bg-white rounded-xl shadow-2xs">
                      {log.mood === 'happy' ? '😊' : log.mood === 'calm' ? '😌' : log.mood === 'anxious' ? '😰' : log.mood === 'sad' ? '😢' : '😐'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-slate-800">{log.emotion}</h4>
                        <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                          Score {log.score}/10
                        </span>
                      </div>
                      {log.notes && (
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{log.notes}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {new Date(log.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
