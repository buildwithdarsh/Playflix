'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { m } from 'framer-motion';
import { useMovieDetail } from '@/hooks/useMovies';
import { useWalletStore } from '@/store/wallet';
import { useAuthStore } from '@/store/auth';
import Skeleton from '@/components/Skeleton';
import { TMDB_PLAY_URL } from '@/lib/constants';
import Link from 'next/link';
import MovieCard from '@/components/home/MovieCard';
import ButtonLoader from '@/components/ui/ButtonLoader';
import RoomListSection from '@/components/movie/RoomListSection';
import { useRoomsForMovie } from '@/hooks/useRooms';
import { TZ } from '@/lib/tz';
import type { Room } from '@/lib/types/room';

function RoomActionButton({ tmdbId, movieTitle, posterUrl, existingRooms, roomsLoading, selectedMinutes, ratePerMin }: {
  tmdbId: number;
  movieTitle: string;
  posterUrl: string;
  existingRooms: Room[];
  roomsLoading: boolean;
  selectedMinutes: number;
  ratePerMin: number;
}) {
  const router = useRouter();
  const requireAuth = useAuthStore((s) => s.requireAuth);
  const user = useAuthStore((s) => s.user);

  const [driveChecked, setDriveChecked] = useState(false);
  const [driveConnected, setDriveConnected] = useState(false);
  const [checkingDrive, setCheckingDrive] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);

  // Only check Drive connection when: user is logged in, no existing room, and rooms done loading
  useEffect(() => {
    if (!user || roomsLoading || existingRooms.length > 0 || driveChecked) return;
    setCheckingDrive(true);
    TZ.storefront.connectedSources.list()
      .then((data) => {
        const sources = Array.isArray(data) ? data : (data as { sources?: { provider: string }[] }).sources || [];
        setDriveConnected(sources.some((s: { provider: string }) => s.provider === 'google_drive'));
      })
      .catch(() => setDriveConnected(false))
      .finally(() => { setCheckingDrive(false); setDriveChecked(true); });
  }, [user, roomsLoading, existingRooms.length, driveChecked]);

  const existingRoom = existingRooms[0];
  const rate = existingRoom ? (existingRoom.ratePerMinPaise / 100).toFixed(1) : '';

  // Loading rooms
  if (roomsLoading) {
    return (
      <div className="w-full py-3.5 rounded-xl bg-white/6 flex items-center justify-center gap-2">
        <svg className="w-4 h-4 animate-spin text-white/40" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-[13px] text-white/40 font-medium">Loading...</span>
      </div>
    );
  }

  // Room exists — show Join
  if (existingRoom) {
    return (
      <button
        onClick={() => requireAuth(() => {
          setJoinLoading(true);
          const capPaise = Math.round(selectedMinutes * ratePerMin * 100);
          router.push(`/room/${existingRoom.id}?cap=${capPaise}`);
        })}
        disabled={joinLoading}
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[var(--accent-sync)] text-white font-bold text-[14px] active:scale-[0.97] transition-transform glow-sync disabled:opacity-80"
      >
        {joinLoading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Joining...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
            Join Room{existingRoom.ratePerMinPaise > 0 ? ` — ₹${rate}/min` : ' — Free'} · {Math.max(existingRoom.viewerCount, 3000 + (existingRoom.tmdbId % 2000))} watching
          </>
        )}
      </button>
    );
  }

  // Checking Drive connection
  if (checkingDrive) {
    return (
      <div className="w-full py-3.5 rounded-xl bg-[var(--accent-sync)]/10 border border-[var(--accent-sync)]/20 flex items-center justify-center gap-2">
        <svg className="w-4 h-4 animate-spin text-[var(--accent-sync)]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-[13px] text-[var(--accent-sync)] font-medium">Validating Drive Connection...</span>
      </div>
    );
  }

  // Drive connected — show Host
  if (driveConnected) {
    return (
      <Link
        href={`/room/create?tmdbId=${tmdbId}&title=${encodeURIComponent(movieTitle)}&poster=${encodeURIComponent(posterUrl)}`}
        onClick={(e) => { e.preventDefault(); requireAuth(() => router.push(`/room/create?tmdbId=${tmdbId}&title=${encodeURIComponent(movieTitle)}&poster=${encodeURIComponent(posterUrl)}`)); }}
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[var(--accent-sync)] text-white font-bold text-[14px] active:scale-[0.97] transition-transform glow-sync"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.652a3.75 3.75 0 010-5.304m5.304 0a3.75 3.75 0 010 5.304m-7.425 2.121a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.807-3.808-9.98 0-13.788m13.788 0c3.808 3.808 3.808 9.981 0 13.788" />
        </svg>
        Host a Room
      </Link>
    );
  }

  // Drive not connected — show connect
  return (
    <Link
      href="/profile"
      onClick={(e) => { e.preventDefault(); requireAuth(() => router.push('/profile')); }}
      className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border border-[var(--accent-sync)]/25 bg-[var(--accent-sync)]/8 text-[var(--accent-sync)] font-semibold text-[14px] active:scale-[0.97] transition-transform"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-1.06l4.5-4.5a4.5 4.5 0 00-6.364-6.364l-1.757 1.757" />
      </svg>
      Connect Google Drive to Host
    </Link>
  );
}

