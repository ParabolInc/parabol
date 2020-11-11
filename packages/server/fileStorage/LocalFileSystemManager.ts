import FileStoreManager from './FileStoreManager'
import fs from 'fs'
import path from 'path'
import makeAppLink from '../utils/makeAppLink'

export default class LocalFileSystemManager extends FileStoreManager {
  prependPath(partialPath: string): string {
    return path.join('self-hosted', partialPath)
  }

  getPublicFileLocation(fullPath: string): string {
    return encodeURI(makeAppLink(fullPath))
  }

  async _putFile(fullPath: string, buffer: Buffer): Promise<void> {
    const fsAbsLocation = path.join(process.cwd(), fullPath)
    await fs.mkdir(path.dirname(fsAbsLocation), {recursive: true}, (err) => {
      if (err) console.error(err)
    })
    await fs.writeFile(fsAbsLocation, buffer, (err) => {
      if (err) console.error(err)
    })
  }
}
