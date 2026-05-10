import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const amount = body.amount; // in INR
    const keyId = process.env['RAZORPAY_KEY_ID'];
    const keySecret = process.env['RAZORPAY_KEY_SECRET'];

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: 'Payment not configured' }, { status: 500 });
    }

    // Create Razorpay order
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: amount * 100, // paise
        currency: 'INR',
        receipt: `imm_wallet_${Date.now()}`,
        notes: { type: 'wallet_topup', packName: body.packName || '' },
      }),
    });

    if (!rzpRes.ok) {
      const err = await rzpRes.text();
      console.error('Razorpay order error:', rzpRes.status, err);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    const order = await rzpRes.json();

    return NextResponse.json({
      orderId: order.id,
      keyId,
      amount: order.amount,
    });
  } catch (err) {
    console.error('Create order error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
