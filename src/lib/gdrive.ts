/**
 * Extract Google Drive file ID from a URL or raw ID.
 */
export function extractGdriveFileId(input: string): string {
  const trimmed = input.trim();
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /id=([a-zA-Z0-9_-]+)/,
    /\/open\?id=([a-zA-Z0-9_-]+)/,
  ];
  for (const p of patterns) {
    const match = trimmed.match(p);
    if (match?.[1]) return match[1];
  }
  return trimmed;
}

/**
 * Check if a string looks like a valid GDrive URL or file ID.
 */
export function isValidGdriveInput(input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed) return false;
  // Raw file ID (alphanumeric with hyphens/underscores, typically 25-50 chars)
  if (/^[a-zA-Z0-9_-]{20,}$/.test(trimmed)) return true;
  // Drive URL
  if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com')) return true;
  return false;
}
