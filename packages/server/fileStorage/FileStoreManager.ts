import generateUID from '../generateUID'

export type FileAssetDir = 'store' | 'build'

export default abstract class FileStoreManager {
  abstract baseUrl: string
  abstract checkExists(fileName: string, assetDir?: FileAssetDir): Promise<boolean>
  abstract prependPath(partialPath: string, assetDir?: FileAssetDir): string
  abstract getPublicFileLocation(fullPath: string): string

  protected abstract putFile(file: ArrayBufferLike, fullPath: string): Promise<string>
  protected abstract putUserFile(file: ArrayBufferLike, partialPath: string): Promise<string>
  abstract putBuildFile(file: ArrayBufferLike, partialPath: string): Promise<string>

  abstract presignUrl(url: string): Promise<string>
  async putUserAvatar(file: ArrayBufferLike, userId: string, ext: string, name?: string) {
    const filename = name ?? generateUID()
    // replace the first dot, if there is one, but not any other dots
    const dotfreeExt = ext.replace(/^\./, '')
    const partialPath = `User/${userId}/picture/${filename}.${dotfreeExt}`
    return this.putUserFile(file, partialPath)
  }

  async putOrgAvatar(file: ArrayBufferLike, orgId: string, ext: string, name?: string) {
    const filename = name ?? generateUID()
    const dotfreeExt = ext.replace(/^\./, '')
    const partialPath = `Organization/${orgId}/picture/${filename}.${dotfreeExt}`
    return this.putUserFile(file, partialPath)
  }

  async putOrgIdPMetadata(file: ArrayBufferLike, orgId: string) {
    const partialPath = `Organization/${orgId}/idpMetadata.xml`
    return this.putUserFile(file, partialPath)
  }

  async putTemplateIllustration(file: ArrayBufferLike, orgId: string, ext: string, name?: string) {
    const filename = name ?? generateUID()
    const dotfreeExt = ext.replace(/^\./, '')
    const partialPath = `Organization/${orgId}/template/${filename}.${dotfreeExt}`
    return this.putUserFile(file, partialPath)
  }

  async putDebugFile(file: ArrayBufferLike, nameWithExt: string) {
    const partialPath = `__debug__/${nameWithExt}`
    return this.putUserFile(file, partialPath)
  }
}
