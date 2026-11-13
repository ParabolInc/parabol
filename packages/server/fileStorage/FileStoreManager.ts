import makeAppURL from '../../client/utils/makeAppURL'
import appOrigin from '../appOrigin'
import generateUID from '../generateUID'
import type {AssetScopeEnum} from '../graphql/public/resolverTypes'
import isContentHashed from '../utils/isContentHashed'

export type FileAssetDir = 'store' | 'build'

export type AssetType = 'assets' | 'atlassian' | 'picture' | 'metadata' | 'template'
export type PartialPath =
  | `${AssetScopeEnum}/${string}/${AssetType}/${string}.${string}`
  | `Organization/${string}/idpMetadata/${string}.xml`
  | `__debug__/${string}`
  | `build/${string}`

export type PutFileOptions = {contentDisposition?: string; cacheControl?: string}

export default abstract class FileStoreManager {
  abstract baseUrl: string
  // true only when the store confirms the file is there, so a file it can't vouch for gets written again
  abstract checkExists(fileName: string, assetDir?: FileAssetDir): Promise<boolean>
  abstract prependPath(partialPath: string, assetDir?: FileAssetDir): string
  abstract getPublicFileLocation(fullPath: string): string

  protected abstract putFile(
    file: ArrayBufferLike | Buffer<ArrayBufferLike>,
    fullPath: string,
    options?: PutFileOptions
  ): Promise<void>
  protected getBuildFileCacheControl(partialPath: string) {
    return isContentHashed(partialPath) ? 'public, max-age=31536000, immutable' : undefined
  }
  abstract putBuildFile(
    file: ArrayBufferLike | Buffer<ArrayBufferLike>,
    partialPath: string
  ): Promise<string>

  abstract copyFile(oldKey: PartialPath, newKey: PartialPath): Promise<string>
  abstract moveFile(oldKey: PartialPath, newKey: PartialPath): Promise<void>
  abstract presignUrl(partialPath: PartialPath, expiresIn?: number): Promise<string>

  private userFileWritesByPath = new Map<PartialPath, Promise<string>>()

  putUserFile(file: ArrayBufferLike | Buffer<ArrayBufferLike>, partialPath: PartialPath) {
    const existingWrite = this.userFileWritesByPath.get(partialPath)
    if (existingWrite) return existingWrite
    const write = this.writeUserFile(file, partialPath)
    this.userFileWritesByPath.set(partialPath, write)
    write.then(
      // GCS allows one write per object per second, so a write right after this one would get a 429
      () => setTimeout(() => this.userFileWritesByPath.delete(partialPath), 1000).unref(),
      () => this.userFileWritesByPath.delete(partialPath)
    )
    return write
  }

  private async writeUserFile(
    file: ArrayBufferLike | Buffer<ArrayBufferLike>,
    partialPath: PartialPath
  ) {
    const fullPath = this.prependPath(partialPath)
    await this.putFile(file, fullPath, {contentDisposition: 'attachment'})
    return makeAppURL(appOrigin, `/assets/${partialPath}`)
  }
  async putUserAvatar(
    file: ArrayBufferLike | Buffer<ArrayBufferLike>,
    userId: string,
    ext: string,
    name?: string
  ) {
    const filename = name ?? generateUID()
    // replace the first dot, if there is one, but not any other dots
    const dotfreeExt = ext.replace(/^\./, '')
    return this.putUserFile(file, `User/${userId}/picture/${filename}.${dotfreeExt}`)
  }

  async putOrgAvatar(file: Buffer<ArrayBufferLike>, orgId: string, ext: string, name?: string) {
    const filename = name ?? generateUID()
    const dotfreeExt = ext.replace(/^\./, '')
    return this.putUserFile(file, `Organization/${orgId}/picture/${filename}.${dotfreeExt}`)
  }

  async putTemplateIllustration(
    file: Buffer<ArrayBufferLike>,
    orgId: string,
    ext: string,
    name?: string
  ) {
    const filename = name ?? generateUID()
    const dotfreeExt = ext.replace(/^\./, '')
    return this.putUserFile(file, `Organization/${orgId}/template/${filename}.${dotfreeExt}`)
  }

  async putDebugFile(file: Buffer<ArrayBufferLike>, nameWithExt: string) {
    return this.putUserFile(file, `__debug__/${nameWithExt}`)
  }
}
