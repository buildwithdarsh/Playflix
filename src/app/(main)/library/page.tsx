'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { useHistoryStore } from '@/store/history';
import { useAuthStore } from '@/store/auth';
import EmptyState from '@/components/ui/EmptyState';

const TABS = ['Watch History', 'Watchlist'] as const;

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('Watch History');
  const { sessions, beHistory, beLoading, beFetched, fetchHistory } = useHistoryStore();
  const user = useAuthStore((s) => s.user);

  // Fetch BE history on mount if logged in
  useEffect(() => {
    if (user && !beFetched) fetchHistory();
  }, [user, beFetched, fetchHistory]);

  // Merge: BE history takes priority, local sessions fill gaps
  const mergedHistory = (() => {
    if (beHistory.length > 0) {
      return beHistory.map((s) => ({
        movieId: String(s.tmdbId),
        movieTitle: s.movieTitle,
        posterUrl: null as string | null,
        minutesWatched: Math.round(s.minutesBilled || 0),
        totalSpend: (s.totalBilledPaise || 0) / 100,
        hitFreeZone: s.status === 'capped',
        timestamp: new Date(s.startedAt).getTime(),
        rating: s.rating ?? undefined,
      }));
    }
    return sessions;
  })();

  return (
    <div className="px-5 py-4 space-y-4 lg:max-w-[800px] lg:mx-auto lg:py-8">
      <h1 className="text-xl font-bold text-white">My Library</h1>

      <div className="flex gap-1 bg-[var(--bg-secondary)] rounded-xl p-1">
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn('flex-1 py-2.5 rounded-lg text-[12px] font-semibold transition-all',
              activeTab === tab ? 'bg-[var(--accent-crimson)] text-white shadow-md' : 'text-[var(--text-muted)]'
            )}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Watch History' && beLoading && (
        <div className="flex items-center justify-center py-12">
          <svg className="w-5 h-5 animate-spin text-white/30" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      )}

      {activeTab === 'Watch History' && !beLoading && mergedHistory.length > 0 && (
        <div className="space-y-2">
          {mergedHistory.map((session, i) => (
            <Link key={`${session.movieId}-${session.timestamp}-${i}`} href={`/movie/${session.movieId}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-[var(--glass-border)] hover:border-white/[0.1] transition-colors"
            >
              {session.posterUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={session.posterUrl} alt={`${session.movieTitle} poster`} width={48} height={64} className="w-12 h-16 rounded-lg object-cover bg-[var(--bg-tertiary)] shrink-0" />
              ) : (
                <div className="w-12 h-16 rounded-lg bg-[var(--bg-tertiary)] shrink-0 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[var(--text-muted)]" fill="currentColor" viewBox="0 0 24 24"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" /></svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-white truncate capitalize">{session.movieTitle}</p>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  {session.minutesWatched} min watched
                  <span className="mx-1.5 text-[var(--text-muted)]/40">|</span>
                  ₹{(session.totalSpend ?? 0).toFixed(2)} spent
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {session.hitFreeZone && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[var(--accent-gold)]/15 text-[var(--accent-gold)]">FREE ZONE</span>
                  )}
                  {session.rating && (
                    <span className="flex items-center gap-0.5 text-[10px] text-[var(--accent-gold)]">
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      {session.rating}
                    </span>
                  )}
                  <span className="text-[10px] text-[var(--text-muted)]/50">
                    {new Date(session.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>
              <svg className="w-4 h-4 text-[var(--text-muted)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          ))}
        </div>
      )}

      {activeTab === 'Watch History' && !beLoading && mergedHistory.length === 0 && (
        <EmptyState variant="library" title="No watch history yet" description="Movies you watch will appear here with your spend, minutes, and ratings." actionLabel="Browse Movies" actionHref="/" />
      )}

      {activeTab === 'Watchlist' && (
        <EmptyState variant="watchlist" title="Your watchlist is empty" description="Tap the heart on any movie to save it here." actionLabel="Discover Movies" actionHref="/" />
      )}
    </div>
  );
}
