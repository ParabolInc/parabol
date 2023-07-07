import {sign} from 'jsonwebtoken'
import mime from 'mime-types'
import path from 'path'
import url from 'url'
import FileStoreManager from './FileStoreManager'

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
  accessToken: string | undefined

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
    const baseUrl = url.parse(CDN_BASE_URL.replace(/^\/+/, 'https://'))
    const {hostname, pathname} = baseUrl
    if (!hostname || !pathname) {
      throw new Error('CDN_BASE_URL ENV VAR IS INVALID')
    }

    this.envSubDir = pathname.replace(/^\//, '')
    this.bucket = GOOGLE_GCS_BUCKET
    this.cloudKey = {
      clientEmail: GOOGLE_CLOUD_CLIENT_EMAIL,
      privateKey: GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/gm, '\n'),
      privateKeyId: GOOGLE_CLOUD_PRIVATE_KEY_ID
    }
    // refresh the token every hour
    // do this on an interval vs. on demand to reduce request latency
    setInterval(async () => {
      this.accessToken = await this.getFreshAccessToken()
    }, (GCSManager.GOOGLE_EXPIRY - 100) * 1000)
  }

  private async getFreshAccessToken() {
    const authUrl = 'https://www.googleapis.com/oauth2/v4/token'
    const {clientEmail, privateKeyId, privateKey} = this.cloudKey
    try {
      // GCS only access OAuth2 Tokens
      // First we self-sign a JWT, then trade it in for an OAuth2 Token
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

  async getAccessToken() {
    if (this.accessToken) return this.accessToken
    this.accessToken = await this.getFreshAccessToken()
    return this.accessToken
  }

  private prependPath(partialPath: string) {
    return path.join(this.envSubDir, partialPath)
  }

  private getPublicFileLocation(fullPath: string) {
    return encodeURI(`https://storage.googleapis.com/${this.bucket}/${fullPath}`)
  }
  protected async putFile(file: Buffer, partialPath: string) {
    const fullPath = this.prependPath(partialPath)
    const url = new URL(`https://storage.googleapis.com/upload/storage/v1/b/${this.bucket}/o`)
    url.searchParams.append('uploadType', 'media')
    url.searchParams.append('name', fullPath)
    const accessToken = await this.getAccessToken()
    await fetch(url, {
      method: 'POST',
      body: file,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
        'Content-Type': mime.lookup(partialPath) || ''
      }
    })
    return this.getPublicFileLocation(fullPath)
  }
  async checkExists(partialPath: string) {
    const fullPath = this.prependPath(partialPath)
    const url = `https://storage.googleapis.com/storage/v1/b/${this.bucket}/o/${fullPath}`
    const res = await fetch(url)
    return res.status !== 404
  }
}
