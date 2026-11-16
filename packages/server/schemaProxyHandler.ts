import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import type {PartialPath} from './fileStorage/FileStoreManager'
import uWSAsyncHandler from './graphql/uWSAsyncHandler'
import redirectToPresignedBuildFile from './utils/redirectToPresignedBuildFile'

const SUPPORTED_NAMES = new Set(['schema.graphql', 'schema.json'])

export const schemaProxyHandler = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  const url = req.getUrl()
  const name = url.slice('/graphql/'.length)
  if (!SUPPORTED_NAMES.has(name)) {
    res.writeStatus('404 Not Found').end()
    return
  }
  await redirectToPresignedBuildFile(res, `/build/${name}` as PartialPath)
})
