import generateUID from '../generateUID'

export type FileAssetDir = 'store' | 'build'

export default abstract class FileStoreManager {
  abstract checkExists(fileName: string, assetDir?: FileAssetDir): Promise<boolean>
  abstract prependPath(partialPath: string, assetDir?: FileAssetDir): string
  abstract getPublicFileLocation(fullPath: string): string

  protected abstract putFile(file: Buffer, fullPath: string): Promise<string>
  protected abstract putUserFile(file: Buffer, partialPath: string): Promise<string>
  abstract putBuildFile(file: Buffer, partialPath: string): Promise<string>
  async putUserAvatar(file: Buffer, userId: string, ext: string, name?: string) {
    const filename = name ?? generateUID()
    // replace the first dot, if there is one, but not any other dots
    const dotfreeExt = ext.replace(/^\./, '')
    const partialPath = `User/${userId}/picture/${filename}.${dotfreeExt}`
    return this.putUserFile(file, partialPath)
  }

  async putOrgAvatar(file: Buffer, orgId: string, ext: string, name?: string) {
    const filename = name ?? generateUID()
    const dotfreeExt = ext.replace(/^\./, '')
    const partialPath = `Organization/${orgId}/picture/${filename}.${dotfreeExt}`
    return this.putUserFile(file, partialPath)
  }

  async putTemplateIllustration(file: Buffer, orgId: string, ext: string, name?: string) {
    const filename = name ?? generateUID()
    const dotfreeExt = ext.replace(/^\./, '')
    const partialPath = `Organization/${orgId}/template/${filename}.${dotfreeExt}`
    return this.putUserFile(file, partialPath)
  }
}
