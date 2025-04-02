import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import acceptsBrotli from './acceptsBrotli'
import serveStatic from './utils/serveStatic'

const PWAHandler = (res: HttpResponse, req: HttpRequest) => {
  if (!serveStatic(res, req.getUrl().slice(1), acceptsBrotli(req))) {
    res.writeStatus('404').end()
  }
}
export default PWAHandler
