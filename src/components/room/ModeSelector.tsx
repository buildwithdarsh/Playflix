'use client';

import { useState } from 'react';
import type { RoomMode } from '@/lib/types/room';

interface ModeSelectorProps {
  movieTitle: string;
  hostName: string;
  ratePerMinPaise: number;
  posterUrl: string | null;
  onSelect: (mode: RoomMode) => void;
}

export default function ModeSelector({ movieTitle, hostName, ratePerMinPaise, posterUrl, onSelect }: ModeSelectorProps) {
  const rate = ratePerMinPaise / 100;
  const [joining, setJoining] = useState(false);

  const handleContinue = () => {
    setJoining(true);
    onSelect('solo');
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-end p-6 pb-12">
      {/* Poster background */}
      {posterUrl && (
        <img
          src={posterUrl}
          alt={movieTitle}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {/* Dark overlay — lighter at top so poster is visible */}
      <div className="absolute inset-0 bg-gradient-to-t from-black from-40% via-black/70 via-65% to-black/30" />

      <div className="relative z-10 w-full max-w-sm space-y-5 text-center">
        {/* Movie title + host */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-dm-serif), serif' }}>
            {movieTitle}
          </h1>
          <p className="text-[13px] text-white/50 mt-1">hosted by {hostName}</p>
        </div>

        {/* Mode cards */}
        <div className="flex gap-3 animate-fade-in" style={{ animationDelay: '0.15s' }}>
          {/* Sync Mode — Coming Soon */}
          <div className="flex-1 p-4 rounded-2xl border-2 border-white/10 bg-white/[0.03] backdrop-blur-sm text-left opacity-50 relative">
            <div className="w-8 h-8 rounded-full bg-[var(--accent-sync)]/10 flex items-center justify-center mb-3">
              <span className="w-3 h-3 rounded-full bg-[var(--accent-sync)]/40" />
            </div>
            <p className="text-[14px] font-bold text-white/40">Sync Mode</p>
            <p className="text-[11px] text-white/30 mt-1 leading-relaxed">
              Watch with the room. Host controls play/pause.
            </p>
            <span className="absolute top-3 right-3 text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--accent-gold)]/20 text-[var(--accent-gold)] font-bold">
              Coming Soon
            </span>
          </div>

          {/* Solo Mode — Active */}
          <button
            onClick={handleContinue}
            disabled={joining}
            className="flex-1 p-4 rounded-2xl border-2 border-[var(--accent-crimson)]/40 bg-[var(--accent-crimson)]/10 backdrop-blur-sm text-left active:scale-[0.97] transition-transform"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--accent-crimson)]/20 flex items-center justify-center mb-3">
              <span className="w-3 h-3 rounded-full bg-[var(--accent-crimson)]" />
            </div>
            <p className="text-[14px] font-bold text-[var(--accent-crimson)]">Solo Mode</p>
            <p className="text-[11px] text-white/50 mt-1 leading-relaxed">
              Watch at your own pace. Your own timeline.
            </p>
          </button>
        </div>

        {/* Continue button */}
        <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <button
            onClick={handleContinue}
            disabled={joining}
            className="w-full py-3.5 rounded-xl bg-[var(--accent-crimson)] text-white font-bold text-[14px] active:scale-[0.97] transition-transform disabled:opacity-70 flex items-center justify-center gap-2 glow-crimson"
          >
            {joining ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Setting up your experience...
              </>
            ) : ratePerMinPaise > 0 ? (
              `Continue — ₹${rate.toFixed(2)}/min`
            ) : (
              'Continue — Free'
            )}
          </button>
          <p className="text-[10px] text-white/25 mt-2">Meter starts when you continue</p>
        </div>
      </div>
    </div>
  );
}
