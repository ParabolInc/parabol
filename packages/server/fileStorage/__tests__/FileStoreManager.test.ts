import FileStoreManager, {type PartialPath} from '../FileStoreManager'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

class RateLimitedFileStore extends FileStoreManager {
  baseUrl = 'https://files.test/'
  writes: string[] = []
  failNextWrite = false
  private lastWriteAtByPath = new Map<string, number>()

  protected async putFile(_file: ArrayBufferLike, fullPath: string) {
    this.writes.push(fullPath)
    if (this.failNextWrite) {
      this.failNextWrite = false
      throw new Error('GCS Upload Error: 503')
    }
    const lastWriteAt = this.lastWriteAtByPath.get(fullPath)
    if (lastWriteAt !== undefined && Date.now() - lastWriteAt < 1000) {
      throw new Error('GCS Upload Error: 429')
    }
    this.lastWriteAtByPath.set(fullPath, Date.now())
    await wait(20)
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
  async moveFile() {}
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
