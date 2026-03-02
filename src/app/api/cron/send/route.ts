import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import Groq from 'groq-sdk';
import { isAdmin } from '@/lib/isAdmin';
import { generateMorningQuote } from '@/lib/ai';

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

    // Today's date
    const today = new Date().toISOString().split('T')[0];

    let sent = 0;
    const errors: string[] = [];

    // 20-Day Free Beta: All users are eligible
    // @ts-ignore
    const eligibleUsers = users;

    // GENERATE AI QUOTE ONCE FOR ALL USERS
    const aiQuote = await generateMorningQuote();

    // Process in parallel batches of 10
    const BATCH_SIZE = 10;
    for (let i = 0; i < eligibleUsers.length; i += BATCH_SIZE) {
      const batch = eligibleUsers.slice(i, i + BATCH_SIZE);

      await Promise.allSettled(batch.map(async (user) => {
        try {
          const tasks = await prisma.task.findMany({
            where: { userId: user.id, dateFor: today },
            orderBy: { createdAt: 'asc' },
          });

          const tasksItems = tasks.map((t: { content: string }, idx: number) => {
            return `
              <li style="margin-bottom: 12px; padding: 18px 20px; background: #ffffff; border: 1px solid rgba(45,27,46,0.06); border-radius: 20px; border-left: 5px solid #f472b6; font-size: 16px; color: #2d1b2e; font-weight: 600; display: flex; align-items: flex-start; gap: 14px; box-shadow: 0 4px 12px rgba(45,27,46,0.03);">
                <span style="color: #db2777; font-weight: 800; font-size: 15px; margin-top: 2px;">${idx + 1}.</span> 
                <span style="line-height: 1.4;">${t.content}</span>
              </li>
            `;
          }).join('');

          const taskHtml = tasks.length > 0
            ? `
              <ul style="text-align: left; padding: 0; margin: 0; list-style: none;">
                ${tasksItems}
              </ul>
            `
            : `
              <div style="text-align: center; padding: 32px 20px; background: rgba(255,255,255,0.6); border-radius: 20px; border: 2px dashed rgba(45,27,46,0.1);">
                <span style="font-size: 28px; display: block; margin-bottom: 12px;">🍃</span>
                <p style="color: #64748b; font-size: 16px; font-weight: 500; margin: 0;">No tasks planned for today. Enjoy a free day!</p>
              </div>
            `;

          const planUrl = `${SITE_URL}/plan?email=${encodeURIComponent(user.email)}`;
          const firstName = user.name?.split(' ')[0] || 'friend';
          const todayDateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
          const subjectDateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

          const result = await sendEmail({
            to: user.email,
            subject: `☀️ Your Planny Digest – ${subjectDateStr}`,
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
                    .quote-box { padding: 24px 20px !important; margin-bottom: 32px !important; }
                    .quote-text { font-size: 18px !important; }
                  }
                </style>
              </head>
              <body style="margin: 0; padding: 0; background-color: #faf5ff;">
                <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #faf5ff; padding: 24px 12px;">
                  <div class="container" style="background-color: #ffffff; border-radius: 32px; border: 1px solid rgba(255,255,255,0.8); overflow: hidden; box-shadow: 0 12px 30px rgba(45,27,46,0.04), 0 4px 12px rgba(244,114,182,0.1);">
                    
                    <div class="header" style="background: linear-gradient(135deg, rgba(233,213,255,0.4), rgba(244,114,182,0.2)); padding: 40px 32px; text-align: center; border-bottom: 1px solid rgba(233,213,255,0.4);">
                      <div style="display: inline-block; background: white; padding: 12px; border-radius: 20px; border: 2px solid rgba(255,255,255,0.8); box-shadow: 0 8px 24px rgba(45,27,46,0.05); margin-bottom: 20px;">
                        <img src="${SITE_URL}/planny-logo.png" alt="Planny" style="width: 48px; height: 48px; object-fit: contain; display: block;" />
                      </div>
                      <h1 style="color: #2d1b2e; margin: 0 0 12px; font-size: 28px; font-weight: 800; letter-spacing: -0.02em;">Good morning, ${firstName}! ☀️</h1>
                      <p style="color: #db2777; margin: 0; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; background: rgba(255,255,255,0.8); display: inline-block; padding: 6px 14px; border-radius: 12px; box-shadow: 0 2px 8px rgba(219,39,119,0.05);">${todayDateStr}</p>
                    </div>
                    
                    <div class="content" style="padding: 32px 24px;">
                      
                      <div class="quote-box" style="background: rgba(255,255,255,0.8); border-radius: 24px; padding: 28px; margin-bottom: 36px; text-align: center; border: 1px solid rgba(244,114,182,0.2); box-shadow: 0 4px 12px rgba(244,114,182,0.04);">
                        <p class="quote-text" style="color: #831843; font-size: 19px; font-style: italic; font-weight: 600; margin: 0; line-height: 1.5;">"${aiQuote}"</p>
                      </div>
                      
                      <h2 style="color: #2d1b2e; font-size: 20px; margin: 0 0 20px; font-weight: 800; letter-spacing: -0.01em;">
                        🎯 Your Focus Today
                      </h2>
                      
                      ${taskHtml}
                      
                      <div style="margin-top: 40px; text-align: center; padding-top: 32px; border-top: 1px solid rgba(45,27,46,0.06);">
                        <a href="${planUrl}" class="btn" style="display: inline-block; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 800; background: #c084fc; padding: 18px 32px; border-radius: 9999px; box-shadow: 0 8px 20px rgba(192,132,252,0.25); transition: background 0.3s ease;">
                          📝 Adjust Plan
                        </a>
                      </div>
                    </div>
                  </div>
                  <div style="text-align: center; margin-top: 24px; padding: 0 16px;">
                    <p style="color: #a1a1aa; font-size: 13px; font-weight: 500; margin: 0;">Have a great day. We'll check in at 10 PM tonight. 🌙</p>
                  </div>
                </div>
              </body>
              </html>
            `
          });

          if (result) sent++;
          else errors.push(user.email);
        } catch (innerErr) {
          console.error(`Send inner error for ${user.email}:`, innerErr);
          errors.push(user.email);
        }
      }));

      // Delay slightly between batches
      if (i + BATCH_SIZE < eligibleUsers.length) {
        await new Promise(r => setTimeout(r, 500));
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      total: users.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (e) {
    console.error('Cron send error:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
