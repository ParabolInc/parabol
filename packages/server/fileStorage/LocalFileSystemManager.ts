import fs from 'fs'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import path from 'path'
import appOrigin from '../appOrigin'
import FileStoreManager from './FileStoreManager'
export default class LocalFileSystemManager extends FileStoreManager {
  protected prependPath(partialPath: string): string {
    return path.join('self-hosted', partialPath)
  }

  protected getPublicFileLocation(fullPath: string): string {
    return encodeURI(makeAppURL(appOrigin, fullPath))
  }

  async checkExists(key: string) {
    const fullPath = this.prependPath(key)
    try {
      await fs.promises.access(fullPath)
      return true
    } catch (e) {
      return false
    }
  }
  protected async _putFile(fullPath: string, buffer: Buffer): Promise<void> {
    const fsAbsLocation = path.join(process.cwd(), fullPath)
    await fs.promises.mkdir(path.dirname(fsAbsLocation), {recursive: true})
    await fs.promises.writeFile(fsAbsLocation, buffer)
  }
}
