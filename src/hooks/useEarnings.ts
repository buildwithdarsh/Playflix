'use client';

import { useState, useEffect } from 'react';
import { TZ } from '@/lib/tz';
import type { EarningsSummary, RoomEarning } from '@/lib/types/room';

export function useEarnings() {
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [history, setHistory] = useState<RoomEarning[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [sum, hist] = await Promise.all([
          TZ.storefront.earnings.getSummary(),
          TZ.storefront.earnings.getHistory(),
        ]);
        if (!cancelled) {
          setSummary(sum as EarningsSummary);
          const histData = Array.isArray(hist) ? hist : (hist as { data?: RoomEarning[] }).data || [];
          setHistory(histData as RoomEarning[]);
        }
      } catch {
        // No earnings data yet
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { summary, history, loading };
}
