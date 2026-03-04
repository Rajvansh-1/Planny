/**
 * Calculates the updated streak for a user based on their last active date.
 * Should be called whenever a task's `completed` status is toggled to true.
 * 
 * @param lastActiveDate - The date the user last completed a task (YYYY-MM-DD)
 * @param currentStreak - The user's current streak
 * @param longestStreak - The user's longest historical streak
 * @param actionDate - The date of the task being completed (YYYY-MM-DD), usually today
 * @returns Object containing the new streak values and whether they changed
 */
export function calculateNewStreak(
  lastActiveDate: string | null,
  currentStreak: number,
  longestStreak: number,
  actionDate: string // The `dateFor` of the task being checked off
) {
  // If they've never completed a task, 1st task sets streak to 1
  if (!lastActiveDate) {
    return {
      newCurrentStreak: 1,
      newLongestStreak: Math.max(1, longestStreak),
      newLastActiveDate: actionDate,
      streakIncremented: true
    };
  }

  // If they already completed a task on this specific requested date, streak stays the same
  // (We don't increment streak twice in one day)
  if (lastActiveDate === actionDate) {
    return {
      newCurrentStreak: currentStreak,
      newLongestStreak: longestStreak,
      newLastActiveDate: actionDate,
      streakIncremented: false
    };
  }

  // To check if they hit consecutive days, we convert YYYY-MM-DD strings to Date objects
  const lastDateStr = new Date(lastActiveDate);
  const actDateStr = new Date(actionDate);

  // Calculate difference in days (ignoring time zones by working with UTC midnight)
  const diffTime = Math.abs(actDateStr.getTime() - lastDateStr.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let newCurrentStreak = currentStreak;

  if (diffDays === 1) {
    // Perfect, they hit the very next day. Increment streak.
    newCurrentStreak += 1;
  } else if (diffDays > 1) {
    // They missed a day (or more). Streak resets. Ouch!
    newCurrentStreak = 1;
  }
  // Note: if diffDays === 0, they somehow completed a task for the same day (handled above)
  // or actDateStr is before lastDateStr (e.g., retroactively checking off an older task).
  // If it's retroactive, we generally just update lastActiveDate and keep the streak at 1 or reset it.
  // For simplicity, retroactive completion to an older date breaks the current streak context.
  // We'll treat checking off an old task as resetting their current momentum to 1.

  return {
    newCurrentStreak,
    newLongestStreak: Math.max(newCurrentStreak, longestStreak),
    newLastActiveDate: actionDate,
    streakIncremented: newCurrentStreak > currentStreak || newCurrentStreak === 1
  };
}
