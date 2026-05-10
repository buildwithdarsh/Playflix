'use client';

import Link from 'next/link';

type EmptyVariant = 'library' | 'watchlist' | 'search' | 'profile' | 'error' | 'no-results';

interface EmptyStateProps {
  variant: EmptyVariant;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

function AnimatedIllustration({ variant }: { variant: EmptyVariant }) {
  if (variant === 'library') {
    return (
      <svg width="160" height="160" viewBox="0 0 160 160" fill="none" className="mx-auto">
        {/* Film strip */}
        <rect x="30" y="40" width="100" height="80" rx="8" fill="#1A1A1A" stroke="#333" strokeWidth="1.5">
          <animate attributeName="y" values="40;37;40" dur="3s" repeatCount="indefinite" />
        </rect>
        {/* Film holes left */}
        {[0, 1, 2, 3].map((i) => (
          <rect key={`l${i}`} x="35" y={48 + i * 18} width="8" height="10" rx="2" fill="#0E0E0E">
            <animate attributeName="y" values={`${48 + i * 18};${45 + i * 18};${48 + i * 18}`} dur="3s" repeatCount="indefinite" />
          </rect>
        ))}
        {/* Film holes right */}
        {[0, 1, 2, 3].map((i) => (
          <rect key={`r${i}`} x="117" y={48 + i * 18} width="8" height="10" rx="2" fill="#0E0E0E">
            <animate attributeName="y" values={`${48 + i * 18};${45 + i * 18};${48 + i * 18}`} dur="3s" repeatCount="indefinite" />
          </rect>
        ))}
        {/* Play button */}
        <circle cx="80" cy="80" r="18" fill="#DC2626" opacity="0.9">
          <animate attributeName="r" values="18;20;18" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.9;1;0.9" dur="2s" repeatCount="indefinite" />
        </circle>
        <polygon points="75,72 75,88 89,80" fill="white" />
        {/* Sparkles */}
        <circle cx="45" cy="35" r="2" fill="#DC2626" opacity="0">
          <animate attributeName="opacity" values="0;1;0" dur="2.5s" repeatCount="indefinite" begin="0s" />
          <animate attributeName="r" values="1;3;1" dur="2.5s" repeatCount="indefinite" begin="0s" />
        </circle>
        <circle cx="120" cy="32" r="2" fill="#F59E0B" opacity="0">
          <animate attributeName="opacity" values="0;1;0" dur="2.5s" repeatCount="indefinite" begin="0.8s" />
          <animate attributeName="r" values="1;3;1" dur="2.5s" repeatCount="indefinite" begin="0.8s" />
        </circle>
        <circle cx="105" cy="130" r="2" fill="#DC2626" opacity="0">
          <animate attributeName="opacity" values="0;1;0" dur="2.5s" repeatCount="indefinite" begin="1.5s" />
          <animate attributeName="r" values="1;3;1" dur="2.5s" repeatCount="indefinite" begin="1.5s" />
        </circle>
      </svg>
    );
  }

  if (variant === 'watchlist') {
    return (
      <svg width="160" height="160" viewBox="0 0 160 160" fill="none" className="mx-auto">
        {/* Heart outline */}
        <path
          d="M80 130 C80 130, 30 95, 30 65 C30 48, 44 38, 55 38 C65 38, 75 45, 80 55 C85 45, 95 38, 105 38 C116 38, 130 48, 130 65 C130 95, 80 130, 80 130Z"
          stroke="#DC2626" strokeWidth="2" fill="none" strokeDasharray="300" strokeDashoffset="300"
        >
          <animate attributeName="stroke-dashoffset" values="300;0;0" dur="3s" repeatCount="indefinite" />
        </path>
        {/* Film icon inside heart */}
        <rect x="64" y="68" width="32" height="24" rx="3" stroke="#555" strokeWidth="1.5" fill="none">
          <animate attributeName="opacity" values="0;1;1;0" dur="3s" repeatCount="indefinite" />
        </rect>
        <circle cx="80" cy="80" r="5" stroke="#555" strokeWidth="1.5" fill="none">
          <animate attributeName="opacity" values="0;1;1;0" dur="3s" repeatCount="indefinite" />
        </circle>
        {/* Pulse rings */}
        <circle cx="80" cy="80" r="50" stroke="#DC2626" strokeWidth="1" fill="none" opacity="0">
          <animate attributeName="r" values="40;65" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
    );
  }

  if (variant === 'search' || variant === 'no-results') {
    return (
      <svg width="160" height="160" viewBox="0 0 160 160" fill="none" className="mx-auto">
        {/* Magnifying glass */}
        <circle cx="72" cy="72" r="28" stroke="#555" strokeWidth="2.5" fill="none">
          <animate attributeName="r" values="28;30;28" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <line x1="93" y1="93" x2="118" y2="118" stroke="#555" strokeWidth="3" strokeLinecap="round">
          <animate attributeName="x2" values="118;120;118" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="y2" values="118;120;118" dur="2.5s" repeatCount="indefinite" />
        </line>
        {/* Film reel inside lens */}
        <circle cx="72" cy="72" r="12" stroke="#DC2626" strokeWidth="1.5" fill="none" opacity="0.6">
          <animateTransform attributeName="transform" type="rotate" from="0 72 72" to="360 72 72" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle cx="72" cy="60" r="2" fill="#DC2626" opacity="0.4">
          <animateTransform attributeName="transform" type="rotate" from="0 72 72" to="360 72 72" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle cx="72" cy="84" r="2" fill="#DC2626" opacity="0.4">
          <animateTransform attributeName="transform" type="rotate" from="0 72 72" to="360 72 72" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle cx="60" cy="72" r="2" fill="#DC2626" opacity="0.4">
          <animateTransform attributeName="transform" type="rotate" from="0 72 72" to="360 72 72" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle cx="84" cy="72" r="2" fill="#DC2626" opacity="0.4">
          <animateTransform attributeName="transform" type="rotate" from="0 72 72" to="360 72 72" dur="4s" repeatCount="indefinite" />
        </circle>
      </svg>
    );
  }

  if (variant === 'profile') {
    return (
      <svg width="160" height="160" viewBox="0 0 160 160" fill="none" className="mx-auto">
        {/* Popcorn bucket */}
        <path d="M50 70 L60 130 L100 130 L110 70Z" fill="#1A1A1A" stroke="#333" strokeWidth="1.5">
          <animate attributeName="d" values="M50 70 L60 130 L100 130 L110 70Z;M48 68 L60 130 L100 130 L112 68Z;M50 70 L60 130 L100 130 L110 70Z" dur="3s" repeatCount="indefinite" />
        </path>
        {/* Stripes */}
        <line x1="65" y1="75" x2="68" y2="125" stroke="#DC2626" strokeWidth="3" opacity="0.3" />
        <line x1="80" y1="72" x2="80" y2="128" stroke="#DC2626" strokeWidth="3" opacity="0.3" />
        <line x1="95" y1="75" x2="92" y2="125" stroke="#DC2626" strokeWidth="3" opacity="0.3" />
        {/* Popcorn pieces popping */}
        <circle cx="65" cy="65" r="6" fill="#F59E0B" opacity="0.8">
          <animate attributeName="cy" values="65;55;65" dur="1.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;1;0.8" dur="1.8s" repeatCount="indefinite" />
        </circle>
        <circle cx="80" cy="60" r="7" fill="#F59E0B" opacity="0.9">
          <animate attributeName="cy" values="60;48;60" dur="2.2s" repeatCount="indefinite" begin="0.3s" />
        </circle>
        <circle cx="95" cy="63" r="5.5" fill="#F59E0B" opacity="0.7">
          <animate attributeName="cy" values="63;53;63" dur="2s" repeatCount="indefinite" begin="0.6s" />
        </circle>
        <circle cx="73" cy="58" r="5" fill="#FBBF24" opacity="0.6">
          <animate attributeName="cy" values="58;45;58" dur="2.5s" repeatCount="indefinite" begin="1s" />
        </circle>
        <circle cx="88" cy="57" r="5.5" fill="#FBBF24" opacity="0.7">
          <animate attributeName="cy" values="57;46;57" dur="2.1s" repeatCount="indefinite" begin="0.5s" />
        </circle>
        {/* Ticket stub */}
        <rect x="40" y="135" width="80" height="16" rx="3" fill="#1A1A1A" stroke="#DC2626" strokeWidth="1" opacity="0.5">
          <animate attributeName="opacity" values="0.5;0.8;0.5" dur="3s" repeatCount="indefinite" />
        </rect>
        <text x="80" y="147" textAnchor="middle" fontSize="8" fill="#DC2626" fontWeight="600" opacity="0.6">ADMIT ONE</text>
      </svg>
    );
  }

  // error fallback
  return (
    <svg width="160" height="160" viewBox="0 0 160 160" fill="none" className="mx-auto">
      <circle cx="80" cy="80" r="40" stroke="#333" strokeWidth="2" fill="none">
        <animate attributeName="r" values="40;42;40" dur="2s" repeatCount="indefinite" />
      </circle>
      <path d="M65 65 L95 95 M95 65 L65 95" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round">
        <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

export default function EmptyState({ variant, title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <AnimatedIllustration variant={variant} />
      <h3 className="text-[17px] font-bold text-white mt-5 mb-1.5">{title}</h3>
      <p className="text-[13px] text-[var(--text-muted)] max-w-[260px] leading-relaxed">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[var(--accent-crimson)] text-white text-[13px] font-bold hover:bg-[var(--accent-crimson-hover)] transition-all active:scale-[0.96] glow-crimson"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
