'use client';

import { useState, useEffect } from 'react';
import { TZ } from '@/lib/tz';
import type { Room } from '@/lib/types/room';

export function useLiveRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await TZ.storefront.rooms.listLive();
        const raw = res as unknown as Record<string, unknown>;
        const data = Array.isArray(res) ? res : (raw['rooms'] || raw['data'] || []) as Room[];
        if (!cancelled) setRooms(data as Room[]);
      } catch {
        // no rooms available yet
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { rooms, loading };
}

export function useRoomsForMovie(tmdbId: number) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tmdbId) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const res = await TZ.storefront.rooms.listForMovie(tmdbId);
        // API may return flat array or { rooms: [...] }
        const data = Array.isArray(res) ? res : (res as { rooms?: Room[] }).rooms || [];
        if (!cancelled) setRooms(data as Room[]);
      } catch {
        // no rooms
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [tmdbId]);

  return { rooms, loading };
}
