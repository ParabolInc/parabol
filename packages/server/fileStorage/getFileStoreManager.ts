import FileStoreManager from './FileStoreManager'
import LocalFileSystemManager from './LocalFileSystemManager'
import S3Manager from './S3Manager'

let fileStoreManager: FileStoreManager
const managers = {
  s3: S3Manager,
  local: LocalFileSystemManager
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
    const Manager = managers[fileStoreProvider as ManagersKey]
    fileStoreManager = new Manager()
  }
  return fileStoreManager
}

export default getFileStoreManager
