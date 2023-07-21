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
    const {AWS_S3_BUCKET, AWS_REGION, ENVIRONMENT} = process.env
    if (!AWS_S3_BUCKET) {
      throw new Error('AWS_S3_BUCKET ENV VAR NOT SET')
    }
    if (!ENVIRONMENT) throw new Error('ENVIRONMENT ENV VAR NOT SET')

    this.envSubDir = ENVIRONMENT
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
    const buildDir = `/build/v${__APP_VERSION__}`
    const fullPath = path.join(this.envSubDir, buildDir, partialPath)
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
