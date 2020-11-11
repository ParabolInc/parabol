import FileStoreManager from './FileStoreManager'
import S3Manager from './S3Manager'
import LocalFileSystemManager from './LocalFileSystemManager'

let fileStoreManager: FileStoreManager
const managers = {
  s3: S3Manager,
  local: LocalFileSystemManager
}

const getFileStoreManager = () => {
  if (!fileStoreManager) {
    const fileStoreProvider = process.env.FILE_STORE_PROVIDER!
    const Manager = managers[fileStoreProvider] ?? LocalFileSystemManager
    fileStoreManager = new Manager()
  }
  return fileStoreManager
}

export default getFileStoreManager
