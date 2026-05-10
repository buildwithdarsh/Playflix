'use client';

import { useToastStore } from '@/store/toast';
import { cn } from '@/lib/cn';

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-[100] flex flex-col items-center gap-2 px-4 pointer-events-none">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          onClick={() => dismiss(toast.id)}
          className={cn(
            'pointer-events-auto animate-slide-up glass rounded-xl px-4 py-3 text-sm font-medium max-w-sm w-full text-center',
            toast.type === 'success' && 'border-green-500/30 text-green-400',
            toast.type === 'error' && 'border-red-500/30 text-red-400',
            toast.type === 'info' && 'border-white/10 text-[var(--text-primary)]'
          )}
        >
          {toast.message}
        </button>
      ))}
    </div>
  );
}
