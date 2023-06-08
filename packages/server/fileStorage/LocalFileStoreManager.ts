import fs from 'fs'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import path from 'path'
import appOrigin from '../appOrigin'
import FileStoreManager from './FileStoreManager'
export default class LocalFileSystemManager extends FileStoreManager {
  private prependPath(partialPath: string): string {
    return path.join('self-hosted', partialPath)
  }

  protected getPublicFileLocation(fullPath: string): string {
    return encodeURI(makeAppURL(appOrigin, fullPath))
  }

  protected async putFile(file: Buffer, partialPath: string) {
    const fullPath = this.prependPath(partialPath)
    const fsAbsLocation = path.join(process.cwd(), fullPath)
    await fs.promises.mkdir(path.dirname(fsAbsLocation), {recursive: true})
    await fs.promises.writeFile(fsAbsLocation, file)
    return this.getPublicFileLocation(fullPath)
  }

  async checkExists(partialPath: string) {
    const fullPath = this.prependPath(partialPath)
    try {
      await fs.promises.access(fullPath)
      return true
    } catch (e) {
      return false
    }
  }
}
