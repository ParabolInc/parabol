import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import ms from 'ms'
import type {PartialPath} from './fileStorage/FileStoreManager'
import getFileStoreManager from './fileStorage/getFileStoreManager'
import uWSAsyncHandler from './graphql/uWSAsyncHandler'
import {redisStoreOrNetwork} from './utils/redisStoreOrNetwork'
export const buildProxyHandler = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  const partialPath = req.getUrl() as PartialPath
  const filename = partialPath.slice('/build'.length + 1)
  if (!filename) {
    res.writeStatus('404').end()
    return
  }

  const manager = getFileStoreManager()
  const expiresIn = ms('7d') / 1000
  const url = await redisStoreOrNetwork(
    `presignedURL:${partialPath}`,
    () => manager.presignUrl(partialPath, expiresIn),
    // we want to refresh the presigned url before it expires
    expiresIn - ms('1d') / 1000
  )
  res
    .writeStatus('307')
    .writeHeader('Location', url)
    .writeHeader('Cache-Control', `public, max-age=${expiresIn}`)
    .end()
})
