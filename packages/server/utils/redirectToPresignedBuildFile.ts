import type {HttpResponse} from 'uWebSockets.js'
import ms from 'ms'
import type {PartialPath} from '../fileStorage/FileStoreManager'
import getFileStoreManager from '../fileStorage/getFileStoreManager'
import {redisStoreOrNetwork} from './redisStoreOrNetwork'

// A URL signed with an IAM role's credentials stops working when they expire, whatever its own expiry says.
// The AWS SDK replaces credentials 5 minutes before they expire, so a URL is only certain to work for 5 minutes
const PRESIGNED_URL_LIFETIME = ms('5m')
const PRESIGNED_URL_REDIS_TTL = ms('4m')

const redirectToPresignedBuildFile = async (res: HttpResponse, partialPath: PartialPath) => {
  const manager = await getFileStoreManager()
  const url = await redisStoreOrNetwork(
    `presignedURL:${partialPath}`,
    () => manager.presignUrl(partialPath, PRESIGNED_URL_LIFETIME / 1000),
    PRESIGNED_URL_REDIS_TTL
  )
  res.writeStatus('307').writeHeader('Location', url).writeHeader('Cache-Control', 'no-store').end()
}

export default redirectToPresignedBuildFile
