import FileStoreManager, {PutFileOptions} from './FileStoreManager'

export default class LocalFileSystemManager extends FileStoreManager {
  async putFile(options: PutFileOptions): Promise<string> {
    console.log('putting file in local file system manager:', options)
    return 'path'
  }
}
