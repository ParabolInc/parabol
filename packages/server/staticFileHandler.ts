import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import acceptsBrotli from './acceptsBrotli'
import serveStatic from './utils/serveStatic'

const ROUTE = '/static/'
let hasWarned = false
const staticFileHandler = async (res: HttpResponse, req: HttpRequest) => {
  if (__PRODUCTION__ && !hasWarned) {
    hasWarned = true
    console.log(
      'Using NodeJS to serve static assets. This is slow! Your reverse proxy should redirect /static to a CDN'
    )
  }
  const fileName = req.getUrl().slice(ROUTE.length)
  const servedStatic = serveStatic(res, fileName, acceptsBrotli(req))
  if (servedStatic) return
  res.writeStatus('404').end()
  return
}

export default staticFileHandler
