function getEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) throw new Error(`Missing env var: ${key}`);
  return value;
}

export const env = {
  get BACKEND_URL() { return getEnv('BACKEND_URL'); },
  get ORG_SLUG() { return getEnv('ORG_SLUG', 'playflix'); },
} as const;
