import FileStoreManager from './FileStoreManager'
import fs from 'fs'
import path from 'path'
import {staticServer} from '../utils/serveStatic'

export default class LocalFileSystemManager extends FileStoreManager {
  prependPath(partialPath: string): string {
    return path.join(
      '/static/images', // todo: use env var??
      partialPath
    )
  }

  getPublicFileLocation(fullPath: string): string {
    return fullPath
  }

  async _putFile(fullPath: string, buffer: Buffer): Promise<void> {
    const fsAbsLocation = path.join(process.cwd(), fullPath)
    await fs.mkdir(path.dirname(fsAbsLocation), {recursive: true}, (err) => console.log(err))
    await fs.writeFile(fsAbsLocation, buffer, (err) => console.log(err))
  }

  _putFileCb = staticServer.whiteListStaticFile.bind(staticServer)
}
