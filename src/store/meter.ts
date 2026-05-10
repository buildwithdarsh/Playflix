import { create } from 'zustand';
import { TZ } from '@/lib/tz';
import type { WatchSessionStatusType } from '@buildwithdarsh/sdk';
import type { RoomMode } from '@/lib/types/room';

interface MeterState {
  sessionId: string | null;
  movieTitle: string | null;
  ratePerMinPaise: number;
  meterCapPaise: number;
  totalBilledPaise: number;
  minutesBilled: number;
  status: WatchSessionStatusType | null;
  balancePaise: number;
  isActive: boolean;
  error: string | null;

  // Room-aware fields
  roomId: string | null;
  mode: RoomMode | null;

  startSession: (tmdbId: number, title: string, ratePerMinPaise: number, meterCapPaise: number, roomId?: string, mode?: RoomMode) => Promise<boolean>;
  pollStatus: () => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  syncPause: () => Promise<void>;
  syncResume: () => Promise<void>;
  setMode: (mode: RoomMode) => void;
  updateCap: (newCapPaise: number) => Promise<boolean>;
  rateSession: (rating: number) => Promise<void>;
  endSession: () => Promise<MeterSessionSummary | null>;
  reset: () => void;
}

export interface MeterSessionSummary {
  movieTitle: string | null;
  minutesBilled: number;
  totalBilledPaise: number;
  meterCapPaise: number;
  hitCap: boolean;
  balancePaise: number;
}

