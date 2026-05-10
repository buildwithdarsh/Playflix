'use client';

import EmptyState from '@/components/ui/EmptyState';

export default function WatchlistPage() {
  return (
    <div className="px-5 py-4 space-y-4 lg:max-w-[800px] lg:mx-auto lg:py-8">
      <h1 className="text-xl font-bold text-white">Watchlist</h1>

      <EmptyState
        variant="watchlist"
        title="Your watchlist is empty"
        description="Tap the heart on any movie to save it here. Build your perfect watch-later list."
        actionLabel="Discover Movies"
        actionHref="/"
      />
    </div>
  );
}
