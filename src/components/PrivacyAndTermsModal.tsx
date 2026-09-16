import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, FileText, Lock, Trash2, Eye, Server, Cpu, HeartHandshake, CheckCircle2, X } from 'lucide-react';

interface PrivacyAndTermsModalProps {
  isOpen: boolean;
  initialTab?: 'privacy' | 'terms' | 'datasafety';
  onClose: () => void;
}

export const PrivacyAndTermsModal: React.FC<PrivacyAndTermsModalProps> = ({
  isOpen,
  initialTab = 'privacy',
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'datasafety'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-base">Sanctuary Trust & Governance</h2>
              <p className="text-[11px] text-slate-500">Privacy Policy, Terms of Service & Data Safety</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 bg-white px-6 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'privacy'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'terms'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Terms of Service</span>
          </button>

          <button
            onClick={() => setActiveTab('datasafety')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'datasafety'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Play Store Data Safety</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-xs leading-relaxed">
          
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>1. Our Core Privacy Pledge</span>
                </h3>
                <p className="text-slate-600">
                  SoulTalk is built as an emotional sanctuary. Your reflections, journal entries, and conversations are deeply personal. We commit that <strong>we do not sell, rent, or monetize your emotional reflections or personal identifiable information</strong> to advertisers, data brokers, or third parties.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">2. Information We Collect</h3>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li><strong>Account Data:</strong> Name or nickname, email address (if creating a synced account), and companion configuration preferences.</li>
                  <li><strong>Sanctuary Interactions:</strong> Chat messages and mood check-in scores used solely to provide empathetic real-time companion responses.</li>
                  <li><strong>Device & Telemetry:</strong> Minimal client diagnostics (e.g., app performance) without linking to conversation content.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">3. How AI Models Process Your Data</h3>
                <p className="text-slate-600">
                  To provide conversational holding and psychoeducational support, message payloads are proxied securely through our backend to trusted inference engines. Your inputs are processed for stateless real-time generation and are <strong>not used by third-party model providers to train public models</strong> without consent.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">4. Data Retention & User Erasure Rights (GDPR & CCPA)</h3>
                <p className="text-slate-600">
                  You maintain 100% data sovereignty. At any time, you can:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <strong className="text-slate-800 block mb-0.5">Export Your Sanctuary</strong>
                    <span>Download your complete profile and chat history in JSON format at one click.</span>
                  </div>
                  <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100 text-rose-900">
                    <strong className="text-rose-800 block mb-0.5">Permanent Deletion</strong>
                    <span>Erase all chat history, mood logs, and account records instantly from device storage.</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">5. Contact Data Privacy Officer</h3>
                <p className="text-slate-600">
                  For data requests, GDPR export requests, or privacy inquiries, contact our team at <span className="font-semibold text-indigo-600">privacy@soultalk.app</span>.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/60 text-amber-900 text-xs">
                <strong className="block font-bold text-amber-950 mb-1 flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 text-amber-700" />
                  <span>Important Non-Clinical Notice</span>
                </strong>
                SoulTalk is an AI-powered emotional wellness companion, NOT a licensed medical clinic, doctor, therapist, or psychiatric emergency service. It cannot diagnose, treat, or cure psychiatric disorders or prescribe medication.
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">1. Acceptance of Terms</h3>
                <p className="text-slate-600">
                  By accessing or utilizing SoulTalk, you agree to these Terms. If you do not agree to all terms, please refrain from using the application.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">2. Crisis & Emergency Disclaimer</h3>
                <p className="text-slate-600">
                  If you are experiencing suicidal thoughts, self-harm impulses, severe mental distress, or a medical emergency, you must immediately contact professional emergency helplines such as <strong>Tele MANAS (14416 / 1800-891-4416)</strong>, <strong>Vandrevala Foundation (9999 666 555)</strong>, <strong>112</strong>, or your local emergency services. SoulTalk is not an emergency response system.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">3. Acceptable Use</h3>
                <p className="text-slate-600">
                  You agree not to use SoulTalk for illegal activities, reverse-engineering, attempting jailbreaks or prompt extractions, or generating content that promotes hate speech or violence.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">4. Limitation of Liability</h3>
                <p className="text-slate-600">
                  SoulTalk is provided on an "as-is" basis. While we strive to provide warm, validating emotional companionship, algorithmic outputs should not replace human judgment, clinical guidance, or professional therapy.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'datasafety' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">Google Play Store Data Safety Declaration</h3>
                <p className="text-slate-600">
                  Transparent breakdown of data collected, shared, and encrypted in accordance with Google Play Store Data Safety policies:
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-slate-800 text-xs block">Data Encryption in Transit</strong>
                    <span className="text-slate-500 text-[11px]">All communication between client and server occurs over HTTPS / TLS 1.3 encryption.</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-slate-800 text-xs block">Zero Data Sharing for Advertising</strong>
                    <span className="text-slate-500 text-[11px]">No user data or emotional dialogue is shared with commercial third parties or ad networks.</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-slate-800 text-xs block">Data Deletion Mechanism</strong>
                    <span className="text-slate-500 text-[11px]">Users can permanently request and execute complete account and chat history erasure from Settings.</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-slate-800 text-xs block">Minimal Analytics & Error Diagnostics</strong>
                    <span className="text-slate-500 text-[11px]">Aggregated uptime diagnostics with no personal dialogue logging.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">SoulTalk Sanctuary v2.4 (Phase 6 Compliant)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition cursor-pointer"
          >
            Acknowledge & Close
          </button>
        </div>

      </div>
    </div>
  );
};
