'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { TZ } from '@/lib/tz';
import { useRoomStore } from '@/store/room';
import { useAuthStore } from '@/store/auth';
import { useMeterStore, type MeterSessionSummary } from '@/store/meter';
import { useHistoryStore } from '@/store/history';
import ModeSelector from '@/components/room/ModeSelector';
import RoomHeader from '@/components/room/RoomHeader';
import RoomPlayer from '@/components/room/RoomPlayer';
import EmojiBar from '@/components/room/EmojiBar';
import FloatingReactions from '@/components/room/FloatingReactions';
import ModeSwitch from '@/components/room/ModeSwitch';
import PPMMeterStrip from '@/components/room/PPMMeterStrip';
import type { RoomMode, Room } from '@/lib/types/room';

// Single unified flow:
// 1. 'init' — loading room data, checking if already joined
// 2. 'mode-select' — new viewer picks mode
// 3. 'joining' — setting up experience (join + start session)
// 4. 'ready' — video playing
type Phase = 'init' | 'mode-select' | 'joining' | 'ready' | 'insufficient-balance' | 'summary';

export default function RoomClient() {
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const capFromQuery = Number(searchParams.get('cap')) || 0;
  const user = useAuthStore((s) => s.user);
  const room = useRoomStore((s) => s.room);
  const isHost = useRoomStore((s) => s.isHost);
  const mode = useRoomStore((s) => s.mode);
  const joinRoom = useRoomStore((s) => s.joinRoom);
  const leaveRoom = useRoomStore((s) => s.leaveRoom);
  const reset = useRoomStore((s) => s.reset);
  const meterStartSession = useMeterStore((s) => s.startSession);
  const meterEndSession = useMeterStore((s) => s.endSession);
  const meterUpdateCap = useMeterStore((s) => s.updateCap);
  const meterRateSession = useMeterStore((s) => s.rateSession);
  const meterStatus = useMeterStore((s) => s.status);
  const meterSpent = useMeterStore((s) => s.totalBilledPaise);
  const meterMinutes = useMeterStore((s) => s.minutesBilled);
  const history = useHistoryStore();
  const [phase, setPhase] = useState<Phase>('init');
  const [showPreviewOverlay, setShowPreviewOverlay] = useState(false);
  const [continuingLoading, setContinuingLoading] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<MeterSessionSummary | null>(null);
  const [selectedRating, setSelectedRating] = useState(0);

  // Phase 1: Init — load room, check join status, start session if already joined
  useEffect(() => {
    if (phase !== 'init' || !user) return;

    (async () => {
      try {
        // Get room data (from store or API — API includes viewerStatus)
        let roomData = room;
        let alreadyJoined = false;

        if (!roomData) {
          const res = await TZ.storefront.rooms.get(roomId);
          const raw = res as unknown as Record<string, unknown>;
          roomData = (raw['room'] || raw) as Room;
          // Check viewerStatus from API response
          const vs = raw['viewerStatus'] as { isJoined?: boolean } | undefined;
          alreadyJoined = vs?.isJoined || false;
        }

        const isCurrentUserHost = roomData.hostId === user.id;
        useRoomStore.setState({ room: roomData, isHost: isCurrentUserHost, mode: 'solo' });

        // If host or already joined — auto-join + start session → go to video
        if (isCurrentUserHost || alreadyJoined) {
          // Join (returns existing data if already in)
          try { await joinRoom(roomId, 'solo'); } catch { /* ok */ }

          const ok = await meterStartSession(
            Number(roomData.tmdbId),
            roomData.movieTitle,
            roomData.ratePerMinPaise,
            capFromQuery || roomData.ratePerMinPaise * 180,
            roomId,
            'solo',
          );
          setPhase(ok ? 'ready' : 'insufficient-balance');
        } else {
          // New viewer — show mode selector
          setPhase('mode-select');
        }
      } catch {
        router.push('/');
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, user]);

  // Handle mode selection (new viewer clicks Continue)
  const handleContinue = useCallback(async (_selectedMode: RoomMode) => {
    setPhase('joining');
    try {
      await joinRoom(roomId, 'solo');
      const roomData = useRoomStore.getState().room;
      const ok = await meterStartSession(
        Number(roomData?.tmdbId || 0),
        roomData?.movieTitle || '',
        roomData?.ratePerMinPaise || 0,
        capFromQuery || (roomData?.ratePerMinPaise || 0) * 180,
        roomId,
        'solo',
      );
      if (!ok) {
        setPhase('insufficient-balance');
        return;
      }
      setPhase('ready');
    } catch {
      // If join fails, go back to mode select
      setPhase('mode-select');
    }
  }, [roomId, joinRoom, meterStartSession]);

  // Show preview overlay when session hits cap
  useEffect(() => {
    if (meterStatus === 'capped' && phase === 'ready' && !showPreviewOverlay) {
      setShowPreviewOverlay(true);
    }
  }, [meterStatus, phase, showPreviewOverlay]);

  // Continue watching — lift cap to unlimited
  const handlePreviewContinue = useCallback(async () => {
    setContinuingLoading(true);
    const ok = await meterUpdateCap(99_999_99); // ₹99,999.99 — effectively unlimited
    if (ok) {
      setShowPreviewOverlay(false);
    }
    setContinuingLoading(false);
  }, [meterUpdateCap]);

  const handleLeave = useCallback(async () => {
    const summary = await meterEndSession();
    await leaveRoom();
    if (summary) {
      history.addSession({
        movieId: String(room?.tmdbId || ''),
        movieTitle: summary.movieTitle || room?.movieTitle || '',
        posterUrl: room?.posterUrl || null,
        minutesWatched: Math.round(summary.minutesBilled),
        totalSpend: summary.totalBilledPaise / 100,
        hitFreeZone: summary.hitCap,
        timestamp: Date.now(),
      });
      setSessionSummary(summary);
      setPhase('summary');
    } else {
      reset();
      router.push('/');
    }
  }, [meterEndSession, leaveRoom, history, room, reset, router]);

  const handleRate = useCallback((star: number) => {
    setSelectedRating(star);
    history.rateSession(String(room?.tmdbId || ''), sessionSummary ? Date.now() : 0, star);
    meterRateSession(star);
  }, [history, room, sessionSummary, meterRateSession]);

  // Not logged in
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <p className="text-[var(--text-muted)]">Sign in to join rooms</p>
      </div>
    );
  }

  // Phase: Insufficient balance
  if (phase === 'insufficient-balance') {
    const rateINR = (room?.ratePerMinPaise || 0) / 100;
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center px-6 text-center">
        <div className="w-full max-w-sm space-y-5">
          <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center mx-auto">
            <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">Insufficient Balance</h2>
          <p className="text-[13px] text-[var(--text-muted)]">
            You need at least ₹{rateINR.toFixed(2)} to start watching (1 minute).
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/wallet"
              className="py-3 rounded-xl bg-[var(--accent-teal)] text-white font-semibold text-[14px] text-center"
            >
              Top Up Wallet
            </Link>
            <Link
              href={`/movie/${room?.tmdbId || ''}`}
              className="py-3 rounded-xl border border-[var(--glass-border)] text-[var(--text-secondary)] font-medium text-[14px] text-center"
            >
              Go Back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Phase: Init or Joining — full page loader with animated illustration
  if (phase === 'init' || phase === 'joining') {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center space-y-5">
          {/* Animated cinema illustration */}
          <svg width="120" height="100" viewBox="0 0 120 100" fill="none" className="mx-auto">
            {/* Screen */}
            <rect x="15" y="10" width="90" height="55" rx="6" fill="#1A1A1A" stroke="#333" strokeWidth="1">
              <animate attributeName="opacity" values="0;1" dur="0.4s" fill="freeze" />
            </rect>
            <rect x="22" y="16" width="76" height="43" rx="3" fill="#111">
              <animate attributeName="opacity" values="0;1" dur="0.3s" fill="freeze" begin="0.15s" />
            </rect>

            {/* Pulsing play icon */}
            <circle cx="60" cy="37" r="12" fill="none" stroke="#EF4444" strokeWidth="1.5" opacity="0">
              <animate attributeName="opacity" values="0;0.6;0.3;0.6" dur="2s" repeatCount="indefinite" begin="0.4s" />
              <animate attributeName="r" values="10;13;10" dur="2s" repeatCount="indefinite" begin="0.4s" />
            </circle>
            <path d="M55 30v14l11-7-11-7z" fill="#EF4444" opacity="0">
              <animate attributeName="opacity" values="0;0.7;0.4;0.7" dur="2s" repeatCount="indefinite" begin="0.4s" />
            </path>

            {/* Signal waves */}
            <path d="M108 25 C115 25 115 35 108 35" stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0">
              <animate attributeName="opacity" values="0;0.5;0" dur="1.5s" repeatCount="indefinite" begin="0.6s" />
            </path>
            <path d="M112 20 C122 20 122 40 112 40" stroke="#EF4444" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0">
              <animate attributeName="opacity" values="0;0.3;0" dur="1.5s" repeatCount="indefinite" begin="0.9s" />
            </path>

            {/* Stand */}
            <line x1="45" y1="65" x2="38" y2="80" stroke="#444" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="75" y1="65" x2="82" y2="80" stroke="#444" strokeWidth="1.5" strokeLinecap="round" />

            {/* Progress bar */}
            <rect x="30" y="88" width="60" height="3" rx="1.5" fill="#222" />
            <rect x="30" y="88" width="0" height="3" rx="1.5" fill="#EF4444">
              <animate attributeName="width" values="0;60;0" dur="2.5s" repeatCount="indefinite" />
            </rect>
          </svg>

          <p className="text-[13px] text-white/50">
            {phase === 'init' ? 'Loading room...' : 'Setting up your experience...'}
          </p>
        </div>
      </div>
    );
  }

  // Phase: Session Summary + Rating
  if (phase === 'summary' && sessionSummary) {
    const totalSpentINR = sessionSummary.totalBilledPaise / 100;
    const balanceINR = sessionSummary.balancePaise / 100;
    const rateINR = (room?.ratePerMinPaise || 0) / 100;

    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center px-6 text-center animate-fade-in">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-2">
            <div className={cn(
              'w-14 h-14 rounded-full flex items-center justify-center mx-auto',
              sessionSummary.hitCap ? 'bg-[var(--accent-gold)]/15' : 'bg-[var(--accent-teal)]/15'
            )}>
              {sessionSummary.hitCap ? (
                <svg className="w-7 h-7 text-[var(--accent-gold)]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
              ) : (
                <svg className="w-7 h-7 text-[var(--accent-teal)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              )}
            </div>
            <h2 className="text-xl font-bold text-white">
              {sessionSummary.hitCap ? 'You hit the Free Zone!' : 'Session Complete'}
            </h2>
            <p className="text-[13px] text-[var(--text-muted)] capitalize">{sessionSummary.movieTitle}</p>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-[11px] text-[var(--text-muted)]">Minutes Watched</p><p className="text-[22px] font-bold text-white">{Math.round(sessionSummary.minutesBilled)}</p></div>
              <div><p className="text-[11px] text-[var(--text-muted)]">Total Spent</p><p className="text-[22px] font-bold text-[var(--accent-teal)]">₹{totalSpentINR.toFixed(2)}</p></div>
            </div>
            <div className="section-divider" />
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[var(--text-secondary)]">Rate</span>
              <span className="text-[14px] font-bold text-white">₹{rateINR.toFixed(2)}/min</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[var(--text-secondary)]">Wallet Balance</span>
              <span className="text-[14px] font-bold text-[var(--accent-teal)]">₹{balanceINR.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[13px] text-[var(--text-secondary)]">How was it?</p>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => handleRate(star)} className="p-1 active:scale-125 transition-transform">
                  <svg className={cn('w-8 h-8 transition-colors', star <= selectedRating ? 'text-[var(--accent-gold)]' : 'text-[var(--text-muted)]/30')}
                    fill={star <= selectedRating ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/" onClick={() => reset()} className="py-3 rounded-xl bg-[var(--accent-crimson)] text-white font-semibold text-[14px] text-center glow-crimson">
              Back to Home
            </Link>
            <Link href="/library" onClick={() => reset()} className="py-3 rounded-xl border border-[var(--glass-border)] text-[var(--text-secondary)] font-medium text-[14px] text-center">
              View Library
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Phase: Mode Select
  if (phase === 'mode-select') {
    return (
      <ModeSelector
        movieTitle={room?.movieTitle || 'Movie'}
        hostName={room?.hostName || 'Host'}
        ratePerMinPaise={room?.ratePerMinPaise || 0}
        posterUrl={room?.posterUrl || null}
        onSelect={handleContinue}
      />
    );
  }

  // Phase: Ready — show video + controls
  const spentINR = (meterSpent / 100).toFixed(2);
  const watchedMins = Math.round(meterMinutes);

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      <RoomHeader
        roomName={room?.name || 'Room'}
        posterUrl={room?.posterUrl || null}
        viewerCount={Math.max(room?.viewerCount || 0, 3000 + ((room?.tmdbId || 0) % 2000))}
        mode={mode}
        isHost={isHost}
        onLeave={handleLeave}
      />

      <div className="flex-1 relative">
        <RoomPlayer />
        <FloatingReactions />
        <ModeSwitch />
      </div>

      <PPMMeterStrip />
      <EmojiBar />

      {/* Preview cap reached overlay */}
      {showPreviewOverlay && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-sm space-y-5 text-center">
            {/* Icon */}
            <div className="w-14 h-14 rounded-full bg-[var(--accent-gold)]/15 flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-[var(--accent-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">Preview Complete</h2>
              <p className="text-[13px] text-white/50 mt-1">
                You watched {watchedMins} min · ₹{spentINR} spent
              </p>
            </div>

            <p className="text-[13px] text-white/60 leading-relaxed">
              Enjoying <span className="text-white font-medium">{room?.movieTitle || 'the movie'}</span>? Continue watching with pay-per-minute billing.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handlePreviewContinue}
                disabled={continuingLoading}
                className="w-full py-3.5 rounded-xl bg-[var(--accent-teal)] text-white font-bold text-[14px] active:scale-[0.97] transition-transform disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {continuingLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Continuing...
                  </>
                ) : (
                  'Continue Watching'
                )}
              </button>
              <button
                onClick={handleLeave}
                className="w-full py-3 rounded-xl border border-white/10 text-white/60 font-medium text-[13px] active:scale-[0.97] transition-transform"
              >
                Leave Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
