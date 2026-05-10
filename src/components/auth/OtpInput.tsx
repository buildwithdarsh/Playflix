'use client';

import { useRef, useEffect, useState } from 'react';

interface OtpInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  isLoading: boolean;
}

export default function OtpInput({ length = 6, onComplete, isLoading }: OtpInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newValues = [...values];

    // Handle paste
    if (value.length > 1) {
      const digits = value.slice(0, length).split('');
      digits.forEach((d, i) => {
        if (index + i < length) newValues[index + i] = d;
      });
      setValues(newValues);
      const nextIndex = Math.min(index + digits.length, length - 1);
      refs.current[nextIndex]?.focus();
      if (newValues.every((v) => v !== '')) {
        onComplete(newValues.join(''));
      }
      return;
    }

    newValues[index] = value;
    setValues(newValues);

    if (value && index < length - 1) {
      refs.current[index + 1]?.focus();
    }

    if (newValues.every((v) => v !== '')) {
      onComplete(newValues.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {values.map((val, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={i === 0 ? length : 1}
          value={val}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          disabled={isLoading}
          className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-crimson)] transition-colors disabled:opacity-40"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
        />
      ))}
    </div>
  );
}
