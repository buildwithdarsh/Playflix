/**
 * Razorpay client-side integration for MintWallet top-ups.
 * Keys and order creation happen server-side — frontend only opens the checkout modal.
 */

interface RazorpayCheckoutParams {
  orderId: string;
  keyId: string;
  amount: number; // in paise
  description: string;
  prefill?: { contact?: string; email?: string };
}

interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, callback: () => void) => void;
    };
  }
}

// ─── Local Next.js API Routes ────────────────────────────────────────────────
const PAYMENTS_CREATE_ORDER = '/api/payments/create-order';
const PAYMENTS_VERIFY = '/api/payments/verify';

let scriptLoaded = false;

function loadScript(): Promise<void> {
  if (scriptLoaded) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => { scriptLoaded = true; resolve(); };
    script.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.head.appendChild(script);
  });
}

/**
 * Step 1: Call backend to create a Razorpay order
 */
export async function createWalletOrder(amount: number, packName: string) {
  const res = await fetch(PAYMENTS_CREATE_ORDER, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, packName, type: 'wallet_topup' }),
  });
  if (!res.ok) throw new Error('Failed to create order');
  return res.json() as Promise<{ orderId: string; keyId: string; amount: number }>;
}

/**
 * Step 2: Open Razorpay checkout modal with the server-created order
 */
export async function openRazorpayCheckout(
  params: RazorpayCheckoutParams,
  onSuccess: (response: RazorpaySuccessResponse) => void,
  onError: (error: string) => void,
) {
  await loadScript();

  const options = {
    key: params.keyId,
    amount: params.amount,
    currency: 'INR',
    name: 'PlayFlix',
    description: params.description,
    order_id: params.orderId,
    prefill: {
      contact: params.prefill?.contact || '',
      email: params.prefill?.email || '',
    },
    theme: {
      color: '#00BFA5',
      backdrop_color: 'rgba(14, 14, 14, 0.9)',
    },
    modal: {
      ondismiss: () => onError('Payment cancelled'),
      confirm_close: true,
    },
    handler: (response: RazorpaySuccessResponse) => {
      onSuccess(response);
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.on('payment.failed', () => onError('Payment failed'));
  rzp.open();
}

/**
 * Step 3: Verify payment on backend
 */
export async function verifyPayment(
  razorpayPaymentId: string,
  razorpayOrderId: string,
  razorpaySignature: string,
) {
  const res = await fetch(PAYMENTS_VERIFY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      razorpay_payment_id: razorpayPaymentId,
      razorpay_order_id: razorpayOrderId,
      razorpay_signature: razorpaySignature,
    }),
  });
  if (!res.ok) throw new Error('Verification failed');
  return res.json() as Promise<{ success: boolean; walletBalance?: number }>;
}
