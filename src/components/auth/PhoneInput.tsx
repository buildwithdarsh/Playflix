'use client';

import { useState } from 'react';

interface PhoneInputProps {
  onSubmit: (phone: string) => void;
  isLoading: boolean;
}

export default function PhoneInput({ onSubmit, isLoading }: PhoneInputProps) {
  const [phone, setPhone] = useState('');

  const isValid = /^[6-9]\d{9}$/.test(phone);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (isValid) onSubmit(`+91${phone}`);
      }}
      className="w-full max-w-sm space-y-4"
    >
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm font-medium">
          +91
        </span>
        <input
          type="tel"
          inputMode="numeric"
          maxLength={10}
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
          className="w-full pl-14 pr-4 py-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] text-[var(--text-primary)] text-lg font-medium placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-crimson)] transition-colors"
          autoFocus
          autoComplete="tel-national"
        />
      </div>

      <button
        type="submit"
        disabled={!isValid || isLoading}
        className="w-full py-4 rounded-xl bg-[var(--accent-crimson)] text-white font-semibold text-base disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--accent-crimson-hover)] transition-colors active:scale-[0.98]"
      >
        {isLoading ? 'Sending OTP...' : 'Continue'}
      </button>
    </form>
  );
}
