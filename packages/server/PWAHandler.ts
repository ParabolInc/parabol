import {HttpResponse, HttpRequest} from 'uWebSockets.js'
import serveStatic from './utils/serveStatic'
import acceptsBrotli from './acceptsBrotli'
import safetyPatchRes from './safetyPatchRes';

const PWAHandler = (res: HttpResponse, req: HttpRequest) => {
  safetyPatchRes(res)
  serveStatic(res, req.getUrl().slice(1), acceptsBrotli(req))
}
export default PWAHandler
