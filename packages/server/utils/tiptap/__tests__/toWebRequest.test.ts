import {type SerializedHTTPRequest, toWebRequest} from '../RedisServerAffinity'

const makeRequest = (headers: Record<string, string | string[]>) =>
  ({
    method: 'GET',
    url: '/yjs?token=abc',
    headers: {'sec-websocket-key': 'dGhlIHNhbXBsZSBub25jZQ==', ...headers},
    socket: {remoteAddress: '127.0.0.1'},
    connectedAt: 0
  }) as SerializedHTTPRequest

test('keeps a header containing U+FFFD from invalid UTF-8 bytes instead of throwing', () => {
  const request = toWebRequest(makeRequest({'user-agent': 'false��%2527'}))
  expect(request.headers.get('user-agent')).toBe(
    Buffer.from('false��%2527', 'utf8').toString('latin1')
  )
  expect(request.headers.get('sec-websocket-key')).toBe('dGhlIHNhbXBsZSBub25jZQ==')
})

test('passes valid UTF-8 through as the bytes that arrived on the wire', () => {
  const request = toWebRequest(makeRequest({cookie: 'name=日本'}))
  expect(Buffer.from(request.headers.get('cookie')!, 'latin1').toString('utf8')).toBe('name=日本')
})

test('appends every value of an array-valued header', () => {
  const request = toWebRequest(makeRequest({'x-forwarded-for': ['1.1.1.1', '2.2.2.2�']}))
  const values = request.headers.get('x-forwarded-for')!.split(', ')
  expect(values).toHaveLength(2)
  expect(values[0]).toBe('1.1.1.1')
})

test('drops a header that is still invalid and keeps the rest', () => {
  const request = toWebRequest(makeRequest({'x-bad': 'a\0b', referer: 'https://example.com'}))
  expect(request.headers.has('x-bad')).toBe(false)
  expect(request.headers.get('referer')).toBe('https://example.com')
  expect(new URL(request.url).searchParams.get('token')).toBe('abc')
})
