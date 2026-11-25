import FileStoreManager, {type PartialPath} from '../FileStoreManager'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

class RateLimitedFileStore extends FileStoreManager {
  baseUrl = 'https://files.test/'
  writes: string[] = []
  deletes: string[] = []
  events: string[] = []
  failNextWrite = false
  isRateLimited = true
  private lastWriteAtByPath = new Map<string, number>()

  protected async putFile(_file: ArrayBufferLike, fullPath: string) {
    this.writes.push(fullPath)
    if (this.failNextWrite) {
      this.failNextWrite = false
      throw new Error('GCS Upload Error: 503')
    }
    const lastWriteAt = this.lastWriteAtByPath.get(fullPath)
    if (this.isRateLimited && lastWriteAt !== undefined && Date.now() - lastWriteAt < 1000) {
      throw new Error('GCS Upload Error: 429')
    }
    this.lastWriteAtByPath.set(fullPath, Date.now())
    await wait(20)
    this.events.push(`wrote ${fullPath}`)
  }
  prependPath(partialPath: string) {
    return `store/${partialPath}`
  }
  getPublicFileLocation(fullPath: string) {
    return `${this.baseUrl}${fullPath}`
  }
  async checkExists() {
    return false
  }
  async putBuildFile() {
    return ''
  }
  async copyFile() {
    return ''
  }
  async getFileSize() {
    return 0
  }
  async moveFile() {}
  protected async deleteFile(fullPath: string) {
    this.deletes.push(fullPath)
    this.events.push(`deleted ${fullPath}`)
  }
  async presignUrl() {
    return ''
  }
}

const partialPath = 'Team/team123/assets/abc.png' as PartialPath
const file = Buffer.from('image')

test('concurrent writes to one path share a single write', async () => {
  const store = new RateLimitedFileStore()
  const urls = await Promise.all([
    store.putUserFile(file, partialPath),
    store.putUserFile(file, partialPath),
    store.putUserFile(file, partialPath)
  ])
  expect(store.writes).toHaveLength(1)
  expect(new Set(urls).size).toBe(1)
  expect(urls[0]).toContain(`/assets/${partialPath}`)
})

test('a write to the same path within a second of the last one reuses it', async () => {
  const store = new RateLimitedFileStore()
  await store.putUserFile(file, partialPath)
  await wait(800)
  await store.putUserFile(file, partialPath)
  expect(store.writes).toHaveLength(1)
})

test('a write to the same path after a second writes again', async () => {
  const store = new RateLimitedFileStore()
  await store.putUserFile(file, partialPath)
  await wait(1100)
  await store.putUserFile(file, partialPath)
  expect(store.writes).toHaveLength(2)
})

test('a failed write is not reused', async () => {
  const store = new RateLimitedFileStore()
  store.failNextWrite = true
  await expect(store.putUserFile(file, partialPath)).rejects.toThrow('503')
  await expect(store.putUserFile(file, partialPath)).resolves.toContain(`/assets/${partialPath}`)
  expect(store.writes).toHaveLength(2)
})

test('writes to different paths are independent', async () => {
  const store = new RateLimitedFileStore()
  await Promise.all([
    store.putUserFile(file, partialPath),
    store.putUserFile(file, 'Team/team456/assets/abc.png' as PartialPath)
  ])
  expect(store.writes).toHaveLength(2)
})

test('an upload right after a delete goes to the store instead of reusing the deleted write', async () => {
  const store = new RateLimitedFileStore()
  store.isRateLimited = false
  await store.putUserFile(file, partialPath)
  await store.deleteUserFile(partialPath)
  expect(store.deletes).toEqual([`store/${partialPath}`])
  await store.putUserFile(file, partialPath)
  expect(store.writes).toHaveLength(2)
})

test('a delete waits for a write still in flight to the same path', async () => {
  const store = new RateLimitedFileStore()
  const write = store.putUserFile(file, partialPath)
  await store.deleteUserFile(partialPath)
  await write
  expect(store.events).toEqual([`wrote store/${partialPath}`, `deleted store/${partialPath}`])
})

test('a write after a delete keeps its own reuse window when the deleted write expires', async () => {
  const store = new RateLimitedFileStore()
  store.isRateLimited = false
  await store.putUserFile(file, partialPath)
  await store.deleteUserFile(partialPath)
  await wait(600)
  await store.putUserFile(file, partialPath)
  await wait(600)
  await store.putUserFile(file, partialPath)
  expect(store.writes).toHaveLength(2)
})
