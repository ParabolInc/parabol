import crypto from 'crypto'
import type Redis from 'ioredis'
import {fetchUntrusted} from '../../utils/fetchUntrusted'
import getRedis from '../../utils/getRedis'
import cimdCacheSeconds from '../cimdCacheSeconds'
import fetchClientMetadataDocument from '../fetchClientMetadataDocument'

jest.mock('../../utils/fetchUntrusted', () => ({fetchUntrusted: jest.fn()}))
jest.mock('../../utils/getRedis', () => ({__esModule: true, default: jest.fn()}))

const mockFetchUntrusted = jest.mocked(fetchUntrusted)
const mockGetRedis = jest.mocked(getRedis)

const CLIENT_ID = 'https://app.example.com/oauth/client.json'
const DOCUMENT = {client_id: CLIENT_ID, redirect_uris: ['https://app.example.com/callback']}

const serve = (body: string, cacheControl: string | null = null) => {
  mockFetchUntrusted.mockImplementation(async (_url, maxSize) => {
    const buffer = Buffer.from(body)
    if (buffer.byteLength > maxSize) return null
    return {buffer, contentType: 'application/json', cacheControl, size: buffer.byteLength}
  })
}

let store: Map<string, string>
const redis = {
  get: jest.fn(async (key: string) => store.get(key) ?? null),
  set: jest.fn(async (key: string, value: string, ..._expiry: unknown[]) => {
    store.set(key, value)
    return 'OK' as const
  })
}

beforeEach(() => {
  store = new Map()
  mockGetRedis.mockReturnValue(redis as unknown as Redis)
})

test('cache lifetime follows max-age within 5 minutes and 24 hours', () => {
  expect(cimdCacheSeconds('max-age=10')).toBe(300)
  expect(cimdCacheSeconds('max-age=999999')).toBe(86400)
  expect(cimdCacheSeconds(null)).toBe(3600)
  expect(cimdCacheSeconds('public, max-age=7200')).toBe(7200)
  expect(cimdCacheSeconds('no-store')).toBe(3600)
})

test('a document over 64 KB is refused', async () => {
  serve(JSON.stringify({...DOCUMENT, padding: 'x'.repeat(64 * 1024)}))
  expect(await fetchClientMetadataDocument(CLIENT_ID)).toEqual({error: expect.any(String)})
  expect(mockFetchUntrusted).toHaveBeenCalledWith(
    CLIENT_ID,
    64 * 1024,
    expect.objectContaining({timeoutMs: 5000})
  )
  expect(redis.set).not.toHaveBeenCalled()
})

test('a body that is not JSON is refused', async () => {
  serve('<html></html>')
  expect(await fetchClientMetadataDocument(CLIENT_ID)).toEqual({error: expect.any(String)})
  expect(redis.set).not.toHaveBeenCalled()
})

test('a cached document is not fetched again', async () => {
  serve(JSON.stringify(DOCUMENT), 'max-age=600')
  expect(await fetchClientMetadataDocument(CLIENT_ID)).toEqual({document: DOCUMENT})
  expect(await fetchClientMetadataDocument(CLIENT_ID)).toEqual({document: DOCUMENT})
  expect(mockFetchUntrusted).toHaveBeenCalledTimes(1)
  const key = `oauth:cimd:${crypto.createHash('sha256').update(CLIENT_ID).digest('hex')}`
  expect(redis.set).toHaveBeenCalledWith(key, JSON.stringify(DOCUMENT), 'EX', 600)
})
