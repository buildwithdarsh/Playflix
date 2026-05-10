'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { m, AnimatePresence } from 'framer-motion';
import { useRoomStore } from '@/store/room';
import { useAuthStore } from '@/store/auth';
import { extractGdriveFileId, isValidGdriveInput } from '@/lib/gdrive';
import { ROOM_VIBES } from '@/lib/constants';
import { useToastStore } from '@/store/toast';
import type { RoomPrivacy, RoomVibe } from '@/lib/types/room';

type Step = 'movie' | 'setup';

export default function CreateRoomClient() {
  const router = useRouter();
  const params = useSearchParams();
  const createRoom = useRoomStore((s) => s.createRoom);
  const requireAuth = useAuthStore((s) => s.requireAuth);
  const user = useAuthStore((s) => s.user);

  const [step, setStep] = useState<Step>(params.get('tmdbId') ? 'setup' : 'movie');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const showToast = useToastStore((s) => s.show);

  // Form state
  const [movieTitle, setMovieTitle] = useState(params.get('title') || '');
  const [tmdbId, setTmdbId] = useState(Number(params.get('tmdbId')) || 0);
  const [posterUrl, setPosterUrl] = useState(params.get('poster') || '');
  const [gdriveLink, setGdriveLink] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [privacy, setPrivacy] = useState<RoomPrivacy>('public');
  const [vibe, setVibe] = useState<RoomVibe>('chill');
  const [ratePaise, setRatePaise] = useState(50);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ tmdbId: number; title: string; year: number; posterUrl: string | null }>>([]);
  const [searching, setSearching] = useState(false);

  const gdriveFileId = extractGdriveFileId(gdriveLink);
  const isGdriveValid = isValidGdriveInput(gdriveLink);
  const canGoLive = isGdriveValid && (roomName.trim().length > 0);

  const handleSearch = async () => {
    if (searchQuery.length < 2) return;
    setSearching(true);
    try {
      const { TZ } = await import('@/lib/tz');
      const results = await TZ.storefront.tmdb.search(searchQuery);
      const list = Array.isArray(results) ? results : (results as { results?: unknown[] }).results || [];
      setSearchResults(
        (list as Array<Record<string, unknown>>)
          .filter((m) => m['posterUrl'] || m['poster_path'])
          .slice(0, 8)
          .map((m) => ({
            tmdbId: (m['tmdbId'] || m['id']) as number,
            title: (m['title'] || m['name']) as string,
            year: m['year'] as number || new Date((m['release_date'] as string) || '').getFullYear(),
            posterUrl: (m['posterUrl'] || (m['poster_path'] ? `https://image.tmdb.org/t/p/w200${m['poster_path']}` : null)) as string | null,
          }))
      );
    } catch {
      setSearchResults([]);
    }
    setSearching(false);
  };

  const selectMovie = (movie: typeof searchResults[0]) => {
    setTmdbId(movie.tmdbId);
    setMovieTitle(movie.title);
    setPosterUrl(movie.posterUrl || '');
    setRoomName(`${movie.title} Night`);
    setStep('setup');
  };

  const handleCreate = async () => {
    if (!user) {
      requireAuth(() => handleCreate());
      return;
    }

    setIsSubmitting(true);
    try {
      const room = await createRoom({
        tmdbId,
        movieTitle,
        posterUrl,
        gdriveFileId,
        name: roomName || `${movieTitle} Room`,
        privacy,
        vibe,
        ratePerMinPaise: ratePaise,
      });

      if (room) {
        router.push(`/room/${room.id}`);
      }
    } catch (err) {
      const message = (err as { message?: string })?.message || '';
      if (message.includes('already exists') || (err as { status?: number })?.status === 409) {
        showToast('A room already exists for this movie. Join it instead!', 'error');
        // Navigate to movie detail where they can see the existing room
        router.push(`/movie/${tmdbId}`);
      } else if (message.includes('Connect Google Drive')) {
        showToast('Connect your Google Drive first', 'error');
        router.push('/profile');
      } else {
        showToast(message || 'Failed to create room', 'error');
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-5 py-4 min-h-[80vh] lg:max-w-[800px] lg:mx-auto lg:py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-white">Host a Room</h1>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1.5 mb-6">
        <div className="h-1 rounded-full flex-1" style={{ background: 'var(--accent-sync)' }} />
        <div className="h-1 rounded-full flex-1 transition-colors duration-300" style={{ background: step === 'setup' ? 'var(--accent-sync)' : 'rgba(255,255,255,0.08)' }} />
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Movie Selection */}
        {step === 'movie' && (
          <m.div key="movie" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <h2 className="text-[15px] font-semibold text-white">Which movie are you hosting?</h2>

            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search movies..."
                className="flex-1 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] text-white text-[14px] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent-sync)]/40"
              />
              <button
                onClick={handleSearch}
                disabled={searchQuery.length < 2 || searching}
                className="px-4 rounded-xl bg-[var(--accent-sync)] text-white text-[13px] font-semibold disabled:opacity-50"
              >
                {searching ? '...' : 'Search'}
              </button>
            </div>

            <div className="space-y-2">
              {searchResults.map((movie) => (
                <button
                  key={movie.tmdbId}
                  onClick={() => selectMovie(movie)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] hover:border-[var(--accent-sync)]/30 transition-colors text-left"
                >
                  {movie.posterUrl && (
                    <img src={movie.posterUrl} alt={`${movie.title} poster`} width={40} height={56} className="w-10 h-14 rounded-lg object-cover" loading="lazy" />
                  )}
                  <div>
                    <p className="text-[14px] font-medium text-white">{movie.title}</p>
                    <p className="text-[12px] text-[var(--text-muted)]">{movie.year}</p>
                  </div>
                </button>
              ))}
            </div>
          </m.div>
        )}

        {/* Step 2: Setup — GDrive + Settings + Go Live (all in one) */}
        {step === 'setup' && (
          <m.div key="setup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            {/* Movie info */}
            <div className="flex items-center gap-3">
              {posterUrl && <img src={posterUrl} alt={`${movieTitle} poster`} width={48} height={64} className="w-12 h-16 rounded-lg object-cover" loading="lazy" />}
              <div>
                <h2 className="text-[15px] font-semibold text-white">{movieTitle}</h2>
                <button onClick={() => setStep('movie')} className="text-[11px] text-[var(--accent-sync)]">Change movie</button>
              </div>
            </div>

            {/* GDrive Link */}
            <div className="space-y-1.5">
              <label className="text-[12px] text-[var(--text-muted)] font-medium">Google Drive Link</label>
              {gdriveLink && isGdriveValid ? (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/8 border border-green-500/20">
                  <svg className="w-4 h-4 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-[12px] text-green-400 flex-1 truncate">{selectedFileName || gdriveFileId.slice(0, 24)}</span>
                  <button onClick={() => { setGdriveLink(''); setSelectedFileName(''); }} className="text-[11px] text-[var(--text-muted)]">Change</button>
                </div>
              ) : (
                <input
                  type="url"
                  value={gdriveLink}
                  onChange={(e) => setGdriveLink(e.target.value)}
                  placeholder="Paste Google Drive link or file ID"
                  className="w-full p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] text-white text-[14px] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent-sync)]/40"
                />
              )}
            </div>

            {/* Room Name */}
            <div className="space-y-1.5">
              <label className="text-[12px] text-[var(--text-muted)] font-medium">Room Name</label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="e.g. Epic Dune Night"
                maxLength={60}
                className="w-full p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] text-white text-[14px] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent-sync)]/40"
              />
            </div>

            {/* Privacy */}
            <div className="space-y-1.5">
              <label className="text-[12px] text-[var(--text-muted)] font-medium">Privacy</label>
              <div className="flex gap-2">
                {(['public', 'private'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPrivacy(p)}
                    className={`flex-1 py-2.5 rounded-xl text-[12px] font-semibold border transition-colors ${
                      privacy === p
                        ? 'bg-[var(--accent-sync)]/15 border-[var(--accent-sync)]/30 text-[var(--accent-sync)]'
                        : 'bg-[var(--bg-secondary)] border-[var(--glass-border)] text-[var(--text-muted)]'
                    }`}
                  >
                    {p === 'public' ? 'Public' : 'Private (Link Only)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Vibe */}
            <div className="space-y-1.5">
              <label className="text-[12px] text-[var(--text-muted)] font-medium">Vibe</label>
              <div className="flex gap-2 flex-wrap">
                {ROOM_VIBES.map((v) => (
                  <button
                    key={v.slug}
                    onClick={() => setVibe(v.slug as RoomVibe)}
                    className={`px-3.5 py-2 rounded-xl text-[12px] font-semibold border transition-colors ${
                      vibe === v.slug
                        ? 'bg-[var(--accent-solo)]/15 border-[var(--accent-solo)]/30 text-[var(--accent-solo)]'
                        : 'bg-[var(--bg-secondary)] border-[var(--glass-border)] text-[var(--text-muted)]'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[12px] text-[var(--text-muted)] font-medium">Price Per Minute</label>
                <span className="text-[14px] font-bold text-[var(--accent-teal)]">
                  {ratePaise === 0 ? 'Free' : `₹${(ratePaise / 100).toFixed(1)}`}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1000}
                step={10}
                value={ratePaise}
                onChange={(e) => setRatePaise(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, var(--accent-teal) 0%, var(--accent-teal) ${ratePaise / 10}%, var(--bg-tertiary) ${ratePaise / 10}%, var(--bg-tertiary) 100%)`,
                }}
              />
              <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                <span>Free</span>
                <span>₹5/min</span>
                <span>₹10/min</span>
              </div>
            </div>

            {/* Earnings estimate */}
            {ratePaise > 0 && (
              <div className="p-3 rounded-xl bg-[var(--accent-teal)]/8 border border-[var(--accent-teal)]/15">
                <p className="text-[11px] text-[var(--accent-teal)]">
                  You earn 70% of viewer spend. 10 viewers x 60 min at ₹{(ratePaise / 100).toFixed(1)}/min = ₹{((ratePaise / 100) * 60 * 10 * 0.7).toFixed(0)} earned.
                </p>
              </div>
            )}
            {ratePaise === 0 && (
              <p className="text-[11px] text-[var(--accent-teal)]">Free room — great for building audience!</p>
            )}

            {/* Go Live button */}
            <button
              onClick={handleCreate}
              disabled={!canGoLive || isSubmitting}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[var(--accent-sync)] text-white font-bold text-[14px] disabled:opacity-40 active:scale-[0.97] transition-transform glow-sync"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Room...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                  </svg>
                  Go Live
                </>
              )}
            </button>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
