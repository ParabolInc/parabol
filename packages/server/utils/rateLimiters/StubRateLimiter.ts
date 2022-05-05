import {RateLimiter, RateLimitStats} from './RateLimiter'

type StubRateLimiterMode = 'always-allow'

export class StubRateLimiter implements RateLimiter {
  constructor(private mode: StubRateLimiterMode = 'always-allow') {}

  public log(_userId: string, _fieldName: string, _isExtendedLog: boolean): RateLimitStats {
    if (this.mode === 'always-allow') {
      return {
        lastHour: 0,
        lastMinute: 0
      }
    } else {
      throw new Error(`Unimplemented StubRateLimiter mode: ${this.mode}`)
    }
  }
}
