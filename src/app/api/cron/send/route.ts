import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import Groq from 'groq-sdk';
import { isAdmin } from '@/lib/isAdmin';
import { generateMorningQuote } from '@/lib/ai';

export const dynamic = 'force-dynamic';

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

    // Filter to only paid users or admins
    // @ts-ignore
    const eligibleUsers = users.filter(u => u.isPaid || isAdmin(u.email));

    for (const user of eligibleUsers) {
      const tasks = await prisma.task.findMany({
        where: { userId: user.id, dateFor: today },
        orderBy: { createdAt: 'asc' },
      });

      const taskContents = tasks.map((t: { content: string }) => t.content);
      const aiQuote = await generateMorningQuote(taskContents);

      const taskHtml = tasks.length > 0
        ? `<ul style="text-align: left; padding: 0; list-style: none; color: #444; font-size: 16px;">
            ${tasks.map((t: { content: string }, i: number) => `
              <li style="margin-bottom: 10px; padding: 12px 16px; background: #FFF0F5; border-radius: 8px; border-left: 3px solid #FFB6C1;">
                <span style="font-weight: bold; color: #FFB6C1;">${i + 1}.</span> ${t.content}
              </li>
            `).join('')}
           </ul>`
        : `<div style="text-align: center; padding: 20px; background: #FFF0F5; border-radius: 12px;">
             <p style="color: #888; font-style: italic; margin: 0;">No tasks planned for today. Enjoy a free day! 🍃</p>
           </div>`;

      const planUrl = `${SITE_URL}/plan?email=${encodeURIComponent(user.email)}`;

      const result = await sendEmail({
        to: user.email,
        subject: `☀️ Your Planny Morning Digest – ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #87CEEB, #98D8FF); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 26px;">Good morning, ${user.name?.split(' ')[0] || 'friend'}! ☀️</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            
            <div style="background: white; padding: 24px; border: 1px solid #f0f0f0;">
              <div style="background: linear-gradient(135deg, #FFF0F5, #f3e8ff); border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center; border-left: 4px solid #FFB6C1;">
                <p style="color: #555; font-size: 18px; font-style: italic; margin: 0; line-height: 1.5;">"${aiQuote}"</p>
              </div>
              
              <h2 style="color: #333; font-size: 20px; margin: 0 0 16px;">📋 Your tasks for today:</h2>
              ${taskHtml}
            </div>
            
            <div style="background: #FFF0F5; padding: 20px; border-radius: 0 0 16px 16px; text-align: center;">
              <a href="${planUrl}" style="color: #FFB6C1; text-decoration: none; font-size: 14px;">
                📝 Update tomorrow's tasks
              </a>
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
    console.error('Cron send error:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
