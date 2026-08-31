const TRACKING_PARAMS = new Set([
  'fbclid',
  'gclid',
  'mc_cid',
  'mc_eid',
  'ref',
  'ref_src',
  '_hsenc',
  '_hsmi',
  'igshid',
  // YouTube and Spotify append `si` as a per-share token, so two people sharing
  // the same video would otherwise occupy two cache entries
  'si'
])

const isTrackingParam = (key: string) => key.startsWith('utm_') || TRACKING_PARAMS.has(key)

/**
 * Canonical form of a URL, used as the cache key and to de-duplicate links that
 * differ only by tracking noise. Returns null for anything we must never fetch.
 */
export const normalizeEmbedUrl = (raw: string): string | null => {
  const trimmed = raw.trim()
  if (!trimmed) return null
  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    return null
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null

  url.hash = ''
  url.hostname = url.hostname.toLowerCase()

  const params = [...url.searchParams.entries()].filter(([key]) => !isTrackingParam(key))
  params.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  url.search = ''
  for (const [key, value] of params) {
    url.searchParams.append(key, value)
  }

  const href = url.href
  // URL always renders the root as a trailing slash; drop it so `example.com` and
  // `example.com/` share a cache entry. Deeper paths keep their slash, since a
  // trailing slash can be semantically distinct.
  return url.pathname === '/' && !url.search ? href.slice(0, -1) : href
}

/**
 * `url` lives in a Yjs document just like `embedSrc`, so a collaborator with edit access
 * can write any scheme straight over the websocket. Every sink that renders it as an
 * href or hands it to window.open has to re-check it here.
 */
export const toSafeHref = (raw: string | null | undefined): string | null => {
  if (!raw) return null
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return null
  }
  return url.protocol === 'http:' || url.protocol === 'https:' ? raw : null
}
