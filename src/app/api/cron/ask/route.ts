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

    // 20-Day Free Beta: All users are eligible
    // @ts-ignore
    const eligibleUsers = users;

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
              <div style="margin: 24px 0;">
                <p style="color: #2d1b2e; font-size: 20px; margin: 0 0 20px; font-weight: 800; text-transform: none; letter-spacing: -0.01em;">🌸 Your wins today (${completedCount}/${todayTasks.length} done)</p>
                ${todayTasks.map((t: any) => `
                  <div style="display: flex; align-items: flex-start; gap: 16px; padding: 20px; margin-bottom: 12px; background: #ffffff; border-radius: 24px; border: 1px solid rgba(45,27,46,0.06); box-shadow: 0 4px 12px rgba(45,27,46,0.03); border-left: 6px solid ${t.completed ? '#f472b6' : '#cbd5e1'};">
                    <span style="font-size: 22px; margin-top: 2px;">${t.completed ? '✨' : '⬜'}</span>
                    <span style="color: ${t.completed ? '#9ca3af' : '#2d1b2e'}; text-decoration: ${t.completed ? 'line-through' : 'none'}; font-size: 18px; font-weight: 700; line-height: 1.4;">${t.content}</span>
                  </div>
                `).join('')}
              </div>
            `
            : `<div style="text-align: center; padding: 40px 24px; background: rgba(255,255,255,0.6); border-radius: 24px; border: 2px dashed rgba(45,27,46,0.1); margin: 32px 0;">
                 <p style="color: #64748b; font-style: italic; font-size: 18px; font-weight: 600; margin: 0;">No tasks were planned for today. 🍃</p>
               </div>`;

          const result = await sendEmail({
            to: user.email,
            subject: `🌙 Planny check-in – How was your day, ${firstName}?`,
            html: `
              <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fff8f6; padding: 40px 20px; border-radius: 32px;">
                <div style="background-color: #ffffff; border-radius: 32px; border: 1px solid rgba(255,255,255,0.8); overflow: hidden; box-shadow: 0 24px 50px rgba(45,27,46,0.05), 0 4px 12px rgba(244,114,182,0.05);">
                  
                  <div style="background: linear-gradient(135deg, rgba(244,114,182,0.1), rgba(253,224,217,0.4)); padding: 48px 32px; text-align: center; border-bottom: 1px solid rgba(244,114,182,0.1);">
                    <div style="display: inline-block; background: white; padding: 16px; border-radius: 24px; border: 2px solid rgba(255,255,255,0.8); box-shadow: 0 8px 24px rgba(45,27,46,0.06); margin-bottom: 24px;">
                      <img src="${SITE_URL}/planny-logo.png" alt="Planny" style="width: 56px; height: 56px; object-fit: contain; display: block;" />
                    </div>
                    <h1 style="color: #2d1b2e; margin: 0 0 12px; font-size: 32px; font-weight: 900; letter-spacing: -0.03em;">Good evening, ${firstName}! 🌙</h1>
                    <p style="color: #64748b; margin: 0; font-size: 18px; font-weight: 500;">Time for your nightly check-in.</p>
                  </div>
                  
                  <div style="padding: 40px 32px;">
                    ${todayTasksHtml}

                    <div style="margin-top: 48px; padding-top: 36px; border-top: 1px solid rgba(45,27,46,0.06); text-align: center;">
                      <h2 style="color: #2d1b2e; font-size: 26px; font-weight: 800; margin: 0 0 16px; letter-spacing: -0.02em;">Ready for tomorrow? ✨</h2>
                      <p style="color: #64748b; font-size: 17px; margin: 0 0 36px; font-weight: 500; line-height: 1.5;">Set your intentions. Keep them small, make them count.</p>
                      
                      <a href="${planUrl}" style="display: inline-block; background: #f472b6; color: white; padding: 18px 40px; border-radius: 9999px; text-decoration: none; font-weight: 700; font-size: 18px; box-shadow: 0 8px 20px rgba(244,114,182,0.3); transition: all 0.3s ease;">
                        Plan My Tomorrow 🌸
                      </a>
                    </div>
                  </div>
                </div>
                <div style="text-align: center; margin-top: 32px;">
                  <p style="color: #a1a1aa; font-size: 15px; font-weight: 500; margin: 0;">See you in the morning with your daily digest! ☀️</p>
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
