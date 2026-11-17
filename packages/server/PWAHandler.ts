import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import {sendStatus} from './utils/StaticServer'
import serveStatic from './utils/serveStatic'

const PWAHandler = (res: HttpResponse, req: HttpRequest) => {
  if (!serveStatic(res, req, req.getUrl().slice(1))) {
    sendStatus(res, '404 Not Found')
  }
}
export default PWAHandler
