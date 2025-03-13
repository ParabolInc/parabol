import {Storage} from '@google-cloud/storage'
import mime from 'mime-types'
import path from 'path'
import {Logger} from '../utils/Logger'
import FileStoreManager, {FileAssetDir} from './FileStoreManager'

export default class GCSManager extends FileStoreManager {
  // e.g. development, production
  private envSubDir: string
  // e.g. action-files.parabol.co
  private bucket: string
  // The CDN_BASE_URL without the env, e.g. storage.google.com/:bucket
  baseUrl: string
  private storage: Storage

  constructor() {
    super()
    const {
      CDN_BASE_URL,
      GOOGLE_GCS_BUCKET,
      GOOGLE_CLOUD_CLIENT_EMAIL,
      GOOGLE_CLOUD_PRIVATE_KEY,
      GOOGLE_CLOUD_PRIVATE_KEY_ID
    } = process.env

    if (!CDN_BASE_URL || CDN_BASE_URL === 'key_CDN_BASE_URL') {
      throw new Error('CDN_BASE_URL ENV VAR NOT SET')
    }

    if (!GOOGLE_CLOUD_CLIENT_EMAIL || !GOOGLE_CLOUD_PRIVATE_KEY_ID || !GOOGLE_CLOUD_PRIVATE_KEY) {
      throw new Error(
        'Env Vars GOOGLE_CLOUD_CLIENT_EMAIL,GOOGLE_CLOUD_PRIVATE_ID,GOOGLE_CLOUD_PRIVATE_KEY must be set'
      )
    }

    if (!GOOGLE_GCS_BUCKET) {
      throw new Error('GOOGLE_GCS_BUCKET ENV VAR NOT SET')
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
    this.bucket = GOOGLE_GCS_BUCKET

    // Initialize Google Cloud Storage client with credentials
    this.storage = new Storage({
      credentials: {
        client_email: GOOGLE_CLOUD_CLIENT_EMAIL,
        private_key: GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/gm, '\n'),
        private_key_id: GOOGLE_CLOUD_PRIVATE_KEY_ID
      }
    })
  }

  protected async putUserFile(file: Buffer<ArrayBufferLike>, partialPath: string) {
    const fullPath = this.prependPath(partialPath)
    return this.putFile(file, fullPath)
  }

  protected async putFile(file: Buffer<ArrayBufferLike>, fullPath: string) {
    try {
      const bucket = this.storage.bucket(this.bucket)
      const blob = bucket.file(fullPath)

      // Set the content type based on file extension
      const contentType = mime.lookup(fullPath) || 'application/octet-stream'
      const options = {
        contentType,
        resumable: false
      }

      await blob.save(file, options)
    } catch (e) {
      // Handle specific socket errors that might occur with GCS
      if (
        (e as any).code === 'ETIMEDOUT' ||
        (e as any).code === 'ECONNRESET' ||
        (e as any).cause?.code === 'UND_ERR_SOCKET'
      ) {
        Logger.log('   Retrying GCS Post:', fullPath)
        await this.putFile(file, fullPath)
      } else {
        throw e
      }
    }

    return this.getPublicFileLocation(fullPath)
  }

  putBuildFile(file: Buffer<ArrayBufferLike>, partialPath: string): Promise<string> {
    const fullPath = this.prependPath(partialPath, 'build')
    return this.putFile(file, fullPath)
  }

  prependPath(partialPath: string, assetDir: FileAssetDir = 'store') {
    return path.join(this.envSubDir, assetDir, partialPath)
  }

  getPublicFileLocation(fullPath: string) {
    return encodeURI(`${this.baseUrl}${fullPath}`)
  }

  async checkExists(partialPath: string, assetDir?: FileAssetDir) {
    const fullPath = this.prependPath(partialPath, assetDir)
    const bucket = this.storage.bucket(this.bucket)
    const file = bucket.file(fullPath)

    try {
      const [exists] = await file.exists()
      return exists
    } catch (e) {
      Logger.error('Error checking if file exists:', e)
      return false
    }
  }

  async presignUrl(url: string, expiresInMinutes: number = 60): Promise<string> {
    // Extract the file path from the URL
    const filePathMatch = url.match(new RegExp(`${this.baseUrl}(.*)`))
    if (!filePathMatch || !filePathMatch[1]) {
      return url // Return original URL if we can't extract the path
    }

    const filePath = decodeURI(filePathMatch[1])
    const bucket = this.storage.bucket(this.bucket)
    const file = bucket.file(filePath)

    try {
      // Generate a signed URL
      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + expiresInMinutes * 60 * 1000
      })

      return signedUrl
    } catch (e) {
      Logger.error('Error generating signed URL:', e)
      return url // Return the original URL if signing fails
    }
  }
}
