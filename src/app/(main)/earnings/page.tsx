'use client';

import { useEarnings } from '@/hooks/useEarnings';
import { useAuthStore } from '@/store/auth';
import Skeleton from '@/components/Skeleton';

export default function EarningsPage() {
  const user = useAuthStore((s) => s.user);
  const { summary, history, loading } = useEarnings();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[var(--text-muted)]">Sign in to view earnings</p>
      </div>
    );
  }

  return (
    <div className="px-5 py-4 space-y-6 lg:max-w-[800px] lg:mx-auto lg:py-8">
      <h1 className="text-xl font-bold text-white">My Earnings</h1>

      {/* Summary Card */}
      {loading ? (
        <Skeleton className="h-36 rounded-2xl" />
      ) : summary ? (
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[var(--accent-sync)]/10 to-[var(--accent-sync)]/3 border border-[var(--accent-sync)]/15 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[var(--accent-sync)]/5 -translate-y-1/2 translate-x-1/2" />

          <p className="text-[11px] text-[var(--accent-sync)]/70 font-medium mb-1">Total Earned</p>
          <p className="text-3xl font-bold text-white mb-4">
            ₹{(summary.totalPaise / 100).toFixed(2)}
          </p>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] text-[var(--text-muted)]">Pending</p>
              <p className="text-[14px] font-bold text-amber-400">₹{(summary.pendingPaise / 100).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--text-muted)]">Paid Out</p>
              <p className="text-[14px] font-bold text-green-400">₹{(summary.paidPaise / 100).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--text-muted)]">Rooms Hosted</p>
              <p className="text-[14px] font-bold text-white">{summary.totalRooms}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] text-center">
          <p className="text-[14px] text-[var(--text-muted)]">No earnings yet</p>
          <p className="text-[12px] text-[var(--text-muted)] mt-1">Host your first room to start earning!</p>
        </div>
      )}

      {/* Earnings breakdown */}
      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/6">
        <p className="text-[12px] text-[var(--text-muted)]">
          You earn <strong className="text-[var(--accent-teal)]">70%</strong> of every viewer minute. Platform takes 30%.
        </p>
      </div>

      {/* Room History */}
      {history.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-[15px] font-bold text-white">Room History</h2>

          {history.map((earning) => (
            <div key={earning.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--glass-border)]">
              {earning.posterUrl && (
                <img src={earning.posterUrl} alt={`${earning.movieTitle} poster`} width={40} height={56} className="w-10 h-14 rounded-lg object-cover shrink-0" loading="lazy" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-white truncate">{earning.movieTitle}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {Math.round(earning.totalViewerMinutes)} viewer-min
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                    earning.status === 'paid' ? 'bg-green-500/15 text-green-400' : 'bg-amber-500/15 text-amber-400'
                  }`}>
                    {earning.status === 'paid' ? 'Paid' : 'Pending'}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[14px] font-bold text-[var(--accent-teal)]">
                  ₹{(earning.hostSharePaise / 100).toFixed(2)}
                </p>
                <p className="text-[9px] text-[var(--text-muted)]">
                  of ₹{(earning.grossPaise / 100).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}
