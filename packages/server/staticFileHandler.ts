import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import serveFromWebpack from './serveFromWebpack'
import serveStatic from './utils/serveStatic'
import acceptsBrotli from './acceptsBrotli'

const staticFileHandler = async (res: HttpResponse, req: HttpRequest) => {
  const fileName = req.getParameter(0)
  const servedStatic = serveStatic(res, fileName, acceptsBrotli(req))
  if (servedStatic) return
  const servedWebpack = await serveFromWebpack(res, req)
  if (servedWebpack) return
  res.writeStatus('404').end()
  return
}

export default staticFileHandler
