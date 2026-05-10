'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useToastStore } from '@/store/toast';
import OtpInput from '@/components/auth/OtpInput';

export default function VerifyPage() {
  const router = useRouter();
  const { verifyOtp, otpState, isLoading } = useAuthStore();
  const showToast = useToastStore((s) => s.show);

  const handleVerify = async (otp: string) => {
    try {
      await verifyOtp(otp);
      showToast('Welcome to PlayFlix!', 'success');
      router.replace('/');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Invalid OTP', 'error');
    }
  };

  return (
    <div className="w-full max-w-sm text-center space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          Verify OTP
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Enter the code sent to{' '}
          <span className="text-[var(--text-primary)] font-medium">
            {otpState?.phone || 'your phone'}
          </span>
        </p>
      </div>

      <OtpInput onComplete={handleVerify} isLoading={isLoading} />

      <button
        onClick={() => router.back()}
        className="text-sm text-[var(--accent-crimson)] font-medium"
      >
        Change phone number
      </button>
    </div>
  );
}
