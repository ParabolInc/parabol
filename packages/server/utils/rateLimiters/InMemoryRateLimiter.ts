import ms from 'ms'

interface RateLimitStats {
  lastHour?: number
  lastMinute: number
}

const HOUR = ms('1h')
const MINUTE = ms('1m')

interface Records {
  [userId: string]: {
    [fieldName: string]: number[]
  }
}

interface LastCall {
  [userId: string]: number
}

export interface InMemoryRateLimiterConfig {
  scheduleGc?: boolean
}

export class InMemoryRateLimiter {
  private _records: Records = {}
  private _lastCall: LastCall = {}

  constructor(config: InMemoryRateLimiterConfig = {}) {
    const {scheduleGc = true} = config
    if (scheduleGc) {
      // careful! this is not unreffed, so it can keep a process alive
      setInterval(() => {
        this.gc()
      }, HOUR)
    }
  }

  public log(userId: string, fieldName: string, isExtendedLog: boolean): RateLimitStats {
    const now = Date.now()
    this._lastCall[userId] = now
    if (!this._records[userId]) {
      this._records[userId] = {}
    }
    const userRecord = this._records[userId]!
    if (!userRecord[fieldName]) {
      userRecord[fieldName] = [now]
      return {lastMinute: 1, lastHour: 1}
    }
    const calls = userRecord[fieldName]!
    calls.push(now)
    const lastMinuteCalls = calls.filter((timestamp) => timestamp > now - MINUTE)
    const lastHourCalls = isExtendedLog
      ? calls.filter((timestamp) => timestamp > now - HOUR)
      : undefined
    userRecord[fieldName] = lastHourCalls || lastMinuteCalls
    return {
      lastHour: lastHourCalls ? lastHourCalls.length : undefined,
      lastMinute: lastMinuteCalls.length
    }
  }

  // Garbage collecting by userId is not safe because there is no good trigger
  // If we use a signout/socket disconnect, then it encourages attackers to simply refresh
  private gc() {
    const now = Date.now()
    const userIds = Object.keys(this._lastCall)
    userIds.forEach((userId) => {
      // warning! never entirely GCs users that make at least 1 request/hour. OK for now
      if (this._lastCall[userId]! < now - HOUR) {
        delete this._lastCall[userId]
        delete this._records[userId]
      }
    })
  }
}
