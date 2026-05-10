import type { Metadata } from 'next';
import MotionProvider from '@/components/MotionProvider';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PlayerLayout({ children }: { children: React.ReactNode }) {
  return (
    <MotionProvider>
      <main className="min-h-dvh bg-black">{children}</main>
    </MotionProvider>
  );
}
