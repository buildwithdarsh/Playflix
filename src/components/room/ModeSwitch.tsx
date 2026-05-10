'use client';

import { useRoomStore } from '@/store/room';
import { useMeterStore } from '@/store/meter';

export default function ModeSwitch() {
  // Only Solo mode is supported currently — no mode switching
  return null;
  const mode = useRoomStore((s) => s.mode);
  const isHost = useRoomStore((s) => s.isHost);
  const switchMode = useRoomStore((s) => s.switchMode);
  const setMeterMode = useMeterStore((s) => s.setMode);

  if (isHost) return null;

  const isSyncMode = mode === 'sync';

  const handleSwitch = () => {
    const newMode = isSyncMode ? 'solo' : 'sync';
    switchMode(newMode);
    setMeterMode(newMode);
  };

  return (
    <button
      onClick={handleSwitch}
      className={`absolute bottom-4 right-4 z-30 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] font-bold border transition-all active:scale-95 ${
        isSyncMode
          ? 'bg-[var(--accent-solo)]/15 border-[var(--accent-solo)]/30 text-[var(--accent-solo)]'
          : 'bg-[var(--accent-sync)]/15 border-[var(--accent-sync)]/30 text-[var(--accent-sync)]'
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${isSyncMode ? 'bg-[var(--accent-solo)]' : 'bg-[var(--accent-sync)]'}`} />
      {isSyncMode ? 'Go Solo' : 'Jump to Host'}
    </button>
  );
}
