import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// POST: Create a task
export async function POST(req: Request) {
  try {
    const { email, content, dateFor } = await req.json();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const task = await prisma.task.create({
      data: { userId: user.id, content, dateFor }
    });

    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH: Toggle task completion  
export async function PATCH(req: Request) {
  try {
    const { taskId, completed } = await req.json();
    if (!taskId) return NextResponse.json({ error: 'taskId required' }, { status: 400 });

    const task = await prisma.task.update({
      where: { id: taskId },
      data: { completed },
    });

    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
