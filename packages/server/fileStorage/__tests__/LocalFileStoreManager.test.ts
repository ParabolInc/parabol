import fs from 'fs'
import os from 'os'
import path from 'path'
import type {PartialPath} from '../FileStoreManager'
import LocalFileStoreManager from '../LocalFileStoreManager'

jest.mock('../../appOrigin', () => ({__esModule: true, default: 'https://parabol.test'}))

const originalCwd = process.cwd()
let storeRoot: string

beforeEach(async () => {
  process.env.PROTO = 'https'
  process.env.HOST = 'parabol.test'
  storeRoot = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'local-file-store-'))
  process.chdir(storeRoot)
})

afterEach(async () => {
  process.chdir(originalCwd)
  await fs.promises.rm(storeRoot, {recursive: true, force: true})
})

test('a copied file gets the same access-checked /assets/ URL as an upload', async () => {
  const manager = new LocalFileStoreManager()
  const uploadedUrl = await manager.putUserFile(
    Buffer.from('image'),
    'Page/1/assets/og.png' as PartialPath
  )
  const copiedUrl = await manager.copyFile(
    'Page/1/assets/og.png' as PartialPath,
    'Page/2/assets/og.png' as PartialPath
  )
  expect(uploadedUrl).toBe('https://parabol.test/assets/Page/1/assets/og.png')
  expect(copiedUrl).toBe('https://parabol.test/assets/Page/2/assets/og.png')
  const copied = await fs.promises.readFile(
    path.join(storeRoot, 'self-hosted/Page/2/assets/og.png')
  )
  expect(copied.toString()).toBe('image')
})

test('reports the size of a stored file', async () => {
  const manager = new LocalFileStoreManager()
  await manager.putUserFile(Buffer.from('image'), 'Page/1/assets/og.png' as PartialPath)
  expect(await manager.getFileSize('Page/1/assets/og.png' as PartialPath)).toBe(5)
})
