import {normalizeEmbedUrl} from '../normalizeEmbedUrl'

describe('normalizeEmbedUrl', () => {
  it('rejects non-http protocols', () => {
    expect(normalizeEmbedUrl('javascript:alert(1)')).toBe(null)
    expect(normalizeEmbedUrl('data:text/html,<h1>hi</h1>')).toBe(null)
    expect(normalizeEmbedUrl('file:///etc/passwd')).toBe(null)
    expect(normalizeEmbedUrl('ftp://example.com/a')).toBe(null)
  })

  it('rejects unparseable input', () => {
    expect(normalizeEmbedUrl('')).toBe(null)
    expect(normalizeEmbedUrl('not a url')).toBe(null)
    expect(normalizeEmbedUrl('   ')).toBe(null)
  })

  it('accepts http and https', () => {
    expect(normalizeEmbedUrl('https://example.com/post')).toBe('https://example.com/post')
    expect(normalizeEmbedUrl('http://example.com/post')).toBe('http://example.com/post')
  })

  it('trims surrounding whitespace', () => {
    expect(normalizeEmbedUrl('  https://example.com/post  ')).toBe('https://example.com/post')
  })

  it('lowercases the host but preserves path case', () => {
    expect(normalizeEmbedUrl('https://EXAMPLE.com/MyPost')).toBe('https://example.com/MyPost')
  })

  it('drops the fragment', () => {
    expect(normalizeEmbedUrl('https://example.com/post#section-2')).toBe('https://example.com/post')
  })

  it('strips utm_* tracking params', () => {
    expect(normalizeEmbedUrl('https://example.com/p?utm_source=x&utm_medium=y')).toBe(
      'https://example.com/p'
    )
  })

  it('strips known click identifiers', () => {
    expect(normalizeEmbedUrl('https://example.com/p?fbclid=abc&gclid=def&igshid=ghi')).toBe(
      'https://example.com/p'
    )
  })

  it('strips the si share token used by YouTube and Spotify', () => {
    expect(normalizeEmbedUrl('https://youtu.be/dQw4w9WgXcQ?si=AbCdEf')).toBe(
      'https://youtu.be/dQw4w9WgXcQ'
    )
  })

  it('preserves semantic params', () => {
    expect(normalizeEmbedUrl('https://www.youtube.com/watch?v=abc123&t=42')).toBe(
      'https://www.youtube.com/watch?t=42&v=abc123'
    )
  })

  it('preserves semantic params while removing tracking ones', () => {
    expect(normalizeEmbedUrl('https://www.youtube.com/watch?v=abc123&utm_source=slack&t=9')).toBe(
      'https://www.youtube.com/watch?t=9&v=abc123'
    )
  })

  it('sorts remaining params so key order does not fragment the cache', () => {
    expect(normalizeEmbedUrl('https://example.com/p?b=2&a=1')).toBe('https://example.com/p?a=1&b=2')
  })

  it('normalizes two links differing only by tracking to one cache key', () => {
    const a = normalizeEmbedUrl('https://example.com/post?utm_campaign=jan')
    const b = normalizeEmbedUrl('https://example.com/post#intro')
    expect(a).toBe(b)
  })

  it('strips a trailing slash on the root path only', () => {
    expect(normalizeEmbedUrl('https://example.com/')).toBe('https://example.com')
    expect(normalizeEmbedUrl('https://example.com/dir/')).toBe('https://example.com/dir/')
  })
})
