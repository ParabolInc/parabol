import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import PROD from './PROD'
import uwsGetHeaders from './utils/uwsGetHeaders'

// let middleware
const startHotServer = async (compiler) => {
  return new Promise((resolve) => {
    const hotClient = require('webpack-hot-client')
    const client = hotClient(compiler, {port: 8082, logLevel: 'error'})
    const {server} = client
    server.on('listening', () => {
      resolve()
    })
  })
}

const buildMiddleware = (compiler, config) => {
  const mw = require('webpack-dev-middleware')
  return mw(compiler, {
    // writeToDisk: true,
    logLevel: 'warn',
    noInfo: true,
    quiet: true,
    publicPath: config.output.publicPath,
    // writeToDisk: true, // required for developing serviceWorkers
    stats: {
      assets: false,
      builtAt: false,
      cached: false,
      cachedAssets: false,
      chunks: false,
      chunkGroups: false,
      chunkModules: false,
      chunkOrigins: false,
      colors: true,
      entrypoints: false,
      hash: false,
      modules: false,
      version: false
    },
    watchOptions: {
      aggregateTimeout: 300
    }
  })
}

export const getWebpackDevMiddleware = async () => {
  if (!global.middleware) {
    global.middleware = new Promise(async (resolve) => {
      const config = require('../../../scripts/webpack/dev.client.config')
      const webpack = require('webpack')
      const compiler = webpack(config)
      // todo begin building before awaiting hot server
      await startHotServer(compiler)
      resolve(buildMiddleware(compiler, config))
    })
  }
  return global.middleware
}

const makeExpressHandlers = (res: HttpResponse, req: HttpRequest) => {
  res.setHeader = (key: string, value: unknown) => {
    // setting content length triggers a bug in cypress-initiated browsers where the browser will get ERR_NO_RESPONSE
    if (key === 'Content-Length') return
    res.writeHeader(key.toLowerCase(), String(value))
  }
  return {
    req: {
      url: req.getUrl(),
      method: req.getMethod().toUpperCase(),
      headers: uwsGetHeaders(req)
    },
    res,
    next: () => {}
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
