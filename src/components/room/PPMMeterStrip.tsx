'use client';

import { useRoomStore } from '@/store/room';
import { useMeterStore } from '@/store/meter';

export default function PPMMeterStrip() {
  const mode = useRoomStore((s) => s.mode);
  const room = useRoomStore((s) => s.room);
  const meterRate = useMeterStore((s) => s.ratePerMinPaise);
  const totalBilledPaise = useMeterStore((s) => s.totalBilledPaise);
  const minutesBilled = useMeterStore((s) => s.minutesBilled);
  const balancePaise = useMeterStore((s) => s.balancePaise);
  const isActive = useMeterStore((s) => s.isActive);
  const sessionId = useMeterStore((s) => s.sessionId);
  const status = useMeterStore((s) => s.status);

  const isSyncMode = mode === 'sync';
  // Use meter rate if session started, otherwise fall back to room rate
  const ratePerMinPaise = meterRate || room?.ratePerMinPaise || 0;
  const rate = (ratePerMinPaise / 100) || 0;
  const spent = (totalBilledPaise / 100) || 0;
  const balance = (balancePaise / 100) || 0;
  const mins = Math.round(minutesBilled) || 0;
  const lowBalance = balance > 0 && balance < 10;

  return (
    <div
      className={`flex items-center justify-between px-4 py-2 text-[10px] font-medium ${
        isSyncMode
          ? 'bg-[var(--accent-sync)]/8 border-t border-[var(--accent-sync)]/15'
          : 'bg-[var(--accent-solo)]/8 border-t border-[var(--accent-solo)]/15'
      } ${lowBalance ? 'animate-meter-pulse' : ''}`}
    >
      <div className="flex items-center gap-2">
        <span className={`flex items-center gap-1 ${isSyncMode ? 'text-[var(--accent-sync)]' : 'text-[var(--accent-solo)]'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isSyncMode ? 'bg-[var(--accent-sync)]' : 'bg-[var(--accent-solo)]'}`} />
          ₹{rate.toFixed(2)}/min
        </span>
        <span className="text-white/30">|</span>
        <span className="text-white/60">{mins} min</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-white/60">₹{spent.toFixed(2)} spent</span>
        <span className="text-white/30">|</span>
        <span className={lowBalance ? 'text-amber-400' : 'text-[var(--accent-teal)]'}>
          ₹{balance.toFixed(2)}
        </span>
        {sessionId && !isActive && status === 'insufficient_funds' && (
          <a href="/wallet" className="text-red-400 font-bold underline">TOP UP</a>
        )}
        {sessionId && !isActive && status === 'capped' && (
          <span className="text-green-400 font-bold">FREE ZONE</span>
        )}
        {sessionId && !isActive && status !== 'insufficient_funds' && status !== 'capped' && (
          <span className="text-amber-400 font-bold">PAUSED</span>
        )}
      </div>
    </div>
  );
}
