export const IDLE_RECHECK_MS = 60_000

export const getNextJobDelay = (nextRunAfter: Date | null, now: Date) =>
  nextRunAfter === null
    ? IDLE_RECHECK_MS
    : Math.min(IDLE_RECHECK_MS, Math.max(0, nextRunAfter.getTime() - now.getTime()))
