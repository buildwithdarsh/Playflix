'use client';

import { useState, useEffect, useRef } from 'react';
import { LANGUAGES } from '@/lib/constants';
import { useSearch } from '@/hooks/useMovies';
import GenreGrid from '@/components/home/GenreGrid';
import MovieCard from '@/components/home/MovieCard';
import EmptyState from '@/components/ui/EmptyState';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const { results, loading, search } = useSearch();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      search(query);
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, search]);

  return (
    <div className="py-4 space-y-6 lg:max-w-[1000px] lg:mx-auto lg:px-10 lg:py-8">
      {/* Search input */}
      <div className="px-5">
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search movies, actors, directors..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] text-[var(--text-primary)] text-[14px] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-crimson)]/50 transition-colors"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
              <svg className="w-3 h-3 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {query.length >= 2 && results.length > 0 && (
        <div className="px-5">
          <p className="text-[11px] text-[var(--text-muted)] mb-3">{results.length} results for &ldquo;{query}&rdquo;</p>
          <div className="grid grid-cols-3 gap-x-2.5 gap-y-4">
            {results.map((movie, i) => (
              <MovieCard key={movie.id} movie={movie} index={i} fluid />
            ))}
          </div>
        </div>
      )}

      {query.length >= 2 && !loading && results.length === 0 && (
        <EmptyState variant="no-results" title={`No results for "${query}"`} description="Try a different search term or browse by genre below." />
      )}

      {loading && query.length >= 2 && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[var(--accent-teal)]/30 border-t-[var(--accent-teal)] rounded-full animate-spin" />
        </div>
      )}

      {/* Browse when not searching */}
      {query.length < 2 && (
        <>
          <GenreGrid />
          <section className="px-5">
            <h3 className="text-[15px] font-bold text-white mb-3">By Language</h3>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <button key={lang} onClick={() => setQuery(lang)} className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08] text-[13px] font-medium text-white/70 hover:text-white hover:border-white/[0.15] transition-all">
                  {lang}
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
