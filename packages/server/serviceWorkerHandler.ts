import {HttpResponse} from 'uWebSockets.js'
import serveStatic from './utils/serveStatic'

const serviceWorkerHandler = (res: HttpResponse) => {
  res.onAborted(() => {
    console.log('sw abort')
  })
  res.writeHeader('service-worker-allowed', '/')
  serveStatic(res, 'sw.ts')
}
export default serviceWorkerHandler
