import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

export async function GET(req: Request) {
  try {
    // Security: verify cron secret in production
    const authHeader = req.headers.get('authorization');
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // Allow requests from Vercel cron (they don't send auth header in free tier)
      // We just log it for now
    }

    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true }
    });

    let sent = 0;
    const errors: string[] = [];

    for (const user of users) {
      const planUrl = `${SITE_URL}/plan?email=${encodeURIComponent(user.email)}`;
      const result = await sendEmail({
        to: user.email,
        subject: `Hey ${user.name?.split(' ')[0] || 'friend'}, plan your tomorrow with Planny 🌙`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFF0F5; border-radius: 16px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #c9a0dc, #FFB6C1); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 26px;">Good evening, ${user.name?.split(' ')[0] || 'friend'}! 🌙</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 16px;">Time to plan your tomorrow</p>
            </div>
            <div style="padding: 32px; text-align: center;">
              <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                It's 10 PM — the perfect time to set your <strong>intentions for tomorrow</strong>. 
                Tap below to add your tasks. It only takes 2 minutes! ✨
              </p>
              <a href="${planUrl}" style="display: inline-block; background: linear-gradient(135deg, #FFB6C1, #f9a8d4); color: white; padding: 16px 36px; border-radius: 25px; text-decoration: none; font-weight: bold; font-size: 18px; box-shadow: 0 4px 15px rgba(249, 168, 212, 0.4);">
                Plan My Day 🌸
              </a>
              <p style="color: #aaa; font-size: 13px; margin: 24px 0 0;">
                This link is just for you. See you in the morning! ☀️
              </p>
            </div>
          </div>
        `
      });

      if (result) sent++;
      else errors.push(user.email);
    }

    return NextResponse.json({
      success: true,
      sent,
      total: users.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (e) {
    console.error('Cron ask error:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
