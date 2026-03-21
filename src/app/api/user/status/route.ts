import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isAdmin } from '@/lib/isAdmin';
import { hasAccess } from '@/lib/subscription';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    // @ts-ignore
    const user = await prisma.user.findUnique({
      where: { email },
      // @ts-ignore
      select: { isPaid: true, createdAt: true, currentStreak: true }
    });
        if (!user) return NextResponse.json({ isPaid: false });

    return NextResponse.json({
      isPaid: hasAccess(user as any),
      currentStreak: user.currentStreak || 0
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
