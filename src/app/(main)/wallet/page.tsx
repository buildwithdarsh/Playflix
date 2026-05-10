'use client';

import { useState, useEffect } from 'react';
import { useWalletStore } from '@/store/wallet';
import { useToastStore } from '@/store/toast';
import { useAuthStore } from '@/store/auth';
import { TZ } from '@/lib/tz';
import type { WalletPack } from '@buildwithdarsh/sdk';
import { cn } from '@/lib/cn';
import { createWalletOrder, openRazorpayCheckout } from '@/lib/razorpay';

export default function WalletPage() {
  const [packs, setPacks] = useState<WalletPack[]>([]);
  const [selectedPack, setSelectedPack] = useState(1);
  const [packsLoading, setPacksLoading] = useState(true);
  const wallet = useWalletStore();
  const user = useAuthStore((s) => s.user);
  const requireAuth = useAuthStore((s) => s.requireAuth);
  const showToast = useToastStore((s) => s.show);
  const [loading, setLoading] = useState(false);

  // Fetch real balance from backend
  useEffect(() => {
    if (user) wallet.fetchBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Fetch packs from backend
  useEffect(() => {
    TZ.storefront.wallet.getPacks()
      .then((data) => {
        setPacks(data);
        // Default select the "popular" one or index 2
        const popularIdx = data.findIndex((p) => p.isPopular);
        setSelectedPack(popularIdx >= 0 ? popularIdx : Math.min(2, data.length - 1));
      })
      .catch(() => {
        // Fallback
        setPacks([
          { id: 'fallback-1', name: 'Movie Night', amount: 50, bonus: 5, isPopular: false, desc: 'Enough for one Premium film' },
          { id: 'fallback-2', name: 'Weekend Pack', amount: 100, bonus: 15, isPopular: true, desc: '2–3 movies over a weekend' },
        ]);
      })
      .finally(() => setPacksLoading(false));
  }, []);

  const pack = packs[selectedPack];

  const handleTopUp = async () => {
    if (!user) {
      requireAuth(() => handleTopUp());
      return;
    }
    if (!pack) return;
    setLoading(true);
    const totalCredit = pack.amount + pack.bonus;

    try {
      const order = await createWalletOrder(pack.amount, pack.name);

      openRazorpayCheckout(
        {
          orderId: order.orderId,
          keyId: order.keyId,
          amount: order.amount,
          description: `MintWallet — ${pack.name}`,
          prefill: { contact: user?.phone || '' },
        },
        async (response) => {
          try {
            const result = await TZ.storefront.wallet.topUp({
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              amountPaise: pack.amount * 100,
              bonusPaise: pack.bonus * 100,
            });

            wallet.setBalancePaise(result.balancePaise);
            showToast(`₹${totalCredit} added to MintWallet!`, 'success');
          } catch {
            showToast('Payment verification failed', 'error');
          }
          setLoading(false);
        },
        (error) => {
          showToast(error || 'Payment failed', 'error');
          setLoading(false);
        },
      );
    } catch {
      showToast('Could not create order. Try again.', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="px-5 py-4 space-y-6 lg:max-w-[800px] lg:mx-auto lg:py-8">
      <h1 className="text-xl font-bold text-white">MintWallet</h1>

      {/* Balance card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[var(--accent-teal)]/12 to-[var(--accent-teal)]/3 border border-[var(--accent-teal)]/20 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[var(--accent-teal)]/5 -translate-y-1/2 translate-x-1/2" />
        <p className="text-[12px] text-[var(--accent-teal)]/70 font-medium mb-1">Available Balance</p>
        <p className="text-[38px] font-bold text-white leading-none">₹{wallet.balance.toFixed(2)}</p>
        <p className="text-[11px] text-[var(--text-muted)] mt-2">Never expires. Fully refundable anytime.</p>
      </div>

      {/* How it works */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-[var(--glass-border)] space-y-2">
        <h3 className="text-[13px] font-semibold text-white">How Pay-Per-Minute works</h3>
        <div className="space-y-1.5 text-[12px] text-[var(--text-muted)]">
          <p className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-[var(--accent-teal)]/15 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[8px] font-bold text-[var(--accent-teal)]">1</span>
            </span>
            Load your wallet — minimum ₹10
          </p>
          <p className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-[var(--accent-teal)]/15 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[8px] font-bold text-[var(--accent-teal)]">2</span>
            </span>
            Tap Watch Now — meter runs only while watching
          </p>
          <p className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-[var(--accent-teal)]/15 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[8px] font-bold text-[var(--accent-teal)]">3</span>
            </span>
            Pause or exit — meter stops instantly
          </p>
          <p className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-[var(--accent-gold)]/15 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[8px] font-bold text-[var(--accent-gold)]">4</span>
            </span>
            Hit the cap? Rest of the movie is FREE
          </p>
        </div>
      </div>

      {/* Top-up packs */}
      <div className="space-y-2">
        <h2 className="text-[15px] font-semibold text-white">Top up</h2>
        {packsLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[72px] rounded-xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : (
          packs.map((p, i) => (
            <button
              key={p.name}
              onClick={() => setSelectedPack(i)}
              className={cn(
                'w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between',
                i === selectedPack
                  ? 'bg-[var(--accent-teal)]/8 border-[var(--accent-teal)]/30'
                  : 'bg-white/[0.02] border-[var(--glass-border)] hover:border-white/[0.12]'
              )}
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[14px] font-semibold text-white">{p.name}</p>
                  {p.isPopular && (
                    <span className="px-1.5 py-[1px] rounded text-[8px] font-bold uppercase bg-[var(--accent-gold)]/15 text-[var(--accent-gold)]">Popular</span>
                  )}
                </div>
                <p className="text-[12px] text-[var(--text-muted)] mt-0.5">{p.desc}</p>
              </div>
              <div className="text-right shrink-0 ml-3">
                <p className="text-[16px] font-bold text-white">₹{p.amount}</p>
                {p.bonus > 0 && (
                  <p className="text-[11px] font-semibold text-[var(--accent-gold)]">+₹{p.bonus} bonus</p>
                )}
              </div>
            </button>
          ))
        )}
      </div>

      {pack && (
        <button
          onClick={handleTopUp}
          disabled={loading}
          className="w-full py-4 rounded-xl bg-[var(--accent-teal)] text-white font-bold text-[15px] hover:bg-[var(--accent-teal-hover)] transition-colors active:scale-[0.98] glow-teal disabled:opacity-50"
        >
          {loading ? 'Processing...' : `Add ₹${pack.amount}${pack.bonus > 0 ? ` + ₹${pack.bonus} bonus` : ''}`}
        </button>
      )}

      <p className="text-center text-[11px] text-[var(--text-muted)]">
        Secure payment via Razorpay. UPI, Cards, Netbanking accepted.
      </p>
    </div>
  );
}
