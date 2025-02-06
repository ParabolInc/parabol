import {GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client} from '@aws-sdk/client-s3'
import {getSignedUrl} from '@aws-sdk/s3-request-presigner'
import type {RetryErrorInfo, StandardRetryToken} from '@smithy/types'
import {StandardRetryStrategy} from '@smithy/util-retry'
import mime from 'mime-types'
import path from 'path'
import {Logger} from '../utils/Logger'
import FileStoreManager, {FileAssetDir} from './FileStoreManager'

class CloudflareRetry extends StandardRetryStrategy {
  public async refreshRetryTokenForRetry(
    tokenToRenew: StandardRetryToken,
    errorInfo: RetryErrorInfo
  ): Promise<StandardRetryToken> {
    const status = errorInfo.error?.$response?.statusCode
    if (status && status >= 520 && status < 530) {
      const date = errorInfo.error?.$response?.headers?.date
      Logger.log('Retrying after Cloudflare error', {
        status,
        date: date && new Date(date).toISOString(),
        path: errorInfo.error?.$response?.body?.req?.path
      })
      // Cloudflare swallows the error, so let's treat it as a transient and retry
      errorInfo.errorType = 'TRANSIENT'
    }
    const token = await super.refreshRetryTokenForRetry(tokenToRenew, errorInfo)
    return token
  }
}

export default class S3Manager extends FileStoreManager {
  // e.g. development, production
  private envSubDir: string

  // e.g. action-files.parabol.co
  private bucket: string

  // e.g. https://action-files.parabol.co
  baseUrl: string
  private s3: S3Client
  constructor() {
    super()
    const {CDN_BASE_URL, AWS_REGION, AWS_SECRET_ACCESS_KEY, AWS_ACCESS_KEY_ID, AWS_S3_BUCKET} =
      process.env
    if (!CDN_BASE_URL || CDN_BASE_URL === 'key_CDN_BASE_URL') {
      throw new Error('CDN_BASE_URL ENV VAR NOT SET')
    }

    const baseUrl = new URL(CDN_BASE_URL.replace(/^\/+/, 'https://'))
    const {hostname, pathname} = baseUrl
    if (!hostname || !pathname) {
      throw new Error('CDN_BASE_URL ENV VAR IS INVALID')
    }
    if (pathname.endsWith('/'))
      throw new Error('CDN_BASE_URL must end with the env, no trailing slash, e.g. /production')

    if (!AWS_S3_BUCKET) {
      throw new Error('AWS_S3_BUCKET required when using AWS S3 as filestore provider')
    }

    this.envSubDir = pathname.split('/').at(-1) as string

    this.baseUrl = baseUrl.href.slice(0, baseUrl.href.lastIndexOf(this.envSubDir))
    this.bucket = AWS_S3_BUCKET

    // credentials are optional since the file store could be public & not need a key to write
    const credentials =
      AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY
        ? {accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY}
        : undefined
    this.s3 = new S3Client({
      credentials,
      // Using true fails to work on the checkExist method, it returns a 403
      bucketEndpoint: false,
      region: AWS_REGION,
      followRegionRedirects: true,
      retryStrategy: new CloudflareRetry(3)
    })
  }

  protected async putUserFile(file: ArrayBufferLike, partialPath: string) {
    const fullPath = this.prependPath(partialPath)
    return this.putFile(file, fullPath)
  }
  protected async putFile(file: ArrayBufferLike, fullPath: string) {
    const s3Params = {
      Body: Buffer.from(file),
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

  putBuildFile(file: ArrayBufferLike, partialPath: string): Promise<string> {
    const fullPath = this.prependPath(partialPath, 'build')
    return this.putFile(file, fullPath)
  }
  async checkExists(key: string, assetDir?: FileAssetDir) {
    const Key = this.prependPath(key, assetDir)
    try {
      await this.s3.send(new HeadObjectCommand({Bucket: this.bucket, Key}))
    } catch (e) {
      if (e instanceof Error && e.name === 'NotFound') return false
      Logger.log(`Invalid error ${(e as Error).name}`)
    }
    return true
  }

  async presignUrl(url: string) {
    // Important to decodeURI so `getSignedUrl` doesn't double encode e.g. local|123/avatars/123.jpg
    const key = decodeURI(url.slice(this.baseUrl.length))
    const command = new GetObjectCommand({Bucket: this.bucket, Key: key})
    const encodedUri = await getSignedUrl(this.s3, command, {expiresIn: 604800})
    return encodedUri
  }
}
