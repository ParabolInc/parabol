import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import {brotliCompressSync} from 'zlib'
import acceptsBrotli from './acceptsBrotli'
import {applyEnvVarsToClientAssets} from './utils/applyEnvVarsToClientAssets'

let html: {body: string; brBody: Buffer} | undefined
// made on the first request, so a server starts without compressing the page
const getHTML = () => {
  if (!html) {
    // In dev mode we don't use this, we proxy to the in-memory Dev Server
    const body = __PRODUCTION__ ? applyEnvVarsToClientAssets()['index.html'] : ''
    html = {body, brBody: brotliCompressSync(body)}
  }
  return html
}

const createSSR = (res: HttpResponse, req: HttpRequest) => {
  if (req.getMethod() !== 'get') {
    res.end()
    return
  }
  const url = req.getUrl()

  const demoMatch = url.match(/^\/(retrospective-demo|team-health-demo)\/./)

  if (demoMatch) {
    res.writeHeader('Link', `<https://${process.env.HOST}/${demoMatch[1]}>; rel="canonical"`)
  }
  res.writeHeader('content-type', 'text/html; charset=utf-8')
  // a shared cache must not send brotli to a client that didn't ask for it
  res.writeHeader('vary', 'Accept-Encoding')
  // no need for eTag since file is < 1 MTU
  const {body, brBody} = getHTML()
  if (acceptsBrotli(req)) {
    res.writeHeader('content-encoding', 'br').end(brBody)
  } else {
    res.end(body)
  }
}

export default createSSR
