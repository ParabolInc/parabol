export interface PutFileOptions {
  partialPath: string
  buffer: Buffer
}

interface UserAvatarPathOptions {
  userId: string
  fileName: string
  ext: string
}

interface OrgAvatarPathOptions {}

export default abstract class FileStoreManager {
  _putFileCb: undefined | ((fullPath: string) => void)

  abstract _putFile(fullPath: string, buffer: Buffer): Promise<void>

  async putFile(options: PutFileOptions): Promise<string> {
    const {partialPath, buffer} = options
    const fullPath = this.prependPath(partialPath)
    this._putFile(fullPath, buffer)
    if (this._putFileCb) this._putFileCb(fullPath)
    return this.getPublicFileLocation(fullPath)
  }

  abstract prependPath(partialPath: string): string

  abstract getPublicFileLocation(fullPath: string): string

  static getUserAvatarPath(options: UserAvatarPathOptions) {
    const {userId, fileName, ext} = options
    return `User/${userId}/picture/${fileName}.${ext}`
  }

  static getOrgAvatarPath(options: OrgAvatarPathOptions) {
    console.log(options)
  }
}
