import {InMemoryRateLimiter} from './InMemoryRateLimiter'

let rateLimiter: InMemoryRateLimiter
const getRateLimiter = () => {
  if (!rateLimiter) {
    rateLimiter = new InMemoryRateLimiter()
  }
  return rateLimiter
}

export default getRateLimiter
