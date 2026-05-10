import type { Metadata } from 'next';
import { APP_NAME, BASE_URL } from '@/lib/constants';
import LiveClient from './LiveClient';

export const metadata: Metadata = {
  title: `Trending Movies Streaming Now — ${APP_NAME}`,
  description: `Discover trending movies with live streams on ${APP_NAME}. Watch instantly with pay-per-minute pricing — join a room or start your own.`,
  alternates: { canonical: `${BASE_URL}/live` },
  openGraph: {
    title: `Trending Movies Streaming Now — ${APP_NAME}`,
    description: `Discover trending movies with live streams on ${APP_NAME}. Watch instantly with pay-per-minute pricing.`,
    url: `${BASE_URL}/live`,
  },
};

export default function LivePage() {
  return <LiveClient />;
}
