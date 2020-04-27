import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import acceptsBrotli from './acceptsBrotli'
import safetyPatchRes from './safetyPatchRes'
import serveStatic from './utils/serveStatic'

const ROUTE = '/static/'
const staticFileHandler = async (res: HttpResponse, req: HttpRequest) => {
  const fileName = req.getUrl().slice(ROUTE.length)
  const servedStatic = serveStatic(res, fileName, acceptsBrotli(req))
  if (servedStatic) return
  safetyPatchRes(res)
  if (process.env.NODE_ENV !== 'production') {
    const serveFromWebpack = require('./serveFromWebpack').default
    const servedWebpack = await serveFromWebpack(res, req)
    if (servedWebpack) return
  }
  if (res.done) return
  res.writeStatus('404').end()
  return
}

export default staticFileHandler
