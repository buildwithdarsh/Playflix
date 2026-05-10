'use client';

import Link from 'next/link';
import { useMovies } from '@/hooks/useMovies';
import MovieCard from './MovieCard';
import Skeleton from '@/components/Skeleton';

export default function LiveRoomRow() {
  const { movies, loading } = useMovies('trending');

  // Only show movies that have a GDrive stream link
  const streamableMovies = movies.filter((m) => m.hasStream);

  if (!loading && streamableMovies.length === 0) return null;

  return (
    <section className="space-y-2.5">
      <div className="flex items-end justify-between px-5 lg:px-10 lg:max-w-[1400px] lg:mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--accent-sync)] animate-pulse-live" />
          <h2 className="text-[16px] font-bold text-white tracking-tight leading-tight">Trending Now</h2>
        </div>
        <Link
          href="/live"
          className="text-[11px] font-semibold text-[var(--accent-sync)] hover:text-[var(--accent-sync-hover)] flex items-center gap-0.5 shrink-0 ml-4"
        >
          See All
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      </div>

      <div className="flex gap-2.5 lg:gap-4 overflow-x-auto scrollbar-hide px-5 lg:px-10 lg:max-w-[1400px] lg:mx-auto pb-1" style={{ minHeight: 230 }}>
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={`shrink-0 w-[130px] lg:w-[170px] ${i >= 4 ? 'hidden lg:block' : ''}`}>
              <Skeleton className="aspect-[2/3] rounded-xl mb-2" />
              <Skeleton className="h-3 w-4/5 rounded" />
              <Skeleton className="h-2.5 w-3/5 rounded mt-1" />
            </div>
          ))
        ) : (
          streamableMovies.map((movie, i) => (
            <MovieCard key={movie.id} movie={movie} index={i} />
          ))
        )}
      </div>
    </section>
  );
}
