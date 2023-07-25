import generateUID from '../generateUID'

export default abstract class FileStoreManager {
  abstract checkExists(fileName: string): Promise<boolean>

  protected abstract putFile(file: Buffer, partialPath: string): Promise<string>
  async putUserAvatar(file: Buffer, userId: string, ext: string, name?: string) {
    const filename = name ?? generateUID()
    // replace the first dot, if there is one, but not any other dots
    const dotfreeExt = ext.replace(/^\./, '')
    const partialPath = `User/${userId}/picture/${filename}.${dotfreeExt}`
    return this.putFile(file, partialPath)
  }

  async putOrgAvatar(file: Buffer, orgId: string, ext: string, name?: string) {
    const filename = name ?? generateUID()
    const dotfreeExt = ext.replace(/^\./, '')
    const partialPath = `Organization/${orgId}/picture/${filename}.${dotfreeExt}`
    return this.putFile(file, partialPath)
  }

  async putTemplateIllustration(file: Buffer, orgId: string, ext: string, name?: string) {
    const filename = name ?? generateUID()
    const dotfreeExt = ext.replace(/^\./, '')
    const partialPath = `Organization/${orgId}/template/${filename}.${dotfreeExt}`
    return this.putFile(file, partialPath)
  }
}
