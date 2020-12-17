import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import PROD from './PROD'
import uwsGetHeaders from './utils/uwsGetHeaders'

// let middleware
const startHotServer = async (compiler) => {
  return new Promise<void>((resolve) => {
    const hotClient = require('webpack-hot-client')
    const client = hotClient(compiler, {port: 8082, logLevel: 'error', autoConfigure: false})
    const {server} = client
    server.on('listening', () => {
      resolve()
    })
  })
}

export const getWebpackDevMiddleware = async () => {
  if (!global.hmrMiddleware) {
    global.hmrMiddleware = new Promise(async (resolve) => {
      const config = require('../../scripts/webpack/dev.client.config')
      const webpack = require('webpack')
      const compiler = webpack(config)
      const mw = require('webpack-dev-middleware')
      const mwPromise = mw(compiler, {})
      await startHotServer(compiler)
      resolve(mwPromise)
    })
  }
  return global.hmrMiddleware
}

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

const serveFromWebpack = async (res: HttpResponse, req: HttpRequest) => {
  if (PROD) return false
  const {req: mwReq, res: mwRes, next} = makeExpressHandlers(res, req)
  const mw = await getWebpackDevMiddleware()
  await mw(mwReq, mwRes, next)
  return mwRes.statusCode !== 200
}

export default serveFromWebpack
