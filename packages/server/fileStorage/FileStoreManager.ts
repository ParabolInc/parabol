import generateUID from '../generateUID'

export default abstract class FileStoreManager {
  abstract checkExists(fileName: string): Promise<boolean>

  protected abstract putFile(file: Buffer, partialPath: string): Promise<string>
  async putUserAvatar(file: Buffer, userId: string, ext: string, name?: string) {
    const filename = name ?? generateUID()
    const partialPath = `User/${userId}/picture/${filename}.${ext}`
    return this.putFile(file, partialPath)
  }

  async putOrgAvatar(file: Buffer, orgId: string, ext: string, name?: string) {
    const filename = name ?? generateUID()
    const partialPath = `Organization/${orgId}/picture/${filename}.${ext}`
    return this.putFile(file, partialPath)
  }

  async putTemplateIllustration(file: Buffer, orgId: string, ext: string, name?: string) {
    const filename = name ?? generateUID()
    const partialPath = `Organization/${orgId}/template/${filename}.${ext}`
    return this.putFile(file, partialPath)
  }
}
