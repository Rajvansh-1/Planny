import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { isAdmin } from '@/lib/isAdmin';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow maximum Vercel Hobby execution time

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

export async function GET() {
  try {
    // @ts-ignore
    const users = await prisma.user.findMany({
      // @ts-ignore
      select: { id: true, email: true, name: true, isPaid: true }
    });

    // Today's date – show what they completed today
    const today = new Date().toISOString().split('T')[0];

    let sent = 0;
    const errors: string[] = [];

    // Filter to only paid users or admins
    // @ts-ignore
    const eligibleUsers = users.filter(u => u.isPaid || isAdmin(u.email));

    // Process in parallel batches of 10 to avoid timeouts but respect DB/SMTP limits
    const BATCH_SIZE = 10;
    for (let i = 0; i < eligibleUsers.length; i += BATCH_SIZE) {
      const batch = eligibleUsers.slice(i, i + BATCH_SIZE);

      const batchResults = await Promise.allSettled(batch.map(async (user) => {
        try {
          const todayTasks = await prisma.task.findMany({
            where: { userId: user.id, dateFor: today },
            orderBy: { createdAt: 'asc' },
          });

          const planUrl = `${SITE_URL}/plan?email=${encodeURIComponent(user.email)}`;
          const firstName = (user.name || 'friend').split(' ')[0];
          const completedCount = todayTasks.filter((t: any) => t.completed).length;

          const todayTasksHtml = todayTasks.length > 0
            ? `
              <div style="margin: 16px 0;">
                <p style="color:#555; font-size:15px; margin:0 0 10px;"><strong>📋 Your tasks today (${completedCount}/${todayTasks.length} done):</strong></p>
                ${todayTasks.map((t: any) => `
                  <div style="display:flex; align-items:center; gap:10px; padding:10px 14px; margin-bottom:6px; background:${t.completed ? 'rgba(52,211,153,0.08)' : '#fff8fc'}; border-radius:8px; border-left:3px solid ${t.completed ? '#34d399' : '#e5e7eb'};">
                    <span style="font-size:16px;">${t.completed ? '✅' : '⬜'}</span>
                    <span style="color:${t.completed ? '#9ca3af' : '#374151'}; text-decoration:${t.completed ? 'line-through' : 'none'}; font-size:15px;">${t.content}</span>
                  </div>
                `).join('')}
              </div>
            `
            : `<p style="color:#aaa; font-style:italic; font-size:14px; margin:12px 0;">No tasks were planned for today.</p>`;

          const result = await sendEmail({
            to: user.email,
            subject: `🌙 Planny check-in – How was your day, ${firstName}?`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #c9a0dc, #a78bfa); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">Good evening, ${firstName}! 🌙</h1>
                  <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 15px;">Time for your nightly Planny check-in</p>
                </div>
                
                <div style="background: white; padding: 28px; border: 1px solid #f3e8ff;">
                  ${todayTasksHtml}

                  <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #f3f4f6;">
                    <p style="color: #555; font-size: 16px; font-weight: bold; margin: 0 0 8px;">✨ Now, plan your tomorrow!</p>
                    <p style="color: #777; font-size: 14px; margin: 0 0 20px;">It takes less than 2 minutes. Tap below to add your goals for tomorrow.</p>
                    <div style="text-align: center;">
                      <a href="${planUrl}" style="display:inline-block; background: linear-gradient(135deg, #c9a0dc, #a78bfa); color: white; padding: 14px 32px; border-radius: 25px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(167,139,250,0.35);">
                        Plan My Tomorrow 🌸
                      </a>
                    </div>
                  </div>
                </div>

                <div style="background: #faf5ff; padding: 16px; border-radius: 0 0 16px 16px; text-align: center;">
                  <p style="color: #aaa; font-size: 12px; margin: 0;">See you in the morning with your daily digest! ☀️</p>
                </div>
              </div>
            `
          });

          if (result) sent++;
          else errors.push(user.email);
        } catch (innerErr) {
          console.error(`Ask inner error for ${user.email}:`, innerErr);
          errors.push(user.email);
        }
      }));

      // Allow a small delay between batches
      if (i + BATCH_SIZE < eligibleUsers.length) {
        await new Promise(r => setTimeout(r, 500));
      }
    }

    return NextResponse.json({ success: true, sent, total: users.length, errors: errors.length > 0 ? errors : undefined });
  } catch (e) {
    console.error('Cron ask error:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
