'use client';

import { useState, useEffect, useCallback } from 'react';
import { TZ } from '@/lib/tz';
import type { ConnectedSource } from '@buildwithdarsh/sdk';

export function useConnectedSources() {
  const [sources, setSources] = useState<ConnectedSource[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await TZ.storefront.connectedSources.list();
      // API returns { sources: [...] } or flat array
      const list = Array.isArray(data) ? data : (data as { sources?: ConnectedSource[] }).sources || [];
      setSources(list);
    } catch {
      setSources([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const isGoogleDriveConnected = sources.some((s) => s.provider === 'google_drive');

  const connectGoogleDrive = useCallback(async () => {
    try {
      const data = await TZ.storefront.connectedSources.getGoogleDriveConnectUrl();
      const url = (data as { url: string }).url;
      // Redirect to Google OAuth consent — callback page handles the code
      window.location.href = url;
    } catch {
      // handle error
    }
  }, []);

  const disconnectGoogleDrive = useCallback(async () => {
    try {
      await TZ.storefront.connectedSources.disconnect('google_drive');
      await fetch();
    } catch {
      // handle error
    }
  }, [fetch]);

  return {
    sources,
    loading,
    isGoogleDriveConnected,
    connectGoogleDrive,
    disconnectGoogleDrive,
    refresh: fetch,
  };
}
