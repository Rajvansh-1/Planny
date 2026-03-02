import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { isAdmin } from '@/lib/isAdmin';

export const dynamic = 'force-dynamic';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, timezone } = body;

    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: name || existing?.name,
        timezone: timezone || existing?.timezone || 'UTC'
      },
      create: { email, name: name || '', timezone: timezone || 'UTC' },
    });

    // Only send welcome email to brand new users
    if (!existing) {
      const planUrl = `${SITE_URL}/plan?email=${encodeURIComponent(email)}`;
      const firstName = (name || 'friend').split(' ')[0];

      await sendEmail({
        to: email,
        subject: 'Welcome to Planny 🐾 – Your daily AI planner is ready!',
        html: `
          <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #faf5ff; border-radius: 32px; overflow: hidden; border: 1px solid rgba(255,255,255,0.8); box-shadow: 0 12px 30px rgba(45,27,46,0.04), 0 4px 12px rgba(244,114,182,0.1);">
            <div style="background: linear-gradient(135deg, rgba(233,213,255,0.5), rgba(244,114,182,0.2)); padding: 40px; text-align: center; border-bottom: 1px solid rgba(233,213,255,0.4);">
              <div style="display: inline-block; background: white; padding: 12px; border-radius: 20px; border: 2px solid rgba(255,255,255,0.8); box-shadow: 0 8px 24px rgba(45,27,46,0.05); margin-bottom: 20px;">
                <img src="${SITE_URL}/planny-logo.png" alt="Planny" style="width: 48px; height: 48px; object-fit: contain; display: block;" />
              </div>
              <h1 style="color: #2d1b2e; margin: 0 0 8px; font-size: 28px; font-weight: 800; letter-spacing: -0.02em;">Welcome to Planny! 🐾</h1>
              <p style="color: #db2777; margin: 0; font-size: 16px; font-weight: 600;">Your AI-powered daily planner is ready.</p>
            </div>
            <div style="padding: 36px 32px; background: white;">
              <p style="color: #2d1b2e; font-size: 18px; font-weight: 600; margin-top: 0;">Hey <strong>${firstName}</strong>! So happy to have you here ✨</p>
              <p style="color: #64748b; font-size: 16px; line-height: 1.6;">Here's how Planny works:</p>
              
              <div style="border-left: 4px solid #f472b6; padding: 16px; margin: 24px 0; background: #fdf2f8; border-radius: 0 16px 16px 0;">
                <p style="margin: 0 0 12px; color: #2d1b2e; line-height: 1.5;">🌙 <strong>Every night at 10 PM</strong><br><span style="color: #64748b; font-size: 14px;">Planny emails you asking what you want to achieve tomorrow.</span></p>
                <p style="margin: 0; color: #2d1b2e; line-height: 1.5;">☀️ <strong>Every morning at 7 AM</strong><br><span style="color: #64748b; font-size: 14px;">Wake up to your task list + an AI motivational quote.</span></p>
              </div>
              
              <p style="color: #64748b; font-size: 16px; text-align: center; margin-bottom: 32px;">No app. No dashboard. <strong>Everything in your inbox.</strong></p>
              
              <div style="text-align: center; margin: 32px 0 16px;">
                <a href="${planUrl}" style="display: inline-block; background: #c084fc; color: white; padding: 18px 32px; border-radius: 9999px; text-decoration: none; font-weight: 700; font-size: 16px; box-shadow: 0 8px 20px rgba(192,132,252,0.25); transition: background 0.3s ease;">Plan My First Day 🌸</a>
              </div>
              
              <p style="color: #94a3b8; font-size: 14px; text-align: center; margin-top: 32px; font-weight: 500;">See you tonight at 10 PM! 💌</p>
            </div>
          </div>
        `
      });
    }

    // @ts-ignore
    return NextResponse.json({ success: true, user, isNew: !existing, isPaid: user.isPaid || isAdmin(email) });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
