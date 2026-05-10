import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TZ } from '@/lib/tz';
import type { EndUser } from '@buildwithdarsh/sdk';

export type User = EndUser;

interface OtpState {
  phone: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  otpState: OtpState | null;

  // Auth drawer state
  showAuthDrawer: boolean;
  authCallback: (() => void) | null;

  initialize: () => Promise<void>;
  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;

  // Open auth drawer with optional callback on success
  requireAuth: (callback?: () => void) => void;
  closeAuthDrawer: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isInitialized: false,
      otpState: null,
      showAuthDrawer: false,
      authCallback: null,

      initialize: async () => {
        if (get().isInitialized) return;
        set({ isLoading: true });

        try {
          const data = await TZ.storefront.auth.me();
          const user = ('user' in data && data.user) ? data.user : data;
          set({ user: user as User, isInitialized: true });
        } catch {
          TZ.storefront.auth.clearTokens();
          set({ user: null, isInitialized: true });
        } finally {
          set({ isLoading: false });
        }
      },

      sendOtp: async (phone) => {
        set({ isLoading: true });
        try {
          await TZ.storefront.auth.sendOtp({ identifier: phone, type: 'login' });
          set({ otpState: { phone } });
        } finally {
          set({ isLoading: false });
        }
      },

      verifyOtp: async (otp) => {
        const otpState = get().otpState;
        if (!otpState) throw new Error('No OTP request in progress');

        set({ isLoading: true });
        try {
          const data = await TZ.storefront.auth.verifyOtp({
            identifier: otpState.phone,
            otp,
            type: 'login',
          });

          // SDK auto-saves tokens internally
          set({ user: data.user as User, otpState: null, showAuthDrawer: false });

          // Execute callback if any (e.g. redirect to watch)
          const cb = get().authCallback;
          if (cb) {
            set({ authCallback: null });
            setTimeout(cb, 100);
          }
        } finally {
          set({ isLoading: false });
        }
      },

      demoLogin: async () => {
        set({ isLoading: true });
        try {
          const res = await TZ.storefront.auth.demoLogin();
          set({ user: res.user as User, otpState: null, showAuthDrawer: false });
          const cb = get().authCallback;
          if (cb) {
            set({ authCallback: null });
            setTimeout(cb, 100);
          }
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        TZ.storefront.auth.clearTokens();
        set({ user: null, isInitialized: false, otpState: null });
      },

      setUser: (user) => set({ user }),

      requireAuth: (callback) => {
        const user = get().user;
        if (user) {
          callback?.();
          return;
        }
        set({ showAuthDrawer: true, authCallback: callback || null });
      },

      closeAuthDrawer: () => {
        set({ showAuthDrawer: false, authCallback: null, otpState: null });
      },
    }),
    {
      name: 'wr-auth',
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
