import fs from 'fs'
import path from 'path'
import {HttpResponse} from 'uWebSockets.js'
import pipeStreamOverResponse from '../pipeStreamOverResponse'
import PROD from '../PROD'
import StaticServer from './StaticServer'

const PROJECT_ROOT = path.join(__dirname, '..', '..', '..', '..')
const staticPaths = {
  [path.join(PROJECT_ROOT, 'build')]: true,
  [path.join(PROJECT_ROOT, 'static')]: true,
  [path.join(PROJECT_ROOT, 'scripts', 'webpack', 'dll')]: !PROD
}
const filesToCache = ['sw.js', 'favicon.ico', 'manifest.json']
const staticServer = new StaticServer({staticPaths, filesToCache})

const serveStatic = (res: HttpResponse, fileName: string, sendCompressed?: boolean) => {
  const meta = staticServer.getMeta(fileName)
  if (!meta) return false
  const {size, pathname, brotliFile, file, type} = meta
  if (file) {
    res.cork(() => {
      res.writeHeader('content-type', type)
      if (PROD && sendCompressed && brotliFile) {
        res.writeHeader('content-encoding', 'br').end(brotliFile)
      } else {
        res.end(file)
      }
    })
    return true
  }
  res.writeHeader('content-type', type)
  const readStream = fs.createReadStream(pathname)
  pipeStreamOverResponse(res, readStream, size)
  return true
}

export default serveStatic
