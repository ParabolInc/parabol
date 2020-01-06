import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import serveFromWebpack from './serveFromWebpack'
import serveStatic from './utils/serveStatic'
import acceptsBrotli from './acceptsBrotli'
import safetyPatchRes from './safetyPatchRes'

const ROUTE = '/static/'
const staticFileHandler = async (res: HttpResponse, req: HttpRequest) => {
  const fileName = req.getUrl().slice(ROUTE.length)
  const servedStatic = serveStatic(res, fileName, acceptsBrotli(req))
  if (servedStatic) return
  safetyPatchRes(res)
  const servedWebpack = await serveFromWebpack(res, req)
  if (res.done || servedWebpack) return
  res.writeStatus('404').end()
  return
}

export default staticFileHandler
