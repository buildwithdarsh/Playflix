'use client';

import Link from 'next/link';
import { m } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/cn';

export interface MovieCardData {
  id: string;
  slug: string;
  title: string;
  posterUrl: string | null;
  backdropUrl?: string | null;
  ppmTier: string;
  ppmRate?: number;
  ppmColor?: string;
  rating: number;
  year: number;
  language: string;
  durationMinutes?: number;
  overview?: string;
  genreIds?: number[];
  tmdbId?: number;
  hasStream?: boolean;
  viewsFormatted?: string;
}

interface MovieCardProps {
  movie: MovieCardData;
  index?: number;
  size?: 'default' | 'large';
  fluid?: boolean; // true = fills parent width (for grids)
}

export default function MovieCard({ movie, index = 0, size = 'default', fluid }: MovieCardProps) {
  const [loaded, setLoaded] = useState(false);
  const isLarge = size === 'large';

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className={cn('shrink-0', fluid ? 'w-full' : isLarge ? 'w-[160px] lg:w-[200px]' : 'w-[130px] lg:w-[170px]')}
    >
      <Link href={`/movie/${movie.slug}`} className="block group" style={{ touchAction: 'manipulation' }}>
        {/* Poster */}
        <div className={cn(
          'relative rounded-xl overflow-hidden mb-2 bg-[var(--bg-secondary)]',
          'shadow-[0_4px_20px_rgba(0,0,0,0.5)] ring-1 ring-white/[0.06]',
          isLarge ? 'aspect-[2/3]' : 'aspect-[2/3]'
        )}>
          {/* Shimmer */}
          {!loaded && <div className="absolute inset-0 animate-shimmer" />}

          {movie.posterUrl && (
            <img
              src={movie.posterUrl}
              alt={`${movie.title} movie poster`}
              width={isLarge ? 320 : 260}
              height={isLarge ? 480 : 390}
              className={cn(
                'w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.06]',
                loaded ? 'opacity-100' : 'opacity-0'
              )}
              loading="lazy"
              onLoad={() => setLoaded(true)}
            />
          )}

          {/* Bottom gradient */}
          <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {/* Duration pill — top left */}
          {movie.durationMinutes ? (
            <div className="absolute top-1.5 left-1.5">
              <span className="inline-flex items-center gap-[3px] px-[6px] py-[2px] rounded-[5px] backdrop-blur-md text-[9px] font-bold leading-tight bg-black/50 text-white/80 border border-white/10">
                {Math.floor(movie.durationMinutes / 60)}h {movie.durationMinutes % 60}m
              </span>
            </div>
          ) : null}

          {/* Rating — bottom left over gradient */}
          <div className="absolute bottom-1.5 left-1.5 flex items-center gap-[3px]">
            <svg className="w-[10px] h-[10px] text-[var(--accent-gold)]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-[10px] font-bold text-white drop-shadow-sm">{movie.rating}</span>
          </div>

          {/* Year — bottom right */}
          <div className="absolute bottom-1.5 right-1.5">
            <span className="text-[9px] font-medium text-white/60">{movie.year}</span>
          </div>

        </div>

        {/* Title + meta */}
        <h3 className="text-[12px] font-semibold text-[var(--text-primary)] line-clamp-2 leading-[1.3] group-hover:text-white transition-colors">
          {movie.title}
        </h3>
        <div className="flex items-center gap-1 mt-0.5 text-[10px] text-[var(--text-muted)] truncate">
          <span>{movie.language}</span>
          {movie.viewsFormatted && (
            <>
              <span className="w-[3px] h-[3px] rounded-full bg-[var(--text-muted)]/40 shrink-0" />
              <span>{movie.viewsFormatted} views</span>
            </>
          )}
        </div>
      </Link>
    </m.div>
  );
}
