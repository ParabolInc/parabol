import type FileStoreManager from './FileStoreManager'

// each store's client is a lot of code, so the first file request evaluates only the configured one
const managerLoaders = {
  s3: async () => (await import(/* webpackMode: "eager" */ './S3FileStoreManager')).default,
  gcs: async () => (await import(/* webpackMode: "eager" */ './GCSManager')).default,
  local: async () => (await import(/* webpackMode: "eager" */ './LocalFileStoreManager')).default
}

type ManagersKey = keyof typeof managerLoaders

const makeFileStoreManager = async (): Promise<FileStoreManager> => {
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
  const Manager = await managerLoaders[fileStoreProvider as ManagersKey]()
  return new Manager()
}

let fileStoreManager: Promise<FileStoreManager> | undefined

export const getFileStoreManager = () => {
  fileStoreManager ??= makeFileStoreManager()
  return fileStoreManager
}

export default getFileStoreManager
