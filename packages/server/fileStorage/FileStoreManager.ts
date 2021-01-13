import shortid from 'shortid'

export interface PutFileOptions {
  partialPath: string
  buffer: Buffer
}

export default abstract class FileStoreManager {
  static getUserAvatarPath(userId: string, ext: string): string {
    return `User/${userId}/picture/${shortid.generate()}.${ext}`
  }

  static getOrgAvatarPath(orgId: string, ext: string): string {
    return `Organization/${orgId}/picture/${shortid.generate()}.${ext}`
  }

  protected abstract prependPath(partialPath: string): string
  protected abstract _putFile(fullPath: string, buffer: Buffer): Promise<void>
  protected abstract getPublicFileLocation(fullPath: string): string

  async putFile(options: PutFileOptions): Promise<string> {
    const {partialPath, buffer} = options
    const fullPath = this.prependPath(partialPath)
    await this._putFile(fullPath, buffer)
    return this.getPublicFileLocation(fullPath)
  }
}
