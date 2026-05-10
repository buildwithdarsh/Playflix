'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import { MediaPlayer, MediaProvider, type MediaPlayerInstance } from '@vidstack/react';
import { DefaultVideoLayout, defaultLayoutIcons } from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { useRoomStore } from '@/store/room';
import { useMeterStore } from '@/store/meter';
import { TMDB_PLAY_URL } from '@/lib/constants';
import Link from 'next/link';

export default function RoomPlayer() {
  const playerRef = useRef<MediaPlayerInstance>(null);
  const room = useRoomStore((s) => s.room);
  const mode = useRoomStore((s) => s.mode);
  const isHost = useRoomStore((s) => s.isHost);
  const hostPlaybackState = useRoomStore((s) => s.hostPlaybackState);
  const hostPlay = useRoomStore((s) => s.hostPlay);
  const hostPause = useRoomStore((s) => s.hostPause);
  const hostSeek = useRoomStore((s) => s.hostSeek);

  const meterResume = useMeterStore((s) => s.resume);
  const meterPause = useMeterStore((s) => s.pause);
  const meterPollStatus = useMeterStore((s) => s.pollStatus);
  const meterSessionId = useMeterStore((s) => s.sessionId);
  const meterIsActive = useMeterStore((s) => s.isActive);
  const meterStatus = useMeterStore((s) => s.status);

  const [showOverlay, setShowOverlay] = useState<'capped' | 'no_funds' | null>(null);

  const isSyncViewer = mode === 'sync' && !isHost;

  // Watch for billing status changes — auto-pause and show popup
  useEffect(() => {
    if (meterStatus === 'capped') {
      playerRef.current?.pause();
      setShowOverlay('capped');
    } else if (meterStatus === 'insufficient_funds') {
      playerRef.current?.pause();
      setShowOverlay('no_funds');
    } else {
      setShowOverlay(null);
    }
  }, [meterStatus]);

  // Sync mode: follow host playback state
  useEffect(() => {
    if (!isSyncViewer || !hostPlaybackState || !playerRef.current) return;

    const player = playerRef.current;
    const timeDiff = Math.abs(player.currentTime - hostPlaybackState.currentTime);

    if (timeDiff > 3) {
      player.currentTime = hostPlaybackState.currentTime;
    }

    if (hostPlaybackState.playing && player.paused) {
      player.play();
    } else if (!hostPlaybackState.playing && !player.paused) {
      player.pause();
    }
  }, [hostPlaybackState, isSyncViewer]);

  const handlePlay = useCallback(() => {
    if (isHost) {
      hostPlay(playerRef.current?.currentTime || 0);
    }
    if (meterSessionId) {
      meterResume();
    }
  }, [isHost, hostPlay, meterSessionId, meterResume]);

  const handlePause = useCallback(() => {
    if (isHost) {
      hostPause(playerRef.current?.currentTime || 0);
    }
    if (meterSessionId) {
      meterPause();
    }
  }, [isHost, hostPause, meterSessionId, meterPause]);

  const handleSeeked = useCallback(() => {
    if (isHost && playerRef.current) {
      hostSeek(playerRef.current.currentTime);
    }
  }, [isHost, hostSeek]);

  // Meter polling every 5s while active
  useEffect(() => {
    if (!meterIsActive || !meterSessionId) return;
    const interval = setInterval(meterPollStatus, 5000);
    return () => clearInterval(interval);
  }, [meterIsActive, meterSessionId, meterPollStatus]);

  // Video source — only load when session is ready
  const videoSrc = (room?.tmdbId && meterSessionId)
    ? { src: TMDB_PLAY_URL(room.tmdbId, meterSessionId), type: 'video/mp4' as const }
    : '';

  // Show loading until session is ready
  if (!meterSessionId) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <div className="text-center space-y-2">
          <svg className="w-8 h-8 animate-spin text-white/30 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-[11px] text-white/30">Starting session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <MediaPlayer
        ref={playerRef}
        src={videoSrc}
        onPlay={handlePlay}
        onPause={handlePause}
        onSeeked={handleSeeked}
        crossOrigin=""
        className="w-full h-full"
      >
        <MediaProvider />
        <DefaultVideoLayout icons={defaultLayoutIcons} />
      </MediaPlayer>

      {/* Overlay popup when capped or no funds */}
      {showOverlay && (
        <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="text-center space-y-4 px-8 max-w-xs">
            {showOverlay === 'capped' ? (
              <>
                <div className="w-14 h-14 rounded-full bg-green-500/15 flex items-center justify-center mx-auto">
                  <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-[16px] font-bold text-white">Cap Reached</p>
                <p className="text-[12px] text-white/50">You&apos;ve hit the meter cap. Continue watching for free!</p>
                <button
                  onClick={() => { setShowOverlay(null); playerRef.current?.play(); }}
                  className="w-full py-3 rounded-xl bg-green-500 text-white font-bold text-[14px] active:scale-[0.97]"
                >
                  Continue Free
                </button>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center mx-auto">
                  <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <p className="text-[16px] font-bold text-white">Balance Depleted</p>
                <p className="text-[12px] text-white/50">Your MintWallet balance is empty. Top up to continue watching.</p>
                <Link
                  href="/wallet"
                  className="block w-full py-3 rounded-xl bg-[var(--accent-teal)] text-white font-bold text-[14px] text-center active:scale-[0.97]"
                >
                  Top Up Wallet
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
