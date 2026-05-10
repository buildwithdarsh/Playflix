/**
 * Free Creative Commons sample videos for demo playback.
 * These are Blender Foundation open movies — free to use.
 * In production, these would be replaced with licensed content streams.
 */

export const DEMO_VIDEOS = [
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    title: 'Big Buck Bunny',
    duration: 596, // ~10 min
  },
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    title: 'Sintel',
    duration: 888, // ~15 min
  },
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    title: 'Tears of Steel',
    duration: 734, // ~12 min
  },
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    title: 'Elephants Dream',
    duration: 654, // ~11 min
  },
];

/** Pick a consistent demo video for a given movie ID */
export function getDemoVideo(movieId: string) {
  const index = Math.abs(hashCode(movieId)) % DEMO_VIDEOS.length;
  return DEMO_VIDEOS[index];
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash;
}
