import FileStoreManager from './FileStoreManager'
import GCSManager from './GCSManager'
import LocalFileStoreManager from './LocalFileStoreManager'
import S3Manager from './S3FileStoreManager'

let fileStoreManager: FileStoreManager
const managers = {
  s3: S3Manager,
  gcs: GCSManager,
  local: LocalFileStoreManager
}

type ManagersKey = keyof typeof managers

const getFileStoreManager = () => {
  if (!fileStoreManager) {
    const fileStoreProvider = process.env.FILE_STORE_PROVIDER
    if (!fileStoreProvider) {
      throw new Error('The env var `FILE_STORE_PROVIDER` must be defined in `.env` file')
    }
    if (!(fileStoreProvider in managers)) {
      throw new Error('Got invalid value for `FILE_STORE_PROVIDER` env var')
    }
    if (fileStoreProvider === 'local' && process.env.CDN_BASE_URL) {
      throw new Error(`Env Var CDN_BASE_URL must be blank when FILE_STORE_PROVIDER=local`)
    }
    const Manager = managers[fileStoreProvider as ManagersKey]
    fileStoreManager = new Manager()
  }
  return fileStoreManager
}

export default getFileStoreManager
