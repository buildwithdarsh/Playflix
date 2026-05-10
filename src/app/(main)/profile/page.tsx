'use client';

import { useAuthStore } from '@/store/auth';
import { useConnectedSources } from '@/hooks/useConnectedSources';
import Link from 'next/link';
import EmptyState from '@/components/ui/EmptyState';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const { sources, loading: sourcesLoading, isGoogleDriveConnected, connectGoogleDrive, disconnectGoogleDrive } = useConnectedSources();

  if (!user) {
    return (
      <div className="px-5 py-4">
        <EmptyState
          variant="profile"
          title="Your cinema awaits"
          description="Sign in to watch movies, join rooms, and host your own screenings."
          actionLabel="Sign In"
          actionHref="/login"
        />
      </div>
    );
  }

  const gdriveSource = sources.find((s) => s.provider === 'google_drive');

  const menuItems = [
    {
      label: 'My Earnings', href: '/earnings',
      icon: (
        <svg className="w-5 h-5 text-[var(--accent-sync)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
        </svg>
      ),
    },
    {
      label: 'Watch History', href: '/library',
      icon: (
        <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'My Watchlist', href: '/watchlist',
      icon: (
        <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      ),
    },
    {
      label: 'Help & Support', href: '/profile',
      icon: (
        <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="px-5 py-4 space-y-6 lg:max-w-[800px] lg:mx-auto lg:py-8">
      {/* Profile header */}
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06]">
        <div className="w-14 h-14 rounded-full bg-[var(--accent-sync)] flex items-center justify-center shadow-lg">
          <span className="text-xl font-bold text-white">
            {(user.name || user.phone)?.[0]?.toUpperCase() || 'U'}
          </span>
        </div>
        <div>
          <h1 className="text-[17px] font-bold text-white">
            {user.name || 'Movie Lover'}
          </h1>
          <p className="text-[13px] text-[var(--text-muted)]">{user.phone}</p>
        </div>
      </div>

      {/* Connected Sources */}
      <div className="space-y-3">
        <h2 className="text-[14px] font-bold text-white">Connected Sources</h2>
        <p className="text-[11px] text-[var(--text-muted)] -mt-1">Connect your Google Drive to host rooms and share movies.</p>

        {sourcesLoading ? (
          <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--glass-border)]">
            <div className="w-32 h-4 rounded bg-white/8 animate-pulse" />
          </div>
        ) : isGoogleDriveConnected ? (
          /* Connected state */
          <div className="p-4 rounded-xl bg-green-500/6 border border-green-500/15">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white">Google Drive</p>
                  <p className="text-[11px] text-green-400">{gdriveSource?.email || 'Connected'}</p>
                </div>
              </div>
              <button
                onClick={disconnectGoogleDrive}
                className="text-[11px] text-red-400/70 hover:text-red-400 transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          /* Not connected state */
          <button
            onClick={connectGoogleDrive}
            className="w-full p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] hover:border-white/15 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center">
                <svg className="w-5 h-5 text-white/60" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-white">Connect Google Drive</p>
                <p className="text-[11px] text-[var(--text-muted)]">Required to host rooms</p>
              </div>
              <svg className="w-4 h-4 text-[var(--accent-sync)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
          </button>
        )}
      </div>

      {/* Menu items */}
      <div className="space-y-0.5">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center justify-between p-3.5 rounded-xl hover:bg-white/[0.03] transition-colors group"
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span className="text-[14px] text-[var(--text-primary)] group-hover:text-white transition-colors">{item.label}</span>
            </div>
            <svg className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full p-3.5 rounded-xl border border-red-500/15 text-red-400 text-[14px] font-medium hover:bg-red-500/8 transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
}
