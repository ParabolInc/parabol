import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import acceptsBrotli from './acceptsBrotli'
import {Logger} from './utils/Logger'
import serveStatic from './utils/serveStatic'

const ROUTE = '/static/'
let hasWarned = false
const staticFileHandler = async (res: HttpResponse, req: HttpRequest) => {
  if (__PRODUCTION__ && !hasWarned) {
    hasWarned = true
    Logger.log(
      'Using NodeJS to serve static assets. This is slow! Your reverse proxy should redirect /static to a CDN'
    )
    Logger.log(req.getUrl())
  }
  const fileName = req.getUrl().slice(ROUTE.length)
  const servedStatic = serveStatic(res, fileName, acceptsBrotli(req))
  if (servedStatic) return
  res.writeStatus('404').end()
  return
}

export default staticFileHandler
