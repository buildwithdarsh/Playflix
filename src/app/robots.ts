import type { MetadataRoute } from 'next';
import { BASE_URL } from '@/lib/constants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/auth/',
          '/login',
          '/verify',
          '/profile',
          '/library',
          '/wallet',
          '/watchlist',
          '/watch/',
          '/checkout',
          '/confirmation',
          '/earnings',
          '/room/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
