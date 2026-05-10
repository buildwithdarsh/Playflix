'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/cn';

export default function SplashScreen() {
  const [phase, setPhase] = useState<'visible' | 'fading' | 'gone'>('visible');

  useEffect(() => {
    const fadeTimer = setTimeout(() => setPhase('fading'), 2600);
    const goneTimer = setTimeout(() => setPhase('gone'), 3200);
    return () => { clearTimeout(fadeTimer); clearTimeout(goneTimer); };
  }, []);

  if (phase === 'gone') return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0A0A0A] transition-opacity duration-600',
        phase === 'fading' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      )}
    >
      {/* SVG Cinema Illustration */}
      <svg width="220" height="200" viewBox="0 0 220 200" fill="none" className="mb-6">
        {/* Film projector body */}
        <rect x="60" y="80" width="100" height="65" rx="10" fill="#1A1A1A" stroke="#333" strokeWidth="1.5">
          <animate attributeName="opacity" values="0;1" dur="0.6s" fill="freeze" />
        </rect>

        {/* Projector lens */}
        <circle cx="110" cy="112" r="20" fill="#1A1A1A" stroke="#444" strokeWidth="1.5">
          <animate attributeName="r" values="0;20" dur="0.5s" fill="freeze" begin="0.3s" />
        </circle>
        <circle cx="110" cy="112" r="12" fill="#1A1A1A" stroke="#555" strokeWidth="1">
          <animate attributeName="r" values="0;12" dur="0.5s" fill="freeze" begin="0.4s" />
        </circle>
        <circle cx="110" cy="112" r="5" fill="#EF4444" opacity="0.8">
          <animate attributeName="r" values="0;5" dur="0.3s" fill="freeze" begin="0.6s" />
          <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" begin="0.8s" />
        </circle>

        {/* Film reels on top */}
        <circle cx="82" cy="72" r="18" fill="#1A1A1A" stroke="#444" strokeWidth="1.5">
          <animate attributeName="cy" values="90;72" dur="0.5s" fill="freeze" begin="0.2s" />
          <animateTransform attributeName="transform" type="rotate" from="0 82 72" to="360 82 72" dur="3s" repeatCount="indefinite" begin="0.5s" />
        </circle>
        <circle cx="82" cy="72" r="5" fill="#0A0A0A" stroke="#555" strokeWidth="1" />
        {/* Reel spokes */}
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <line
            key={angle}
            x1="82" y1="72" x2={82 + 14 * Math.cos((angle * Math.PI) / 180)} y2={72 + 14 * Math.sin((angle * Math.PI) / 180)}
            stroke="#444" strokeWidth="1"
          >
            <animateTransform attributeName="transform" type="rotate" from={`0 82 72`} to={`360 82 72`} dur="3s" repeatCount="indefinite" begin="0.5s" />
          </line>
        ))}

        <circle cx="138" cy="72" r="18" fill="#1A1A1A" stroke="#444" strokeWidth="1.5">
          <animate attributeName="cy" values="90;72" dur="0.5s" fill="freeze" begin="0.3s" />
          <animateTransform attributeName="transform" type="rotate" from="0 138 72" to="-360 138 72" dur="4s" repeatCount="indefinite" begin="0.5s" />
        </circle>
        <circle cx="138" cy="72" r="5" fill="#0A0A0A" stroke="#555" strokeWidth="1" />
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <line
            key={`r${angle}`}
            x1="138" y1="72" x2={138 + 14 * Math.cos((angle * Math.PI) / 180)} y2={72 + 14 * Math.sin((angle * Math.PI) / 180)}
            stroke="#444" strokeWidth="1"
          >
            <animateTransform attributeName="transform" type="rotate" from={`0 138 72`} to={`-360 138 72`} dur="4s" repeatCount="indefinite" begin="0.5s" />
          </line>
        ))}

        {/* Film strip connecting reels */}
        <path d="M82 54 C82 40 138 40 138 54" stroke="#555" strokeWidth="1.5" fill="none" strokeDasharray="4 3">
          <animate attributeName="stroke-dashoffset" values="0;-28" dur="1s" repeatCount="indefinite" begin="0.5s" />
        </path>

        {/* Light beam from projector */}
        <path d="M130 105 L200 70 L200 150 L130 119Z" fill="url(#beam)" opacity="0">
          <animate attributeName="opacity" values="0;0.6" dur="0.5s" fill="freeze" begin="0.8s" />
          <animate attributeName="opacity" values="0.5;0.7;0.5" dur="2s" repeatCount="indefinite" begin="1.3s" />
        </path>

        {/* Light beam gradient */}
        <defs>
          <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#F5A623" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Projector stand/legs */}
        <line x1="85" y1="145" x2="75" y2="170" stroke="#444" strokeWidth="2" strokeLinecap="round">
          <animate attributeName="opacity" values="0;1" dur="0.3s" fill="freeze" begin="0.5s" />
        </line>
        <line x1="135" y1="145" x2="145" y2="170" stroke="#444" strokeWidth="2" strokeLinecap="round">
          <animate attributeName="opacity" values="0;1" dur="0.3s" fill="freeze" begin="0.5s" />
        </line>
        <line x1="110" y1="145" x2="110" y2="172" stroke="#444" strokeWidth="2" strokeLinecap="round">
          <animate attributeName="opacity" values="0;1" dur="0.3s" fill="freeze" begin="0.5s" />
        </line>

        {/* Dust particles in beam */}
        {[
          { cx: 160, cy: 85, r: 1.2, delay: 1 },
          { cx: 175, cy: 100, r: 0.8, delay: 1.5 },
          { cx: 185, cy: 130, r: 1, delay: 2 },
          { cx: 150, cy: 115, r: 0.7, delay: 1.2 },
          { cx: 190, cy: 90, r: 1.1, delay: 1.8 },
          { cx: 170, cy: 120, r: 0.6, delay: 0.8 },
        ].map((p, i) => (
          <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill="white" opacity="0">
            <animate attributeName="opacity" values="0;0.6;0" dur="2.5s" repeatCount="indefinite" begin={`${p.delay}s`} />
            <animate attributeName="cy" values={`${p.cy};${p.cy - 8};${p.cy}`} dur="3s" repeatCount="indefinite" begin={`${p.delay}s`} />
          </circle>
        ))}
      </svg>

      {/* Logo */}
      <div className="flex items-center gap-3 mb-2" style={{ animation: 'fade-in 0.6s ease-out 0.4s both' }}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E8004D] to-[#FF4D6D] flex items-center justify-center shadow-[0_4px_16px_rgba(232,0,77,0.5)]">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
            <path d="M9.5 7.2v9.6c0 .7.8 1.1 1.3.7l6.5-4.8c.4-.3.4-1 0-1.3L10.8 6.5c-.5-.4-1.3 0-1.3.7z" fill="white"/>
          </svg>
        </div>
        <span className="text-2xl font-bold text-white tracking-tight">
          Play<span className="text-[#E8004D]">Flix</span>
        </span>
      </div>

      {/* Tagline */}
      <p className="text-[12px] text-[var(--text-muted)] tracking-wide" style={{ animation: 'fade-in 0.6s ease-out 0.8s both' }}>
        Stream together. Pay only for what you watch.
      </p>

      {/* Loading bar */}
      <div className="w-32 h-[2px] bg-white/[0.06] rounded-full mt-6 overflow-hidden" style={{ animation: 'fade-in 0.4s ease-out 1s both' }}>
        <div className="h-full bg-[#E8004D] rounded-full" style={{ animation: 'splash-progress 2.2s ease-in-out 0.8s both' }} />
      </div>
    </div>
  );
}
