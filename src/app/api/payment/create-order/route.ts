import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import prisma from '@/lib/prisma';
import { isAdmin } from '@/lib/isAdmin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (isAdmin(email)) {
      return NextResponse.json({ success: true, isPaid: true, admin: true });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // @ts-ignore
    if (user.isPaid) {
      return NextResponse.json({ success: true, isPaid: true });
    }

    // Disable payments if KYC is pending (keys are placeholders)
    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('placeholder')) {
      return NextResponse.json({ error: 'Payments are currently disabled pending verification. Please try again later.' }, { status: 503 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Rs 19 per month = 1900 paise
    const amount = 1900;

    const options = {
      amount,
      currency: "INR",
      receipt: `rcpt_${user.id.substring(0, 10)}_` + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency
      }
    });

  } catch (error) {
    console.error("Payment Order Error:", error);
    return NextResponse.json({ error: 'Failed to create plan checkout' }, { status: 500 });
  }
}
