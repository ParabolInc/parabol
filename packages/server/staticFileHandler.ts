import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import acceptsBrotli from './acceptsBrotli'
import {Logger} from './utils/Logger'
import serveStatic from './utils/serveStatic'

export const createStaticFileHandler = (route: string) => {
  let hasWarned = false
  return async (res: HttpResponse, req: HttpRequest) => {
    if (__PRODUCTION__ && !hasWarned) {
      hasWarned = true
      Logger.log(
        `Using NodeJS to serve static assets. This is slow! Your reverse proxy should redirect ${route} to a CDN`,
        req.getUrl()
      )
    }
    const fileName = req.getUrl().slice(route.length)
    const servedStatic = serveStatic(res, fileName, acceptsBrotli(req))
    if (servedStatic) return
    res.writeStatus('404').end()
    return
  }
}
