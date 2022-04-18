// This file must have worker types, but not DOM types.
// The global should be that of a service worker.

// This fixes `self`'s type.
declare let self: ServiceWorkerGlobalScope

declare global {
  interface ServiceWorkerGlobalScope {
    __WB_MANIFEST: {
      url: string
      revision: string | null
    }[]
  }
}

const STATIC_CACHE = `parabol-static-${__APP_VERSION__}`
const DYNAMIC_CACHE = `parabol-dynamic-${__APP_VERSION__}`
const cacheList = [STATIC_CACHE, DYNAMIC_CACHE]

const waitUntil = (cb: (e: ExtendableEvent) => void) => (e: ExtendableEvent) => {
  e.waitUntil(cb(e))
}

const onInstall = async (_event: ExtendableEvent) => {
  await self.skipWaiting()
  const urls = self.__WB_MANIFEST.map(({url}) => url)
  const cacheNames = await caches.keys()
  const oldStaticCacheName = cacheNames.find((cacheName) => cacheName.startsWith('parabol-static'))
  const newCache = await caches.open(STATIC_CACHE)

  // if this is their first service worker, fetch it all
  if (!oldStaticCacheName) {
    console.log('Installing service worker')
    return newCache.addAll(urls)
  }

  // if they already have some assets, forward them over to the new cache & fetch the rest
  const oldStaticCache = await caches.open(oldStaticCacheName)
  const cachedResponses = await Promise.all(urls.map((url) => oldStaticCache.match(url)))
  const newUrls = urls.filter((_url, idx) => !cachedResponses[idx])
  console.log(`Installing ${urls.length} modules (${newUrls.length} new)`)
  await Promise.all(
    cachedResponses.map((res: Response | undefined, idx) => {
      if (!res) return
      newCache.put(urls[idx], res)
    })
  )
  return newCache.addAll(newUrls)
}

const onActivate = async (_event: ExtendableEvent) => {
  await self.clients.claim()
  const cacheNames = await caches.keys()
  return Promise.all(
    cacheNames.map((cacheName) =>
      cacheList.includes(cacheName) ? undefined : caches.delete(cacheName)
    )
  )
}

const onFetch = async (event: FetchEvent) => {
  const {request} = event
  const {url} = request
  const isCacheable =
    url.startsWith('http') &&
    url.match(/.(js|css|mjs|png|svg|gif|jpg|jpeg|ico|eot|ttf|wav|mp3|woff|woff2|otf)$/)
  if (isCacheable) {
    const cachedRes = await caches.match(request.url)
    // all our assets are hashed, so if the hash matches, it's valid
    if (cachedRes) return cachedRes
    const networkRes = await fetch(request)
    const cache = await caches.open(DYNAMIC_CACHE)
    // cloning here because I'm not sure if we must clone before reading the body
    cache.put(request.url, networkRes.clone()).catch(console.error)
    return networkRes
    // } else if (request.destination === 'document') {
    //   // dynamic because index.html isn't hashed (and the server returns an html with keys)
    //   const dynamicCache = await caches.open(DYNAMIC_CACHE)
    //   const cachedRes = await dynamicCache.match('/')
    //   if (cachedRes) return cachedRes
    //   const networkRes = await fetch(request)
    //   const cache = await caches.open(DYNAMIC_CACHE)
    //   // cloning here because I'm not sure if we must clone before reading the body
    //   cache.put('/', networkRes.clone()).catch(console.error)
    //   return networkRes
  }
  return fetch(request)
}

self.oninstall = waitUntil(onInstall)
self.onactivate = waitUntil(onActivate)
self.onfetch = (e: FetchEvent) => {
  e.respondWith(onFetch(e))
}
export {}
