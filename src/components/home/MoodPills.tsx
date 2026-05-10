'use client';

import Link from 'next/link';
import { MOODS } from '@/lib/constants';

export default function MoodPills() {
  return (
    <section className="px-5 lg:px-10 lg:max-w-[1400px] lg:mx-auto">
      <h2 className="text-[17px] lg:text-[20px] font-bold text-white tracking-tight mb-1">
        I&apos;m in the mood for...
      </h2>
      <p className="text-[11px] text-[var(--text-muted)] mb-3">Find movies by vibe</p>
      <div className="flex flex-wrap gap-2">
        {MOODS.map((mood) => (
          <Link
            key={mood.slug}
            href={`/search?mood=${mood.slug}`}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08] text-[13px] font-medium text-white/70 hover:text-white hover:border-[var(--accent-crimson)]/40 hover:from-[var(--accent-crimson)]/10 hover:to-transparent transition-all duration-300"
          >
            {mood.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
