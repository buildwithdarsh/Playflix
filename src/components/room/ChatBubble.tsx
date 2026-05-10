'use client';

import type { RoomMode } from '@/lib/types/room';

interface ChatBubbleProps {
  userName: string;
  text: string;
  mode: RoomMode;
  isHost: boolean;
  isOwn: boolean;
  hostId: string;
}

export default function ChatBubble({ userName, text, mode, isHost, isOwn }: ChatBubbleProps) {
  return (
    <div className={`flex gap-2 ${isOwn ? 'justify-end' : ''}`}>
      <div className={`max-w-[80%] ${isOwn ? 'order-2' : ''}`}>
        <div className="flex items-center gap-1.5 mb-0.5">
          {/* Mode badge */}
          <span className={`w-2 h-2 rounded-full ${mode === 'sync' ? 'bg-[var(--accent-sync)]' : 'bg-[var(--accent-solo)]'}`} />
          <span className="text-[11px] text-[var(--text-muted)] font-medium">{isOwn ? 'You' : userName}</span>
          {isHost && (
            <span className="text-[8px] uppercase tracking-wider px-1 py-0.5 rounded bg-[var(--accent-gold)]/20 text-[var(--accent-gold)] font-bold">
              HOST
            </span>
          )}
        </div>
        <div
          className={`px-3 py-2 rounded-2xl text-[13px] leading-relaxed ${
            isOwn
              ? 'bg-[var(--accent-sync)]/15 text-white rounded-tr-sm'
              : 'bg-white/8 text-white/90 rounded-tl-sm'
          }`}
        >
          {text}
        </div>
      </div>
    </div>
  );
}
