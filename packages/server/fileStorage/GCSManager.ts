import {fetch} from '@whatwg-node/fetch'
import {sign} from 'jsonwebtoken'
import mime from 'mime-types'
import path from 'path'
import {Logger} from '../utils/Logger'
import FileStoreManager, {FileAssetDir} from './FileStoreManager'

interface CloudKey {
  clientEmail: string
  privateKeyId: string
  privateKey: string
}

export default class GCSManager extends FileStoreManager {
  static GOOGLE_EXPIRY = 3600
  // e.g. development, production
  private envSubDir: string
  // e.g. action-files.parabol.co
  private bucket: string
  private accessToken: string | undefined

  // The CDN_BASE_URL without the env, e.g. storage.google.com/:bucket
  baseUrl: string
  private cloudKey: CloudKey
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
    this.cloudKey = {
      clientEmail: GOOGLE_CLOUD_CLIENT_EMAIL,
      privateKey: GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/gm, '\n'),
      privateKeyId: GOOGLE_CLOUD_PRIVATE_KEY_ID
    }
    // refresh the token every hour
    // do this on an interval vs. on demand to reduce request latency
    // unref it so things like pushToCDN can exit
    setInterval(
      async () => {
        this.accessToken = await this.getFreshAccessToken()
      },
      (GCSManager.GOOGLE_EXPIRY - 100) * 1000
    ).unref()
  }

  private async getFreshAccessToken() {
    const authUrl = 'https://www.googleapis.com/oauth2/v4/token'
    const {clientEmail, privateKeyId, privateKey} = this.cloudKey
    try {
      // GCS only accepts OAuth2 Tokens
      // To get a token, we self-sign a JWT, then trade it in for an OAuth2 Token
      const jwt = sign(
        {
          scope: 'https://www.googleapis.com/auth/devstorage.read_write'
        },
        privateKey,
        {
          algorithm: 'RS256',
          audience: authUrl,
          subject: clientEmail,
          issuer: clientEmail,
          keyid: privateKeyId,
          expiresIn: GCSManager.GOOGLE_EXPIRY
        }
      )
      const accessTokenRes = await fetch(authUrl, {
        method: 'POST',
        body: JSON.stringify({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: jwt
        })
      })
      const accessTokenJson = await accessTokenRes.json()
      return accessTokenJson.access_token
    } catch (e) {
      return undefined
    }
  }

  private async getAccessToken() {
    if (this.accessToken) return this.accessToken
    this.accessToken = await this.getFreshAccessToken()
    return this.accessToken
  }

  protected async putUserFile(file: Buffer<ArrayBufferLike>, partialPath: string) {
    const fullPath = this.prependPath(partialPath)
    return this.putFile(file, fullPath)
  }

  protected async putFile(file: Buffer<ArrayBufferLike>, fullPath: string) {
    const url = new URL(`https://storage.googleapis.com/upload/storage/v1/b/${this.bucket}/o`)
    url.searchParams.append('uploadType', 'media')
    url.searchParams.append('name', fullPath)
    const accessToken = await this.getAccessToken()
    try {
      await fetch(url, {
        method: 'POST',
        body: file,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
          'Content-Type': mime.lookup(fullPath) || ''
        }
      })
    } catch (e) {
      // https://github.com/nodejs/undici/issues/583#issuecomment-1577475664
      // GCS will cause undici to error randomly with `SocketError: other side closed` `code: 'UND_ERR_SOCKET'`
      if ((e as any).cause?.code === 'UND_ERR_SOCKET') {
        Logger.log('   Retrying GCS Post:', fullPath)
        await this.putFile(file, fullPath)
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
    const fullPath = encodeURIComponent(this.prependPath(partialPath, assetDir))
    const url = `https://storage.googleapis.com/storage/v1/b/${this.bucket}/o/${fullPath}`
    const res = await fetch(url)
    return res.status !== 404
  }
  async presignUrl(url: string): Promise<string> {
    // not implemented yet!
    return url
  }
}
