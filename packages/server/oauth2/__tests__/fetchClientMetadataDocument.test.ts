import crypto from 'crypto'
import {fetchUntrusted} from '../../utils/fetchUntrusted'
import cimdCacheSeconds from '../cimdCacheSeconds'
import fetchClientMetadataDocument from '../fetchClientMetadataDocument'

const mockStore = new Map<string, string>()
const mockRedis = {
  get: jest.fn(async (key: string) => mockStore.get(key) ?? null),
  set: jest.fn(async (key: string, value: string, ..._expiry: unknown[]) => {
    mockStore.set(key, value)
    return 'OK' as const
  })
}

jest.mock('../../utils/fetchUntrusted', () => ({fetchUntrusted: jest.fn()}))
jest.mock('../../utils/getRedis', () => ({__esModule: true, default: () => mockRedis}))

const mockFetchUntrusted = jest.mocked(fetchUntrusted)

const CLIENT_ID = 'https://app.example.com/oauth/client.json'
const REDIRECT_URI = 'https://app.example.com/callback'
const DOCUMENT = {client_id: CLIENT_ID, redirect_uris: [REDIRECT_URI]}
const METADATA = {clientName: 'app.example.com', redirectUris: [REDIRECT_URI]}
const URL_HASH = crypto.createHash('sha256').update(CLIENT_ID).digest('hex')
const KEY = `oauth:cimd:${URL_HASH}`
const FAILURE_KEY = `oauth:cimdFailure:${URL_HASH}`

const serve = (body: string, cacheControl: string | null = null) => {
  mockFetchUntrusted.mockImplementation(async (_url, maxSize) => {
    const buffer = Buffer.from(body)
    if (buffer.byteLength > maxSize) return null
    return {buffer, contentType: 'application/json', cacheControl, size: buffer.byteLength}
  })
}

beforeEach(() => {
  mockStore.clear()
  jest.clearAllMocks()
})

test('cache lifetime follows max-age within 5 minutes and 24 hours', () => {
  expect(cimdCacheSeconds('max-age=10')).toBe(300)
  expect(cimdCacheSeconds('max-age=999999')).toBe(86400)
  expect(cimdCacheSeconds(null)).toBe(3600)
  expect(cimdCacheSeconds('public, max-age=7200')).toBe(7200)
  expect(cimdCacheSeconds('no-store')).toBe(3600)
})

test('a document over 64 KB is refused and remembered for a minute', async () => {
  serve(JSON.stringify({...DOCUMENT, padding: 'x'.repeat(64 * 1024)}))
  expect(await fetchClientMetadataDocument(CLIENT_ID)).toEqual({error: expect.any(String)})
  expect(mockFetchUntrusted).toHaveBeenCalledWith(
    CLIENT_ID,
    64 * 1024,
    expect.objectContaining({deadlineMs: 5000})
  )
  expect(mockRedis.set).toHaveBeenCalledTimes(1)
  expect(mockRedis.set).toHaveBeenCalledWith(FAILURE_KEY, expect.any(String), 'EX', 60)
})

test('a body that is not JSON is refused and not cached as a document', async () => {
  serve('<html></html>')
  expect(await fetchClientMetadataDocument(CLIENT_ID)).toEqual({error: expect.any(String)})
  expect(mockStore.has(KEY)).toBe(false)
  expect(mockStore.has(FAILURE_KEY)).toBe(true)
})

test('a document naming another client_id is not cached as a document', async () => {
  serve(JSON.stringify({...DOCUMENT, client_id: 'https://evil.example.com/oauth/client.json'}))
  expect(await fetchClientMetadataDocument(CLIENT_ID)).toEqual({
    error: expect.stringMatching(/^Invalid client_id/)
  })
  expect(mockStore.has(KEY)).toBe(false)
  expect(mockStore.has(FAILURE_KEY)).toBe(true)
})

test('a failure is not fetched again while it is remembered', async () => {
  mockFetchUntrusted.mockResolvedValue(null)
  const first = await fetchClientMetadataDocument(CLIENT_ID)
  const second = await fetchClientMetadataDocument(CLIENT_ID)
  expect(first).toEqual({error: expect.stringMatching('could not be fetched')})
  expect(second).toEqual(first)
  expect(mockFetchUntrusted).toHaveBeenCalledTimes(1)
})

test('a valid document is cached in its checked form and not fetched again', async () => {
  serve(
    JSON.stringify({...DOCUMENT, client_name: 'Example', extra: 'x'.repeat(1000)}),
    'max-age=600'
  )
  expect(await fetchClientMetadataDocument(CLIENT_ID)).toEqual(METADATA)
  expect(await fetchClientMetadataDocument(CLIENT_ID)).toEqual(METADATA)
  expect(mockFetchUntrusted).toHaveBeenCalledTimes(1)
  expect(mockRedis.set).toHaveBeenCalledWith(KEY, JSON.stringify(DOCUMENT), 'EX', 600)
})

test('an unreadable cache entry is fetched again', async () => {
  mockStore.set(KEY, '{not json')
  serve(JSON.stringify(DOCUMENT))
  expect(await fetchClientMetadataDocument(CLIENT_ID)).toEqual(METADATA)
  expect(mockFetchUntrusted).toHaveBeenCalledTimes(1)
})
