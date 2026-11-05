import isClientErrorBatchAllowed, {
  MAX_CLIENT_ERROR_BATCHES_PER_IP,
  MAX_CLIENT_ERROR_BATCHES_PER_SERVER
} from '../isClientErrorBatchAllowed'
import {InMemoryRateLimiter} from '../rateLimiters'

test('a flood from one address is refused while other addresses get through', () => {
  const rateLimiter = new InMemoryRateLimiter({scheduleGc: false})
  const results = Array.from({length: MAX_CLIENT_ERROR_BATCHES_PER_IP + 1}, () =>
    isClientErrorBatchAllowed(rateLimiter, '203.0.113.7')
  )
  expect(results.filter(Boolean)).toHaveLength(MAX_CLIENT_ERROR_BATCHES_PER_IP)
  expect(results.at(-1)).toBe(false)
  expect(isClientErrorBatchAllowed(rateLimiter, '198.51.100.9')).toBe(true)
})

test('the server-wide cap applies across addresses', () => {
  const rateLimiter = new InMemoryRateLimiter({scheduleGc: false})
  const results = Array.from({length: MAX_CLIENT_ERROR_BATCHES_PER_SERVER + 1}, (_, i) =>
    isClientErrorBatchAllowed(rateLimiter, `198.51.100.${i % 250}`)
  )
  expect(results.filter(Boolean)).toHaveLength(MAX_CLIENT_ERROR_BATCHES_PER_SERVER)
})
