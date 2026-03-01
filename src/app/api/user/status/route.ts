import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isAdmin } from '@/lib/isAdmin';

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
      select: { isPaid: true, createdAt: true }
    });

    if (!user) return NextResponse.json({ isPaid: false });

    // 1-day free trial logic: if created within last 24 hours, user is implicitly "paid"
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const isWithinFreeTrial = user.createdAt > oneDayAgo;

    return NextResponse.json({
      isPaid: user.isPaid || isAdmin(email) || isWithinFreeTrial
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
