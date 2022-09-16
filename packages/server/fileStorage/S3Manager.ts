import aws from 'aws-sdk'
import mime from 'mime-types'
import {APP_CDN_USER_ASSET_SUBDIR} from 'parabol-client/utils/constants'
import protocolRelativeUrl from 'parabol-server/utils/protocolRelativeUrl'
import path from 'path'
import FileStoreManager from './FileStoreManager'

export default class S3Manager extends FileStoreManager {
  private baseUrl: {hostname: string; pathname: string}
  private bucket: string
  private s3: AWS.S3
  constructor() {
    super()
    const {CDN_BASE_URL, AWS_S3_BUCKET} = process.env
    if (!CDN_BASE_URL || CDN_BASE_URL === 'key_CDN_BASE_URL') {
      throw new Error('CDN_BASE_URL ENV VAR NOT SET')
    }
    if (!AWS_S3_BUCKET) {
      throw new Error('AWS_S3_BUCKET ENV VAR NOT SET')
    }
    const baseUrl = protocolRelativeUrl.parse(CDN_BASE_URL) as any
    if (!baseUrl.hostname || !baseUrl.pathname) {
      throw new Error('CDN_BASE_URL ENV VAR IS INVALID')
    }

    this.baseUrl = baseUrl
    this.bucket = AWS_S3_BUCKET
    this.s3 = new aws.S3({
      endpoint: this.baseUrl.hostname,
      s3BucketEndpoint: true,
      signatureVersion: 'v4'
    })
  }
  protected prependPath(partialPath: string) {
    return path.join(this.baseUrl.pathname, APP_CDN_USER_ASSET_SUBDIR, partialPath)
  }

  protected getPublicFileLocation(fullPath: string) {
    return encodeURI(`https://${this.bucket}${fullPath}`)
  }

  protected async _putFile(fullPath: string, buffer: Buffer): Promise<void> {
    const keyifyPath = (path: string) => path.replace(/^\//, '')
    const s3Params = {
      Body: buffer,
      Bucket: this.bucket,
      Key: keyifyPath(fullPath),
      ContentType: mime.lookup(fullPath) || 'application/octet-stream'
    }
    await this.s3.putObject(s3Params).promise()
  }
}
