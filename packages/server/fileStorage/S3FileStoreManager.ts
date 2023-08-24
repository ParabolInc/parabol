import {HeadObjectCommand, PutObjectCommand, S3Client} from '@aws-sdk/client-s3'
import mime from 'mime-types'
import path from 'path'
import FileStoreManager from './FileStoreManager'

export default class S3Manager extends FileStoreManager {
  // e.g. development, production
  private envSubDir: string
  // e.g. action-files.parabol.co
  private bucket: string
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

    this.envSubDir = pathname.replace(/^\//, '')
    this.bucket = AWS_S3_BUCKET
    this.s3 = new S3Client({
      region: AWS_REGION
    })
  }
  private prependPath(partialPath: string) {
    return path.join(this.envSubDir, 'store', partialPath)
  }

  private getPublicFileLocation(fullPath: string) {
    return encodeURI(`https://${this.bucket}/${fullPath}`)
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

  putBuildFile(file: Buffer, partialPath: string): Promise<string> {
    const fullPath = path.join(this.envSubDir, 'build', partialPath)
    return this.putFile(file, fullPath)
  }
  async checkExists(key: string) {
    const Key = this.prependPath(key)
    try {
      await this.s3.send(new HeadObjectCommand({Bucket: this.bucket, Key}))
    } catch (e) {
      if (e instanceof Error && e.name === 'NotFound') return false
    }
    return true
  }
}
