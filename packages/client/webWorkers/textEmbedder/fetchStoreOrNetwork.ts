interface ProgressCallbackParams {
  progress: number
  loaded: number
  total: number
  url: string
}

export type ProgressCallback = (params: ProgressCallbackParams) => void

export const fetchStoreOrNetwork = async <T>(
  url: string,
  progressCallback?: ProgressCallback
): Promise<T> => {
  console.log('star1')
  const cache = await caches.open('transformers-cache')
  let modelResponse = await cache.match(url)
  if (modelResponse) {
    console.log('got 1')
    const ab = await modelResponse.arrayBuffer()
    progressCallback?.({progress: 1, loaded: ab.byteLength, total: ab.byteLength, url})
    if (url.endsWith('.json')) {
      return JSON.parse(new TextDecoder().decode(ab)) as T
    }
    console.log('got 13')
    return new Uint8Array(ab) as T
  }
  const remoteResponse = await fetch(url)
  const contentLength = remoteResponse.headers.get('Content-Length')
  let total = parseInt(contentLength ?? '0')
  let buffer = new Uint8Array(total)
  let loaded = 0
  const reader = remoteResponse.body.getReader()
  while (true) {
    const {done, value} = await reader.read()
    if (done) break
    const newLoaded = loaded + value.length
    if (newLoaded > total) {
      total = newLoaded
      const newBuffer = new Uint8Array(total)
      newBuffer.set(buffer)
      buffer = newBuffer
    }
    buffer.set(value, loaded)
    loaded = newLoaded
    const progress = (loaded / total) * 100
    progressCallback?.({progress, loaded, total, url})
  }
  cache.put(url, new Response(buffer))
  if (url.endsWith('.json')) {
    return JSON.parse(new TextDecoder().decode(buffer)) as T
  }
  return buffer as T
}
