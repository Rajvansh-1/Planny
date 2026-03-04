import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { generateWeeklyReportReview } from '@/lib/ai';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow maximum Vercel Hobby execution time

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://planny-mu.vercel.app').replace(/\/$/, '');

export async function GET() {
  try {
    // 1. Fetch all users
    // @ts-ignore
    const users = await prisma.user.findMany({
      // @ts-ignore
      select: { id: true, email: true, name: true, isPaid: true }
    });

    const eligibleUsers = users;
    let sent = 0;
    const errors: string[] = [];

    // Calculate dates for the past 7 days
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    const dateRangeStr = `${sevenDaysAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

    // Process in batches
    const BATCH_SIZE = 5;
    for (let i = 0; i < eligibleUsers.length; i += BATCH_SIZE) {
      const batch = eligibleUsers.slice(i, i + BATCH_SIZE);

      await Promise.allSettled(batch.map(async (user) => {
        try {
          // Fetch tasks for this user over the last 7 days (createdAt >= 7 days ago)
          const weeklyTasks = await prisma.task.findMany({
            where: {
              userId: user.id,
              createdAt: { gte: sevenDaysAgo }
            },
            orderBy: { createdAt: 'desc' },
          });

          // Math stats
          const totalTasks = weeklyTasks.length;
          // Return early if they literally haven't used the app this week to not bother them
          if (totalTasks === 0) return;

          const completedTasks = weeklyTasks.filter((t: any) => t.completed);
          const completedCount = completedTasks.length;
          const completionRate = Math.round((completedCount / totalTasks) * 100);

          const notableTasks = completedTasks.slice(0, 5).map((t: any) => t.content);

          // Generate AI Roast / Praise
          const aiReview = await generateWeeklyReportReview(user.name, completedCount, totalTasks, notableTasks);

          const firstName = user.name?.split(' ')[0] || 'friend';
          const planUrl = `${SITE_URL}/plan?email=${encodeURIComponent(user.email)}`;

          const result = await sendEmail({
            to: user.email,
            subject: `📊 Your Planny Weekly Wrap-Up (${completionRate}% Done)`,
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="margin: 0; padding: 0; background-color: #faf5ff;">
                <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #faf5ff; padding: 24px 12px;">
                  <div class="container" style="background-color: #ffffff; border-radius: 32px; border: 1px solid rgba(255,255,255,0.8); overflow: hidden; box-shadow: 0 12px 30px rgba(45,27,46,0.04), 0 4px 12px rgba(139,92,246,0.1);">
                    
                    <div class="header" style="background: linear-gradient(135deg, rgba(167,139,250,0.2), rgba(244,114,182,0.1)); padding: 40px 32px; text-align: center; border-bottom: 1px solid rgba(167,139,250,0.3);">
                      <div style="display: inline-block; background: white; padding: 12px; border-radius: 20px; border: 2px solid rgba(255,255,255,0.8); box-shadow: 0 8px 24px rgba(45,27,46,0.05); margin-bottom: 20px;">
                        <span style="font-size: 32px; display: block; line-height: 1;">📊</span>
                      </div>
                      <h1 style="color: #2d1b2e; margin: 0 0 8px; font-size: 26px; font-weight: 800; letter-spacing: -0.02em;">Weekly Wrap-Up</h1>
                      <p style="color: #7c3aed; margin: 0; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; background: rgba(255,255,255,0.8); display: inline-block; padding: 6px 14px; border-radius: 12px;">${dateRangeStr}</p>
                    </div>
                    
                    <div class="content" style="padding: 32px 24px;">
                      
                      <!-- Stats Grid -->
                      <div style="display: flex; gap: 16px; margin-bottom: 32px;">
                        <div style="flex: 1; background: #f8fafc; padding: 20px; border-radius: 20px; text-align: center; border: 1px solid #e2e8f0; border-bottom: 4px solid #f472b6;">
                          <h3 style="color: #64748b; font-size: 13px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em; margin: 0 0 8px;">Completed</h3>
                          <p style="color: #2d1b2e; font-size: 32px; font-weight: 800; margin: 0;">${completedCount}</p>
                        </div>
                        <div style="flex: 1; background: #f8fafc; padding: 20px; border-radius: 20px; text-align: center; border: 1px solid #e2e8f0; border-bottom: 4px solid #a855f7;">
                          <h3 style="color: #64748b; font-size: 13px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em; margin: 0 0 8px;">Success Rate</h3>
                          <p style="color: #2d1b2e; font-size: 32px; font-weight: 800; margin: 0;">${completionRate}%</p>
                        </div>
                      </div>

                      <!-- AI Review -->
                      <div style="background: rgba(167,139,250,0.05); border-radius: 24px; padding: 28px; margin-bottom: 36px; border: 1px solid rgba(167,139,250,0.2);">
                        <h2 style="color: #6d28d9; font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 12px; display: flex; align-items: center; gap: 8px;">
                          <span>🤖</span> Planny says...
                        </h2>
                        <p style="color: #4c1d95; font-size: 17px; font-weight: 500; margin: 0; line-height: 1.6;">
                          "${aiReview}"
                        </p>
                      </div>

                      <!-- Action CTA -->
                      <div style="text-align: center; padding-top: 32px; border-top: 1px solid rgba(45,27,46,0.06);">
                        <h2 style="color: #2d1b2e; font-size: 20px; font-weight: 800; margin: 0 0 12px; letter-spacing: -0.01em;">Ready for a new week? 🚀</h2>
                        <a href="${planUrl}" style="display: inline-block; background: #c084fc; color: white; padding: 18px 32px; border-radius: 9999px; text-decoration: none; font-weight: 800; font-size: 16px; box-shadow: 0 8px 20px rgba(192,132,252,0.25);">
                          Plan My Monday
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </body>
              </html>
            `
          });

          if (result) sent++;
          else errors.push(user.email);
        } catch (innerErr) {
          console.error(`Weekly send error for ${user.email}:`, innerErr);
          errors.push(user.email);
        }
      }));

      if (i + BATCH_SIZE < eligibleUsers.length) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    return NextResponse.json({ success: true, sent, total: eligibleUsers.length, errors: errors.length > 0 ? errors : undefined });
  } catch (e) {
    console.error('Cron weekly error:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
