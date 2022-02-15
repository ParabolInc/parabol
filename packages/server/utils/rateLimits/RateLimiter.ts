export interface RateLimitStats {
  lastHour?: number
  lastMinute: number
}

export abstract class RateLimiter {
  public abstract log(userId: string, fieldName: string, isExtendedLog: boolean): RateLimitStats
}
