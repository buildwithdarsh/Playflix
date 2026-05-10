import { Suspense } from 'react';
import type { Metadata } from 'next';
import { APP_NAME, BASE_URL } from '@/lib/constants';
import CreateRoomClient from './CreateRoomClient';

export const metadata: Metadata = {
  title: 'Host a Room',
  description: 'Create a PlayFlix room — paste your Google Drive link, set your rate, and go live.',
  alternates: { canonical: `${BASE_URL}/room/create` },
  openGraph: {
    title: `Host a Room — ${APP_NAME}`,
    description: 'Create a PlayFlix room — paste your Google Drive link, set your rate, and go live.',
    url: `${BASE_URL}/room/create`,
  },
  twitter: {
    card: 'summary',
    title: `Host a Room — ${APP_NAME}`,
    description: 'Create a PlayFlix room — paste your Google Drive link, set your rate, and go live.',
  },
};

export default function CreateRoomPage() {
  return (
    <Suspense>
      <CreateRoomClient />
    </Suspense>
  );
}
