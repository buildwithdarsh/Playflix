'use client';

import { useState, useEffect, useCallback } from 'react';
import type { MovieCardData } from '@/components/home/MovieCard';
import { TZ } from '@/lib/tz';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TMDB_METHODS: Record<string, (page?: number) => PromiseLike<any>> = {
  popular: (p) => TZ.storefront.tmdb.popular(p),
  trending: () => TZ.storefront.tmdb.trending(),
  bollywood: (p) => TZ.storefront.tmdb.bollywood(p),
  hollywood: (p) => TZ.storefront.tmdb.hollywood(p),
  tamil: (p) => TZ.storefront.tmdb.tamil(p),
  telugu: (p) => TZ.storefront.tmdb.telugu(p),
};

function mapMovie(m: Record<string, unknown>): MovieCardData | null {
  const tmdbId = (m['tmdbId'] as number) || 0;
  const posterUrl = (m['posterUrl'] as string) || null;
  if (!posterUrl || !tmdbId) return null;

  const ppm = m['ppm'] as { tier?: string; ratePerMin?: number; color?: string } | undefined;

  return {
    id: String(tmdbId),
    slug: String(tmdbId),
    tmdbId,
    title: (m['title'] as string) || '',
    posterUrl,
    backdropUrl: (m['backdropUrl'] as string) || null,
    rating: (m['rating'] as number) || 0,
    year: (m['year'] as number) || 0,
    language: (m['language'] as string) || '',
    ppmTier: ppm?.tier || 'Standard',
    ppmRate: ppm?.ratePerMin || 0.50,
    ppmColor: ppm?.color || '#00BFA5',
    durationMinutes: (m['runtime'] as number) || 0,
    overview: (m['overview'] as string) || '',
    genreIds: (m['genreIds'] as number[]) || [],
    hasStream: (m['hasStream'] as boolean) ?? true,
    viewsFormatted: (m['viewsFormatted'] as string) || '',
  };
}

function extractMovies(payload: unknown): MovieCardData[] {
  if (Array.isArray(payload)) {
    return payload.map((m) => mapMovie(m as Record<string, unknown>)).filter(Boolean) as MovieCardData[];
  }
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj['data'])) {
      return (obj['data'] as Record<string, unknown>[]).map(mapMovie).filter(Boolean) as MovieCardData[];
    }
  }
  return [];
}

export function useMovies(type: string, page = 1) {
  const [movies, setMovies] = useState<MovieCardData[]>([]);
  const [totalPages, setTotalPages] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const method = TMDB_METHODS[type];
    const promise = Promise.resolve(method ? method(page) : TZ.storefront.tmdb.popular(page));

    promise
      .then((payload: unknown) => {
        setMovies(extractMovies(payload));
        if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
          setTotalPages((payload as Record<string, unknown>)['totalPages'] as number | undefined);
        }
      })
      .catch(() => setMovies([]))
      .finally(() => setLoading(false));
  }, [type, page]);

  return { movies, totalPages, loading };
}

export function useMovieDetail(tmdbId: string) {
  const [movie, setMovie] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tmdbId || tmdbId === 'undefined') { setLoading(false); return; }
    setLoading(true);

    TZ.storefront.tmdb.getDetail(Number(tmdbId))
      .then((data: unknown) => setMovie(data as Record<string, unknown>))
      .catch(() => setMovie(null))
      .finally(() => setLoading(false));
  }, [tmdbId]);

  return { movie, loading };
}

export function useSearch() {
  const [results, setResults] = useState<MovieCardData[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (query: string) => {
    if (!query || query.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const payload = await TZ.storefront.tmdb.search(query);
      setResults(extractMovies(payload));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, search };
}
