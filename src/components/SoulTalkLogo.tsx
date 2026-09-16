import React from 'react';
import officialLogoImg from '../assets/images/soultalk_official_logo.png';
import officialEmblemImg from '../assets/images/soultalk_emblem.png';

interface SoulTalkLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  showTagline?: boolean;
  className?: string;
  variant?: 'full' | 'icon-only' | 'horizontal' | 'official-card';
  useImage?: boolean;
}

export const SoulTalkLogo: React.FC<SoulTalkLogoProps> = ({
  size = 'md',
  showText = true,
  showTagline = true,
  className = '',
  variant = 'horizontal',
  useImage = false
}) => {
  // Dimensions based on size
  const iconDimensions = {
    xs: { w: 24, h: 24 },
    sm: { w: 32, h: 32 },
    md: { w: 42, h: 42 },
    lg: { w: 64, h: 64 },
    xl: { w: 96, h: 96 },
    '2xl': { w: 140, h: 140 }
  }[size];

  const titleSizes = {
    xs: 'text-sm',
    sm: 'text-base font-bold',
    md: 'text-xl font-bold tracking-tight',
    lg: 'text-3xl font-extrabold tracking-tight',
    xl: 'text-4xl font-extrabold tracking-tight',
    '2xl': 'text-5xl font-extrabold tracking-tight'
  }[size];

  const taglineSizes = {
    xs: 'text-[9px]',
    sm: 'text-[10px]',
    md: 'text-[11px]',
    lg: 'text-xs',
    xl: 'text-sm',
    '2xl': 'text-base'
  }[size];

  // Official Card Variant: Displays the transparent official logo cleanly without black background
  if (variant === 'official-card') {
    const cardMaxW = {
      xs: 'max-w-[110px]',
      sm: 'max-w-[150px]',
      md: 'max-w-[200px]',
      lg: 'max-w-[260px]',
      xl: 'max-w-[320px]',
      '2xl': 'max-w-[390px]'
    }[size];

    return (
      <div className={`relative group flex items-center justify-center ${cardMaxW} ${className}`}>
        {/* Soft atmospheric ambient glow behind the transparent emblem */}
        <div className="absolute -inset-3 bg-gradient-to-r from-pink-400/20 via-purple-500/20 to-indigo-400/20 blur-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-full" />
        <img
          src={officialLogoImg}
          alt="SoulTalk - AI That Listens to Your Soul"
          referrerPolicy="no-referrer"
          className="relative z-10 w-full h-auto object-contain drop-shadow-sm transform transition-transform duration-500 group-hover:scale-105"
        />
      </div>
    );
  }

  // Emblem renderer: either official transparent image avatar or vector SVG
  const emblem = useImage ? (
    <div
      className="relative shrink-0 flex items-center justify-center transition-transform hover:scale-105"
      style={{ width: iconDimensions.w, height: iconDimensions.h }}
    >
      <img
        src={officialEmblemImg}
        alt="SoulTalk Logo"
        referrerPolicy="no-referrer"
        className="w-full h-full object-contain drop-shadow-xs"
      />
    </div>
  ) : (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: iconDimensions.w, height: iconDimensions.h }}
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm transition-transform duration-300 hover:scale-105"
      >
        <defs>
          {/* Main Gradient matching the SoulTalk emblem */}
          <linearGradient id="stGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F472B6" />
            <stop offset="35%" stopColor="#E879F9" />
            <stop offset="70%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#818CF8" />
          </linearGradient>

          {/* Inner Heart Glow Gradient */}
          <linearGradient id="stHeartGrad" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#FDA4AF" />
            <stop offset="50%" stopColor="#F472B6" />
            <stop offset="100%" stopColor="#C084FC" />
          </linearGradient>

          {/* Stroke Shading Gradient */}
          <linearGradient id="stStrokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F9A8D4" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>

          {/* Soft Drop Shadow Filter */}
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#C084FC" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Ambient Soft Backdrop Glow */}
        <circle cx="60" cy="58" r="48" fill="url(#stGrad1)" opacity="0.1" filter="url(#softGlow)" />

        {/* LEFT HEMISPHERE: Organic Brain Folds */}
        <g filter="url(#softGlow)">
          {/* Outer brain contour */}
          <path
            d="M 52 26 C 40 26, 30 32, 26 40 C 22 47, 22 55, 26 62 C 22 70, 24 79, 30 85 C 36 90, 44 92, 52 90"
            stroke="url(#stStrokeGrad)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Internal Brain Gyri & Sulci curves */}
          <path
            d="M 32 44 C 36 41, 44 42, 48 46 C 43 51, 35 52, 33 58 C 31 63, 38 67, 46 66 C 41 71, 35 74, 38 80 C 40 84, 46 84, 50 82"
            stroke="url(#stStrokeGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          <path
            d="M 45 34 C 49 37, 52 42, 50 48"
            stroke="url(#stStrokeGrad)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
        </g>

        {/* RIGHT HEMISPHERE & SPEECH BUBBLE TAIL: AI circuits & speech bubble contour */}
        <g filter="url(#softGlow)">
          {/* Speech bubble & heart right border with lower tail */}
          <path
            d="M 58 26 C 72 26, 88 32, 92 46 C 96 60, 88 74, 78 84 L 80 95 L 68 89 C 63 90, 58 90, 54 88"
            stroke="url(#stStrokeGrad)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Circuit connection paths */}
          <path
            d="M 72 38 L 82 46 L 82 58"
            stroke="url(#stStrokeGrad)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="72" cy="38" r="3.5" fill="url(#stGrad1)" />
          <circle cx="82" cy="58" r="3.5" fill="url(#stGrad1)" />

          <path
            d="M 76 66 L 84 72"
            stroke="url(#stStrokeGrad)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="76" cy="66" r="3" fill="url(#stGrad1)" />
          <circle cx="84" cy="72" r="3" fill="url(#stGrad1)" />
        </g>

        {/* CENTER HEART: Luminous heart connecting empathy and cognition */}
        <path
          d="M 56 46 C 53 38, 43 38, 41 46 C 39 54, 52 65, 56 70 C 60 65, 73 54, 71 46 C 69 38, 59 38, 56 46 Z"
          fill="url(#stHeartGrad)"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          filter="url(#softGlow)"
        />

        {/* Mini sparkle highlights */}
        <circle cx="50" cy="44" r="1.5" fill="#FFFFFF" />
        <circle cx="62" cy="44" r="1.5" fill="#FFFFFF" />
      </svg>
    </div>
  );

  if (variant === 'icon-only' || !showText) {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {emblem}
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        {emblem}
        <div className="mt-2.5">
          <div className={`${titleSizes} font-bold text-slate-800 tracking-tight flex items-center justify-center gap-1`}>
            <span>Soul</span>
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
              Talk
            </span>
          </div>
          {showTagline && (
            <p className={`${taglineSizes} text-slate-500 font-medium tracking-wide mt-0.5`}>
              AI That Listens to Your Soul
            </p>
          )}
        </div>
      </div>
    );
  }

  // Default horizontal layout
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {emblem}
      <div className="flex flex-col text-left">
        <div className={`leading-none ${titleSizes} text-slate-800 tracking-tight flex items-center gap-0.5`}>
          <span>Soul</span>
          <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
            Talk
          </span>
        </div>
        {showTagline && (
          <p className={`leading-tight ${taglineSizes} text-slate-400 font-medium tracking-tight mt-0.5`}>
            AI That Listens to Your Soul
          </p>
        )}
      </div>
    </div>
  );
};
