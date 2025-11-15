import makeAppURL from '../../client/utils/makeAppURL'
import appOrigin from '../appOrigin'
import generateUID from '../generateUID'
import type {AssetScopeEnum} from '../graphql/public/resolverTypes'

export type FileAssetDir = 'store' | 'build'

type AssetType = 'assets' | 'picture' | 'metadata' | 'template'
export type PartialPath =
  | `${AssetScopeEnum}/${string}/${AssetType}/${string}.${string}`
  | `Organization/${string}/idpMetadata.xml`
  | `__debug__/${string}`

export default abstract class FileStoreManager {
  abstract baseUrl: string
  abstract checkExists(fileName: string, assetDir?: FileAssetDir): Promise<boolean>
  abstract prependPath(partialPath: string, assetDir?: FileAssetDir): string
  abstract getPublicFileLocation(fullPath: string): string

  protected abstract putFile(
    file: ArrayBufferLike | Buffer<ArrayBufferLike>,
    fullPath: string
  ): Promise<void>
  abstract putBuildFile(
    file: ArrayBufferLike | Buffer<ArrayBufferLike>,
    partialPath: string
  ): Promise<string>

  abstract presignUrl(partialPath: PartialPath): Promise<string>
  async putUserFile(file: ArrayBufferLike | Buffer<ArrayBufferLike>, partialPath: PartialPath) {
    const fullPath = this.prependPath(partialPath)
    await this.putFile(file, fullPath)
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
