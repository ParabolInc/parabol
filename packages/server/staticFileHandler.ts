import {HttpResponse, HttpRequest} from 'uWebSockets.js'
import serveStatic from './utils/serveStatic'
import serveFromWebpack from './serveFromWebpack'

const staticFileHandler = async (res: HttpResponse, req: HttpRequest) => {
  res.onAborted(() => {
    console.log('static abort')
  })
  const fileName = req.getParameter(0)
  const servedStatic = serveStatic(res, fileName)
  if (servedStatic) return
  const servedWebpack = await serveFromWebpack(res, req)
  if (servedWebpack) return
  res.writeStatus('404 Not found').end()
  return
}

export default staticFileHandler
