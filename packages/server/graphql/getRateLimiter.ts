import {InMemoryRateLimiter, StubRateLimiter, RateLimiter} from '../utils/rateLimiters'

const RATE_LIMITERS = Object.freeze({
  'in-memory': InMemoryRateLimiter,
  stub: StubRateLimiter
})

let rateLimiter: RateLimiter
export default function getRateLimiter() {
  if (!rateLimiter) {
    rateLimiter = _getRateLimiter()
  }
  return rateLimiter
}

/**
 * This function returns the appropriate rate limited based on the RATE_LIMITER
 * environment variable, falling back to the InMemoryRateLimiter (the previous,
 * uncustomizable default).
 *
 * Exposed for testing. Use the default export outside of test.
 *
 * @private
 */
export function _getRateLimiter(): RateLimiter {
  const rateLimiterEnvVar = process.env.RATE_LIMITER
  if (!rateLimiterEnvVar) {
    return new InMemoryRateLimiter()
  }

  const possibleRateLimiters = Object.keys(RATE_LIMITERS)
  if (possibleRateLimiters.includes(rateLimiterEnvVar)) {
    return new RATE_LIMITERS[rateLimiterEnvVar]()
  } else {
    throw new Error(
      `Specified RateLimiter '${rateLimiterEnvVar}' was not understood! Options are ${possibleRateLimiters.join(
        ', '
      )}`
    )
  }
}
