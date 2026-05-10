import { NextResponse } from 'next/server';
import { createHmac } from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;
    const keySecret = process.env['RAZORPAY_KEY_SECRET'];

    if (!keySecret) {
      return NextResponse.json({ error: 'Payment not configured' }, { status: 500 });
    }

    // Verify signature
    const expectedSignature = createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 });
    }

    // Payment verified — in production, credit the wallet in the database here
    return NextResponse.json({
      success: true,
      paymentId: razorpay_payment_id,
    });
  } catch (err) {
    console.error('Verify payment error:', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
