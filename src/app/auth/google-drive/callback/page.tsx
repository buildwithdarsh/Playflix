'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { TZ } from '@/lib/tz';

function GoogleDriveCallbackInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setErrorMsg(error === 'access_denied' ? 'You denied access.' : `Google error: ${error}`);
      return;
    }

    if (!code) {
      setStatus('error');
      setErrorMsg('No authorization code received.');
      return;
    }

    (async () => {
      try {
        await TZ.storefront.connectedSources.connectGoogleDrive({ code });
        setStatus('success');
        // If opened as popup, send message to parent and close
        if (window.opener) {
          window.opener.postMessage({ type: 'google-drive-callback', code }, '*');
          window.close();
        } else {
          // Redirect to profile after short delay
          setTimeout(() => router.replace('/profile'), 1500);
        }
      } catch (err) {
        setStatus('error');
        setErrorMsg((err as Error).message || 'Failed to connect Google Drive.');
      }
    })();
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)]">
      <div className="text-center space-y-3 px-6">
        {status === 'processing' && (
          <>
            <div className="w-10 h-10 rounded-full border-2 border-[var(--accent-sync)] border-t-transparent animate-spin mx-auto" />
            <p className="text-[14px] text-white">Connecting Google Drive...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-12 h-12 rounded-full bg-green-500/15 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-[14px] text-white font-semibold">Google Drive Connected!</p>
            <p className="text-[12px] text-[var(--text-muted)]">Redirecting to profile...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-[14px] text-white font-semibold">Connection Failed</p>
            <p className="text-[12px] text-red-400">{errorMsg}</p>
            <button onClick={() => router.replace('/profile')} className="text-[12px] text-[var(--accent-sync)] mt-2">
              Back to Profile
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function GoogleDriveCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)]">
        <div className="w-10 h-10 rounded-full border-2 border-[var(--accent-sync)] border-t-transparent animate-spin" />
      </div>
    }>
      <GoogleDriveCallbackInner />
    </Suspense>
  );
}
