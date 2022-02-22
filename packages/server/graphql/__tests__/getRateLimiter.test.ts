import {_getRateLimiter} from '../getRateLimiter'
import {InMemoryRateLimiter, StubRateLimiter} from '../../utils/rateLimiters'

const originalRateLimiterEnvVariable = process.env.RATE_LIMITER

describe('getRateLimiter', () => {
  beforeEach(() => {
    delete process.env.RATE_LIMITER
    jest.useFakeTimers('modern')
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  afterAll(() => {
    process.env.RATE_LIMITER = originalRateLimiterEnvVariable
  })

  it('defaults to the in-memory rate limiter if not specified', () => {
    // Given that the RATE_LIMITER env variable is not set
    delete process.env.RATE_LIMITER

    // When getting the rate limiter
    // Then it is an in-memory rate limiter
    expect(_getRateLimiter()).toBeInstanceOf(InMemoryRateLimiter)
  })

  it('uses the in-memory rate limiter when specified in the env variable', () => {
    // Given that the RATE_LIMITER env variable is set to 'in-memory'
    process.env.RATE_LIMITER = 'in-memory'

    // When getting the rate limiter
    // Then it is an in-memory rate limiter
    expect(_getRateLimiter()).toBeInstanceOf(InMemoryRateLimiter)
  })

  it('uses the stub rate limiter when specified in the env variable', () => {
    // Given that the RATE_LIMITER env variable is set to 'stub'
    process.env.RATE_LIMITER = 'stub'

    // When getting the rate limiter
    // Then it is a stub rate limiter
    expect(_getRateLimiter()).toBeInstanceOf(StubRateLimiter)
  })

  it('throws an error if the rate limiter env variable is set to an unknown value', () => {
    // Given that the RATE_LIMITER env variable is set to an unknown value
    process.env.RATE_LIMITER = 'oddball'

    // When getting the rate limiter
    // Then it throws a runtime exception
    expect(() => _getRateLimiter()).toThrowError(
      "Specified RateLimiter 'oddball' was not understood!"
    )
  })
})
