import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Fetch tasks by email (and optional dateFor)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const dateFor = searchParams.get('dateFor');

    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ tasks: [] });

    const tasks = await prisma.task.findMany({
      where: {
        userId: user.id,
        ...(dateFor ? { dateFor } : {}),
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

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
    const { taskId, completed, content } = await req.json();
    if (!taskId) return NextResponse.json({ error: 'taskId required' }, { status: 400 });

    const data: any = {};
    if (completed !== undefined) data.completed = completed;
    if (content !== undefined) data.content = content;

    const task = await prisma.task.update({ where: { id: taskId }, data });
    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Remove a task by id
export async function DELETE(req: Request) {
  try {
    const { taskId } = await req.json();
    if (!taskId) return NextResponse.json({ error: 'taskId required' }, { status: 400 });

    await prisma.task.delete({ where: { id: taskId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
