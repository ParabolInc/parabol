import type {HttpResponse} from 'uWebSockets.js'
import type {PartialPath} from '../fileStorage/FileStoreManager'
import getFileStoreManager from '../fileStorage/getFileStoreManager'
import {redisStoreOrNetwork} from './redisStoreOrNetwork'

interface PresignedBuildUrl {
  url: string
  expiresAt: number
}

// leaves time to follow the redirect after the browser takes it from its cache
const EXPIRY_MARGIN_MS = 60_000

// Redis keeps a URL for half its lifetime and the browser keeps the redirect for what is left of it,
// so a URL signed just before its credentials are replaced still works wherever it is cached
const redirectToPresignedBuildFile = async (res: HttpResponse, partialPath: PartialPath) => {
  const manager = await getFileStoreManager()
  let lifetimeSeconds = 0
  const cachedUrl = await redisStoreOrNetwork(
    `presignedBuildURL:${partialPath}`,
    async () => {
      lifetimeSeconds = await manager.getPresignedUrlMaxLifetime()
      const presignedUrl: PresignedBuildUrl = {
        url: await manager.presignUrl(partialPath, lifetimeSeconds),
        expiresAt: Date.now() + lifetimeSeconds * 1000
      }
      return JSON.stringify(presignedUrl)
    },
    () => (lifetimeSeconds * 1000) / 2
  )
  const {url, expiresAt} = JSON.parse(cachedUrl) as PresignedBuildUrl
  const maxAge = Math.max(0, Math.floor((expiresAt - Date.now() - EXPIRY_MARGIN_MS) / 1000))
  res
    .writeStatus('307')
    .writeHeader('Location', url)
    .writeHeader('Cache-Control', `private, max-age=${maxAge}`)
    .end()
}

export default redirectToPresignedBuildFile
