import type {RateLimiter} from './rateLimiters'

export const MAX_CLIENT_ERROR_BATCHES_PER_IP = 60
export const MAX_CLIENT_ERROR_BATCHES_PER_SERVER = 1200

// Both limits are per minute. The server-wide one caps log volume when many clients fail at once
const isClientErrorBatchAllowed = (rateLimiter: RateLimiter, ip: string) =>
  rateLimiter.log(`clientErrors:${ip}`, 'clientErrors', false).lastMinute <=
    MAX_CLIENT_ERROR_BATCHES_PER_IP &&
  rateLimiter.log('clientErrors:server', 'clientErrors', false).lastMinute <=
    MAX_CLIENT_ERROR_BATCHES_PER_SERVER

export default isClientErrorBatchAllowed
