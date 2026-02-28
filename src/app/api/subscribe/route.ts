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
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFF0F5; border-radius: 16px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #FFB6C1, #f9a8d4); padding: 40px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Planny! 🐾</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 16px;">Your AI-powered daily planner is ready!</p>
            </div>
            <div style="padding: 32px; background: white;">
              <p style="color: #444; font-size: 18px;">Hey <strong>${firstName}</strong>! So happy to have you here ✨</p>
              <p style="color: #555; font-size: 16px; line-height: 1.6;">Here's how Planny works:</p>
              <div style="border-left: 4px solid #FFB6C1; padding: 16px; margin: 16px 0; background: #FFF0F5; border-radius: 0 8px 8px 0;">
                <p style="margin: 0 0 10px; color: #333;">🌙 <strong>Every night at 10 PM</strong> – Planny emails you asking what you want to achieve tomorrow.</p>
                <p style="margin: 0; color: #333;">☀️ <strong>Every morning at 7 AM</strong> – Wake up to your task list + an AI motivational quote, delivered to your inbox.</p>
              </div>
              <p style="color: #555; font-size: 16px;">No app. No dashboard. <strong>Everything in your inbox.</strong></p>
              <div style="text-align: center; margin: 28px 0;">
                <a href="${planUrl}" style="background: linear-gradient(135deg, #FFB6C1, #f9a8d4); color: white; padding: 14px 28px; border-radius: 25px; text-decoration: none; font-weight: bold; font-size: 16px;">Plan My First Day 🌸</a>
              </div>
              <p style="color: #888; font-size: 14px; text-align: center;">See you tonight at 10 PM! 💌</p>
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
