'use client';

import Link from 'next/link';
import { m } from 'framer-motion';

export default function ConfirmationPage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center space-y-6">
      {/* Success animation */}
      <m.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center"
      >
        <m.svg
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-12 h-12 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </m.svg>
      </m.div>

      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-2"
      >
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          You&apos;re All Set!
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Your movie is ready to watch. Enjoy!
        </p>
      </m.div>

      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col gap-3 w-full max-w-xs"
      >
        <Link
          href="/"
          className="py-3.5 rounded-xl bg-[var(--accent-crimson)] text-white font-semibold text-center text-sm hover:bg-[var(--accent-crimson-hover)] transition-colors"
        >
          Browse Movies
        </Link>
        <Link
          href="/library"
          className="py-3.5 rounded-xl border border-[var(--glass-border)] text-[var(--text-secondary)] font-medium text-center text-sm hover:bg-[var(--bg-secondary)] transition-colors"
        >
          Go to Library
        </Link>
      </m.div>
    </div>
  );
}
