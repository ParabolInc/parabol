import {InMemoryRateLimiter, StubRateLimiter} from '../../utils/rateLimiters'
import {_getRateLimiter} from '../getRateLimiter'

const originalRateLimiterEnvVariable = process.env.CI

describe('getRateLimiter', () => {
  beforeEach(() => {
    delete process.env.CI
    jest.useFakeTimers('modern')
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  afterAll(() => {
    process.env.CI = originalRateLimiterEnvVariable
  })

  it('defaults to the in-memory rate limiter when not in CI', () => {
    // Given that the CI env variable is not set
    delete process.env.CI

    // When getting the rate limiter
    // Then it is an in-memory rate limiter
    expect(_getRateLimiter()).toBeInstanceOf(InMemoryRateLimiter)
  })

  it('uses the stub rate limiter when in CI', () => {
    // Given that the CI env variable is true
    process.env.CI = 'true'

    // When getting the rate limiter
    // Then it is a stub rate limiter
    expect(_getRateLimiter()).toBeInstanceOf(StubRateLimiter)
  })
})
