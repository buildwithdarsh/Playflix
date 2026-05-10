'use client';

import type { RoomMode } from '@/lib/types/room';

interface RoomHeaderProps {
  roomName: string;
  posterUrl: string | null;
  viewerCount: number;
  mode: RoomMode;
  isHost: boolean;
  onLeave: () => void;
}

export default function RoomHeader({ roomName, posterUrl, viewerCount, mode, isHost, onLeave }: RoomHeaderProps) {
  const isSyncMode = mode === 'sync';

  return (
    <div className="relative z-20 flex items-center gap-3 px-4 py-3 bg-gradient-to-b from-black/80 to-transparent">
      <button onClick={onLeave} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {posterUrl && (
        <img src={posterUrl} alt={`${roomName} poster`} width={32} height={32} className="w-8 h-8 rounded-md object-cover shrink-0" loading="lazy" />
      )}

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-white truncate">{roomName}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-live" />
            <span className="text-[10px] text-white/50">{viewerCount} watching</span>
          </div>
          {isHost && (
            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--accent-gold)]/20 text-[var(--accent-gold)] font-bold">
              HOST
            </span>
          )}
        </div>
      </div>

      <div
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
          isSyncMode ? 'mode-badge-sync' : 'mode-badge-solo'
        }`}
      >
        <span className={`w-2 h-2 rounded-full ${isSyncMode ? 'bg-[var(--accent-sync)]' : 'bg-[var(--accent-solo)]'}`} />
        {isSyncMode ? 'Sync' : 'Solo'}
      </div>
    </div>
  );
}
