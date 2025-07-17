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

// this gets built in applyEnvVarToClientAssets
const PUBLIC_PATH = `__PUBLIC_PATH__`.replace(/^\/{2,}/, 'https://')
const waitUntil = <T>(cb: (e: ExtendableEvent) => Promise<T>) => (e: ExtendableEvent) => {
  e.waitUntil(cb(e))
}

const onInstall = async (_event: ExtendableEvent) => {
  await self.skipWaiting()
  const urls = self.__WB_MANIFEST.map(({url}) => url)
  const cacheNames = await caches.keys()
  const oldStaticCacheName = cacheNames.find((cacheName) => cacheName.startsWith('parabol-static'))
  const newCache = await caches.open(STATIC_CACHE)
  const fetchCachedFiles = async (urls: string[]) =>
    Promise.all(urls.map((url) => newCache.add(url)))

  // if this is their first service worker, fetch it all
  if (!oldStaticCacheName) {
    console.log('Installing service worker')
    return fetchCachedFiles(urls).catch(console.error)
  }

  // if they already have some assets, forward them over to the new cache & fetch the rest
  const oldStaticCache = await caches.open(oldStaticCacheName)
  const cachedResponses = await Promise.all(urls.map((url) => oldStaticCache.match(url)))
  const newUrls = urls.filter((_url, idx) => !cachedResponses[idx])
  console.log(`Installing ${urls.length} modules (${newUrls.length} new)`)
  await Promise.all(
    cachedResponses.map((res: Response | undefined, idx) => {
      if (!res) return
      newCache.put(urls[idx]!, res)
    })
  )
  return fetchCachedFiles(newUrls).catch(console.error)
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
    url.match(/.(js|json|css|mjs|png|svg|gif|jpg|jpeg|ico|eot|ttf|wav|mp3|woff|woff2|otf)$/)
  if (isCacheable) {
    const cachedRes = await caches.match(request.url)
    // all our assets are hashed, so if the hash matches, it's valid
    // let's skip opaque responses because we don't know whether they're valid
    if (cachedRes && cachedRes.type !== 'opaque' && cachedRes.ok) {
      return cachedRes
    }
    try {
      // request.mode could be 'no-cors'
      // By fetching the URL without specifying the mode the response will not be opaque
      const isParabolHosted = url.startsWith(PUBLIC_PATH) || url.startsWith(self.origin)
      // if one of our assets is not in the service worker cache, then it's either fetched via network or served from the broswer cache.
      // The browser cache most likely has incorrect CORS headers set, so we better always fetch from the network.
      const req = isParabolHosted ? fetch(request.url, {cache: 'no-store'}) : fetch(request)
      const networkRes = await req
      const cache = await caches.open(DYNAMIC_CACHE)
      if (isParabolHosted && networkRes.status === 404 && url.match(/.(js|json|mjs)/)) {
        // If we encounter a 404 for a script file, we most likely have a stale dyanmic cache.
        // We could clear the cache and the app probably will recover after a reload, however more likely the whole service worker is stale.
        // Because failing to load a script file might prevent the code to refresh the service worker from loading, it's better to just harakiri.
        console.error(`Parabol source file ${url} returned 404, updating service worker`)
        self.registration.update().catch((error) => {
          console.error('Failed to update service worker, unregistering it', error)
          self.registration.unregister()
        })
        return networkRes
      }
      // cloning here because I'm not sure if we must clone before reading the body
      cache.put(request.url, networkRes.clone()).catch(console.error)
      return networkRes
    } catch (e) {
      // if we have an opaque cached response, it's better than nothing
      if (cachedRes) return cachedRes
      throw e
    }
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

const onMessage = async (event: MessageEvent) => {
  if (event.data?.type === 'getVersion') {
    const port = event.ports?.[0]
    port?.postMessage({type: 'version', payload: `${__APP_VERSION__}`})
    port?.close()
  }
}

self.onmessage = onMessage
self.oninstall = waitUntil(onInstall)
self.onactivate = waitUntil(onActivate)
self.onfetch = (e: FetchEvent) => {
  e.respondWith(onFetch(e))
}
export {}
