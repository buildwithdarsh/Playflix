'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWalletStore } from '@/store/wallet';
import { useAuthStore } from '@/store/auth';

const NAV_LINKS = [
  { label: 'Home', href: '/', match: (p: string) => p === '/' },
  { label: 'Search', href: '/search', match: (p: string) => p.startsWith('/search') },
  { label: 'Library', href: '/library', match: (p: string) => p.startsWith('/library') || p.startsWith('/watchlist') },
  { label: 'Profile', href: '/profile', match: (p: string) => p.startsWith('/profile') },
];

export default function TopBar() {
  const balance = useWalletStore((s) => s.balance);
  const isWalletLoading = useWalletStore((s) => s.isLoading);
  const fetchBalance = useWalletStore((s) => s.fetchBalance);
  const user = useAuthStore((s) => s.user);
  const requireAuth = useAuthStore((s) => s.requireAuth);
  const pathname = usePathname();

  useEffect(() => {
    if (user) fetchBalance();
  }, [user, fetchBalance]);

  return (
    <header
      className="fixed top-0 z-50 w-full max-w-[476px] lg:max-w-full left-1/2 -translate-x-1/2"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        background: 'linear-gradient(to bottom, rgba(14,14,14,0.95) 0%, rgba(14,14,14,0.7) 60%, transparent 100%)',
      }}
    >
      <div className="flex items-center justify-between h-14 px-5 lg:px-10 lg:h-16 lg:max-w-[1400px] lg:mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-gradient-to-br from-[#E8004D] to-[#FF4D6D] flex items-center justify-center shadow-[0_2px_8px_rgba(232,0,77,0.4)]">
            <svg className="w-4 h-4 lg:w-5 lg:h-5" viewBox="0 0 24 24" fill="none">
              <path d="M9.5 7.2v9.6c0 .7.8 1.1 1.3.7l6.5-4.8c.4-.3.4-1 0-1.3L10.8 6.5c-.5-.4-1.3 0-1.3.7z" fill="white"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] lg:text-[18px] font-bold tracking-tight text-white leading-none">
              Play<span className="text-[#E8004D]">Flix</span>
            </span>
            <span className="text-[7px] lg:text-[8px] uppercase tracking-[0.2em] text-[var(--text-muted)] leading-none mt-0.5">
              Stream Together
            </span>
          </div>
        </Link>

        {/* Desktop nav links — hidden on mobile */}
        <nav className="hidden lg:flex items-center gap-1 ml-10">
          {NAV_LINKS.map((link) => {
            const isActive = link.match(pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-[14px] font-medium transition-colors ${
                  isActive
                    ? 'text-white bg-white/10'
                    : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 lg:gap-3">
          {/* Wallet balance or Sign In */}
          {user ? (
            <Link
              href="/wallet"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--accent-teal)]/10 border border-[var(--accent-teal)]/20 hover:bg-[var(--accent-teal)]/15 transition-colors"
            >
              <svg className="w-3.5 h-3.5 text-[var(--accent-teal)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 013 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 013 6v3" />
              </svg>
              {isWalletLoading ? (
                <span className="w-10 h-3 rounded bg-[var(--accent-teal)]/20 animate-pulse" />
              ) : (
                <span className="text-[12px] font-bold text-[var(--accent-teal)]">
                  ₹{balance.toFixed(2)}
                </span>
              )}
            </Link>
          ) : (
            <button
              onClick={() => requireAuth()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent-crimson)]/15 border border-[var(--accent-crimson)]/25 hover:bg-[var(--accent-crimson)]/25 transition-colors"
            >
              <svg className="w-3.5 h-3.5 text-[var(--accent-crimson)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              <span className="text-[12px] font-semibold text-[var(--accent-crimson)]">
                Sign In
              </span>
            </button>
          )}

          {/* Search icon — hidden on desktop (nav link replaces it) */}
          <Link
            href="/search"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-white/8 hover:bg-white/15 transition-colors lg:hidden"
            aria-label="Search"
          >
            <svg className="w-[18px] h-[18px] text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
