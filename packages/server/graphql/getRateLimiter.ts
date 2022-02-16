import {InMemoryRateLimiter, StubRateLimiter, RateLimiter} from '../utils/rateLimiters'

interface GetRateLimiterConfig {
  memoize?: boolean
}

const RATE_LIMITERS = Object.freeze({
  'in-memory': InMemoryRateLimiter,
  stub: StubRateLimiter
})
type RateLimiterType = keyof typeof RATE_LIMITERS

let rateLimiter: RateLimiter
export default function getRateLimiter(config: GetRateLimiterConfig = {}) {
  const {memoize = true} = config

  if (memoize) {
    if (!rateLimiter) {
      rateLimiter = new RATE_LIMITERS[getRateLimiterFromEnv() || 'in-memory']()
    }
    return rateLimiter
  } else {
    // exposed for testing
    return new RATE_LIMITERS[getRateLimiterFromEnv() || 'in-memory']()
  }
}

function getRateLimiterFromEnv(): RateLimiterType | undefined {
  const rateLimiterEnvVar = process.env.RATE_LIMITER
  if (!rateLimiterEnvVar) {
    return
  }

  const possibleRateLimiters = Object.keys(RATE_LIMITERS)
  if (possibleRateLimiters.includes(rateLimiterEnvVar)) {
    return rateLimiterEnvVar as RateLimiterType
  } else {
    throw new Error(
      `Specified RateLimiter '${rateLimiterEnvVar}' was not understood! Options are ${possibleRateLimiters.join(
        ', '
      )}`
    )
  }
}
