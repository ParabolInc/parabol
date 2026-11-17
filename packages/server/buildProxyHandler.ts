import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import type {PartialPath} from './fileStorage/FileStoreManager'
import uWSAsyncHandler from './graphql/uWSAsyncHandler'
import redirectToPresignedBuildFile from './utils/redirectToPresignedBuildFile'

export const buildProxyHandler = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  const partialPath = req.getUrl() as PartialPath
  const filename = partialPath.slice('/build'.length + 1)
  if (!filename) {
    res.writeStatus('404').end()
    return
  }
  await redirectToPresignedBuildFile(res, partialPath)
})
