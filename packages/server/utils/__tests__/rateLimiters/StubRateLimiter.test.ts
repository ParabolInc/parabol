import {StubRateLimiter} from '../../rateLimiters/StubRateLimiter'

describe('StubRateLimiter', () => {
  describe('always-allow mode', () => {
    it('returns 0 lastHour and 0 lastMinute calls to prevent rate limiting', () => {
      const stubRateLimiter = new StubRateLimiter('always-allow')

      stubRateLimiter.log('123', 'FieldName', false)
      stubRateLimiter.log('123', 'FieldName', false)
      stubRateLimiter.log('123', 'FieldName', false)
      stubRateLimiter.log('123', 'FieldName', false)

      expect(stubRateLimiter.log('123', 'FieldName', false)).toEqual({
        lastHour: 0,
        lastMinute: 0
      })
    })
  })
})
