'use client';

import { useMovies } from '@/hooks/useMovies';
import HeroBanner from '@/components/home/HeroBanner';
import MovieRow from '@/components/home/MovieRow';
import LiveRoomRow from '@/components/home/LiveRoomRow';
import GenreGrid from '@/components/home/GenreGrid';
import MoodPills from '@/components/home/MoodPills';
import Skeleton from '@/components/Skeleton';

export default function HomeClient() {
  const { movies: popular, loading: lp } = useMovies('popular');
  const { movies: trending, loading: lt } = useMovies('trending');
  const { movies: bollywood, loading: lb } = useMovies('bollywood');
  const { movies: hollywood, loading: lh } = useMovies('hollywood');

  const heroBanners = popular.slice(0, 4).map((m) => ({
    id: m.id,
    title: m.title,
    subtitle: `${m.ppmTier} — ₹${m.ppmRate || 0.5}/min${m.durationMinutes ? ` — ~₹${Math.round((m.durationMinutes) * (m.ppmRate || 0.5))} full movie` : ''}`,
    imageUrl: m.backdropUrl || m.posterUrl || '',
    slug: m.slug,
  }));

  return (
    <div className="space-y-6 -mt-14">
      {/* Hero */}
      {lp ? (
        <div className="w-full hero-banner">
          <Skeleton className="w-full h-full rounded-none" />
        </div>
      ) : (
        <HeroBanner banners={heroBanners} />
      )}

      {/* PPM info strip */}
      <section className="px-5 lg:px-10 lg:max-w-[1400px] lg:mx-auto">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--accent-teal)]/[0.06] border border-[var(--accent-teal)]/[0.12]">
          <div className="w-9 h-9 rounded-lg bg-[var(--accent-teal)]/[0.12] flex items-center justify-center shrink-0">
            <svg className="w-[18px] h-[18px] text-[var(--accent-teal)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-white leading-tight">Pay only for what you watch</p>
            <p className="text-[10px] text-[var(--text-muted)] leading-tight mt-0.5">
              Meter pauses when you pause. Never pay for a movie you didn&apos;t finish.
            </p>
          </div>
        </div>
      </section>

      {/* Live Rooms */}
      <LiveRoomRow />

      {/* Rows */}
      <MovieRow title="Popular in India" subtitle="What everyone is watching right now" movies={popular} loading={lp} seeAllHref="/genre/popular" size="large" />

      <MovieRow title="Trending This Week" subtitle="Most-watched by minutes" movies={trending} loading={lt} seeAllHref="/genre/trending" />

      <MoodPills />

      <MovieRow title="Bollywood" subtitle="Latest Hindi blockbusters" movies={bollywood} loading={lb} seeAllHref="/genre/bollywood" />

      <MovieRow title="Hollywood" subtitle="Award winners & fan favourites" movies={hollywood} loading={lh} seeAllHref="/genre/hollywood" />

      <GenreGrid />

      {/* Budget row — filter movies under ₹0.40/min */}
      <MovieRow
        title="Budget Friendly"
        subtitle="Quality movies from ₹0.25/min"
        movies={[...popular, ...bollywood].filter((m) => (m.ppmRate || 0.5) <= 0.40)}
        seeAllHref="/genre/budget"
      />

      {/* Desktop footer */}
      <footer className="hidden lg:block border-t border-white/[0.06] mt-12">
        <div className="max-w-[1400px] mx-auto px-10 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#E8004D] to-[#FF4D6D] flex items-center justify-center">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                <path d="M9.5 7.2v9.6c0 .7.8 1.1 1.3.7l6.5-4.8c.4-.3.4-1 0-1.3L10.8 6.5c-.5-.4-1.3 0-1.3.7z" fill="white"/>
              </svg>
            </div>
            <span className="text-[13px] font-semibold text-white/50">
              Play<span className="text-[#E8004D]/60">Flix</span>
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)]">
            Stream together. Pay only for what you watch.
          </p>
        </div>
      </footer>

      <div className="h-4 lg:h-0" />
    </div>
  );
}
