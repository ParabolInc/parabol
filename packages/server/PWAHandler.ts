import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import acceptsBrotli from './acceptsBrotli'
import serveStatic from './utils/serveStatic'

const PWAHandler = (res: HttpResponse, req: HttpRequest) => {
  console.log('PWA', req.getUrl())
  serveStatic(res, req.getUrl().slice(1), acceptsBrotli(req))
}
export default PWAHandler
