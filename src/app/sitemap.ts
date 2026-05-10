import type { MetadataRoute } from 'next';
import { BASE_URL, GENRES } from '@/lib/constants';
import { fetchMovieSlugsForSitemap } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/live`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/room/create`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  const genreRoutes: MetadataRoute.Sitemap = GENRES.map((genre) => ({
    url: `${BASE_URL}/genre/${genre.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const movieSlugs = await fetchMovieSlugsForSitemap();
  const movieRoutes: MetadataRoute.Sitemap = movieSlugs.map((m) => ({
    url: `${BASE_URL}/movie/${m.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...genreRoutes, ...movieRoutes];
}
