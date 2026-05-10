'use client';

import { useState, useEffect, useCallback } from 'react';
import { TZ } from '@/lib/tz';

interface StreamMapping {
  tmdbId: number;
  title: string;
  gdriveFileId: string;
  source: string;
  enabled: boolean;
  updatedAt: string;
}

interface TmdbSearchResult {
  tmdbId: number;
  title: string;
  posterUrl: string | null;
  rating: number;
  year: number;
  language: string;
  ppm: { tier: string; ratePerMin: number; color: string };
}

export default function AdminMoviesPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [mappings, setMappings] = useState<StreamMapping[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TmdbSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<TmdbSearchResult | null>(null);
  const [gdriveFileId, setGdriveFileId] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingMappings, setLoadingMappings] = useState(true);

  // Check if super admin is already logged in
  useEffect(() => {
    if (TZ.superAdmin.auth.getToken()) {
      setLoggedIn(true);
    } else {
      setLoadingMappings(false);
    }
  }, []);

  // Login as super admin
  const handleLogin = async () => {
    setLoggingIn(true);
    setLoginError('');
    try {
      await TZ.superAdmin.auth.login({ email, password });
      setLoggedIn(true);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    TZ.superAdmin.auth.clearToken();
    setLoggedIn(false);
    setMappings([]);
  };

  // Load existing mappings
  const loadMappings = useCallback(async () => {
    if (!loggedIn) return;
    setLoadingMappings(true);
    try {
      const data = await TZ.superAdmin.movies.listStreamMappings();
      setMappings((data as StreamMapping[]) || []);
    } catch {
      handleLogout();
    } finally {
      setLoadingMappings(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedIn]);

  useEffect(() => { if (loggedIn) loadMappings(); }, [loggedIn, loadMappings]);

  // Search TMDB (public)
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const data = await TZ.storefront.tmdb.search(searchQuery);
      const results = Array.isArray(data) ? data : (data as unknown as { results?: TmdbSearchResult[]; data?: TmdbSearchResult[] })?.results || (data as unknown as { data?: TmdbSearchResult[] })?.data || [];
      setSearchResults(results as TmdbSearchResult[]);
    } catch {
      // ignore
    } finally {
      setSearching(false);
    }
  };

  // Save mapping
  const handleSave = async () => {
    if (!selectedMovie || !gdriveFileId.trim()) return;
    setSaving(true);
    try {
      await TZ.superAdmin.movies.upsertStreamMapping({
        tmdbId: selectedMovie.tmdbId,
        title: selectedMovie.title,
        gdriveFileId: gdriveFileId.trim(),
        source: 'gdrive',
      });
      setSelectedMovie(null);
      setGdriveFileId('');
      setSearchResults([]);
      setSearchQuery('');
      loadMappings();
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  // Delete mapping
  const handleDelete = async (tmdbId: number) => {
    if (!confirm('Remove this stream mapping?')) return;
    try {
      await TZ.superAdmin.movies.removeStreamMapping(tmdbId);
      loadMappings();
    } catch {
      // ignore
    }
  };

  // Extract GDrive file ID from URL
  const extractFileId = (input: string): string => {
    const patterns = [
      /\/file\/d\/([a-zA-Z0-9_-]+)/,
      /id=([a-zA-Z0-9_-]+)/,
      /\/open\?id=([a-zA-Z0-9_-]+)/,
    ];
    for (const p of patterns) {
      const match = input.match(p);
      if (match?.[1]) return match[1];
    }
    return input;
  };

  // ─── Login Screen ──────────────────────────────────────────────────────────
  if (!loggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-5">
        <div className="w-full max-w-sm space-y-5">
          <div className="text-center">
            <h1 className="text-xl font-bold text-white">Admin Login</h1>
            <p className="text-[12px] text-[var(--text-muted)] mt-1">Movie Stream Manager</p>
          </div>

          <div className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Email"
              className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] text-white text-[14px] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent-teal)]/40"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Password"
              className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] text-white text-[14px] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent-teal)]/40"
            />
            {loginError && (
              <p className="text-[12px] text-red-400">{loginError}</p>
            )}
            <button
              onClick={handleLogin}
              disabled={loggingIn || !email || !password}
              className="w-full py-3 rounded-xl bg-[var(--accent-crimson)] text-white font-semibold text-[14px] disabled:opacity-50"
            >
              {loggingIn ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Admin Dashboard ──────────────────────────────────────────────────────
  return (
    <div className="px-5 py-6 space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Movie Stream Manager</h1>
          <p className="text-[12px] text-[var(--text-muted)] mt-1">
            Map TMDB movies to Google Drive video files
          </p>
        </div>
        <button onClick={handleLogout} className="text-[11px] text-[var(--text-muted)] hover:text-red-400">
          Logout
        </button>
      </div>

      {/* ── Search & Add ── */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search movies by title..."
            className="flex-1 px-3 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] text-white text-[13px] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent-teal)]/40"
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            className="px-4 py-2.5 rounded-xl bg-[var(--accent-teal)] text-white text-[13px] font-semibold shrink-0 disabled:opacity-50"
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Search results */}
        {searchResults.length > 0 && !selectedMovie && (
          <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
            {searchResults.map((m) => (
              <button
                key={m.tmdbId}
                onClick={() => { setSelectedMovie(m); setSearchResults([]); }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] hover:border-[var(--accent-teal)]/30 transition-colors text-left"
              >
                {m.posterUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.posterUrl} alt={`${m.title} poster`} width={40} height={56} className="w-10 h-14 rounded-lg object-cover bg-[var(--bg-tertiary)]" loading="lazy" />
                ) : (
                  <div className="w-10 h-14 rounded-lg bg-[var(--bg-tertiary)]" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-white truncate">{m.title}</p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {m.year} | {m.language} | {m.rating} | {m.ppm.tier} ₹{m.ppm.ratePerMin}/min
                  </p>
                </div>
                <span className="text-[10px] text-[var(--text-muted)] shrink-0">#{m.tmdbId}</span>
              </button>
            ))}
          </div>
        )}

        {/* Selected movie + GDrive input */}
        {selectedMovie && (
          <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--accent-teal)]/20 space-y-3">
            <div className="flex items-center gap-3">
              {selectedMovie.posterUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selectedMovie.posterUrl} alt={`${selectedMovie.title} poster`} width={48} height={64} className="w-12 h-16 rounded-lg object-cover" loading="lazy" />
              ) : (
                <div className="w-12 h-16 rounded-lg bg-[var(--bg-tertiary)]" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold text-white">{selectedMovie.title}</p>
                <p className="text-[11px] text-[var(--text-muted)]">
                  TMDB #{selectedMovie.tmdbId} | {selectedMovie.year} | {selectedMovie.language}
                </p>
              </div>
              <button onClick={() => { setSelectedMovie(null); setGdriveFileId(''); }}
                className="p-1 text-[var(--text-muted)] hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div>
              <label className="text-[11px] text-[var(--text-muted)] mb-1 block">
                Google Drive File ID or URL
              </label>
              <input
                type="text"
                value={gdriveFileId}
                onChange={(e) => setGdriveFileId(extractFileId(e.target.value))}
                placeholder="Paste GDrive link or file ID..."
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--glass-border)] text-white text-[13px] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent-teal)]/40 font-mono"
              />
              <p className="text-[10px] text-[var(--text-muted)] mt-1">
                Supports: drive.google.com/file/d/FILE_ID/... or raw file ID
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={saving || !gdriveFileId.trim()}
              className="w-full py-2.5 rounded-xl bg-[var(--accent-teal)] text-white text-[13px] font-semibold disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Stream Mapping'}
            </button>
          </div>
        )}
      </div>

      {/* ── Existing Mappings ── */}
      <div className="space-y-2">
        <h2 className="text-[14px] font-semibold text-white flex items-center gap-2">
          Mapped Movies
          <span className="text-[11px] font-normal text-[var(--text-muted)]">({mappings.length})</span>
        </h2>

        {loadingMappings ? (
          <div className="py-8 text-center text-[var(--text-muted)] text-[13px]">Loading...</div>
        ) : mappings.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-[var(--text-muted)] text-[13px]">No movies mapped yet</p>
            <p className="text-[var(--text-muted)] text-[11px] mt-1">
              Search for a movie above and paste a Google Drive file ID
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {mappings.map((m) => (
              <div key={m.tmdbId} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--glass-border)]">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent-teal)]/10 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-[var(--accent-teal)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-white truncate">{m.title}</p>
                  <p className="text-[10px] text-[var(--text-muted)] font-mono truncate">
                    #{m.tmdbId} | {m.gdriveFileId.substring(0, 20)}...
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${m.enabled ? 'bg-[var(--accent-teal)]/15 text-[var(--accent-teal)]' : 'bg-red-500/15 text-red-400'}`}>
                    {m.enabled ? 'Active' : 'Disabled'}
                  </span>
                  <button onClick={() => handleDelete(m.tmdbId)} className="p-1 text-[var(--text-muted)] hover:text-red-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Service Account Info ── */}
      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
        <p className="text-[11px] text-[var(--text-muted)]">
          Share your GDrive movie files with:
        </p>
        <p className="text-[12px] text-[var(--accent-teal)] font-mono mt-1 break-all select-all">
          instamoviewmart-drive@lustrous-bus-488412-m8.iam.gserviceaccount.com
        </p>
      </div>
    </div>
  );
}
