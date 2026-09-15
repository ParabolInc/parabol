import {pack} from 'msgpackr'
import getRedis from '../getRedis'
import {redisStoreAndNetwork} from '../redisStoreAndNetwork'

jest.mock('../getRedis', () => ({__esModule: true, default: jest.fn()}))

const mockGetRedis = getRedis as jest.MockedFunction<typeof getRedis>
const setBuffer = jest.fn()
const set = jest.fn()
const del = jest.fn()
const identity = <T>(raw: T) => raw
const packEntry = (transformedPayload: unknown, cachedAt = Date.now()) =>
  pack({rawHash: Buffer.alloc(32), transformedPayload, cachedAt})

beforeEach(() => {
  jest.clearAllMocks()
  mockGetRedis.mockReturnValue({setBuffer, set, del} as unknown as ReturnType<typeof getRedis>)
})

test('a fresh hit is served from the cache without fetching', async () => {
  setBuffer.mockResolvedValue(packEntry(['cached']))
  const thunk = jest.fn()
  await expect(redisStoreAndNetwork('k', thunk, identity)).resolves.toEqual(['cached'])
  expect(thunk).not.toHaveBeenCalled()
  expect(set).not.toHaveBeenCalled()
})

test('a stale hit is served at once and a changed refresh is stored before onUpdate runs', async () => {
  setBuffer.mockResolvedValue(packEntry(['cached'], 0))
  let resolveSet = () => {}
  set.mockReturnValue(new Promise<void>((resolve) => (resolveSet = resolve)))
  const onUpdate = jest.fn()
  const thunk = jest.fn().mockResolvedValue(['fresh'])
  await expect(
    redisStoreAndNetwork('k', thunk, identity, {maxAge: 1000, ttl: 5000, onUpdate})
  ).resolves.toEqual(['cached'])
  await new Promise(setImmediate)
  expect(set).toHaveBeenCalledWith('k', expect.any(Buffer), 'PX', 5000)
  expect(onUpdate).not.toHaveBeenCalled()
  resolveSet()
  await new Promise(setImmediate)
  expect(onUpdate).toHaveBeenCalledWith(['fresh'])
})
