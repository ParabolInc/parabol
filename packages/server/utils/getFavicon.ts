import {HttpResponse} from 'uWebSockets.js'
import serveStatic from './serveStatic'

const getFavicon = (res: HttpResponse) => {
  serveStatic(res, 'favicon.ico')
}
export default getFavicon
