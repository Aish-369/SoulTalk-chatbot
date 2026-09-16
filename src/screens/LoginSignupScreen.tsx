import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { WolfieCharacter } from '../components/WolfieCharacter';
import { SoulTalkLogo } from '../components/SoulTalkLogo';
import { User } from '../types';
import { PrivacyAndTermsModal } from '../components/PrivacyAndTermsModal';
import { analytics } from '../utils/analytics';
import { authStorage } from '../utils/api';

interface LoginSignupScreenProps {
  companionName: string;
  companionType: string;
  onAuthSuccess: (user: User) => void;
}

export const LoginSignupScreen: React.FC<LoginSignupScreenProps> = ({
  companionName = 'Wolfie',
  companionType = 'wolfie_guardian',
  onAuthSuccess
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<'privacy' | 'terms' | 'datasafety'>('privacy');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegister && !name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const payload = isRegister
        ? { email, password, name: name.trim(), companion_name: companionName, companion_type: companionType }
        : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Authentication failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      if (data.access_token) {
        authStorage.setToken(data.access_token);
      }

      analytics.trackAccountCreation('email');
      onAuthSuccess(data.user);
    } catch (err: any) {
      setError('Connection to sanctuary server failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companion_name: companionName,
          companion_type: companionType
        })
      });

      const data = await res.json();
      if (data.access_token) {
        authStorage.setToken(data.access_token);
      }

      analytics.trackAccountCreation('guest');
      onAuthSuccess(data.user);
    } catch (err) {
      // Fallback guest user if server is completely offline
      const guestUser: User = {
        id: 'guest_' + Math.floor(Math.random() * 10000),
        name: 'Kind Soul',
        email: 'guest@soultalk.app',
        language: 'en',
        companion_type: companionType,
        companion_name: companionName,
        personality_type: 'Gentle Friend',
        created_at: Date.now()
      };
      analytics.trackAccountCreation('guest');
      onAuthSuccess(guestUser);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-slate-50 via-purple-50/20 to-slate-100">
      <div className="mb-4">
        <SoulTalkLogo size="md" useImage={true} showText={true} showTagline={true} />
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 relative overflow-hidden">
        {/* Companion header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-2">
            <WolfieCharacter
              emotion={loading ? "THINKING" : error ? "SUPPORTIVE" : "HAPPY"}
              size="MEDIUM"
              companionType={companionType}
            />
          </div>

          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            {isRegister ? 'Create Your Sanctuary' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {companionName} is waiting with a warm, open space for you.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex p-1 rounded-2xl bg-slate-100 mb-6">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError('');
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
              !isRegister ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError('');
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
              isRegister ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Your Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="How should your companion call you?"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isRegister ? 'Join SoulTalk' : 'Sign In to Sanctuary'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-slate-400">or explore freely</span>
          </div>
        </div>

        {/* Guest access */}
        <button
          type="button"
          onClick={handleGuestLogin}
          className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Continue as Guest (No Registration)</span>
        </button>

        {/* Legal & Privacy Consent */}
        <div className="mt-4 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400 space-y-1.5">
          <p>
            By continuing, you agree to our{' '}
            <button
              type="button"
              onClick={() => {
                setLegalModalTab('terms');
                setShowLegalModal(true);
              }}
              className="text-indigo-600 hover:underline font-semibold cursor-pointer"
            >
              Terms of Service
            </button>{' '}
            &{' '}
            <button
              type="button"
              onClick={() => {
                setLegalModalTab('privacy');
                setShowLegalModal(true);
              }}
              className="text-indigo-600 hover:underline font-semibold cursor-pointer"
            >
              Privacy Policy
            </button>
          </p>
          <div className="flex items-center justify-center gap-1.5 text-emerald-600">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Non-clinical companion • Zero data sold to advertisers</span>
          </div>
        </div>
      </div>

      <PrivacyAndTermsModal
        isOpen={showLegalModal}
        initialTab={legalModalTab}
        onClose={() => setShowLegalModal(false)}
      />
    </div>
  );
};
