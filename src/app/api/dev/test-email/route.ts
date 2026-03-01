import { NextResponse } from 'next/server';
import { transporter } from '@/lib/email';
import { generateMorningQuote } from '@/lib/ai';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const testTo = 'cartoonworldd24x7@gmail.com'; // Admin email to receive test

    // 1. Test Groq Connection
    let aiQuote = "Not Generated";
    let aiError = null;
    try {
      aiQuote = await generateMorningQuote();
    } catch (e: any) {
      aiError = e.message;
    }

    // 2. Test SMTP Connection
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Planny 🐾" <hello@planny.app>',
      to: testTo,
      subject: "Vercel Production Test 🚀",
      html: "<p>If you are reading this, your Vercel email config works!</p>",
    });

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      aiTest: {
        quoteGenerated: aiQuote,
        error: aiError,
        groqKeyConfigured: !!process.env.GROQ_API_KEY
      },
      env: {
        SMTP_HOST: process.env.SMTP_HOST || 'Not Set',
        SMTP_PORT: process.env.SMTP_PORT || 'Not Set',
        SMTP_USER: process.env.SMTP_USER || 'Not Set',
        EMAIL_FROM: process.env.EMAIL_FROM || 'Not Set',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'Not Set'
      }
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      hint: "Make sure all your Environment Variables in Vercel match your local .env file."
    });
  }
}
