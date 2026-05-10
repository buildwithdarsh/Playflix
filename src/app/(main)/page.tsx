import type { Metadata } from 'next';
import { APP_NAME, APP_TAGLINE, BASE_URL } from '@/lib/constants';
import { buildHomepageJsonLd } from '@/lib/seo';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: `${APP_NAME} — Stream Movies Online Instantly | Pay Per Minute`,
  description: 'Stream Bollywood, Hollywood & regional films instantly. Pay only for what you watch with transparent per-minute pricing. Simple setup, fast access — UPI, cards & netbanking accepted.',
  alternates: { canonical: BASE_URL },
  openGraph: {
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description: 'Stream your favourite movies instantly. Bollywood, Hollywood & regional films with simple per-minute pricing.',
    url: BASE_URL,
    type: 'website',
  },
};

export default function HomePage() {
  const jsonLdItems = buildHomepageJsonLd();

  return (
    <>
      {jsonLdItems.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
      <h1 className="sr-only">{APP_NAME} — Rent and Buy Movies Online in India</h1>
      <HomeClient />
    </>
  );
}
