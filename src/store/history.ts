import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TZ } from '@/lib/tz';
import type { WatchSessionHistoryItem } from '@buildwithdarsh/sdk';

export interface WatchSession {
  movieId: string;
  movieTitle: string;
  posterUrl: string | null;
  minutesWatched: number;
  totalSpend: number;
  hitFreeZone: boolean;
  timestamp: number; // Date.now()
  rating?: number;
  sessionId?: string; // BE session id for rating
}

interface HistoryState {
  sessions: WatchSession[];
  beHistory: WatchSessionHistoryItem[];
  beLoading: boolean;
  beFetched: boolean;
  addSession: (session: WatchSession) => void;
  rateSession: (movieId: string, timestamp: number, rating: number) => void;
  fetchHistory: () => Promise<void>;
  clear: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      sessions: [],
      beHistory: [],
      beLoading: false,
      beFetched: false,
      addSession: (session) =>
        set((s) => ({ sessions: [session, ...s.sessions].slice(0, 100) })),
      rateSession: (movieId, timestamp, rating) =>
        set((s) => ({
          sessions: s.sessions.map((sess) =>
            sess.movieId === movieId && sess.timestamp === timestamp
              ? { ...sess, rating }
              : sess
          ),
        })),
      fetchHistory: async () => {
        if (get().beLoading) return;
        set({ beLoading: true });
        try {
          const res = await TZ.storefront.movies.getHistory(50, 0);
          const raw = res as unknown as Record<string, unknown>;
          const data = (raw['data'] || raw) as { sessions: WatchSessionHistoryItem[]; total: number };
          set({ beHistory: data.sessions || [], beFetched: true });
        } catch {
          set({ beFetched: true });
        } finally {
          set({ beLoading: false });
        }
      },
      clear: () => set({ sessions: [], beHistory: [], beFetched: false }),
    }),
    { name: 'wr-history', partialize: (s) => ({ sessions: s.sessions }) }
  )
);
