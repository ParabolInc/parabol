import {addBreadcrumb} from './clientBreadcrumbs'

type ChunkLoader = (chunkId: string | number, promises: Promise<unknown>[]) => void
declare const __webpack_require__: {f: Record<string, ChunkLoader>} | undefined

const isChunkLoadError = (error: unknown): error is Error =>
  error instanceof Error &&
  (error.name === 'ChunkLoadError' || ('code' in error && error.code === 'CSS_CHUNK_LOAD_FAILED'))

// Every import() asks each of webpack's chunk loaders (script, css) to load the chunk. A loader forgets a chunk
// that failed, so asking it again requests the chunk again. The loaders are shared by every module, unlike
// __webpack_require__.e, which the dev server's hot reloading gives each module its own copy of
const retryChunkLoadErrorOnce = () => {
  if (typeof __webpack_require__ === 'undefined') return
  const chunkLoaders = __webpack_require__.f
  Object.entries(chunkLoaders).forEach(([name, loadChunk]) => {
    chunkLoaders[name] = (chunkId, promises) => {
      const attempt: Promise<unknown>[] = []
      loadChunk(chunkId, attempt)
      const retriedAttempt = attempt.map((loading) =>
        loading.catch((error: unknown) => {
          if (!isChunkLoadError(error)) throw error
          addBreadcrumb('error', `retrying chunk ${chunkId} after: ${error.message}`)
          const retry: Promise<unknown>[] = []
          loadChunk(chunkId, retry)
          return Promise.all(retry)
        })
      )
      promises.push(...retriedAttempt)
    }
  })
}

export default retryChunkLoadErrorOnce
