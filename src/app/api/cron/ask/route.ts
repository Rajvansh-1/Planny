import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // In a real app, verify cron secret
  try {
    const users = await prisma.user.findMany();

    for (const user of users) {
      // Typically we'd check if user's local time is 10 PM.
      // For MVP, we just send to everyone

      const planUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/plan?email=${encodeURIComponent(user.email)}`;

      await sendEmail({
        to: user.email,
        subject: "Plan your day with Planny 🐾",
        html: `
          <div style="font-family: 'Nunito', sans-serif; text-align: center; padding: 20px; background: #FFF0F5; border-radius: 12px;">
            <h1 style="color: #FFB6C1;">Good evening, ${user.name || 'friend'}! ✨</h1>
            <p style="color: #666; font-size: 16px;">It's 10 PM somewhere! Time to plan your tasks for tomorrow to stay productive.</p>
            <a href="${planUrl}" style="display: inline-block; padding: 12px 24px; background: #FFB6C1; color: white; text-decoration: none; border-radius: 20px; font-weight: bold; margin-top: 20px;">Plan My Day 🌸</a>
          </div>
        `
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
