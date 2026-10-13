import type Redis from 'ioredis'

jest.mock('../getRedis')

import getRedis from '../getRedis'
import {redisStaleWhileRevalidate} from '../redisStaleWhileRevalidate'

const mockedGetRedis = getRedis as jest.MockedFunction<typeof getRedis>

type FakeRedis = {
  get: jest.Mock<Promise<string | null>, [string]>
  set: jest.Mock<Promise<'OK'>, [string, string, ...unknown[]]>
  del: jest.Mock<Promise<number>, [string]>
}

const makeFakeRedis = (store: Map<string, string>): FakeRedis => ({
  get: jest.fn(async (key: string) => store.get(key) ?? null),
  set: jest.fn(async (key: string, value: string, ..._rest: unknown[]) => {
    store.set(key, value)
    return 'OK' as const
  }),
  del: jest.fn(async (key: string) => {
    store.delete(key)
    return 1
  })
})

describe('redisStaleWhileRevalidate', () => {
  let store: Map<string, string>
  let redis: FakeRedis

  beforeEach(() => {
    store = new Map()
    redis = makeFakeRedis(store)
    mockedGetRedis.mockReturnValue(redis as unknown as Redis)
  })

  it('returns the cached value without calling the thunk on a hit', async () => {
    store.set('embed:foo', JSON.stringify({title: 'cached'}))
    const thunk = jest.fn(async () => ({title: 'fresh'}))

    const result = await redisStaleWhileRevalidate('embed:foo', thunk, 1000)

    expect(result).toEqual({title: 'cached'})
    expect(thunk).not.toHaveBeenCalled()
  })

  it('selects the TTL from the resolved value when ttlMs is a function', async () => {
    const thunk = jest.fn(async () => ({isFallback: true}))
    const ttlSelector = jest.fn((value: {isFallback: boolean}) =>
      value.isFallback ? 300_000 : 604_800_000
    )

    await redisStaleWhileRevalidate('embed:bar', thunk, ttlSelector)

    expect(ttlSelector).toHaveBeenCalledWith({isFallback: true})
    const call = redis.set.mock.calls.find(([key]) => key === 'embed:bar')!
    const ttlArg = call[3] as number
    // jitterTTL applies +/-20%, so assert the jittered value stays in that band
    expect(ttlArg).toBeGreaterThanOrEqual(240_000)
    expect(ttlArg).toBeLessThanOrEqual(360_000)
  })

  it('reads the cache both before and after the lock when refresh is not set', async () => {
    const thunk = jest.fn(async () => ({title: 'fresh'}))

    await redisStaleWhileRevalidate('embed:quux', thunk, 1000)

    expect(thunk).toHaveBeenCalledTimes(1)
    expect(redis.get.mock.calls.filter(([key]) => key === 'embed:quux')).toHaveLength(2)
  })

  it('never reads the cache and always refetches when refresh is true, even on a hit', async () => {
    // A value present before the call stands in for either a normal cache hit (the
    // initial read) or another holder populating the key while this caller waited
    // for the lock (the post-lock read) - refresh must skip both.
    store.set('embed:baz', JSON.stringify({title: 'stale'}))
    const thunk = jest.fn(async () => ({title: 'fresh'}))

    const result = await redisStaleWhileRevalidate('embed:baz', thunk, 1000, {refresh: true})

    expect(thunk).toHaveBeenCalledTimes(1)
    expect(result).toEqual({title: 'fresh'})
    expect(redis.get).not.toHaveBeenCalledWith('embed:baz')
    // The fresh value overwrites the stale one, so a later non-refresh read gets it
    expect(JSON.parse(store.get('embed:baz')!)).toEqual({title: 'fresh'})
  })
})
