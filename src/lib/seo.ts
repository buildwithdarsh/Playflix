import { APP_NAME, BASE_URL } from './constants';
import { createTZ } from '@buildwithdarsh/sdk';

const serverTZ = createTZ({
  orgSlug: 'playflix',
  orgKey: process.env['NEXT_PUBLIC_TZ_ORG_KEY'] || 'tz_60a03469a9b0a03ebe91ab6996a044dde833a16c',
  baseUrl: process.env['NEXT_PUBLIC_TZ_API_URL'] || process.env['BACKEND_URL'] || '',
  keyPrefix: 'wr-ssr',
});

/**
 * Server-side movie data fetching for generateMetadata and JSON-LD.
 */
export async function fetchMovieForSEO(tmdbId: string): Promise<Record<string, unknown> | null> {
  try {
    const data = await serverTZ.storefront.tmdb.getDetail(Number(tmdbId));
    return data as unknown as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Fetch popular movie slugs for sitemap generation.
 */
export async function fetchMovieSlugsForSitemap(): Promise<Array<{ slug: string; title: string }>> {
  try {
    const data = await serverTZ.storefront.tmdb.popular(1);
    const movies = Array.isArray(data) ? data : ((data as Record<string, unknown>)['results'] || (data as Record<string, unknown>)['data'] || []) as Array<Record<string, unknown>>;
    return movies
      .filter((m) => m['tmdbId'])
      .map((m) => ({
        slug: String(m['tmdbId']),
        title: (m['title'] as string) || '',
      }));
  } catch {
    return [];
  }
}

/** Build Movie JSON-LD from movie data */
export function buildMovieJsonLd(movie: Record<string, unknown>, slug: string) {
  const title = (movie['title'] as string) || '';
  const overview = (movie['overview'] as string) || '';
  const year = (movie['year'] as number) || undefined;
  const rating = (movie['rating'] as number) || undefined;
  const voteCount = (movie['voteCount'] as number) || undefined;
  const posterUrl = (movie['posterUrl'] as string) || undefined;
  const backdropUrl = (movie['backdropUrl'] as string) || undefined;
  const runtime = (movie['runtime'] as number) || undefined;
  const director = movie['director'] as { name: string; photoUrl: string | null } | null;
  const genres = (movie['genres'] as Array<{ id: number; name: string }>) || [];
  const trailerKey = movie['trailerKey'] as string | null;

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: title,
    url: `${BASE_URL}/movie/${slug}`,
    description: overview,
    image: backdropUrl || posterUrl,
  };

  if (year) jsonLd['dateCreated'] = String(year);
  if (runtime) jsonLd['duration'] = `PT${runtime}M`;
  if (director) jsonLd['director'] = { '@type': 'Person', name: director.name };
  if (genres.length > 0) jsonLd['genre'] = genres.map((g) => g.name);

  if (rating && voteCount) {
    jsonLd['aggregateRating'] = {
      '@type': 'AggregateRating',
      ratingValue: rating,
      bestRating: 10,
      worstRating: 0,
      ratingCount: voteCount,
    };
  }

  if (trailerKey) {
    jsonLd['trailer'] = {
      '@type': 'VideoObject',
      name: `${title} - Trailer`,
      description: `Official trailer for ${title}`,
      thumbnailUrl: `https://img.youtube.com/vi/${trailerKey}/maxresdefault.jpg`,
      uploadDate: year ? `${year}-01-01` : undefined,
      embedUrl: `https://www.youtube.com/embed/${trailerKey}`,
    };
  }

  return jsonLd;
}

/** Build WebSite + Organization JSON-LD for homepage */
export function buildHomepageJsonLd() {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: APP_NAME,
      url: BASE_URL,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: APP_NAME,
      url: BASE_URL,
      logo: `${BASE_URL}/icon-512.png`,
    },
  ];
}

/** Build BreadcrumbList JSON-LD */
export function buildBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
