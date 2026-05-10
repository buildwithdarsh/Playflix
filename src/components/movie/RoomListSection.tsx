'use client';

import Link from 'next/link';
import { useRoomsForMovie } from '@/hooks/useRooms';
import type { Room } from '@/lib/types/room';

interface RoomListSectionProps {
  tmdbId: number;
}

function RoomMiniCard({ room }: { room: Room }) {
  const rate = room.ratePerMinPaise / 100;
  const isFree = room.ratePerMinPaise === 0;

  return (
    <Link href={`/room/${room.id}`} className="block">
      <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] hover:border-[var(--accent-sync)]/20 transition-colors">
        {/* Live dot + host */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-2 h-2 rounded-full bg-[var(--accent-sync)] animate-pulse-live shrink-0" />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-white truncate">{room.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-[var(--text-muted)]">by {room.hostName}</span>
              <span className="text-[10px] text-[var(--accent-sync)]">🔴 {room.syncCount}</span>
              <span className="text-[10px] text-[var(--accent-solo)]">🟣 {room.soloCount}</span>
            </div>
          </div>
        </div>

        {/* Rate + viewer count */}
        <div className="text-right shrink-0">
          <p className={`text-[12px] font-bold ${isFree ? 'text-green-400' : 'text-[var(--accent-teal)]'}`}>
            {isFree ? 'Free' : `₹${rate}/min`}
          </p>
          <p className="text-[9px] text-[var(--text-muted)]">{Math.max(room.viewerCount, 3000 + (room.tmdbId % 2000))} watching</p>
        </div>
      </div>
    </Link>
  );
}

export default function RoomListSection({ tmdbId }: RoomListSectionProps) {
  const { rooms, loading } = useRoomsForMovie(tmdbId);

  if (loading || rooms.length === 0) return null;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[var(--accent-sync)] animate-pulse-live" />
        <h3 className="text-[14px] font-bold text-white">Live Rooms</h3>
        <span className="text-[11px] text-[var(--text-muted)]">{rooms.length} active</span>
      </div>

      <div className="space-y-2">
        {rooms.slice(0, 5).map((room) => (
          <RoomMiniCard key={room.id} room={room} />
        ))}
      </div>
    </div>
  );
}
