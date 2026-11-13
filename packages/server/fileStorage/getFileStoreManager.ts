import type FileStoreManager from './FileStoreManager'

let fileStoreManager: FileStoreManager
// each store's client is a lot of code, so only the configured one is evaluated, by the first file request.
// They are requires so this getter stays synchronous
const managerLoaders = {
  s3: () => (require('./S3FileStoreManager') as typeof import('./S3FileStoreManager')).default,
  gcs: () => (require('./GCSManager') as typeof import('./GCSManager')).default,
  local: () =>
    (require('./LocalFileStoreManager') as typeof import('./LocalFileStoreManager')).default
}

type ManagersKey = keyof typeof managerLoaders

export const getFileStoreManager = () => {
  if (!fileStoreManager) {
    const fileStoreProvider = process.env.FILE_STORE_PROVIDER
    if (!fileStoreProvider) {
      throw new Error('The env var `FILE_STORE_PROVIDER` must be defined in `.env` file')
    }
    if (!(fileStoreProvider in managerLoaders)) {
      throw new Error('Got invalid value for `FILE_STORE_PROVIDER` env var')
    }
    if (fileStoreProvider === 'local' && process.env.CDN_BASE_URL) {
      throw new Error(`Env Var CDN_BASE_URL must be blank when FILE_STORE_PROVIDER=local`)
    }
    const Manager = managerLoaders[fileStoreProvider as ManagersKey]()
    fileStoreManager = new Manager()
  }
  return fileStoreManager
}

export default getFileStoreManager
