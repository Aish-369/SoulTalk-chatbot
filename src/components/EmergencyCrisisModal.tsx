import React from 'react';
import { motion } from 'motion/react';
import { X, HeartHandshake, Phone, ShieldAlert, Heart, ExternalLink } from 'lucide-react';
import { EMERGENCY_RESOURCES } from '../data/emergencyResources';

interface EmergencyCrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyCrisisModal: React.FC<EmergencyCrisisModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-rose-100 max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-rose-50 text-rose-600">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Crisis Support & Resources</h3>
              <p className="text-xs text-rose-600 font-medium">You are never alone. Confidential help is available.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Empathy banner */}
        <div className="my-4 p-4 rounded-2xl bg-rose-50/80 border border-rose-100 text-rose-950 text-xs leading-relaxed">
          <div className="flex items-center gap-2 font-semibold text-rose-800 mb-1 text-sm">
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            <span>SoulTalk Safety Notice</span>
          </div>
          If you are experiencing overwhelming distress or thoughts of self-harm, please reach out to trained professionals immediately. These helplines are 100% free, confidential, and available right now.
        </div>

        {/* Helplines List */}
        <div className="space-y-2.5">
          {EMERGENCY_RESOURCES.helplines.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-rose-50/40 hover:border-rose-200 transition"
            >
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">{item.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                <span className="inline-block text-[11px] font-medium text-emerald-600 mt-1">
                  ● {item.available}
                </span>
              </div>
              <a
                href={`tel:${item.contact.replace(/[^0-9+]/g, '')}`}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-sm transition whitespace-nowrap"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call {item.contact}</span>
              </a>
            </div>
          ))}
        </div>

        {/* Grounding reminder */}
        <div className="mt-5 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-indigo-900 text-xs">
          <p className="font-semibold mb-1">Quick Grounding Reminder (5-4-3-2-1):</p>
          <ul className="list-disc list-inside space-y-0.5 text-slate-600">
            <li>Notice 5 things you can see around you right now</li>
            <li>Feel 4 things you can physically touch</li>
            <li>Listen for 3 distinct sounds in your environment</li>
            <li>Identify 2 things you can smell or appreciate</li>
            <li>Take 1 slow, deep diaphragmatic breath with hand on chest</li>
          </ul>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-medium text-sm transition"
        >
          Close Safety Window
        </button>
      </motion.div>
    </div>
  );
};
