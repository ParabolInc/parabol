import {HttpResponse, HttpRequest} from 'uWebSockets.js'
import serveStatic from './utils/serveStatic'
import acceptsBrotli from './acceptsBrotli'

const PWAHandler = (res: HttpResponse, req: HttpRequest) => {
  serveStatic(res, req.getUrl().slice(1), acceptsBrotli(req))
}
export default PWAHandler
