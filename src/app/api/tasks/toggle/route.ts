import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://planny-mu.vercel.app').replace(/\/$/, '');

/**
 * GET /api/tasks/toggle?id=TASK_ID&email=USER_EMAIL
 * 
 * Called when a user clicks a checkbox in the evening email.
 * Toggles the task's completed status, then redirects to the plan page.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const email = searchParams.get('email');

  if (!id || !email) {
    return NextResponse.redirect(`${SITE_URL}/?error=missing_params`);
  }

  try {
    // Look up the task and verify it belongs to the user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.redirect(`${SITE_URL}/?error=not_found`);
    }

    const task = await prisma.task.findFirst({
      where: { id, userId: user.id },
    });

    if (!task) {
      return NextResponse.redirect(`${SITE_URL}/?error=task_not_found`);
    }

    // Toggle the completed state
    const newCompletedState = !task.completed;

    await prisma.task.update({
      where: { id },
      data: { completed: newCompletedState },
    });

    // If we just completed a task, let's calculate their new streak
    if (newCompletedState) {
      const { calculateNewStreak } = await import('@/lib/streak');

      const {
        newCurrentStreak,
        newLongestStreak,
        newLastActiveDate
      } = calculateNewStreak(
        user.lastActiveDate,
        user.currentStreak,
        user.longestStreak,
        task.dateFor // The date context of the task they just completed
      );

      // Only update if something changed to save DB writes
      if (
        user.currentStreak !== newCurrentStreak ||
        user.lastActiveDate !== newLastActiveDate
      ) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            currentStreak: newCurrentStreak,
            longestStreak: newLongestStreak,
            lastActiveDate: newLastActiveDate,
          }
        });
      }
    }

    // Redirect back to the plan page so user sees their updated list
    return NextResponse.redirect(
      `${SITE_URL}/plan?email=${encodeURIComponent(email)}&toggled=1`
    );
  } catch (error) {
    console.error('Toggle task error:', error);
    return NextResponse.redirect(`${SITE_URL}/?error=server_error`);
  }
}
