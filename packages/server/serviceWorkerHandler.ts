import {HttpResponse} from 'uWebSockets.js'
import serveStatic from './utils/serveStatic'

const serviceWorkerHandler = (res: HttpResponse) => {
  res.writeHeader('service-worker-allowed', '/')
  serveStatic(res, 'sw.ts')
}
export default serviceWorkerHandler
