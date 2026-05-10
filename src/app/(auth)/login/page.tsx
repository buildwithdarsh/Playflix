'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useToastStore } from '@/store/toast';
import { TZ } from '@/lib/tz';
import PhoneInput from '@/components/auth/PhoneInput';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';

export default function LoginPage() {
  const router = useRouter();
  const { sendOtp, isLoading, setUser } = useAuthStore();
  const showToast = useToastStore((s) => s.show);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleSendOtp = async (phone: string) => {
    try {
      await sendOtp(phone);
      router.push('/verify');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to send OTP', 'error');
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    try {
      const res = await TZ.storefront.auth.login({ email: 'demo@playflix.in', password: 'Demo@1234' });
      setUser(res.user);
      router.replace('/dashboard');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Demo login failed', 'error');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm text-center space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--accent-crimson)] mb-2">
          {APP_NAME}
        </h1>
        <p className="text-sm text-[var(--text-muted)]">{APP_TAGLINE}</p>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          Sign in to continue
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Enter your phone number to receive an OTP
        </p>
      </div>

      <PhoneInput onSubmit={handleSendOtp} isLoading={isLoading} />

      <div className="space-y-3">
        <div className="relative flex items-center gap-3">
          <div className="flex-1 h-px bg-[var(--border)]" />
          <span className="text-xs text-[var(--text-muted)]">or</span>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>

        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={demoLoading || isLoading}
          className="w-full py-2.5 border border-[var(--accent-crimson)]/30 bg-[var(--accent-crimson)]/5 text-[var(--accent-crimson)] text-sm font-semibold rounded-xl hover:bg-[var(--accent-crimson)]/10 transition-colors disabled:opacity-50"
        >
          {demoLoading ? 'Signing in...' : 'Try Demo Account'}
        </button>
        <p className="text-xs text-[var(--text-muted)]">demo@playflix.in · Demo@1234</p>
      </div>

      <p className="text-xs text-[var(--text-muted)]">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
