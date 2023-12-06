import {HeadObjectCommand, PutObjectCommand, S3Client} from '@aws-sdk/client-s3'
import mime from 'mime-types'
import path from 'path'
import FileStoreManager, {FileAssetDir} from './FileStoreManager'

export default class S3Manager extends FileStoreManager {
  // e.g. development, production
  private envSubDir: string
  // e.g. action-files.parabol.co. Usually matches CDN_BASE_URL for DNS reasons
  private bucket: string

  // e.g. https://action-files.parabol.co
  private baseUrl: string
  private s3: S3Client
  constructor() {
    super()
    const {CDN_BASE_URL, AWS_S3_BUCKET, AWS_REGION} = process.env
    if (!CDN_BASE_URL || CDN_BASE_URL === 'key_CDN_BASE_URL') {
      throw new Error('CDN_BASE_URL ENV VAR NOT SET')
    }

    if (!AWS_S3_BUCKET) {
      throw new Error('AWS_S3_BUCKET ENV VAR NOT SET')
    }
    const baseUrl = new URL(CDN_BASE_URL.replace(/^\/+/, 'https://'))
    const {hostname, pathname} = baseUrl
    if (!hostname || !pathname) {
      throw new Error('CDN_BASE_URL ENV VAR IS INVALID')
    }
    if (pathname.endsWith('/'))
      throw new Error('CDN_BASE_URL must end with the env, no trailing slash, e.g. /production')

    this.envSubDir = pathname.split('/').at(-1) as string

    this.baseUrl = baseUrl.href.slice(0, baseUrl.href.lastIndexOf(this.envSubDir))

    this.bucket = AWS_S3_BUCKET
    this.s3 = new S3Client({
      region: AWS_REGION
    })
  }

  protected async putUserFile(file: Buffer, partialPath: string) {
    const fullPath = this.prependPath(partialPath)
    return this.putFile(file, fullPath)
  }
  protected async putFile(file: Buffer, fullPath: string) {
    const s3Params = {
      Body: file,
      Bucket: this.bucket,
      Key: fullPath,
      ContentType: mime.lookup(fullPath) || 'application/octet-stream'
    }
    await this.s3.send(new PutObjectCommand(s3Params))
    return this.getPublicFileLocation(fullPath)
  }

  prependPath(partialPath: string, assetDir: FileAssetDir = 'store') {
    return path.join(this.envSubDir, assetDir, partialPath)
  }

  getPublicFileLocation(fullPath: string) {
    return encodeURI(`${this.baseUrl}${fullPath}`)
  }

  putBuildFile(file: Buffer, partialPath: string): Promise<string> {
    const fullPath = this.prependPath(partialPath, 'build')
    return this.putFile(file, fullPath)
  }
  async checkExists(key: string, assetDir?: FileAssetDir) {
    const Key = this.prependPath(key, assetDir)
    try {
      await this.s3.send(new HeadObjectCommand({Bucket: this.bucket, Key}))
    } catch (e) {
      if (e instanceof Error && e.name === 'NotFound') return false
    }
    return true
  }
}
