import {HeadObjectCommand, PutObjectCommand, S3Client} from '@aws-sdk/client-s3'
import mime from 'mime-types'
import path from 'path'
import url from 'url'
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
    const baseUrl = url.parse(CDN_BASE_URL.replace(/^\/+/, 'https://'))
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
  protected prependPath(partialPath: string) {
    return path.join(this.envSubDir, 'store', partialPath)
  }

  protected getPublicFileLocation(fullPath: string) {
    return encodeURI(`https://${this.bucket}/${fullPath}`)
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

  protected async _putFile(fullPath: string, buffer: Buffer): Promise<void> {
    const s3Params = {
      Body: buffer,
      Bucket: this.bucket,
      Key: fullPath,
      ContentType: mime.lookup(fullPath) || 'application/octet-stream'
    }
    await this.s3.send(new PutObjectCommand(s3Params))
  }
}
