import fs from 'fs'
import path from 'path'
import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import {brotliCompressSync} from 'zlib'
import acceptsBrotli from './acceptsBrotli'

// In dev mode we don't use this, we proxy to the in-memory Dev Server
const minifiedHTML = __PRODUCTION__
  ? fs.readFileSync(path.join(__dirname, '../build', 'index.html'), 'utf8')
  : ''
const brotliHTML = brotliCompressSync(minifiedHTML)

const createSSR = (res: HttpResponse, req: HttpRequest) => {
  if (req.getMethod() !== 'get') {
    res.end()
    return
  }
  const url = req.getUrl()

  const demoMatch = url.match(/\/retrospective-demo\/(reflect|vote|group)/)

  if (demoMatch) {
    res.writeHeader('Link', `<https://${process.env.HOST}/retrospective-demo>; rel="canonical"`)
  }
  res.writeHeader('content-type', 'text/html; charset=utf-8')
  // no need for eTag since file is < 1 MTU
  if (acceptsBrotli(req)) {
    res.writeHeader('content-encoding', 'br').end(brotliHTML)
  } else {
    res.end(minifiedHTML)
  }
}

export default createSSR