export default function MovieDetailClient({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { movie, loading } = useMovieDetail(slug);
  const walletBalance = useWalletStore((s) => s.balance);
  const { rooms: existingRooms, loading: roomsLoading } = useRoomsForMovie(Number(slug));
  const requireAuth = useAuthStore((s) => s.requireAuth);
  const [selectedMinutes, setSelectedMinutes] = useState(30);
  const [watchLoading, setWatchLoading] = useState(false);

  if (loading) {
    return (
      <div className="-mt-14 space-y-4">
        <Skeleton className="w-full aspect-[16/10]" />
        <div className="px-5 space-y-3">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!movie) {
    return <div className="px-5 py-20 text-center text-[var(--text-muted)]">Movie not found</div>;
  }

  // PPM pricing — use room price if room exists, otherwise movie tier
  const ppm = movie['ppm'] as { tier: string; ratePerMin: number; color: string; meterCap: number; fullMovieCost: number; thirtyMinCost: number } | undefined;
  const existingRoom = existingRooms[0];
  const rate = existingRoom ? existingRoom.ratePerMinPaise / 100 : (ppm?.ratePerMin || 0.50);
  const color = existingRoom ? '#EF4444' : (ppm?.color || '#00BFA5');
  const tier = existingRoom ? 'Room Price' : (ppm?.tier || 'Standard');
  const runtime = (movie["runtime"] as number) || 120;
  const meterCap = existingRoom ? Math.round(runtime * rate) : (ppm?.meterCap || Math.round(runtime * rate));

  const cost = Math.round(selectedMinutes * rate * 100) / 100;
  const canAfford = walletBalance >= cost;
  const hasStream = (movie["hasStream"] as boolean) ?? true;

  const hours = Math.floor(runtime / 60);
  const mins = runtime % 60;
  const cast = (movie["cast"] as Array<{ name: string; character: string; photoUrl: string | null }>) || [];
  const director = movie["director"] as { name: string; photoUrl: string | null } | null;
  const genres = (movie["genres"] as Array<{ id: number; name: string }>) || [];
  const languages = (movie["languages"] as string[]) || [];
  const similar = (movie["similar"] as Array<Record<string, unknown>>) || [];
  const trailerKey = movie["trailerKey"] as string | null;

  // Minute presets
  const presets = [5, 15, 30, 60, runtime];

  return (
    <div className="-mt-14">
      {/* Backdrop — fixed parallax on desktop */}
      <div className="relative w-full aspect-[16/10] lg:aspect-auto lg:h-0">
        {movie["backdropUrl"] ? (
          <>
            <img
              src={movie["backdropUrl"] as string}
              alt={`${movie["title"] as string} movie backdrop`}
              className="absolute inset-0 w-full h-full object-cover lg:fixed lg:inset-0 lg:z-0"
              width={800}
              height={500}
            />
            {/* Desktop: darker overlay for readability */}
            <div className="hidden lg:block fixed inset-0 z-0 bg-black/50" />
          </>
        ) : (
          <div className="absolute inset-0 bg-[var(--bg-secondary)] lg:fixed lg:inset-0 lg:z-0" />
        )}
        {/* Mobile gradient */}
        <div className="absolute inset-0 lg:hidden" style={{
          background: 'linear-gradient(to top, #0E0E0E 0%, rgba(14,14,14,0.85) 20%, rgba(14,14,14,0.3) 60%, rgba(14,14,14,0.5) 100%)'
        }} />
        {/* Desktop gradient — stronger bottom fade for content */}
        <div className="hidden lg:block fixed inset-0 z-0" style={{
          background: 'linear-gradient(to top, #0E0E0E 0%, rgba(14,14,14,0.7) 40%, transparent 100%)'
        }} />
      </div>

      <div className="px-5 -mt-24 relative z-10 space-y-5 lg:max-w-[900px] lg:mx-auto lg:px-10 lg:mt-0 lg:pt-24">
        {/* Title */}
        <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-dm-serif), serif' }}>
            {movie["title"] as string}
          </h1>
          {movie["tagline"] ? <p className="text-[12px] italic mt-1" style={{ color }}>{String(movie["tagline"])}</p> : null}
          <div className="flex items-center gap-2 mt-2 text-[13px] text-[var(--text-secondary)] flex-wrap">
            <span>{movie["year"] as number}</span>
            <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
            <span>{hours}h {mins}m</span>
            <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
            <span className="flex items-center gap-0.5">
              <svg className="w-3.5 h-3.5 text-[var(--accent-gold)]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {movie["rating"] as number} <span className="text-[var(--text-muted)]">({movie["voteCount"] as number})</span>
            </span>
            {(movie["viewsFormatted"] as string) && (
              <>
                <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {movie["viewsFormatted"] as string}
                </span>
              </>
            )}
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            {genres.map((g) => (
              <span key={g.id} className="px-3 py-1 rounded-full bg-[var(--bg-tertiary)] text-[11px] font-medium text-[var(--text-secondary)]">{g.name}</span>
            ))}
          </div>
          <div className="flex gap-2 mt-1.5 flex-wrap">
            {languages.slice(0, 5).map((l) => (
              <span key={l} className="text-[11px] text-[var(--text-muted)]">{l}</span>
            ))}
          </div>
        </m.div>


        {/* Trailer */}
        {trailerKey && (
          <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}>
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?rel=0&modestbranding=1`}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                title={`${movie["title"] as string} - Official Trailer`}
              />
            </div>
          </m.div>
        )}

        {/* ── Live Rooms for this Movie ── */}
        <RoomListSection tmdbId={Number(slug)} />

        {/* ── Combined Pricing + Slider Card ── */}
        {roomsLoading ? (
          <Skeleton className="h-48 rounded-2xl" />
        ) : <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl border overflow-hidden"
          style={{ borderColor: `${color}15` }}
        >
          {/* Rate header */}
          <div className="p-4 pb-3" style={{ background: `${color}08` }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full animate-meter-pulse" style={{ backgroundColor: color }} />
                <span className="text-[12px] font-semibold" style={{ color }}>Pay-Per-Minute</span>
                <span className="px-1.5 py-[1px] rounded text-[9px] font-bold" style={{ background: `${color}20`, color }}>
                  {tier}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[22px] font-bold text-white">₹{rate}</span>
                <span className="text-[11px] text-[var(--text-muted)]">/min</span>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="p-1.5 rounded-lg bg-white/[0.04] text-center">
                <p className="text-[9px] text-[var(--text-muted)]">Full movie</p>
                <p className="text-[13px] font-bold text-white">~₹{meterCap}</p>
              </div>
              <div className="p-1.5 rounded-lg bg-white/[0.04] text-center">
                <p className="text-[9px] text-[var(--text-muted)]">30 min only</p>
                <p className="text-[13px] font-bold" style={{ color }}>~₹{Math.round(30 * rate)}</p>
              </div>
              <div className="p-1.5 rounded-lg text-center" style={{ background: 'rgba(245,166,35,0.08)' }}>
                <p className="text-[9px] text-[var(--accent-gold)]">Cap (max)</p>
                <p className="text-[13px] font-bold text-[var(--accent-gold)]">₹{meterCap}</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="section-divider" />

          {/* Minute picker */}
          <div className="p-4 pt-3 bg-[var(--bg-secondary)]">
            <p className="text-[12px] font-semibold text-white mb-2.5">Choose your watch time</p>

            {/* Presets */}
            <div className="flex gap-1.5 mb-3">
              {presets.map((min) => {
                const active = selectedMinutes === min;
                const isFull = min >= runtime;
                return (
                  <button
                    key={min}
                    onClick={() => setSelectedMinutes(min)}
                    className="flex-1 py-2 rounded-lg text-[11px] font-semibold transition-all active:scale-95"
                    style={{
                      background: active ? `${color}22` : 'rgba(255,255,255,0.03)',
                      borderWidth: 1,
                      borderColor: active ? `${color}50` : 'rgba(255,255,255,0.05)',
                      color: active ? color : 'var(--text-muted)',
                    }}
                  >
                    {isFull ? 'Full' : `${min}m`}
                    <span className="block text-[8px] font-normal mt-0.5" style={{ opacity: 0.6 }}>
                      ₹{isFull ? meterCap : Math.round(min * rate)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Slider */}
            <input
              type="range"
              min={1}
              max={runtime}
              value={selectedMinutes}
              onChange={(e) => setSelectedMinutes(Number(e.target.value))}
              className="w-full h-[6px] rounded-full appearance-none cursor-pointer mb-1"
              style={{
                background: `linear-gradient(to right, ${color} 0%, ${color} ${(selectedMinutes / runtime) * 100}%, rgba(255,255,255,0.08) ${(selectedMinutes / runtime) * 100}%)`,
              }}
            />
            <div className="flex justify-between text-[9px] text-[var(--text-muted)]">
              <span>1 min</span>
              <span className="font-medium" style={{ color }}>{selectedMinutes} min selected</span>
              <span>{runtime}m</span>
            </div>

            {/* Cost summary row */}
            <div className="mt-3 flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div>
                <p className="text-[10px] text-[var(--text-muted)]">{selectedMinutes} min × ₹{rate}</p>
                <p className="text-[20px] font-bold text-white leading-tight">
                  ₹{Math.min(cost, meterCap).toFixed(2)}
                </p>
                {cost > meterCap && (
                  <p className="text-[9px] text-[var(--accent-gold)]">capped at ₹{meterCap}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-[9px] text-[var(--text-muted)]">Wallet</p>
                <p className="text-[16px] font-bold leading-tight" style={{ color: canAfford ? 'var(--accent-teal)' : '#EF4444' }}>
                  ₹{walletBalance.toFixed(2)}
                </p>
                {!canAfford && (
                  <p className="text-[9px] text-red-400">Need ₹{(cost - walletBalance).toFixed(0)} more</p>
                )}
              </div>
            </div>

            {/* Don't worry notice */}
            <div className="flex items-start gap-2 mt-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
              <svg className="w-3.5 h-3.5 text-[var(--accent-teal)] shrink-0 mt-[1px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
                <span className="text-[var(--text-secondary)] font-medium">No hard stop.</span>{' '}
                You can continue watching beyond your selection. We&apos;ll notify you once the time is reached so you can choose to continue or stop.
              </p>
            </div>
          </div>
        </m.div>}

        {/* Host a Room + Watch Solo */}
        <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="space-y-2.5">
          {/* Join existing room OR Host a new one */}
          <RoomActionButton
            tmdbId={Number(slug)}
            movieTitle={movie["title"] as string}
            posterUrl={(movie["posterUrl"] as string) || ''}
            existingRooms={existingRooms}
            roomsLoading={roomsLoading}
            selectedMinutes={selectedMinutes}
            ratePerMin={rate}
          />

          {/* Watch Solo — only if stream URL exists */}
          {hasStream && (
            canAfford ? (
              <>
                <button
                  onClick={() => {
                    requireAuth(() => {
                      setWatchLoading(true);
                      const videoUrl = TMDB_PLAY_URL(slug);
                      setTimeout(() => {
                        router.push(`/watch/${slug}?title=${encodeURIComponent(movie["title"] as string)}&rate=${rate}&cap=${meterCap}&minutes=${selectedMinutes}&poster=${encodeURIComponent((movie["posterUrl"] as string) || '')}&video=${encodeURIComponent(videoUrl)}`);
                      }, 400);
                    });
                  }}
                  disabled={watchLoading}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white font-semibold text-[13px] transition-all active:scale-[0.97] disabled:opacity-80 border border-white/10 bg-white/[0.06]"
                >
                  {watchLoading ? (
                    <ButtonLoader variant="play" size={18} />
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  )}
                  {watchLoading ? 'Starting...' : `Watch Solo — ₹${Math.min(cost, meterCap).toFixed(2)}`}
                </button>
                <p className="text-[10px] text-[var(--text-muted)] text-center">
                  Meter pauses when you pause. Exit anytime.
                </p>
              </>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-white">
                    Need ₹{Math.ceil(cost - walletBalance)} more to watch solo
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                    Balance: ₹{walletBalance.toFixed(2)} — Cost: ₹{Math.min(cost, meterCap).toFixed(2)}
                  </p>
                </div>
                <Link
                  href="/wallet"
                  onClick={(e) => { e.preventDefault(); requireAuth(() => router.push('/wallet')); }}
                  className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[var(--accent-teal)] text-white text-[12px] font-semibold transition-all active:scale-95"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Top Up
                </Link>
              </div>
            )
          )}
        </m.div>

        {/* Synopsis */}
        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.25 }}>
          <h2 className="text-[14px] font-semibold text-white mb-2">Synopsis</h2>
          <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">{movie["overview"] as string}</p>
        </m.div>

        {/* Cast */}
        {cast.length > 0 && (
          <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <h2 className="text-[14px] font-semibold text-white mb-3">Cast & Crew</h2>
            {director && (
              <p className="text-[12px] text-[var(--text-muted)] mb-3">
                Directed by <span className="text-[var(--text-secondary)]">{director.name}</span>
              </p>
            )}
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {cast.map((person) => (
                <div key={person.name} className="shrink-0 text-center w-[72px]">
                  {person.photoUrl ? (
                    <img
                      src={person.photoUrl}
                      alt={`${person.name}, ${person.character}`}
                      width={56}
                      height={56}
                      className="w-14 h-14 rounded-full object-cover mx-auto mb-1.5 bg-[var(--bg-tertiary)]"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-[var(--bg-tertiary)] mx-auto mb-1.5 flex items-center justify-center">
                      <span className="text-[16px] font-bold text-[var(--text-muted)]">{person.name.charAt(0)}</span>
                    </div>
                  )}
                  <p className="text-[11px] font-medium text-[var(--text-primary)] line-clamp-1">{person.name}</p>
                  <p className="text-[9px] text-[var(--text-muted)] line-clamp-1">{person.character}</p>
                </div>
              ))}
            </div>
          </m.div>
        )}

        {/* Similar */}
        {similar.length > 0 && (
          <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.35 }}>
            <h2 className="text-[14px] font-semibold text-white mb-3">You Might Also Like</h2>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {similar.map((sm, i) => (
                <MovieCard key={sm['id'] as string || i} movie={sm as never} index={i} />
              ))}
            </div>
          </m.div>
        )}

        <div className="h-4" />
      </div>
    </div>
  );
}
