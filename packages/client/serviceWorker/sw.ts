// ServiceWorkerPlugin transpiles this file by itself, so it cannot import anything
// It must have worker types, but not DOM types

declare let self: ServiceWorkerGlobalScope
declare const __APP_VERSION__: string
declare const __COMMIT_HASH__: string
// In production this is a placeholder until applyEnvVarsToClientAssets knows where the build is deployed
declare const __PUBLIC_PATH__: string
declare const __PRECACHE_MANIFEST__: string[]

// Holds the build files that have a content hash in their name
// The URL identifies the content, so an entry is never stale & every build shares this 1 cache
const BUILD_CACHE = 'parabol-build'
const UPLOAD_CACHE = 'parabol-uploads'
// The previous worker kept 2 caches per app version
const LEGACY_CACHE = /^parabol-(static|dynamic)-/

const PUBLIC_PATH = new URL(__PUBLIC_PATH__, self.location.href).href
const PRECACHE_URLS = new Set(__PRECACHE_MANIFEST__.map((filename) => PUBLIC_PATH + filename))
// a webpack content hash is 20 hex characters
const CONTENT_HASHED = /[-_/][0-9a-f]{20}(\.[a-z0-9]+)+$/
// assetProxyHandler serves these to everyone & a new upload gets a new name
// The rest of /assets depends on who is asking, so the server must answer every time
const PUBLIC_UPLOAD =
  /^\/assets\/((User|Team|Organization)\/[^/]+\/picture|Organization\/aGhostOrg\/[^/]+)\/[^/]+$/

const PRECACHE_CONCURRENCY = 6
// Files of other builds & files that are not precached. Pages of the previous build may still need theirs
const MAX_UNLISTED_BUILD_FILES = 100
const MAX_UPLOADS = 500
const LEGACY_PAGE_LOAD_GRACE = 15_000

let isUploadStorageReadable = true

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// An <img> can leave a copy without CORS headers in the HTTP cache
// That copy fails every CORS request for the same URL until the HTTP cache is bypassed
const fetchReadable = async (url: string, init?: RequestInit) => {
  try {
    return await fetch(url, init)
  } catch {
    return fetch(url, {...init, cache: 'reload'})
  }
}

const store = async (cacheName: string, url: string, response: Response) => {
  // If a missing file were answered with the app's HTML, caching it would break that file for good
  if (!response.ok || response.headers.get('content-type')?.startsWith('text/html')) return
  // A redirected response cannot answer a request that forbids redirects, so only its content is kept
  const storable = response.redirected
    ? new Response(response.body, {headers: response.headers})
    : response
  const cache = await caches.open(cacheName)
  await cache.put(url, storable)
}

// cache.keys() goes from the oldest entry to the newest
const trim = async (
  cacheName: string,
  maxEntries: number,
  isEvictable = (_url: string) => true
) => {
  const cache = await caches.open(cacheName)
  const requests = await cache.keys()
  const evictable = requests.filter(({url}) => isEvictable(url))
  await Promise.all(evictable.slice(0, -maxEntries).map((request) => cache.delete(request)))
}

const precache = async () => {
  const cache = await caches.open(BUILD_CACHE)
  const urls = [...PRECACHE_URLS]
  const fetchUntilDone = async () => {
    for (let url = urls.pop(); url; url = urls.pop()) {
      try {
        if (await cache.match(url, {ignoreVary: true})) continue
        // caches.match looks in every cache, so files the previous worker fetched are reused
        const response =
          (await caches.match(url, {ignoreVary: true})) ??
          (await fetchReadable(url, {priority: 'low'}))
        await store(BUILD_CACHE, url, response)
      } catch {
        // Precaching is a head start. A page that needs a missing file fetches it
      }
    }
  }
  await Promise.all(Array.from({length: PRECACHE_CONCURRENCY}, fetchUntilDone))
}

const install = async () => {
  const cacheNames = await caches.keys()
  const isReplacingLegacyWorker = cacheNames.some((name) => LEGACY_CACHE.test(name))
  await precache()
  if (!isReplacingLegacyWorker) return
  // A worker waits until a page of its own build asks it to take over (see useServiceWorkerUpdater)
  // Pages from before that hook never ask. They only reload after their controller changes
  // Taking over is delayed, because Safari has killed the old worker while a page was loading through it
  await sleep(LEGACY_PAGE_LOAD_GRACE)
  await self.skipWaiting()
}

const activate = async () => {
  const cacheNames = await caches.keys()
  const obsoleteCacheNames = cacheNames.filter(
    (name) => name !== BUILD_CACHE && name !== UPLOAD_CACHE
  )
  await Promise.all(obsoleteCacheNames.map((name) => caches.delete(name)))
  await trim(BUILD_CACHE, MAX_UNLISTED_BUILD_FILES, (url) => !PRECACHE_URLS.has(url))
  // lets the page that registered its first worker use the cache without a reload
  await self.clients.claim()
}

const respondWithBuildFile = async (event: FetchEvent) => {
  const {request} = event
  const {url} = request
  const cached = await caches.match(url, {cacheName: BUILD_CACHE, ignoreVary: true})
  if (cached) return cached
  // A request that would work without this worker must work with it, even if the response cannot be cached
  const response = await fetchReadable(url).catch(() => fetch(request))
  if (response.status === 404) {
    // The build this page belongs to is gone, so there is probably a newer one
    self.registration.update().catch(() => {})
  }
  event.waitUntil(store(BUILD_CACHE, url, response.clone()).catch(() => {}))
  return response
}

const storeUpload = async (url: string, response: Response) => {
  await store(UPLOAD_CACHE, url, response)
  await trim(UPLOAD_CACHE, MAX_UPLOADS)
}

const respondWithUpload = async (event: FetchEvent) => {
  const {request} = event
  const {url} = request
  const cached = await caches.match(url, {cacheName: UPLOAD_CACHE, ignoreVary: true})
  if (cached) return cached
  // Storage that does not allow CORS can still answer the request as the page made it
  if (!isUploadStorageReadable) return fetch(request)
  let response: Response
  try {
    response = await fetchReadable(url)
  } catch {
    isUploadStorageReadable = false
    return fetch(request)
  }
  // The server redirects to where the picture is stored. Anything else is not the picture
  if (response.redirected) {
    event.waitUntil(storeUpload(url, response.clone()).catch(() => {}))
  }
  return response
}

self.addEventListener('install', (event) => {
  event.waitUntil(install())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(activate())
})

self.addEventListener('fetch', (event) => {
  const {request} = event
  const {method, mode, headers, url} = request
  // The HTML is tiny & names the files of the newest build, so it always comes from the server
  // Safari cannot play media from a response that ignores the range it asked for
  if (method !== 'GET' || mode === 'navigate' || headers.has('range')) return
  const {origin, pathname} = new URL(url)
  if (origin === self.location.origin && PUBLIC_UPLOAD.test(pathname)) {
    event.respondWith(respondWithUpload(event))
    return
  }
  const isBuildFile = url.startsWith(PUBLIC_PATH) && CONTENT_HASHED.test(pathname)
  if (isBuildFile || PRECACHE_URLS.has(url)) {
    event.respondWith(respondWithBuildFile(event))
  }
})

self.addEventListener('message', (event) => {
  const {type} = event.data ?? {}
  if (type === 'getVersion') {
    const [port] = event.ports
    port?.postMessage({type: 'version', payload: __APP_VERSION__, commitHash: __COMMIT_HASH__})
    port?.close()
  } else if (type === 'skipWaiting') {
    event.waitUntil(self.skipWaiting())
  }
})
