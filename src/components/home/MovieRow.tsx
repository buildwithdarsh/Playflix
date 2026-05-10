'use client';

import Link from 'next/link';
import MovieCard, { type MovieCardData } from './MovieCard';
import Skeleton from '@/components/Skeleton';
import { cn } from '@/lib/cn';

interface MovieRowProps {
  title: string;
  subtitle?: string;
  movies: MovieCardData[];
  seeAllHref?: string;
  loading?: boolean;
  size?: 'default' | 'large';
}

export default function MovieRow({ title, subtitle, movies, seeAllHref, loading, size }: MovieRowProps) {
  const isLarge = size === 'large';
  if (!loading && movies.length === 0) return null;

  return (
    <section className="space-y-2.5 lg:space-y-4">
      <div className="flex items-end justify-between px-5 lg:px-10 lg:max-w-[1400px] lg:mx-auto">
        <div>
          <h2 className="text-[16px] lg:text-[20px] font-bold text-white tracking-tight leading-tight">{title}</h2>
          {subtitle && (
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{subtitle}</p>
          )}
        </div>
        {seeAllHref && (
          <Link
            href={seeAllHref}
            className="text-[11px] font-semibold text-[var(--accent-teal)] hover:text-[var(--accent-teal-hover)] flex items-center gap-0.5 shrink-0 ml-4"
          >
            See All
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        )}
      </div>

      <div className="flex gap-2.5 lg:gap-4 overflow-x-auto scrollbar-hide px-5 lg:px-10 lg:max-w-[1400px] lg:mx-auto pb-1" style={{ minHeight: isLarge ? 280 : 230 }}>
        {loading ? (
          <>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={cn(
                'shrink-0',
                isLarge ? 'w-[160px] lg:w-[200px]' : 'w-[130px] lg:w-[170px]',
                i >= 4 ? 'hidden lg:block' : ''
              )}>
                <Skeleton className="aspect-[2/3] rounded-xl mb-2" />
                <Skeleton className="h-3 w-4/5 rounded" />
                <Skeleton className="h-2.5 w-3/5 rounded mt-1" />
              </div>
            ))}
          </>
        ) : (
          movies.map((movie, i) => (
            <MovieCard key={movie.id} movie={movie} index={i} {...(size ? { size } : {})} />
          ))
        )}
      </div>
    </section>
  );
}
