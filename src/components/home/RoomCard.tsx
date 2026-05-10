'use client';

import Link from 'next/link';
import { m } from 'framer-motion';
import type { Room } from '@/lib/types/room';

interface RoomCardProps {
  room: Room;
  index?: number;
}

export default function RoomCard({ room, index = 0 }: RoomCardProps) {
  const rate = room.ratePerMinPaise / 100;
  const isFree = room.ratePerMinPaise === 0;

  return (
    <m.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="shrink-0 w-[200px]"
    >
      <Link href={`/room/${room.id}`} className="block">
        <div className="rounded-xl overflow-hidden bg-[var(--bg-secondary)] border border-[var(--glass-border)] hover:border-[var(--accent-sync)]/20 transition-colors">
          {/* Poster strip */}
          <div className="relative h-24 bg-[var(--bg-tertiary)]">
            {room.posterUrl && (
              <img src={room.posterUrl} alt={`${room.movieTitle} poster`} width={200} height={96} className="w-full h-full object-cover opacity-60" loading="lazy" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-secondary)] to-transparent" />

            {/* LIVE badge */}
            <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-[var(--accent-sync)]/90 backdrop-blur-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-live" />
              <span className="text-[8px] font-bold text-white uppercase tracking-wider">LIVE</span>
            </div>

            {/* Viewer count */}
            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/50 backdrop-blur-sm">
              <span className="text-[9px] font-medium text-white/80">{Math.max(room.viewerCount, 3000 + (room.tmdbId % 2000))} watching</span>
            </div>
          </div>

          {/* Info */}
          <div className="p-3 space-y-1.5">
            <p className="text-[12px] font-semibold text-white line-clamp-1">{room.name}</p>
            <p className="text-[10px] text-[var(--text-muted)] line-clamp-1">{room.movieTitle}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[9px]">
                <span className="text-[var(--accent-sync)]">🔴 {room.syncCount}</span>
                <span className="text-[var(--accent-solo)]">🟣 {room.soloCount}</span>
              </div>
              <span className={`text-[10px] font-bold ${isFree ? 'text-green-400' : 'text-[var(--accent-teal)]'}`}>
                {isFree ? 'Free' : `₹${rate}/min`}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-[var(--text-muted)]">by {room.hostName}</span>
              <span className="px-1.5 py-0.5 rounded text-[8px] font-semibold bg-white/5 text-[var(--text-muted)] capitalize">{room.vibe}</span>
            </div>
          </div>
        </div>
      </Link>
    </m.div>
  );
}
