import {HttpResponse, HttpRequest} from 'uWebSockets.js'
import serveStatic from './utils/serveStatic'
import acceptsBrotli from './acceptsBrotli'
import PROD from './PROD';

const PWAHandler = (res: HttpResponse, req: HttpRequest) => {
  if(!PROD) return res.end()
  return serveStatic(res, req.getUrl().slice(1), acceptsBrotli(req))
}
export default PWAHandler
