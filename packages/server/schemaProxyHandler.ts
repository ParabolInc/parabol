import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import ms from 'ms'
import type {PartialPath} from './fileStorage/FileStoreManager'
import getFileStoreManager from './fileStorage/getFileStoreManager'
import uWSAsyncHandler from './graphql/uWSAsyncHandler'
import {redisStoreOrNetwork} from './utils/redisStoreOrNetwork'

const SUPPORTED_NAMES = new Set(['schema.graphql', 'schema.json'])

export const schemaProxyHandler = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  const url = req.getUrl()
  const name = url.slice('/graphql/'.length)
  if (!SUPPORTED_NAMES.has(name)) {
    res.writeStatus('404 Not Found').end()
    return
  }
  const schemaPath = `/build/${name}` as PartialPath
  const manager = getFileStoreManager()
  const expiresIn = ms('1h') / 1000

  const presignedUrl = await redisStoreOrNetwork(
    `presignedURL:${schemaPath}`,
    () => manager.presignUrl(schemaPath, expiresIn),
    expiresIn - ms('30m') / 1000
  )
  res
    .writeStatus('307')
    .writeHeader('Location', presignedUrl)
    .writeHeader('Cache-Control', `public, max-age=${expiresIn}`)
    .end()
})
