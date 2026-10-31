type ChunkLoader = (chunkId: string | number, promises: Promise<unknown>[]) => void

const chunkLoadError = () =>
  Object.assign(new Error('Loading chunk 7 failed.'), {name: 'ChunkLoadError'})

// webpack loads a chunk like __webpack_require__.e does: each loader adds its promise and all of them must settle
const loadChunk = (chunkLoaders: Record<string, ChunkLoader>, chunkId: number) => {
  const promises: Promise<unknown>[] = []
  Object.values(chunkLoaders).forEach((load) => load(chunkId, promises))
  return Promise.all(promises)
}

// the retry wraps webpack's chunk loaders, which only exist in a bundle, so each test installs fake ones
const installRetry = async (...results: (Error | undefined)[]) => {
  jest.resetModules()
  const attempts = {count: 0}
  const loadScript: ChunkLoader = (_chunkId, promises) => {
    const result = results[attempts.count++]
    promises.push(result ? Promise.reject(result) : Promise.resolve())
  }
  const chunkLoaders = {j: loadScript}
  Object.assign(globalThis, {__webpack_require__: {f: chunkLoaders}})
  const {default: retryChunkLoadErrorOnce} = await import('../retryChunkLoadErrorOnce')
  retryChunkLoadErrorOnce()
  return {chunkLoaders, attempts}
}

afterAll(() => {
  Reflect.deleteProperty(globalThis, '__webpack_require__')
})

test('a chunk that fails to load is requested once more', async () => {
  const {chunkLoaders, attempts} = await installRetry(chunkLoadError(), undefined)
  await expect(loadChunk(chunkLoaders, 7)).resolves.toBeDefined()
  expect(attempts.count).toBe(2)
})

test('a chunk that fails twice reports the second failure', async () => {
  const {chunkLoaders, attempts} = await installRetry(chunkLoadError(), chunkLoadError())
  await expect(loadChunk(chunkLoaders, 7)).rejects.toThrow('Loading chunk 7 failed.')
  expect(attempts.count).toBe(2)
})

test('other errors are not retried', async () => {
  const {chunkLoaders, attempts} = await installRetry(new TypeError('boom'))
  await expect(loadChunk(chunkLoaders, 7)).rejects.toThrow('boom')
  expect(attempts.count).toBe(1)
})
