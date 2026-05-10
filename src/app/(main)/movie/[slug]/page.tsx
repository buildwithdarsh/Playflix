import type { Metadata } from 'next';
import { APP_NAME, BASE_URL } from '@/lib/constants';
import { fetchMovieForSEO, buildMovieJsonLd, buildBreadcrumbJsonLd } from '@/lib/seo';
import MovieDetailClient from './MovieDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const movie = await fetchMovieForSEO(slug);

  if (!movie) {
    return {
      title: `Movie — ${APP_NAME}`,
      description: `Watch this movie on ${APP_NAME}. Pay only for the minutes you watch.`,
      robots: { index: false },
    };
  }

  const title = (movie['title'] as string) || 'Movie';
  const overview = (movie['overview'] as string) || '';
  const year = (movie['year'] as number) || '';
  const posterUrl = (movie['posterUrl'] as string) || undefined;
  const backdropUrl = (movie['backdropUrl'] as string) || undefined;
  const genres = (movie['genres'] as Array<{ name: string }>) || [];
  const genreText = genres.slice(0, 3).map((g) => g.name).join(', ');

  const pageTitle = `${title}${year ? ` (${year})` : ''} — Watch on ${APP_NAME}`;
  const pageDescription = overview
    ? `${overview.slice(0, 130)}${overview.length > 130 ? '...' : ''} Stream ${title} with pay-per-minute pricing.`
    : `Watch ${title}${genreText ? ` — ${genreText}` : ''} on ${APP_NAME}. Pay only for what you watch.`;

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: { canonical: `${BASE_URL}/movie/${slug}` },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: `${BASE_URL}/movie/${slug}`,
      type: 'video.movie',
      images: backdropUrl || posterUrl ? [{ url: (backdropUrl || posterUrl)!, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: backdropUrl || posterUrl ? [(backdropUrl || posterUrl)!] : undefined,
    },
  };
}

export default async function MovieDetailPage({ params }: Props) {
  const { slug } = await params;
  const movie = await fetchMovieForSEO(slug);

  const movieJsonLd = movie ? buildMovieJsonLd(movie, slug) : null;
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', url: BASE_URL },
    { name: (movie?.['title'] as string) || 'Movie', url: `${BASE_URL}/movie/${slug}` },
  ]);

  return (
    <>
      {movieJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(movieJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <MovieDetailClient params={params} />
    </>
  );
}
