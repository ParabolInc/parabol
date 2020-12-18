import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import PROD from './PROD'
import uwsGetHeaders from './utils/uwsGetHeaders'


const makeExpressHandlers = (res: HttpResponse, req: HttpRequest) => {
  res.setHeader = (key: string, value: unknown) => {
    // setting content length triggers a bug in cypress-initiated browsers where the browser will get ERR_NO_RESPONSE
    if (key === 'Content-Length') return
    res.writeHeader(key.toLowerCase(), String(value))
  }
  res.get = () => undefined

  return {
    req: {
      url: req.getUrl(),
      method: req.getMethod().toUpperCase(),
      headers: uwsGetHeaders(req)
    },
    res,
    next: () => { /* noop */}
  }
}

export const buildClient = async () => {
  if (!global.hmrMiddleware) {
    console.log("building initial client")
    const start = Date.now()
    const config = require('../../scripts/webpack/dev.client.config')
    const webpack = require('webpack')
    const compiler = webpack(config)
    const devMW = require('webpack-dev-middleware')(compiler, {}) as any
    global.hmrMiddleware = new Promise((resolve) => {
      devMW.waitUntilValid(() => {
        console.log('client build complete', (Date.now() - start) / 1000)
        const hotMW = require('./sse/whm')(compiler)
        resolve({devMW, hotMW})
      })
    })
  }
  return global.hmrMiddleware
}

const serveFromWebpack = async (res: HttpResponse, req: HttpRequest) => {
  if (PROD) return false
  return new Promise(async (resolve) => {
    const {req: mwReq, res: mwRes, next: noop} = makeExpressHandlers(res, req)
    const {devMW, hotMW} = await buildClient()
    devMW(mwReq, mwRes, noop)
    hotMW(mwReq, mwRes, noop)
    resolve(mwRes.statusCode !== 200)
  })
}

export default serveFromWebpack