export const useMeterStore = create<MeterState>((set, get) => ({
  sessionId: null,
  movieTitle: null,
  ratePerMinPaise: 0,
  meterCapPaise: 0,
  totalBilledPaise: 0,
  minutesBilled: 0,
  status: null,
  balancePaise: 0,
  isActive: false,
  error: null,
  roomId: null,
  mode: null,

  startSession: async (tmdbId, title, ratePerMinPaise, meterCapPaise, roomId, mode) => {
    set({ error: null });
    try {
      // Retry once on auth failure (token might be refreshing)
      let res;
      try {
        res = await TZ.storefront.movies.startSession(tmdbId, {
          movieTitle: title,
          ratePerMinPaise,
          meterCapPaise,
        });
      } catch (firstErr) {
        // Wait for token refresh and retry
        await new Promise((r) => setTimeout(r, 2000));
        res = await TZ.storefront.movies.startSession(tmdbId, {
          movieTitle: title,
          ratePerMinPaise,
          meterCapPaise,
        });
      }

      // API may return { session: {...}, balancePaise } or flat object
      const raw = res as unknown as Record<string, unknown>;
      const session = (raw['session'] || raw) as Record<string, unknown>;
      const balPaise = (raw['balancePaise'] ?? session['balancePaise'] ?? 0) as number;

      set({
        sessionId: (session['id'] || session['sessionId']) as string,
        movieTitle: (session['movieTitle'] as string) || title,
        ratePerMinPaise: (session['ratePerMinPaise'] as number) || ratePerMinPaise,
        meterCapPaise: (session['meterCapPaise'] as number) || meterCapPaise,
        totalBilledPaise: 0,
        minutesBilled: 0,
        status: ((session['status'] as string) || 'active') as WatchSessionStatusType,
        balancePaise: balPaise,
        isActive: true,
        roomId: roomId || null,
        mode: mode || null,
      });
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to start session';
      set({ error: msg });
      return false;
    }
  },

  pollStatus: async () => {
    const { sessionId } = get();
    if (!sessionId) return;

    try {
      const res = await TZ.storefront.movies.getSessionStatus(sessionId);
      // Unwrap: API may return { session: {...}, balancePaise } or flat
      const raw = res as unknown as Record<string, unknown>;
      const s = (raw['session'] || raw) as Record<string, unknown>;
      const bal = (raw['balancePaise'] ?? s['balancePaise'] ?? 0) as number;
      const status = (s['status'] as string) || 'active';

      set({
        totalBilledPaise: (s['totalBilledPaise'] as number) || 0,
        minutesBilled: (s['minutesBilled'] as number) || 0,
        status: status as WatchSessionStatusType,
        balancePaise: bal,
        isActive: status === 'active',
      });
    } catch {
      // keep existing state
    }
  },

  pause: async () => {
    const { sessionId } = get();
    if (!sessionId) return;
    try {
      const res = await TZ.storefront.movies.pauseSession(sessionId);
      const raw = res as unknown as Record<string, unknown>;
      const s = (raw['session'] || raw) as Record<string, unknown>;
      set({
        status: ((s['status'] as string) || 'paused') as WatchSessionStatusType,
        totalBilledPaise: (s['totalBilledPaise'] as number) || get().totalBilledPaise,
        balancePaise: (raw['balancePaise'] ?? s['balancePaise'] ?? get().balancePaise) as number,
        isActive: false,
      });
    } catch { /* keep state */ }
  },

  resume: async () => {
    const { sessionId } = get();
    if (!sessionId) return;
    try {
      const res = await TZ.storefront.movies.resumeSession(sessionId);
      const raw = res as unknown as Record<string, unknown>;
      const s = (raw['session'] || raw) as Record<string, unknown>;
      const status = (s['status'] as string) || 'active';
      set({
        status: status as WatchSessionStatusType,
        isActive: status === 'active',
        balancePaise: (raw['balancePaise'] ?? s['balancePaise'] ?? get().balancePaise) as number,
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to resume' });
    }
  },

  endSession: async () => {
    const { sessionId } = get();
    if (!sessionId) return null;
    try {
      const res = await TZ.storefront.movies.endSession(sessionId);
      // API may return { session: {...}, balancePaise, summary: {...} } or flat
      const raw = res as unknown as Record<string, unknown>;
      const session = (raw['session'] || raw) as Record<string, unknown>;
      const summaryObj = (raw['summary'] || {}) as Record<string, unknown>;
      const bal = (raw['balancePaise'] ?? session['balancePaise'] ?? 0) as number;

      const totalBilled = (summaryObj['totalBilledPaise'] ?? session['totalBilledPaise'] ?? get().totalBilledPaise) as number;
      const minsBilled = (summaryObj['minutesBilled'] ?? session['minutesBilled'] ?? get().minutesBilled) as number;
      const capPaise = (session['meterCapPaise'] ?? get().meterCapPaise) as number;
      const title = (summaryObj['movieTitle'] ?? session['movieTitle'] ?? get().movieTitle) as string;

      const summary: MeterSessionSummary = {
        movieTitle: title,
        minutesBilled: minsBilled,
        totalBilledPaise: totalBilled,
        meterCapPaise: capPaise,
        hitCap: totalBilled >= capPaise,
        balancePaise: bal,
      };
      set({ status: 'ended', isActive: false });
      return summary;
    } catch {
      return null;
    }
  },

  // Host-driven pause/resume for sync mode viewers
  syncPause: async () => {
    const { sessionId, mode } = get();
    if (!sessionId || mode !== 'sync') return;
    try {
      const res = await TZ.storefront.movies.pauseSession(sessionId);
      set({ status: res.status, totalBilledPaise: res.totalBilledPaise, balancePaise: res.balancePaise });
    } catch { /* keep state */ }
  },

  syncResume: async () => {
    const { sessionId, mode } = get();
    if (!sessionId || mode !== 'sync') return;
    try {
      const res = await TZ.storefront.movies.resumeSession(sessionId);
      set({ status: res.status, isActive: res.status === 'active', balancePaise: res.balancePaise });
    } catch { /* keep state */ }
  },

  updateCap: async (newCapPaise) => {
    const { sessionId } = get();
    if (!sessionId) return false;
    try {
      const res = await TZ.storefront.movies.updateSessionCap(sessionId, newCapPaise);
      const raw = res as unknown as Record<string, unknown>;
      const s = (raw['session'] || raw) as Record<string, unknown>;
      const bal = (raw['balancePaise'] ?? s['balancePaise'] ?? get().balancePaise) as number;
      const status = (s['status'] as string) || 'active';
      set({
        meterCapPaise: (s['meterCapPaise'] as number) || newCapPaise,
        status: status as WatchSessionStatusType,
        isActive: status === 'active',
        balancePaise: bal,
      });
      return true;
    } catch {
      return false;
    }
  },

  rateSession: async (rating) => {
    const { sessionId } = get();
    if (!sessionId) return;
    try {
      await TZ.storefront.movies.rateSession(sessionId, rating);
    } catch { /* best-effort */ }
  },

  setMode: (mode) => set({ mode }),

  reset: () => set({
    sessionId: null,
    movieTitle: null,
    ratePerMinPaise: 0,
    meterCapPaise: 0,
    totalBilledPaise: 0,
    minutesBilled: 0,
    status: null,
    balancePaise: 0,
    isActive: false,
    error: null,
    roomId: null,
    mode: null,
  }),
}));
