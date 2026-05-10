import { TZ } from '@/lib/tz';

/**
 * Proxy-stream video from backend. Supports Range requests for seeking.
 * Requires a valid session ID to serve content.
 *
 * Uses raw fetch because the SDK's rawRequest parses JSON — streaming
 * requires a raw Response body. The SDK provides the base URL and org headers.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('session');

  // Require session ID for access control
  if (!sessionId) {
    return new Response(JSON.stringify({ error: 'Session required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Build headers using SDK config (org slug + key)
  const headers: Record<string, string> = {
    'X-Org-Slug': TZ.client.orgSlug,
    ...(TZ.client.orgKey ? { 'X-Org-Key': TZ.client.orgKey } : {}),
  };
  const range = request.headers.get('range');
  if (range) headers['Range'] = range;

  const backendUrl = `${TZ.client.baseUrl}/api/v1/storefront/tmdb/play/${id}?session=${sessionId}`;
  const backendRes = await fetch(backendUrl, { headers, redirect: 'manual' });

  // Handle redirects (e.g. to CDN/GDrive)
  if (backendRes.status >= 300 && backendRes.status < 400) {
    const location = backendRes.headers.get('location');
    if (location) return Response.redirect(location, backendRes.status);
  }

  if (!backendRes.ok && backendRes.status !== 206) {
    return new Response(JSON.stringify({ error: 'Stream unavailable' }), {
      status: backendRes.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const responseHeaders = new Headers();
  const forwardHeaders = [
    'content-type', 'content-length', 'content-range',
    'accept-ranges', 'cache-control',
  ];
  for (const h of forwardHeaders) {
    const val = backendRes.headers.get(h);
    if (val) responseHeaders.set(h, val);
  }

  if (!responseHeaders.has('accept-ranges')) {
    responseHeaders.set('accept-ranges', 'bytes');
  }

  responseHeaders.set('cache-control', 'no-store, no-cache, must-revalidate');

  return new Response(backendRes.body, {
    status: backendRes.status,
    headers: responseHeaders,
  });
}
