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

          const taskHtml = tasks.length > 0
            ? `<ul style="text-align: left; padding: 0; margin: 0; list-style: none;">
                ${tasks.map((t: { content: string }, idx: number) => `
                  <li style="margin-bottom: 12px; padding: 20px 24px; background: #ffffff; border: 1px solid rgba(45,27,46,0.06); border-radius: 24px; border-left: 6px solid #fbbf24; font-size: 18px; color: #2d1b2e; font-weight: 700; display: flex; align-items: flex-start; gap: 16px; box-shadow: 0 4px 12px rgba(45,27,46,0.03);">
                    <span style="color: #f59e0b; font-weight: 900;">${idx + 1}.</span> 
                    <span style="line-height: 1.4;">${t.content}</span>
                  </li>
                `).join('')}
              </ul>`
            : `<div style="text-align: center; padding: 40px 24px; background: rgba(255,255,255,0.6); border-radius: 24px; border: 2px dashed rgba(45,27,46,0.1);">
                 <span style="font-size: 32px; display: block; margin-bottom: 12px;">🍃</span>
                 <p style="color: #64748b; font-size: 18px; font-weight: 600; margin: 0;">No tasks planned for today. Enjoy a free day!</p>
               </div>`;

          const planUrl = `${SITE_URL}/plan?email=${encodeURIComponent(user.email)}`;
          const firstName = user.name?.split(' ')[0] || 'friend';

          const result = await sendEmail({
            to: user.email,
            subject: `☀️ Your Planny Digest – ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`,
            html: `
              <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fef3c7; padding: 40px 20px; border-radius: 32px;">
                <div style="background-color: #ffffff; border-radius: 32px; border: 1px solid rgba(255,255,255,0.8); overflow: hidden; box-shadow: 0 24px 50px rgba(45,27,46,0.05), 0 4px 12px rgba(251,191,36,0.1);">
                  
                  <div style="background: linear-gradient(135deg, rgba(253,230,138,0.4), rgba(254,243,199,0.8)); padding: 48px 32px; text-align: center; border-bottom: 1px solid rgba(251,191,36,0.1);">
                    <div style="display: inline-block; background: white; padding: 16px; border-radius: 24px; border: 2px solid rgba(255,255,255,0.8); box-shadow: 0 8px 24px rgba(45,27,46,0.06); margin-bottom: 24px;">
                      <img src="${SITE_URL}/planny-logo.png" alt="Planny" style="width: 56px; height: 56px; object-fit: contain; display: block;" />
                    </div>
                    <h1 style="color: #2d1b2e; margin: 0 0 12px; font-size: 32px; font-weight: 900; letter-spacing: -0.03em;">Good morning, ${firstName}! ☀️</h1>
                    <p style="color: #64748b; margin: 0; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; background: rgba(255,255,255,0.6); display: inline-block; padding: 8px 16px; border-radius: 12px;">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  
                  <div style="padding: 40px 32px;">
                    
                    <div style="background: rgba(255,255,255,0.6); border-radius: 24px; padding: 28px; margin-bottom: 40px; text-align: center; border: 1px solid rgba(45,27,46,0.06); box-shadow: 0 4px 12px rgba(45,27,46,0.03);">
                      <p style="color: #2d1b2e; font-size: 20px; font-style: italic; font-weight: 600; margin: 0; line-height: 1.6;">"${aiQuote}"</p>
                    </div>
                    
                    <h2 style="color: #2d1b2e; font-size: 22px; margin: 0 0 24px; font-weight: 800; text-transform: none; letter-spacing: -0.01em;">
                      🎯 Your Focus Today
                    </h2>
                    
                    ${taskHtml}
                    
                    <div style="margin-top: 48px; text-align: center; padding-top: 36px; border-top: 1px solid rgba(45,27,46,0.06);">
                      <a href="${planUrl}" style="display: inline-block; color: #2d1b2e; text-decoration: none; font-size: 18px; font-weight: 800; background: #fbbf24; padding: 18px 40px; border-radius: 9999px; box-shadow: 0 8px 20px rgba(251,191,36,0.3); transition: all 0.3s ease;">
                        📝 Adjust Plan
                      </a>
                    </div>
                  </div>
                </div>
                <div style="text-align: center; margin-top: 32px;">
                  <p style="color: #a1a1aa; font-size: 15px; font-weight: 500; margin: 0;">Have a great day. We'll check in at 10 PM tonight. 🌙</p>
                </div>
              </div>
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
