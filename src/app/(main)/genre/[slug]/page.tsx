import type { Metadata } from 'next';
import { APP_NAME, BASE_URL, GENRES } from '@/lib/constants';
import { buildBreadcrumbJsonLd } from '@/lib/seo';
import GenreClient from './GenreClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const genre = GENRES.find((g) => g.slug === slug);
  const label = genre?.label || slug.charAt(0).toUpperCase() + slug.slice(1);

  return {
    title: `${label} Movies — Watch ${label} Films Online`,
    description: `Browse and watch ${label.toLowerCase()} movies on ${APP_NAME}. Pay only for what you watch with transparent per-minute pricing. Stream instantly.`,
    alternates: { canonical: `${BASE_URL}/genre/${slug}` },
    openGraph: {
      title: `${label} Movies — ${APP_NAME}`,
      description: `Browse and watch ${label.toLowerCase()} movies on ${APP_NAME}. Pay only for what you watch.`,
      url: `${BASE_URL}/genre/${slug}`,
      images: [{ url: `${BASE_URL}/logo.svg`, width: 512, height: 512, alt: `${APP_NAME} — ${label} movies` }],
    },
    twitter: {
      card: 'summary',
      title: `${label} Movies — ${APP_NAME}`,
      description: `Browse and watch ${label.toLowerCase()} movies on ${APP_NAME}. Pay only for what you watch.`,
    },
  };
}

export default async function GenrePage({ params }: Props) {
  const { slug } = await params;
  const genre = GENRES.find((g) => g.slug === slug);
  const label = genre?.label || slug;

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', url: BASE_URL },
    { name: label, url: `${BASE_URL}/genre/${slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <GenreClient params={params} />
    </>
  );
}
