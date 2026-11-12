import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import fs from 'fs'
import path from 'path'
import getProjectRoot from '../../scripts/webpack/utils/getProjectRoot'
import {
  getContentType,
  makeDiskETag,
  readStaticRequest,
  sendStaticFile,
  sendStatus
} from './utils/StaticServer'

const ROUTE = '/self-hosted/'

// Serves what LocalFileStoreManager stored under rootDir, & nothing outside it
export const createSelfHostedHandler = (rootDir: string) => {
  const root = path.resolve(rootDir)
  return async (res: HttpResponse, req: HttpRequest) => {
    // uWS frees the request at the first await
    const request = readStaticRequest(req)
    const url = req.getUrl()
    res.onAborted(() => {
      res.aborted = true
    })
    let pathname: string
    try {
      pathname = path.resolve(root, `.${path.sep}${decodeURIComponent(url.slice(ROUTE.length))}`)
    } catch {
      sendStatus(res, '400 Bad Request')
      return
    }
    // a .. or an encoded %2e%2e must not climb out of the store, e.g. to the .env beside it
    if (!pathname.startsWith(root + path.sep)) {
      sendStatus(res, '404 Not Found')
      return
    }
    let stats: fs.Stats
    try {
      stats = await fs.promises.stat(pathname)
    } catch {
      sendStatus(res, '404 Not Found')
      return
    }
    if (!stats.isFile()) {
      sendStatus(res, '404 Not Found')
      return
    }
    sendStaticFile(res, request, {
      type: getContentType(pathname),
      // an upload can be replaced under the same name, so the client checks its copy each time
      cacheControl: 'no-cache',
      etag: makeDiskETag(stats),
      size: stats.size,
      pathname,
      // like the cloud file stores, an upload opened on its own is downloaded, not shown,
      // so an uploaded page or SVG can't run a script on the app's origin
      headers: {'Content-Disposition': 'attachment'}
    })
  }
}

const selfHostedHandler = createSelfHostedHandler(path.join(getProjectRoot(), 'self-hosted'))

export default selfHostedHandler
