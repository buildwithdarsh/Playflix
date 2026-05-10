import type { Metadata } from 'next';
import MotionProvider from '@/components/MotionProvider';
import ToastContainer from '@/components/ToastContainer';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <MotionProvider>
      <ToastContainer />
      <main className="min-h-dvh bg-[var(--bg-primary)]">{children}</main>
    </MotionProvider>
  );
}
