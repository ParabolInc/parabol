import {InMemoryRateLimiter, StubRateLimiter, RateLimiter} from '../utils/rateLimiters'

const RATE_LIMITERS = Object.freeze({
  'in-memory': InMemoryRateLimiter,
  stub: StubRateLimiter
})
type RateLimiterType = keyof typeof RATE_LIMITERS

let rateLimiter: RateLimiter
const getRateLimiter = () => {
  if (!rateLimiter) {
    rateLimiter = new RATE_LIMITERS[getRateLimiterFromEnv() || 'in-memory']()
  }
  return rateLimiter
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
      `Specified RateLimiter ${rateLimiterEnvVar} was not understood! Options are ${possibleRateLimiters.join(
        ', '
      )}`
    )
  }
}

export default getRateLimiter
