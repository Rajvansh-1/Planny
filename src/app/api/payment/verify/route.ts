import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !email) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return NextResponse.json({ error: 'Razorpay secret missing' }, { status: 500 });

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Update user as paid
    // @ts-ignore
    const user = await prisma.user.update({
      where: { email },
      data: {
        isPaid: true,
        paidAt: new Date(),
        razorpayOrderId: razorpay_order_id,
      },
    });

    // Send confirmation email / receipt
    const planUrl = `${SITE_URL}/plan?email=${encodeURIComponent(email)}`;
    await sendEmail({
      to: email,
      subject: '🧾 Receipt: Your Planny Pro Subscription',
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFF0F5; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #34d399, #10b981); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Planny Pro Activated! 🐾</h1>
        </div>
        <div style="padding: 32px; background: white;">
          <p style="color: #444; font-size: 18px;">Hey <strong>${(user.name || 'friend').split(' ')[0]}</strong>,</p>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">Thank you for your purchase! Here is the receipt for your Planny Pro subscription.</p>
          
          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Plan</td>
                <td style="padding: 8px 0; color: #1f2937; text-align: right; font-weight: bold;">Planny Pro (Monthly)</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Amount Paid</td>
                <td style="padding: 8px 0; color: #1f2937; text-align: right; font-weight: bold;">₹19.00</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Order ID</td>
                <td style="padding: 8px 0; color: #1f2937; text-align: right; font-size: 13px; font-family: monospace;">${razorpay_order_id}</td>
              </tr>
            </table>
          </div>

          <p style="color: #555; font-size: 16px; line-height: 1.6;">Your AI planning emails will start flowing immediately tonight at 10 PM. You can start planning right now!</p>
          
          <div style="text-align: center; margin: 32px 0 16px;">
            <a href="${planUrl}" style="background: linear-gradient(135deg, #FFB6C1, #f9a8d4); color: white; padding: 14px 28px; border-radius: 25px; text-decoration: none; font-weight: bold; font-size: 16px;">
              Go to My Planner 🌸
            </a>
          </div>
        </div>
      </div>
      `
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Payment Verification Error:", error);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
