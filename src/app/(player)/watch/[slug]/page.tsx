'use client';

import { use, useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/cn';
import { useMeterStore, type MeterSessionSummary } from '@/store/meter';
import { useWalletStore } from '@/store/wallet';
import { useHistoryStore } from '@/store/history';
import Link from 'next/link';

import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { MediaPlayer, MediaProvider, type MediaPlayerInstance } from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';

function WatchContent({ slug }: { slug: string }) {
  const searchParams = useSearchParams();

  const movieTitle = searchParams.get('title') || slug.replace(/-/g, ' ');
  const ratePerMin = Number(searchParams.get('rate')) || 0.75;
  const capAmount = Number(searchParams.get('cap')) || 90;
  const selectedMins = Number(searchParams.get('minutes')) || 30;
  const posterUrl = searchParams.get('poster') || null;
  const videoUrl = searchParams.get('video') || null;


  const ratePerMinPaise = Math.round(ratePerMin * 100);
  const meterCapPaise = Math.round(capAmount * 100);

  const playerRef = useRef<MediaPlayerInstance>(null);
  const pollInterval = useRef<ReturnType<typeof setInterval>>(null);
  const sessionTimestamp = useRef(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [showMeterPanel, setShowMeterPanel] = useState(false);
  const [showNotLovingIt, setShowNotLovingIt] = useState(false);
  const [notLovingItShown, setNotLovingItShown] = useState(false);
  const [showTimeReached, setShowTimeReached] = useState(false);
  const [timeReachedShown, setTimeReachedShown] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<MeterSessionSummary | null>(null);
  const [lowBalanceWarning, setLowBalanceWarning] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [startError, setStartError] = useState<string | null>(null);

  const meter = useMeterStore();
  const wallet = useWalletStore();
  const history = useHistoryStore();

  // Display values (INR from paise)
  const displaySpend = meter.totalBilledPaise / 100;
  const displayBalance = meter.balancePaise / 100;
  const displayCap = meter.meterCapPaise / 100;
  const isCapped = meter.status === 'capped';
  const isInsufficientFunds = meter.status === 'insufficient_funds';

  // ── Force landscape on mobile ──
  useEffect(() => {
    const lockLandscape = async () => {
      try {
        const orientation = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void>; unlock?: () => void };
        if (orientation?.lock) await orientation.lock('landscape');
      } catch {}
    };
    lockLandscape();
    try { document.documentElement.requestFullscreen?.(); } catch {}
    return () => {
      try {
        const orientation = screen.orientation as ScreenOrientation & { unlock?: () => void };
        orientation?.unlock?.();
        document.exitFullscreen?.();
      } catch {}
    };
  }, []);

  // ── Start session on mount ──
  useEffect(() => {
    const start = async () => {
      const ok = await meter.startSession(Number(slug), movieTitle, ratePerMinPaise, meterCapPaise);
      if (!ok) {
        setStartError(meter.error || 'Insufficient balance to start watching');
      }
    };
    start();
    return () => { meter.reset(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // ── Poll session status every 5 seconds while active ──
  useEffect(() => {
    if (meter.sessionId && (meter.status === 'active' || meter.status === 'paused')) {
      pollInterval.current = setInterval(() => {
        meter.pollStatus();
      }, 5000);
    }
    return () => { if (pollInterval.current) clearInterval(pollInterval.current); };
  }, [meter.sessionId, meter.status, meter]);

  // ── Handle insufficient funds from backend ──
  useEffect(() => {
    if (isInsufficientFunds) {
      playerRef.current?.pause();
      setIsPlaying(false);
      setLowBalanceWarning(true);
    }
  }, [isInsufficientFunds]);

  // ── Update wallet store from meter poll ──
  useEffect(() => {
    if (meter.balancePaise > 0) {
      wallet.setBalancePaise(meter.balancePaise);
    }
  }, [meter.balancePaise, wallet]);

  // "Not loving it?" at 10 min
  useEffect(() => {
    if (meter.minutesBilled >= 10 && !notLovingItShown && !isCapped) {
      setShowNotLovingIt(true);
      setNotLovingItShown(true);
      setTimeout(() => setShowNotLovingIt(false), 8000);
    }
  }, [meter.minutesBilled, isCapped, notLovingItShown]);

  // "Time reached" (NO hard stop)
  useEffect(() => {
    if (meter.minutesBilled >= selectedMins && !timeReachedShown && !isCapped && isPlaying) {
      setShowTimeReached(true);
      setTimeReachedShown(true);
      setTimeout(() => setShowTimeReached(false), 10000);
    }
  }, [meter.minutesBilled, selectedMins, timeReachedShown, isCapped, isPlaying]);

  // Low balance warning (< ₹10)
  useEffect(() => {
    if (displayBalance > 0 && displayBalance < 10 && isPlaying && !isCapped) {
      setLowBalanceWarning(true);
      setTimeout(() => setLowBalanceWarning(false), 5000);
    }
  }, [displayBalance, isPlaying, isCapped]);

  // Handle player play/pause events
  const onPlay = useCallback(() => {
    if (isInsufficientFunds) {
      playerRef.current?.pause();
      setLowBalanceWarning(true);
      return;
    }
    meter.resume();
    setIsPlaying(true);
  }, [isInsufficientFunds, meter]);

  const onPause = useCallback(() => {
    meter.pause();
    setIsPlaying(false);
  }, [meter]);

  const onEnd = useCallback(() => {
    meter.pause();
    setIsPlaying(false);
  }, [meter]);

  const handleExit = async () => {
    playerRef.current?.pause();
    const summary = await meter.endSession();
    const ts = Date.now();
    sessionTimestamp.current = ts;
    if (summary) {
      history.addSession({
        movieId: slug, movieTitle, posterUrl,
        minutesWatched: Math.round(summary.minutesBilled),
        totalSpend: summary.totalBilledPaise / 100,
        hitFreeZone: summary.hitCap,
        timestamp: ts,
      });
      setSessionSummary(summary);
    }
    setIsPlaying(false);
  };

  const handleRate = (star: number) => {
    setSelectedRating(star);
    history.rateSession(slug, sessionTimestamp.current, star);
    meter.rateSession(star); // persist to BE
  };

  // ── Start Error (insufficient balance) ──
  if (startError) {
    return (
      <div className="min-h-dvh bg-[var(--bg-primary)] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-full max-w-sm space-y-5">
          <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center mx-auto">
            <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
          </div>
          <h2 className="text-xl font-bold text-white">Insufficient Balance</h2>
          <p className="text-[13px] text-[var(--text-muted)]">{startError}</p>
          <p className="text-[13px] text-[var(--text-secondary)]">You need at least ₹{ratePerMin} to start watching (1 minute).</p>
          <div className="flex flex-col gap-3">
            <Link href="/wallet" className="py-3 rounded-xl bg-[var(--accent-teal)] text-white font-semibold text-[14px] text-center">Top Up Wallet</Link>
            <Link href={`/movie/${slug}`} className="py-3 rounded-xl border border-[var(--glass-border)] text-[var(--text-secondary)] font-medium text-[14px] text-center">Go Back</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Session End Summary ──
  if (sessionSummary) {
    const totalSpentINR = sessionSummary.totalBilledPaise / 100;
    const capINR = sessionSummary.meterCapPaise / 100;
    const savings = Math.max(0, capINR - totalSpentINR);
    const balanceINR = sessionSummary.balancePaise / 100;

    return (
      <div className="min-h-dvh bg-[var(--bg-primary)] flex flex-col items-center justify-center px-6 text-center animate-fade-in">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-2">
            <div className={cn(
              'w-14 h-14 rounded-full flex items-center justify-center mx-auto',
              sessionSummary.hitCap ? 'bg-[var(--accent-gold)]/15 animate-gold-glow' : 'bg-[var(--accent-teal)]/15'
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
              <span className="text-[13px] text-[var(--text-secondary)]">vs Full Rental (₹{capINR})</span>
              <span className="text-[14px] font-bold text-[var(--accent-gold)]">You saved ₹{savings.toFixed(0)}</span>
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
            <Link href="/" className="py-3 rounded-xl bg-[var(--accent-crimson)] text-white font-semibold text-[14px] text-center glow-crimson">Back to Home</Link>
            <Link href="/library" className="py-3 rounded-xl border border-[var(--glass-border)] text-[var(--text-secondary)] font-medium text-[14px] text-center">View Library</Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Vidstack Player ──────────────────────────────────────────────────────
  return (
    <div className="relative w-full h-dvh bg-black landscape-player overflow-hidden">
      <div className="absolute inset-0 z-0 [&_.vds-video-layout]:!h-full">
        {videoUrl ? (
          <MediaPlayer
            ref={playerRef}
            title={movieTitle}
            src={videoUrl}
            poster={posterUrl || undefined}
            crossOrigin=""
            playsInline
            className="w-full h-full"
            onPlay={onPlay}
            onPause={onPause}
            onEnd={onEnd}
          >
            <MediaProvider />
            <DefaultVideoLayout
              icons={defaultLayoutIcons}
              slots={{ beforePlayButton: null }}
            />
          </MediaPlayer>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {posterUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={posterUrl} alt={movieTitle} className="absolute inset-0 w-full h-full object-cover opacity-15 blur-2xl scale-110" />
            )}
            <p className="text-white/40 text-[14px]">No video available</p>
          </div>
        )}
      </div>

      {/* ── MiniMeter Badge (top-right) ── */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-[60]">
        <button onClick={() => setShowMeterPanel(!showMeterPanel)}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full backdrop-blur-md border text-[10px] sm:text-[12px] font-bold transition-all',
            isCapped
              ? 'bg-[var(--accent-gold)]/20 border-[var(--accent-gold)]/40 text-[var(--accent-gold)] animate-gold-glow'
              : 'bg-black/50 border-[var(--accent-teal)]/30 text-[var(--accent-teal)]'
          )}>
          {isCapped ? (
            <><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>FREE ZONE</>
          ) : (
            <><span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-teal)] animate-meter-pulse" />₹{ratePerMin}/min</>
          )}
        </button>
        <p className={cn('text-[9px] sm:text-[11px] font-medium mt-0.5 text-right', isCapped ? 'text-[var(--accent-gold)]/70' : 'text-[var(--accent-teal)]/50')}>
          {isCapped ? 'Cap reached — FREE' : `₹${displaySpend.toFixed(2)} spent`}
        </p>
      </div>

      {/* ── Back button (top-left) ── */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-[60]">
        <button onClick={handleExit} className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/50 backdrop-blur-md">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          <span className="text-white font-medium text-[11px] sm:text-[13px] capitalize line-clamp-1 max-w-[120px] sm:max-w-[200px]">{movieTitle}</span>
        </button>
      </div>

      {/* ── Time Reached notification ── */}
      {showTimeReached && (
        <div className="absolute top-14 left-3 right-20 sm:left-4 sm:right-24 z-[60] animate-slide-up">
          <div className="p-2.5 sm:p-3 rounded-xl bg-[var(--accent-teal)]/12 border border-[var(--accent-teal)]/25 backdrop-blur-md">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2 min-w-0">
                <svg className="w-4 h-4 text-[var(--accent-teal)] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-[11px] sm:text-[13px] font-semibold text-[var(--accent-teal)]">{selectedMins} minutes reached</p>
                  <p className="text-[9px] sm:text-[11px] text-white/50 mt-0.5">₹{displaySpend.toFixed(2)} spent so far. Continue watching or exit — your call.</p>
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => setShowTimeReached(false)}
                  className="px-2.5 py-1.5 rounded-lg bg-[var(--accent-teal)]/20 text-[10px] sm:text-[11px] font-semibold text-[var(--accent-teal)]">Continue</button>
                <button onClick={handleExit}
                  className="px-2.5 py-1.5 rounded-lg bg-white/10 text-[10px] sm:text-[11px] font-semibold text-white/70">Stop</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Low balance / Insufficient funds warning ── */}
      {(lowBalanceWarning || isInsufficientFunds) && !showTimeReached && (
        <div className="absolute top-14 left-3 right-20 sm:left-4 sm:right-24 z-[60] animate-slide-up">
          <div className="p-2.5 sm:p-3 rounded-xl bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/25 backdrop-blur-md flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] sm:text-[13px] font-semibold text-[var(--accent-gold)]">
                {isInsufficientFunds ? 'Playback Paused' : 'Low Balance'}
              </p>
              <p className="text-[9px] sm:text-[11px] text-white/50">
                {isInsufficientFunds ? 'Top up to continue watching' : `₹${displayBalance.toFixed(2)} remaining`}
              </p>
            </div>
            <Link href="/wallet" onClick={() => handleExit()}
              className="px-2.5 py-1.5 rounded-lg bg-[var(--accent-teal)] text-[10px] sm:text-[11px] font-semibold text-white shrink-0">Top Up</Link>
          </div>
        </div>
      )}

      {/* ── "Not loving it?" ── */}
      {showNotLovingIt && !showTimeReached && (
        <div className="absolute top-14 left-3 right-20 sm:left-4 sm:right-24 z-[60] animate-slide-up">
          <div className="p-2.5 sm:p-3 rounded-xl bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/20 backdrop-blur-md flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] sm:text-[13px] font-semibold text-[var(--accent-gold)]">Not loving it?</p>
              <p className="text-[9px] sm:text-[11px] text-white/50">₹{displaySpend.toFixed(0)} spent. Exit and save the rest.</p>
            </div>
            <button onClick={handleExit} className="px-2.5 py-1.5 rounded-lg bg-white/10 text-[10px] sm:text-[11px] font-semibold text-white/70 shrink-0">Exit</button>
          </div>
        </div>
      )}

      {/* ── Free Zone banner ── */}
      {isCapped && !showMeterPanel && !showTimeReached && (
        <div className="absolute top-14 left-0 right-0 z-[55] flex justify-center pointer-events-none animate-fade-in">
          <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[var(--accent-gold)]/20 border border-[var(--accent-gold)]/30 backdrop-blur-md">
            <p className="text-[11px] sm:text-[13px] font-bold text-[var(--accent-gold)]">Cap reached — watching FREE</p>
          </div>
        </div>
      )}

      {/* ── Meter Panel (bottom sheet) ── */}
      {showMeterPanel && (
        <div className="absolute bottom-0 left-0 right-0 z-[70] animate-slide-up">
          <div className="p-4 sm:p-5 rounded-t-2xl bg-[var(--bg-primary)]/95 backdrop-blur-xl border-t border-[var(--glass-border)] space-y-3 sm:space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[13px] sm:text-[15px] font-bold text-white capitalize">{movieTitle}</p>
                <p className="text-[10px] sm:text-[12px] text-[var(--text-muted)]">₹{ratePerMin}/min — {isCapped ? 'Free Zone' : isPlaying ? 'Metering' : 'Paused'}</p>
              </div>
              <button onClick={() => setShowMeterPanel(false)} className="p-1">
                <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 rounded-xl bg-white/[0.03]"><p className="text-[9px] sm:text-[10px] text-[var(--text-muted)]">Minutes</p><p className="text-[16px] sm:text-[18px] font-bold text-white">{Math.round(meter.minutesBilled)}</p></div>
              <div className="p-2 sm:p-3 rounded-xl bg-white/[0.03]"><p className="text-[9px] sm:text-[10px] text-[var(--text-muted)]">Cost</p><p className="text-[16px] sm:text-[18px] font-bold text-[var(--accent-teal)]">₹{displaySpend.toFixed(2)}</p></div>
              <div className="p-2 sm:p-3 rounded-xl bg-white/[0.03]"><p className="text-[9px] sm:text-[10px] text-[var(--text-muted)]">Wallet</p><p className="text-[16px] sm:text-[18px] font-bold text-white">₹{displayBalance.toFixed(2)}</p></div>
            </div>
            <div>
              <div className="flex justify-between text-[9px] sm:text-[11px] text-[var(--text-muted)] mb-1">
                <span>Free Zone progress</span>
                <span>{isCapped ? 'Reached!' : `₹${Math.max(0, displayCap - displaySpend).toFixed(0)} away`}</span>
              </div>
              <div className="h-1.5 sm:h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{
                  width: `${Math.min(100, (displaySpend / displayCap) * 100)}%`,
                  background: isCapped ? 'var(--accent-gold)' : 'var(--accent-teal)',
                }} />
              </div>
            </div>
            <button onClick={handleExit} className="w-full py-2.5 sm:py-3 rounded-xl border border-[var(--glass-border)] text-[var(--text-secondary)] text-[12px] sm:text-[13px] font-medium">
              Pause & Exit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WatchPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return (
    <Suspense fallback={<div className="w-full h-dvh bg-black flex items-center justify-center"><div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>}>
      <WatchContent slug={slug} />
    </Suspense>
  );
}
