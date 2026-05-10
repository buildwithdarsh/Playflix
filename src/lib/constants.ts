export const APP_NAME = 'PlayFlix';
export const APP_TAGLINE = 'Host drops a GDrive link. Everyone watches together — or alone — your call.';
export const BASE_URL = 'https://playflix.in';

/** Local Next.js proxy route for streaming movie playback */
export const TMDB_PLAY_URL = (id: string | number, sessionId?: string) =>
  sessionId ? `/api/tmdb/play/${id}?session=${sessionId}` : `/api/tmdb/play/${id}`;

export const COLORS = {
  bgPrimary: '#0E0E0E',
  bgSecondary: '#1A1A1A',
  bgTertiary: '#262626',
  bgNavy: '#0A0F1C',
  accentCrimson: '#E8004D',
  accentSync: '#EF4444',
  accentSolo: '#8B5CF6',
  accentTeal: '#00BFA5',
  accentGold: '#F5A623',
  textPrimary: '#FAFAFA',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
} as const;

export const ROOM_VIBES = [
  { slug: 'chill', label: 'Chill' },
  { slug: 'serious', label: 'Serious' },
  { slug: 'party', label: 'Party' },
  { slug: 'commentary', label: 'Commentary' },
] as const;

// PPM Content Tiers
export const PPM_TIERS = {
  'standard-classic': { label: 'Classic', ratePerMin: 0.30, color: '#60A5FA' },
  'standard-new': { label: 'New Release', ratePerMin: 0.50, color: '#00BFA5' },
  'premium': { label: 'Premium', ratePerMin: 0.75, color: '#E8004D' },
  'ultra-premium': { label: 'Ultra Premium', ratePerMin: 1.25, color: '#F5A623' },
  'regional-classic': { label: 'Regional', ratePerMin: 0.30, color: '#60A5FA' },
  'regional-new': { label: 'Regional New', ratePerMin: 0.60, color: '#00BFA5' },
  'kids': { label: 'Kids & Family', ratePerMin: 0.25, color: '#4ADE80' },
  'international': { label: 'International', ratePerMin: 0.40, color: '#818CF8' },
} as const;

export type PpmTier = keyof typeof PPM_TIERS;

// MintWallet Load Packs
export const WALLET_PACKS = [
  { name: 'Starter Pack', amount: 20, bonus: 0, desc: 'Try it out — ~40 min of Standard content' },
  { name: 'Movie Night', amount: 50, bonus: 5, desc: 'Enough for one Premium film' },
  { name: 'Weekend Pack', amount: 100, bonus: 15, desc: '2\u20133 movies over a weekend' },
  { name: 'Cinephile Pack', amount: 200, bonus: 40, desc: '4\u20136 movies, best value' },
  { name: 'Super Fan', amount: 500, bonus: 125, desc: '10\u201315 movies, family use' },
] as const;

export const GENRES = [
  { slug: 'action', label: 'Action' },
  { slug: 'comedy', label: 'Comedy' },
  { slug: 'drama', label: 'Drama' },
  { slug: 'thriller', label: 'Thriller' },
  { slug: 'romance', label: 'Romance' },
  { slug: 'horror', label: 'Horror' },
  { slug: 'sci-fi', label: 'Sci-Fi' },
  { slug: 'family', label: 'Family' },
  { slug: 'documentary', label: 'Documentary' },
  { slug: 'animation', label: 'Animation' },
] as const;

export const MOODS = [
  { slug: 'feel-good', label: 'Feel Good Tonight' },
  { slug: 'intense', label: 'Something Intense' },
  { slug: 'scary', label: 'Something Scary Tonight' },
  { slug: 'romantic', label: 'Date Night' },
  { slug: 'family', label: 'Family Movie Night' },
  { slug: 'mind-bending', label: 'Mind-Bending' },
] as const;

export const LANGUAGES = [
  'Hindi', 'English', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Marathi', 'Punjabi', 'Bengali',
] as const;
