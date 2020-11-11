import FileStoreManager from './FileStoreManager'
import fs from 'fs'
import path from 'path'
import makeAppLink from '../utils/makeAppLink'

export default class LocalFileSystemManager extends FileStoreManager {
  prependPath(partialPath: string): string {
    return path.join(
      'self-hosted',
      partialPath
    )
  }

  getPublicFileLocation(fullPath: string): string {
    return encodeURI(makeAppLink(fullPath))
  }

  async _putFile(fullPath: string, buffer: Buffer): Promise<void> {
    const fsAbsLocation = path.join(process.cwd(), fullPath)
    await fs.mkdir(path.dirname(fsAbsLocation), {recursive: true}, (err) => console.log(err))
    await fs.writeFile(fsAbsLocation, buffer, (err) => console.log(err))
  }
}
