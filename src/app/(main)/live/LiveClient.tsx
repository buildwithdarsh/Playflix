'use client';

import { useMovies } from '@/hooks/useMovies';
import MovieCard from '@/components/home/MovieCard';
import Skeleton from '@/components/Skeleton';

export default function LiveClient() {
  const { movies, loading } = useMovies('trending');

  // Only movies that have a GDrive stream link
  const streamableMovies = movies.filter((m) => m.hasStream);

  return (
    <div className="px-5 py-4 space-y-5 lg:max-w-[1000px] lg:mx-auto lg:py-8">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-sync)] animate-pulse-live" />
        <h1 className="text-xl font-bold text-white">Trending Now</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i}>
              <Skeleton className="aspect-[2/3] rounded-xl mb-2" />
              <Skeleton className="h-3 w-4/5 rounded" />
              <Skeleton className="h-2.5 w-3/5 rounded mt-1" />
            </div>
          ))}
        </div>
      ) : streamableMovies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          {/* Animated empty state illustration */}
          <svg width="180" height="160" viewBox="0 0 180 160" fill="none" className="mb-6">
            {/* TV/Monitor body */}
            <rect x="30" y="20" width="120" height="80" rx="8" fill="#1A1A1A" stroke="#333" strokeWidth="1.5">
              <animate attributeName="opacity" values="0;1" dur="0.5s" fill="freeze" />
            </rect>

            {/* Screen */}
            <rect x="38" y="28" width="104" height="64" rx="4" fill="#111">
              <animate attributeName="opacity" values="0;1" dur="0.4s" fill="freeze" begin="0.2s" />
            </rect>

            {/* Play button on screen */}
            <circle cx="90" cy="60" r="16" fill="none" stroke="#EF4444" strokeWidth="1.5" opacity="0">
              <animate attributeName="opacity" values="0;0.6;0.3;0.6" dur="2.5s" repeatCount="indefinite" begin="0.6s" />
              <animate attributeName="r" values="14;17;14" dur="2.5s" repeatCount="indefinite" begin="0.6s" />
            </circle>
            <path d="M84 51v18l14-9-14-9z" fill="#EF4444" opacity="0">
              <animate attributeName="opacity" values="0;0.5;0.3;0.5" dur="2.5s" repeatCount="indefinite" begin="0.6s" />
            </path>

            {/* Signal waves from TV */}
            <path d="M155 40 C165 40 165 55 155 55" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0">
              <animate attributeName="opacity" values="0;0.5;0" dur="2s" repeatCount="indefinite" begin="0.8s" />
            </path>
            <path d="M160 35 C175 35 175 60 160 60" stroke="#8B5CF6" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0">
              <animate attributeName="opacity" values="0;0.3;0" dur="2s" repeatCount="indefinite" begin="1.2s" />
            </path>

            {/* TV Stand */}
            <line x1="75" y1="100" x2="60" y2="120" stroke="#444" strokeWidth="2" strokeLinecap="round">
              <animate attributeName="opacity" values="0;1" dur="0.3s" fill="freeze" begin="0.4s" />
            </line>
            <line x1="105" y1="100" x2="120" y2="120" stroke="#444" strokeWidth="2" strokeLinecap="round">
              <animate attributeName="opacity" values="0;1" dur="0.3s" fill="freeze" begin="0.4s" />
            </line>

            {/* Floating dots / stars */}
            {[
              { cx: 20, cy: 30, r: 1.5, delay: 1 },
              { cx: 165, cy: 75, r: 1, delay: 1.5 },
              { cx: 15, cy: 80, r: 1.2, delay: 2 },
              { cx: 170, cy: 25, r: 0.8, delay: 0.8 },
            ].map((p, i) => (
              <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill="white" opacity="0">
                <animate attributeName="opacity" values="0;0.4;0" dur="3s" repeatCount="indefinite" begin={`${p.delay}s`} />
              </circle>
            ))}
          </svg>

          <p className="text-[15px] font-semibold text-white/60">No streams yet</p>
          <p className="text-[12px] text-[var(--text-muted)] mt-1 text-center px-8">
            Movies with Google Drive links will appear here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {streamableMovies.map((movie, i) => (
            <MovieCard key={movie.id} movie={movie} index={i} fluid />
          ))}
        </div>
      )}
    </div>
  );
}
