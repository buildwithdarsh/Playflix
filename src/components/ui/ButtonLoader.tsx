'use client';

type LoaderVariant = 'film' | 'play' | 'wallet' | 'search' | 'default';

interface ButtonLoaderProps {
  variant?: LoaderVariant;
  size?: number;
  color?: string;
}

export default function ButtonLoader({ variant = 'default', size = 18, color = 'currentColor' }: ButtonLoaderProps) {
  if (variant === 'film') {
    // Film reel spinning
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ color }}>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" />
        <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.5" />
        <g>
          <circle cx="12" cy="4" r="1.5" fill="currentColor" />
          <circle cx="12" cy="20" r="1.5" fill="currentColor" />
          <circle cx="4" cy="12" r="1.5" fill="currentColor" />
          <circle cx="20" cy="12" r="1.5" fill="currentColor" />
          <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
        </g>
      </svg>
    );
  }

  if (variant === 'play') {
    // Pulsing play triangle
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ color }}>
        <polygon points="8,5 8,19 19,12" fill="currentColor" opacity="0.9">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="0.8s" repeatCount="indefinite" />
        </polygon>
        <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.2">
          <animate attributeName="r" values="11;10;11" dur="0.8s" repeatCount="indefinite" />
        </circle>
      </svg>
    );
  }

  if (variant === 'wallet') {
    // Coin dropping animation
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ color }}>
        <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <text x="12" y="15" textAnchor="middle" fontSize="9" fill="currentColor" fontWeight="bold">₹</text>
        <circle cx="12" cy="3" r="2" fill="currentColor" opacity="0">
          <animate attributeName="cy" values="0;12" dur="0.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;0" dur="0.6s" repeatCount="indefinite" />
        </circle>
      </svg>
    );
  }

  if (variant === 'search') {
    // Magnifying glass wobble
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ color }}>
        <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
        <line x1="14.5" y1="14.5" x2="20" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <animateTransform attributeName="transform" type="rotate" values="-5 12 12;5 12 12;-5 12 12" dur="0.4s" repeatCount="indefinite" />
      </svg>
    );
  }

  // Default: simple spinner
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ color }} className="animate-spin">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.2" />
      <path d="M12 2 a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}
