import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import {Logger} from './utils/Logger'
import {sendStatus} from './utils/StaticServer'
import serveStatic from './utils/serveStatic'

export const createStaticFileHandler = (route: string) => {
  let hasWarned = false
  return (res: HttpResponse, req: HttpRequest) => {
    if (__PRODUCTION__ && !hasWarned) {
      hasWarned = true
      Logger.log(
        `Using NodeJS to serve static assets. This is slow! Your reverse proxy should redirect ${route} to a CDN`,
        req.getUrl()
      )
    }
    const fileName = req.getUrl().slice(route.length)
    if (!serveStatic(res, req, fileName)) {
      sendStatus(res, '404 Not Found')
    }
  }
}
