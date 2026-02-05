import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
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
  const url = await redisStoreOrNetwork(
    `presignedURL:${partialPath}`,
    () => manager.presignUrl(partialPath),
    60_000
  )
  res
    .writeStatus('307')
    .writeHeader('Location', url)
    .writeHeader('Cache-Control', 'public, max-age=86400')
    .end()
})
