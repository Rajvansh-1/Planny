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

          const tasksItems = todayTasks.map((t: any) => {
            const toggleUrl = `${SITE_URL}/api/tasks/toggle?id=${t.id}&email=${encodeURIComponent(user.email)}`;
            return `
              <div style="display: flex; align-items: flex-start; gap: 14px; padding: 18px; margin-bottom: 12px; background: #ffffff; border-radius: 20px; border: 1px solid rgba(45,27,46,0.06); box-shadow: 0 4px 12px rgba(45,27,46,0.03); border-left: 5px solid ${t.completed ? '#f472b6' : '#e2e8f0'};">
                <a href="${toggleUrl}" style="text-decoration: none; flex-shrink: 0; display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 8px; border: 2px solid ${t.completed ? '#f472b6' : '#cbd5e1'}; background: ${t.completed ? '#fdf2f8' : '#ffffff'}; margin-top: -2px;">
                  ${t.completed ? '<span style="color: #f472b6; font-size: 16px; font-weight: bold; line-height: 1;">✓</span>' : ''}
                </a>
                <span style="color: ${t.completed ? '#9ca3af' : '#2d1b2e'}; text-decoration: ${t.completed ? 'line-through' : 'none'}; font-size: 16px; font-weight: 600; line-height: 1.4; flex: 1;">${t.content}</span>
              </div>
            `;
          }).join('');

          const todayTasksHtml = todayTasks.length > 0
            ? `
              <div style="margin: 20px 0;">
                <p style="color: #2d1b2e; font-size: 18px; margin: 0 0 16px; font-weight: 800; letter-spacing: -0.01em;">🌸 Your wins today (${completedCount}/${todayTasks.length} done)</p>
                ${tasksItems}
              </div>
            `
            : `
              <div style="text-align: center; padding: 32px 20px; background: rgba(255,255,255,0.6); border-radius: 20px; border: 2px dashed rgba(45,27,46,0.1); margin: 24px 0;">
                <p style="color: #64748b; font-style: italic; font-size: 16px; font-weight: 500; margin: 0;">No tasks were planned for today. 🍃</p>
              </div>
            `;

          const result = await sendEmail({
            to: user.email,
            subject: `🌙 Planny check-in – How was your day, ${firstName}?`,
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  @media only screen and (max-width: 600px) {
                    .container { padding: 16px 12px !important; border-radius: 24px !important; }
                    .header { padding: 32px 20px !important; }
                    .content { padding: 24px 16px !important; }
                    h1 { font-size: 26px !important; }
                    .btn { width: 100% !important; box-sizing: border-box !important; }
                  }
                </style>
              </head>
              <body style="margin: 0; padding: 0; background-color: #faf5ff;">
                <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #faf5ff; padding: 24px 12px;">
                  <div class="container" style="background-color: #ffffff; border-radius: 32px; border: 1px solid rgba(255,255,255,0.8); overflow: hidden; box-shadow: 0 12px 30px rgba(45,27,46,0.04), 0 4px 12px rgba(216,180,254,0.1);">
                    
                    <div class="header" style="background: linear-gradient(135deg, rgba(233,213,255,0.2), rgba(244,114,182,0.1)); padding: 40px 32px; text-align: center; border-bottom: 1px solid rgba(233,213,255,0.3);">
                      <div style="display: inline-block; background: white; padding: 12px; border-radius: 20px; border: 2px solid rgba(255,255,255,0.8); box-shadow: 0 8px 24px rgba(45,27,46,0.05); margin-bottom: 20px;">
                        <img src="${SITE_URL}/planny-logo.png" alt="Planny" style="width: 48px; height: 48px; object-fit: contain; display: block;" />
                      </div>
                      <h1 style="color: #2d1b2e; margin: 0 0 8px; font-size: 28px; font-weight: 800; letter-spacing: -0.02em;">Good evening, ${firstName}! 🌙</h1>
                      <p style="color: #64748b; margin: 0; font-size: 16px; font-weight: 500;">Tap the checkboxes to tick off what you did.</p>
                    </div>
                    
                    <div class="content" style="padding: 32px 24px;">
                      ${todayTasksHtml}

                      <div style="margin-top: 40px; padding-top: 32px; border-top: 1px solid rgba(45,27,46,0.06); text-align: center;">
                        <h2 style="color: #2d1b2e; font-size: 22px; font-weight: 800; margin: 0 0 12px; letter-spacing: -0.02em;">Ready for tomorrow? ✨</h2>
                        <p style="color: #64748b; font-size: 15px; margin: 0 0 28px; font-weight: 500; line-height: 1.5;">Keep your momentum going. Takes 2 mins.</p>
                        
                        <a href="${planUrl}" class="btn" style="display: inline-block; background: #c084fc; color: white; padding: 18px 32px; border-radius: 9999px; text-decoration: none; font-weight: 700; font-size: 16px; box-shadow: 0 8px 20px rgba(192,132,252,0.25); transition: background 0.3s ease;">
                          Plan My Tomorrow 🌸
                        </a>
                      </div>
                    </div>
                  </div>
                  <div style="text-align: center; margin-top: 24px; padding: 0 16px;">
                    <p style="color: #94a3b8; font-size: 13px; font-weight: 500; margin: 0;">See you in the morning with your daily digest! ☀️</p>
                  </div>
                </div>
              </body>
              </html>
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
