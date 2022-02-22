import ms from 'ms'
import {
  InMemoryRateLimiter,
  InMemoryRateLimiterConfig
} from '../../rateLimiters/InMemoryRateLimiter'

describe('InMemoryRateLimiter', () => {
  function subject(configOverrides: Partial<InMemoryRateLimiterConfig> = {}): InMemoryRateLimiter {
    const configDefaults: Required<InMemoryRateLimiterConfig> = {
      scheduleGc: false
    }

    return new InMemoryRateLimiter(Object.assign(configDefaults, configOverrides))
  }

  beforeEach(() => {
    jest.useFakeTimers('modern')
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('when not using extended logging', () => {
    it('returns 1 call for last minute & hour on the first call', () => {
      // Given
      const inMemoryRateLimiter = subject()
      const userId = '123'
      const fieldName = 'FieldName'

      // When the user requests a field
      const result = inMemoryRateLimiter.log(userId, fieldName, false)

      // Then it returns 1 call last hour, 1 call last minute
      expect(result).toEqual({lastMinute: 1, lastHour: 1})
    })

    it('returns 2 calls for last minute & undefined for last hour on the second call', () => {
      // Given
      const inMemoryRateLimiter = subject()
      const userId = '123'
      const fieldName = 'FieldName'

      // When the same user requests the same field twice within the same minute
      inMemoryRateLimiter.log(userId, fieldName, false)
      jest.advanceTimersByTime(ms('30s'))
      const secondResult = inMemoryRateLimiter.log(userId, fieldName, false)

      // Then it returns 2 calls last minute, undefined call last hour
      expect(secondResult).toEqual({lastMinute: 2, lastHour: undefined})
    })

    it('returns 1 call last minute when two calls occur a minute apart', () => {
      // Given
      const inMemoryRateLimiter = subject()
      const userId = '123'
      const fieldName = 'FieldName'

      // When the same user requests the same field one minute apart
      inMemoryRateLimiter.log(userId, fieldName, false)
      jest.advanceTimersByTime(ms('1m'))
      const secondResult = inMemoryRateLimiter.log(userId, fieldName, false)

      // Then it returns 1 call last minute, undefined lastHour
      expect(secondResult).toEqual({lastMinute: 1, lastHour: undefined})
    })

    it('does not reuse the same rate limit for different users', () => {
      // Given
      const inMemoryRateLimiter = subject()
      const firstUserId = '123'
      const secondUserId = '456'
      const fieldName = 'FieldName'

      // When a different user requests the same field 1 minute apart
      inMemoryRateLimiter.log(firstUserId, fieldName, false)
      jest.advanceTimersByTime(ms('1m'))
      const secondUserFirstCallResult = inMemoryRateLimiter.log(secondUserId, fieldName, false)

      // Then it returns 1 call last minute, 1 call lastHour
      expect(secondUserFirstCallResult).toEqual({lastMinute: 1, lastHour: 1})
    })
  })

  describe('when using extended logging', () => {
    it('returns 1 call for last minute & hour on the first call', () => {
      // Given
      const inMemoryRateLimiter = subject()
      const userId = '123'
      const fieldName = 'FieldName'

      // When the user requests a field
      const result = inMemoryRateLimiter.log(userId, fieldName, true)

      // Then it returns 1 call last hour, 1 call last minute
      expect(result).toEqual({lastMinute: 1, lastHour: 1})
    })

    it('returns 2 calls for last minute & 1 for last hour on the second call', () => {
      // Given
      const inMemoryRateLimiter = subject()
      const userId = '123'
      const fieldName = 'FieldName'

      // When the same user requests the same field twice within the same minute
      inMemoryRateLimiter.log(userId, fieldName, true)
      jest.advanceTimersByTime(ms('30s'))
      const secondResult = inMemoryRateLimiter.log(userId, fieldName, true)

      // Then it returns 2 calls last minute, 2 calls last hour
      expect(secondResult).toEqual({lastMinute: 2, lastHour: 2})
    })

    it('returns 1 call last minute, 2 calls last hour when two calls occur a minute apart', () => {
      // Given
      const inMemoryRateLimiter = subject()
      const userId = '123'
      const fieldName = 'FieldName'

      // When the same user requests the same field one minute apart
      inMemoryRateLimiter.log(userId, fieldName, true)
      jest.advanceTimersByTime(ms('1m'))
      const secondResult = inMemoryRateLimiter.log(userId, fieldName, true)

      // Then it returns 1 call last minute, 2 calls last hour
      expect(secondResult).toEqual({lastMinute: 1, lastHour: 2})
    })

    it('returns 1 call last minute, 1 calls last hour when two calls occur an hour apart', () => {
      // Given
      const inMemoryRateLimiter = subject()
      const userId = '123'
      const fieldName = 'FieldName'

      // When the same user requests the same field one hour apart
      inMemoryRateLimiter.log(userId, fieldName, true)
      jest.advanceTimersByTime(ms('1h'))
      const secondResult = inMemoryRateLimiter.log(userId, fieldName, true)

      // Then it returns 1 call last hour, 1 call last minute
      expect(secondResult).toEqual({lastMinute: 1, lastHour: 1})
    })

    it('does not reuse the same rate limit for different users', () => {
      // Given
      const inMemoryRateLimiter = subject()
      const firstUserId = '123'
      const secondUserId = '456'
      const fieldName = 'FieldName'

      // When a different user requests the same field 1 minute apart
      inMemoryRateLimiter.log(firstUserId, fieldName, true)
      jest.advanceTimersByTime(ms('1m'))
      const secondUserFirstCallResult = inMemoryRateLimiter.log(secondUserId, fieldName, true)

      // Then it returns 1 call last minute, 1 call lastHour
      expect(secondUserFirstCallResult).toEqual({lastMinute: 1, lastHour: 1})
    })
  })

  describe('gc', () => {
    it('cleans up users who have not called the service in the last hour', () => {
      // Given an InMemoryRateLimiter with scheduled GC enabled
      const inMemoryRateLimiter = subject({scheduleGc: true})
      const userId = '123'
      const fieldName = 'FieldName'

      // When a user requested a field, triggering gc twice
      inMemoryRateLimiter.log(userId, fieldName, false)
      jest.advanceTimersByTime(ms('1h'))
      jest.advanceTimersByTime(ms('1h'))
      // When the same user requests the same field two hours later
      const secondResult = inMemoryRateLimiter.log(userId, fieldName, false)

      // Then it returns 1 call last minute, 1 lastHour
      // We're relying on the behavior that you receive 1 lastHour the first time the user calls without
      // extended logging for this assertion. If the user was not GC'ed we've get lastMinute: 1, lastHour: undefined
      expect(secondResult).toEqual({lastMinute: 1, lastHour: 1})
    })
  })
})
