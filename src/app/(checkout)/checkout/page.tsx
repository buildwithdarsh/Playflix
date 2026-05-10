'use client';

import { redirect } from 'next/navigation';

// Checkout is now the Wallet page — redirect
export default function CheckoutPage() {
  redirect('/wallet');
}
