import fs from 'fs'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import path from 'path'
import appOrigin from '../appOrigin'
import {Logger} from '../utils/Logger'
import FileStoreManager, {type PartialPath} from './FileStoreManager'

export default class LocalFileStoreManager extends FileStoreManager {
  baseUrl = makeAppURL(appOrigin, 'self-hosted')
  constructor() {
    super()
    const {PROTO, HOST} = process.env
    if (!PROTO || !HOST) {
      throw new Error('Env Vars PROTO and HOST must be set if FILE_STORE_PROVIDER=local')
    }
  }

  protected async putFile(file: ArrayBufferLike, fullPath: string) {
    const fsAbsLocation = path.join(process.cwd(), fullPath)
    await fs.promises.mkdir(path.dirname(fsAbsLocation), {recursive: true})
    await fs.promises.writeFile(fsAbsLocation, Buffer.from(file) as any)
  }

  prependPath(partialPath: string): string {
    return path.join('self-hosted', partialPath)
  }

  getPublicFileLocation(fullPath: string): string {
    return encodeURI(makeAppURL(appOrigin, fullPath))
  }

  async moveFile(oldKey: PartialPath, newKey: PartialPath): Promise<void> {
    const oldFullPath = this.prependPath(oldKey)
    const newFullPath = this.prependPath(newKey)
    await fs.promises.rename(oldFullPath, newFullPath)
  }

  async putBuildFile() {
    Logger.warn(
      'Cannot call `putBuildFile` when using Local File Storage. The build files are already there'
    )
    return ''
  }

  async checkExists(partialPath: string) {
    const fullPath = this.prependPath(partialPath)
    try {
      await fs.promises.access(fullPath)
      return true
    } catch {
      return false
    }
  }
  async presignUrl(url: string) {
    return url
  }
}
