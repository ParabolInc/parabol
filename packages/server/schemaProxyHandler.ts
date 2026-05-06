import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import ms from 'ms'
import type {PartialPath} from './fileStorage/FileStoreManager'
import getFileStoreManager from './fileStorage/getFileStoreManager'
import uWSAsyncHandler from './graphql/uWSAsyncHandler'
import {redisStoreOrNetwork} from './utils/redisStoreOrNetwork'

const SCHEMA_PATH = '/build/schema.graphql' as PartialPath

export const schemaProxyHandler = uWSAsyncHandler(async (res: HttpResponse, _req: HttpRequest) => {
  const manager = getFileStoreManager()
  const expiresIn = ms('1h') / 1000
  const url = await redisStoreOrNetwork(
    `presignedURL:${SCHEMA_PATH}`,
    () => manager.presignUrl(SCHEMA_PATH, expiresIn),
    expiresIn - ms('30m') / 1000
  )
  res
    .writeStatus('307')
    .writeHeader('Location', url)
    .writeHeader('Cache-Control', `public, max-age=${expiresIn}`)
    .end()
})
