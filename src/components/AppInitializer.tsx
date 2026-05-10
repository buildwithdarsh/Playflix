'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';

export default function AppInitializer() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return null;
}
