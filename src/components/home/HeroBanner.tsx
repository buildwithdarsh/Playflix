'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { m, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  slug: string;
}

interface HeroBannerProps {
  banners: Banner[];
}

export default function HeroBanner({ banners }: HeroBannerProps) {
  const [current, setCurrent] = useState(0);
  const [imgLoaded, setImgLoaded] = useState<Record<string, boolean>>({});

  const next = useCallback(() => {
    setCurrent((i) => (i + 1) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  if (banners.length === 0) return null;

  const banner = banners[current];
  if (!banner) return null;

  return (
    <section className="relative w-full overflow-hidden hero-banner">
      {/* Background images — preload all for smooth transition */}
      <AnimatePresence mode="wait">
        <m.div
          key={banner.id}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0"
        >
          <img
            src={banner.imageUrl}
            alt={`${banner.title} — featured movie banner`}
            width={960}
            height={540}
            className={cn(
              'w-full h-full object-cover transition-opacity duration-500',
              imgLoaded[banner.id] ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={() => setImgLoaded((s) => ({ ...s, [banner.id]: true }))}
          />
        </m.div>
      </AnimatePresence>

      {/* Multi-layer gradients for depth */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(to top, #0E0E0E 0%, rgba(14,14,14,0.9) 15%, rgba(14,14,14,0.4) 50%, rgba(14,14,14,0.2) 70%, rgba(14,14,14,0.5) 100%)'
      }} />
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(to right, rgba(14,14,14,0.7) 0%, transparent 50%, transparent 100%)'
      }} />

      {/* Cinematic vignette */}
      <div className="absolute inset-0" style={{
        boxShadow: 'inset 0 0 120px 40px rgba(14,14,14,0.4)'
      }} />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 pb-8 lg:px-10 lg:pb-14 lg:max-w-[1400px] lg:mx-auto">
        <AnimatePresence mode="popLayout">
          <m.div
            key={banner.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Category pill */}
            <m.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--accent-crimson)]/20 border border-[var(--accent-crimson)]/30 mb-3"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-crimson)] animate-pulse" />
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--accent-crimson)]">
                Featured
              </span>
            </m.div>

            <h2
              className="text-[28px] lg:text-[42px] leading-[1.1] font-bold text-white mb-1.5 lg:mb-3 drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] line-clamp-2"
              style={{ fontFamily: 'var(--font-dm-serif), serif' }}
            >
              {banner.title}
            </h2>
            <p className="text-[13px] lg:text-[15px] text-white/60 mb-4 lg:mb-6 font-medium line-clamp-1">
              {banner.subtitle}
            </p>

            <div className="flex items-center gap-3">
              <Link
                href={`/movie/${banner.slug}`}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[var(--accent-crimson)] text-white text-[13px] font-bold tracking-wide hover:bg-[var(--accent-crimson-hover)] transition-all active:scale-[0.96] shadow-[0_4px_24px_rgba(220,38,38,0.4)]"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch Now
              </Link>
              <Link
                href={`/movie/${banner.slug}`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-white/20 text-white/80 text-[13px] font-medium hover:bg-white/10 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Details
              </Link>
            </div>
          </m.div>
        </AnimatePresence>
      </div>

      {/* Progress bar indicators */}
      <div className="absolute bottom-2 right-5 flex gap-1.5 items-end">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="group relative"
            aria-label={`Go to slide ${i + 1}`}
          >
            <div className="w-6 h-[3px] rounded-full bg-white/20 overflow-hidden">
              {i === current && (
                <m.div
                  className="h-full bg-[var(--accent-crimson)] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 6, ease: 'linear' }}
                />
              )}
              {i < current && (
                <div className="h-full w-full bg-white/50 rounded-full" />
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
