import {pack} from 'msgpackr'
import getRedis from '../getRedis'
import {peekRedisStoreAndNetwork, redisStoreAndNetwork} from '../redisStoreAndNetwork'

jest.mock('../getRedis', () => ({__esModule: true, default: jest.fn()}))

const mockGetRedis = getRedis as jest.MockedFunction<typeof getRedis>
const setBuffer = jest.fn()
const getBuffer = jest.fn()
const set = jest.fn()
const del = jest.fn()
const identity = <T>(raw: T) => raw
const packEntry = (transformedPayload: unknown, cachedAt = Date.now()) =>
  pack({rawHash: Buffer.alloc(32), transformedPayload, cachedAt})

beforeEach(() => {
  jest.clearAllMocks()
  mockGetRedis.mockReturnValue({setBuffer, getBuffer, set, del} as unknown as ReturnType<
    typeof getRedis
  >)
})

test('a fresh hit is served from the cache without fetching', async () => {
  setBuffer.mockResolvedValue(packEntry(['cached']))
  const thunk = jest.fn()
  await expect(redisStoreAndNetwork('k', thunk, identity)).resolves.toEqual(['cached'])
  expect(thunk).not.toHaveBeenCalled()
  expect(set).not.toHaveBeenCalled()
})

test('networkOnly fetches and stores even when the cache has a fresh entry', async () => {
  setBuffer.mockResolvedValue(packEntry(['cached']))
  const thunk = jest.fn().mockResolvedValue(['fresh'])
  await expect(
    redisStoreAndNetwork('k', thunk, identity, {networkOnly: true, ttl: 1000})
  ).resolves.toEqual(['fresh'])
  expect(thunk).toHaveBeenCalledTimes(1)
  expect(set).toHaveBeenCalledWith('k', expect.any(Buffer), 'PX', 1000)
})

test('peek returns the cached payload without fetching or refreshing', async () => {
  getBuffer.mockResolvedValue(packEntry(['cached'], 0))
  await expect(peekRedisStoreAndNetwork('k')).resolves.toEqual(['cached'])
  expect(setBuffer).not.toHaveBeenCalled()
  expect(set).not.toHaveBeenCalled()
})

test('peek is null when the key is absent or another request is still fetching', async () => {
  getBuffer.mockResolvedValueOnce(null).mockResolvedValueOnce(Buffer.from('__pending__'))
  await expect(peekRedisStoreAndNetwork('k')).resolves.toBeNull()
  await expect(peekRedisStoreAndNetwork('k')).resolves.toBeNull()
})
