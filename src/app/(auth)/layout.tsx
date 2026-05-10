import type { Metadata } from 'next';
import MotionProvider from '@/components/MotionProvider';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <MotionProvider>
      <main className="min-h-dvh flex flex-col items-center justify-center px-6 bg-[var(--bg-primary)]">
        {children}
      </main>
    </MotionProvider>
  );
}
