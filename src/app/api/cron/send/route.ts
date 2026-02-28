import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { generateMorningQuote } from '@/lib/ai';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const users = await prisma.user.findMany();
    // Use today's date in YYYY-MM-DD. For simplistic matching, UTC date.
    // For tomorrow's task date that they set at 10 PM the night prior, 
    // it will match "today" since the day has flipped over.
    const today = new Date().toISOString().split('T')[0];

    for (const user of users) {
      const tasks = await prisma.task.findMany({
        where: {
          userId: user.id,
          dateFor: today,
        }
      });

      const taskContents = tasks.map((t: { content: string }) => t.content);
      const aiQuote = await generateMorningQuote(taskContents);

      const taskHtml = tasks.length > 0
        ? `<ul style="text-align: left; padding: 0 40px; color: #444; font-size: 16px;">
            ${tasks.map((t: { content: string }) => `<li style="margin-bottom: 8px;">${t.content}</li>`).join('')}
           </ul>`
        : `<p style="color: #888; font-style: italic;">No tasks planned for today. Take it easy! 🍃</p>`;

      await sendEmail({
        to: user.email,
        subject: "Your Morning Planny Digest ☀️",
        html: `
          <div style="font-family: 'Nunito', sans-serif; text-align: center; padding: 20px; background: #F0F8FF; border-radius: 12px; margin-bottom: 20px;">
            <h1 style="color: #87CEFA;">Good morning! ☀️</h1>
            <p style="font-size: 18px; font-weight: bold; color: #555;">"${aiQuote}"</p>
          </div>
          <div style="background: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #eee;">
            <h2 style="color: #333; text-align: center;">Today's Tasks</h2>
            ${taskHtml}
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
