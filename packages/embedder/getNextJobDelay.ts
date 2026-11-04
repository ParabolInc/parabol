export const getNextJobDelay = (nextRunAfter: Date | null, now: Date) =>
  nextRunAfter === null ? null : Math.max(0, nextRunAfter.getTime() - now.getTime())
