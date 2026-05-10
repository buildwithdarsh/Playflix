import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';

export default function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center bg-[var(--bg-primary)]">
      <div className="w-20 h-20 rounded-full bg-[var(--accent-crimson)]/15 flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-[var(--accent-crimson)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">Page Not Found</h1>
      <p className="text-[14px] text-[var(--text-muted)] max-w-xs mb-8">
        The page you are looking for does not exist on {APP_NAME}. It may have been moved or removed.
      </p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          href="/"
          className="py-3 rounded-xl bg-[var(--accent-crimson)] text-white font-semibold text-[14px] text-center"
        >
          Back to Home
        </Link>
        <Link
          href="/search"
          className="py-3 rounded-xl border border-[var(--glass-border)] text-[var(--text-secondary)] font-medium text-[14px] text-center"
        >
          Search Movies
        </Link>
      </div>
    </div>
  );
}
