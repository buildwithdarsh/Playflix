'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/auth';

export default function AuthDrawer() {
  const { showAuthDrawer, closeAuthDrawer, sendOtp, verifyOtp, demoLogin, otpState, isLoading } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [demoLoading, setDemoLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const otpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Focus OTP input when we move to OTP step
  useEffect(() => {
    if (otpState) {
      setTimeout(() => otpInputRef.current?.focus(), 300);
    }
  }, [otpState]);

  // Reset state when drawer closes
  useEffect(() => {
    if (!showAuthDrawer) {
      setPhone('');
      setOtp('');
      setError('');
    }
  }, [showAuthDrawer]);

  const handleSendOtp = async () => {
    if (phone.length < 10) { setError('Enter a valid 10-digit number'); return; }
    setError('');
    try {
      await sendOtp(phone);
    } catch (e) {
      setError((e as Error).message || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 4) { setError('Enter the OTP'); return; }
    setError('');
    try {
      await verifyOtp(otp);
    } catch (e) {
      setError((e as Error).message || 'Invalid OTP');
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    setError('');
    try {
      await demoLogin();
    } catch (e) {
      setError((e as Error).message || 'Demo login failed');
    } finally {
      setDemoLoading(false);
    }
  };

  if (!mounted || !showAuthDrawer) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] animate-fade-in"
        onClick={closeAuthDrawer}
      />

      {/* Drawer (mobile) / Modal (desktop) */}
      <div className="fixed bottom-0 left-0 right-0 z-[91] animate-slide-up lg:inset-0 lg:flex lg:items-center lg:justify-center">
        <div className="max-w-[476px] mx-auto lg:w-full">
          <div className="rounded-t-3xl lg:rounded-2xl bg-[var(--bg-primary)] border-t lg:border border-[var(--glass-border)] shadow-[0_-8px_40px_rgba(0,0,0,0.5)] lg:shadow-[0_24px_80px_rgba(0,0,0,0.8)]">
            {/* Handle bar — mobile only */}
            <div className="flex justify-center pt-3 pb-1 lg:hidden">
              <div className="w-10 h-1 rounded-full bg-white/15" />
            </div>

            <div className="px-6 pb-8 pt-2 lg:pt-8 space-y-5">
              {/* Logo + Title */}
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[var(--accent-sync)]/15 flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-[var(--accent-sync)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
                  </svg>
                </div>
                <h2 className="text-[18px] font-bold text-white">
                  {otpState ? 'Enter OTP' : 'Sign in to continue'}
                </h2>
                <p className="text-[12px] text-[var(--text-muted)]">
                  {otpState
                    ? `We sent a code to +91 ${otpState.phone}`
                    : 'Enter your phone number to receive an OTP'}
                </p>
              </div>

              {/* Phone or OTP input */}
              {!otpState ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] focus-within:border-[var(--accent-teal)]/40 transition-colors">
                    <span className="text-[14px] text-[var(--text-muted)] font-medium shrink-0">+91</span>
                    <div className="w-px h-5 bg-white/10" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                      placeholder="Phone number"
                      className="flex-1 bg-transparent text-white text-[15px] font-medium outline-none placeholder:text-[var(--text-muted)]"
                      autoFocus
                      inputMode="numeric"
                    />
                  </div>

                  {error && <p className="text-[12px] text-red-400">{error}</p>}

                  <button
                    onClick={handleSendOtp}
                    disabled={isLoading || phone.length < 10}
                    className="w-full py-3.5 rounded-xl bg-[var(--accent-crimson)] text-white font-bold text-[14px] transition-all active:scale-[0.97] disabled:opacity-50"
                  >
                    {isLoading ? 'Sending...' : 'Continue'}
                  </button>

                  <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                    <div className="flex-1 h-px bg-white/10" />
                    <span>or</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  <button
                    onClick={handleDemoLogin}
                    disabled={demoLoading}
                    className="w-full py-3.5 rounded-xl border border-[var(--accent-sync)]/30 bg-[var(--accent-sync)]/5 text-[var(--accent-sync)] font-bold text-[14px] transition-all active:scale-[0.97] disabled:opacity-50"
                  >
                    {demoLoading ? 'Loading demo...' : 'Try Demo Account'}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <input
                      ref={otpInputRef}
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                      placeholder="------"
                      maxLength={6}
                      className="w-[200px] text-center bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-xl p-3 text-white text-[24px] font-bold tracking-[0.5em] outline-none focus:border-[var(--accent-teal)]/40 placeholder:text-[var(--text-muted)]/30 placeholder:tracking-[0.3em]"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                    />
                  </div>

                  {error && <p className="text-[12px] text-red-400 text-center">{error}</p>}

                  <button
                    onClick={handleVerifyOtp}
                    disabled={isLoading || otp.length < 4}
                    className="w-full py-3.5 rounded-xl bg-[var(--accent-crimson)] text-white font-bold text-[14px] transition-all active:scale-[0.97] disabled:opacity-50"
                  >
                    {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                  </button>

                  <button
                    onClick={() => { useAuthStore.setState({ otpState: null }); setOtp(''); setError(''); }}
                    className="w-full py-2 text-[12px] text-[var(--text-muted)] hover:text-white transition-colors"
                  >
                    Change phone number
                  </button>
                </div>
              )}

              {/* Terms */}
              <p className="text-[10px] text-[var(--text-muted)] text-center leading-relaxed">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
