'use client';

const ICONS = [
  // Film reel
  { id: 1, x: 5, y: 8, size: 32, delay: 0, dur: 18, icon: <><circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1" fill="none"/><circle cx="16" cy="16" r="4" stroke="currentColor" strokeWidth="1" fill="none"/><circle cx="16" cy="6" r="2" fill="currentColor"/><circle cx="16" cy="26" r="2" fill="currentColor"/><circle cx="6" cy="16" r="2" fill="currentColor"/><circle cx="26" cy="16" r="2" fill="currentColor"/></> },
  // Popcorn
  { id: 2, x: 85, y: 15, size: 28, delay: 3, dur: 22, icon: <><path d="M8 14 L10 26 L22 26 L24 14Z" stroke="currentColor" strokeWidth="1" fill="none"/><circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="0.8" fill="none"/><circle cx="16" cy="9" r="3.5" stroke="currentColor" strokeWidth="0.8" fill="none"/><circle cx="20" cy="11" r="3" stroke="currentColor" strokeWidth="0.8" fill="none"/></> },
  // Play button
  { id: 3, x: 12, y: 40, size: 26, delay: 6, dur: 20, icon: <><circle cx="13" cy="13" r="12" stroke="currentColor" strokeWidth="1" fill="none"/><polygon points="10,7 10,19 20,13" fill="currentColor" opacity="0.6"/></> },
  // Star
  { id: 4, x: 90, y: 55, size: 22, delay: 2, dur: 16, icon: <path d="M11 1 l3 7 h7 l-5.5 4.5 2 7 -6.5-4.5 -6.5 4.5 2-7L1 8h7z" stroke="currentColor" strokeWidth="0.8" fill="none"/> },
  // Clapperboard
  { id: 5, x: 8, y: 70, size: 30, delay: 8, dur: 24, icon: <><rect x="4" y="10" width="24" height="18" rx="2" stroke="currentColor" strokeWidth="1" fill="none"/><path d="M4 10 L8 4 L28 4 L28 10Z" stroke="currentColor" strokeWidth="1" fill="none"/><line x1="12" y1="4" x2="10" y2="10" stroke="currentColor" strokeWidth="0.8"/><line x1="20" y1="4" x2="18" y2="10" stroke="currentColor" strokeWidth="0.8"/></> },
  // Ticket
  { id: 6, x: 88, y: 80, size: 30, delay: 5, dur: 19, icon: <><rect x="3" y="8" width="26" height="16" rx="3" stroke="currentColor" strokeWidth="1" fill="none"/><line x1="16" y1="8" x2="16" y2="24" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2"/><circle cx="16" cy="8" r="2.5" fill="#050505" stroke="currentColor" strokeWidth="0.8"/><circle cx="16" cy="24" r="2.5" fill="#050505" stroke="currentColor" strokeWidth="0.8"/></> },
  // Camera
  { id: 7, x: 50, y: 5, size: 26, delay: 10, dur: 21, icon: <><rect x="4" y="9" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1" fill="none"/><circle cx="14" cy="16" r="5" stroke="currentColor" strokeWidth="1" fill="none"/><circle cx="14" cy="16" r="2" stroke="currentColor" strokeWidth="0.8" fill="none"/><rect x="7" y="6" width="6" height="3" rx="1" stroke="currentColor" strokeWidth="0.8" fill="none"/></> },
  // Film strip
  { id: 8, x: 48, y: 90, size: 34, delay: 7, dur: 23, icon: <><rect x="5" y="4" width="24" height="24" rx="2" stroke="currentColor" strokeWidth="1" fill="none"/><rect x="7" y="6" width="4" height="3" rx="0.5" fill="currentColor" opacity="0.4"/><rect x="7" y="11" width="4" height="3" rx="0.5" fill="currentColor" opacity="0.4"/><rect x="7" y="16" width="4" height="3" rx="0.5" fill="currentColor" opacity="0.4"/><rect x="7" y="21" width="4" height="3" rx="0.5" fill="currentColor" opacity="0.4"/><rect x="23" y="6" width="4" height="3" rx="0.5" fill="currentColor" opacity="0.4"/><rect x="23" y="11" width="4" height="3" rx="0.5" fill="currentColor" opacity="0.4"/><rect x="23" y="16" width="4" height="3" rx="0.5" fill="currentColor" opacity="0.4"/><rect x="23" y="21" width="4" height="3" rx="0.5" fill="currentColor" opacity="0.4"/></> },
  // Heart / love
  { id: 9, x: 25, y: 92, size: 20, delay: 4, dur: 17, icon: <path d="M12 21 C12 21, 3 14, 3 8.5 C3 5, 5.5 3, 7.5 3 C9.5 3, 11 4.5, 12 6 C13 4.5, 14.5 3, 16.5 3 C18.5 3, 21 5, 21 8.5 C21 14, 12 21, 12 21Z" stroke="currentColor" strokeWidth="1" fill="none"/> },
  // Music note
  { id: 10, x: 75, y: 35, size: 22, delay: 11, dur: 20, icon: <><line x1="8" y1="4" x2="8" y2="18" stroke="currentColor" strokeWidth="1"/><line x1="18" y1="2" x2="18" y2="16" stroke="currentColor" strokeWidth="1"/><circle cx="5" cy="18" r="3" stroke="currentColor" strokeWidth="1" fill="none"/><circle cx="15" cy="16" r="3" stroke="currentColor" strokeWidth="1" fill="none"/><line x1="8" y1="4" x2="18" y2="2" stroke="currentColor" strokeWidth="1"/></> },
  // Glasses / 3D
  { id: 11, x: 70, y: 65, size: 24, delay: 9, dur: 18, icon: <><circle cx="8" cy="12" r="5" stroke="currentColor" strokeWidth="1" fill="none"/><circle cx="20" cy="12" r="5" stroke="currentColor" strokeWidth="1" fill="none"/><line x1="13" y1="12" x2="15" y2="12" stroke="currentColor" strokeWidth="1"/><line x1="3" y1="10" x2="1" y2="8" stroke="currentColor" strokeWidth="1"/><line x1="25" y1="10" x2="27" y2="8" stroke="currentColor" strokeWidth="1"/></> },
  // Sparkle
  { id: 12, x: 35, y: 50, size: 18, delay: 1, dur: 15, icon: <><line x1="9" y1="1" x2="9" y2="17" stroke="currentColor" strokeWidth="1"/><line x1="1" y1="9" x2="17" y2="9" stroke="currentColor" strokeWidth="1"/><line x1="3" y1="3" x2="15" y2="15" stroke="currentColor" strokeWidth="0.6"/><line x1="15" y1="3" x2="3" y2="15" stroke="currentColor" strokeWidth="0.6"/></> },
];

const COLORS = ['#E8004D', '#00BFA5', '#F5A623', '#ffffff'];

export default function DesktopBackground() {
  return (
    <div className="desktop-bg-container">
      {ICONS.map((item) => (
        <div
          key={item.id}
          className="desktop-floating-icon"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            width: item.size,
            height: item.size,
            animationDelay: `${item.delay}s`,
            animationDuration: `${item.dur}s`,
          }}
        >
          <svg
            viewBox="0 0 32 32"
            width={item.size}
            height={item.size}
            style={{ color: COLORS[item.id % COLORS.length] }}
          >
            {item.icon}
          </svg>
        </div>
      ))}
    </div>
  );
}
