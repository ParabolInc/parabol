import RateLimiter from './RateLimiter'

let rateLimiter: RateLimiter
const getRateLimiter = () => {
  if (!rateLimiter) {
    rateLimiter = new RateLimiter()
  }
  return rateLimiter
}

export default getRateLimiter
