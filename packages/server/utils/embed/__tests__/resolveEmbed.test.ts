import type Redis from 'ioredis'

jest.mock('../oEmbedResolver', () => ({resolveOEmbed: jest.fn()}))
jest.mock('../openGraphResolver', () => ({resolveOpenGraph: jest.fn()}))
jest.mock('../../getRedis')

import getRedis from '../../getRedis'
import {resolveOEmbed} from '../oEmbedResolver'
import {resolveOpenGraph} from '../openGraphResolver'
import {EMBED_CACHE_TTL_MS, EMBED_UNRESOLVED_CACHE_TTL_MS, resolveEmbed} from '../resolveEmbed'

const mockedResolveOEmbed = resolveOEmbed as jest.MockedFunction<typeof resolveOEmbed>
const mockedResolveOpenGraph = resolveOpenGraph as jest.MockedFunction<typeof resolveOpenGraph>
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

const ttlWrittenFor = (redis: FakeRedis, key: string, callIndex = 0): number => {
  const calls = redis.set.mock.calls.filter(([k]) => k === key)
  return calls[callIndex]![3] as number
}

// Not the exact TTL: jitterTTL applies +/-20%, so assert the written value lands in that band
const expectTtlNear = (ttlArg: number, ttlMs: number) => {
  expect(ttlArg).toBeGreaterThanOrEqual(ttlMs * 0.8)
  expect(ttlArg).toBeLessThanOrEqual(ttlMs * 1.2)
}

describe('resolveEmbed short-TTL decision', () => {
  const url = 'https://someblog.example.com/post'
  let store: Map<string, string>
  let redis: FakeRedis

  beforeEach(() => {
    store = new Map()
    redis = makeFakeRedis(store)
    mockedGetRedis.mockReturnValue(redis as unknown as Redis)
    mockedResolveOEmbed.mockReset()
    mockedResolveOpenGraph.mockReset()
  })

  it('caches a real oEmbed resolution for the full week-long TTL', async () => {
    mockedResolveOEmbed.mockResolvedValue({
      embedSrc: 'https://player.example.com/embed/1',
      title: 'A Real Post'
    })
    mockedResolveOpenGraph.mockResolvedValue(null)

    await resolveEmbed(url)

    expectTtlNear(ttlWrittenFor(redis, `embed:v2:${url}`), EMBED_CACHE_TTL_MS)
  })

  it('caches a real Open Graph resolution for the full week-long TTL', async () => {
    mockedResolveOEmbed.mockResolvedValue(null)
    mockedResolveOpenGraph.mockResolvedValue({
      embedSrc: null,
      title: 'A Real Post Title',
      description: 'a real description'
    })

    await resolveEmbed(url)

    expectTtlNear(ttlWrittenFor(redis, `embed:v2:${url}`), EMBED_CACHE_TTL_MS)
  })

  it('caches the hostname-only fallback (both resolvers found nothing) for a short TTL', async () => {
    mockedResolveOEmbed.mockResolvedValue(null)
    mockedResolveOpenGraph.mockResolvedValue(null)

    await resolveEmbed(url)

    expectTtlNear(ttlWrittenFor(redis, `embed:v2:${url}`), EMBED_UNRESOLVED_CACHE_TTL_MS)
  })

  it('caches a soft-404/login-wall scrape (Open Graph resolves but every field is null) for a short TTL', async () => {
    // This is the shape metascraper returns when it fetched a page but found nothing -
    // the exact case a naive title-vs-hostname check misses, since title here is
    // simply absent rather than equal to the synthesized hostname fallback.
    mockedResolveOEmbed.mockResolvedValue(null)
    mockedResolveOpenGraph.mockResolvedValue({
      embedSrc: null,
      title: null,
      description: null,
      thumbnailUrl: null,
      faviconUrl: null,
      providerName: null
    })

    await resolveEmbed(url)

    expectTtlNear(ttlWrittenFor(redis, `embed:v2:${url}`), EMBED_UNRESOLVED_CACHE_TTL_MS)
  })

  it('bypasses the cache and re-resolves when refresh is true', async () => {
    mockedResolveOEmbed.mockResolvedValue(null)
    mockedResolveOpenGraph.mockResolvedValue(null)
    await resolveEmbed(url)
    expect(mockedResolveOpenGraph).toHaveBeenCalledTimes(1)

    mockedResolveOpenGraph.mockResolvedValue({embedSrc: null, title: 'Now Reachable'})
    const result = await resolveEmbed(url, true)

    expect(mockedResolveOpenGraph).toHaveBeenCalledTimes(2)
    expect(result?.metadata.title).toBe('Now Reachable')
    expectTtlNear(ttlWrittenFor(redis, `embed:v2:${url}`, 1), EMBED_CACHE_TTL_MS)
  })
})
