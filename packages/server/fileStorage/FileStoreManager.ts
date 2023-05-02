import generateUID from '../generateUID'

export interface PutFileOptions {
  partialPath: string
  buffer: Buffer
}

export default abstract class FileStoreManager {
  static getUserAvatarPath(userId: string, ext: string): string {
    return `User/${userId}/picture/${generateUID()}.${ext}`
  }

  static getOrgAvatarPath(orgId: string, ext: string): string {
    return `Organization/${orgId}/picture/${generateUID()}.${ext}`
  }

  static getTemplatePath(orgId: string, ext: string) {
    return `Organization/${orgId}/template/${generateUID()}.${ext}`
  }

  protected abstract prependPath(partialPath: string): string
  protected abstract _putFile(fullPath: string, buffer: Buffer): Promise<void>
  protected abstract getPublicFileLocation(fullPath: string): string
  abstract checkExists(fileName: string): Promise<boolean>

  async putFile(options: PutFileOptions): Promise<string> {
    const {partialPath, buffer} = options
    const fullPath = this.prependPath(partialPath)
    await this._putFile(fullPath, buffer)
    return this.getPublicFileLocation(fullPath)
  }
}
