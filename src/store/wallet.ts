import { create } from 'zustand';
import { TZ } from '@/lib/tz';

interface WalletState {
  balancePaise: number;
  balance: number; // display value in INR (balancePaise / 100)
  isLoading: boolean;

  fetchBalance: () => Promise<void>;
  setBalancePaise: (paise: number) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  balancePaise: 0,
  balance: 0,
  isLoading: false,

  fetchBalance: async () => {
    set({ isLoading: true });
    try {
      const data = await TZ.storefront.wallet.getBalance();
      set({
        balancePaise: data.balancePaise,
        balance: data.balancePaise / 100,
      });
    } catch {
      // keep existing balance
    } finally {
      set({ isLoading: false });
    }
  },

  setBalancePaise: (paise) => set({
    balancePaise: paise,
    balance: paise / 100,
  }),
}));
