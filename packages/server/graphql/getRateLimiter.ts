import {InMemoryRateLimiter, RateLimiter, StubRateLimiter} from '../utils/rateLimiters'

let rateLimiter: RateLimiter
const getRateLimiter = () => {
  if (!rateLimiter) {
    rateLimiter = _getRateLimiter()
  }
  return rateLimiter
}

/**
 * This function returns a stub rate limiter when testing, based on the CI
 * environment variable.
 *
 * Exposed for testing. Use the default export outside of test.
 *
 * @private
 */
export function _getRateLimiter(): RateLimiter {
  return process.env.CI ? new StubRateLimiter() : new InMemoryRateLimiter()
}

export default getRateLimiter
