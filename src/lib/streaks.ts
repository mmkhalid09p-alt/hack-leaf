export interface StreakState {
  current: number;
  longest: number;
  lastActiveDate: string | null;
}

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 86_400_000;
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPerDay);
}

/**
 * Pure function — given the current streak state and the date of a new session,
 * returns the updated streak state. Keeps streak logic independently testable.
 */
export function computeStreak(
  current: StreakState,
  sessionDate: string = todayUTC()
): StreakState {
  if (!current.lastActiveDate) {
    const next: StreakState = { current: 1, longest: 1, lastActiveDate: sessionDate };
    return next;
  }

  const diff = daysBetween(current.lastActiveDate, sessionDate);

  if (diff === 0) {
    // Same day — no change
    return current;
  }

  if (diff === 1) {
    // Consecutive day — extend streak
    const newCurrent = current.current + 1;
    return {
      current: newCurrent,
      longest: Math.max(current.longest, newCurrent),
      lastActiveDate: sessionDate,
    };
  }

  // Gap — reset streak
  return { current: 1, longest: current.longest, lastActiveDate: sessionDate };
}
