import fs from 'fs'
import path from 'path'
import {HttpResponse} from 'uWebSockets.js'
import pipeStreamOverResponse from '../pipeStreamOverResponse'
import PROD from '../PROD'
import StaticServer from './StaticServer'

// __dirname should be /dev, but during HMR it becomes its true path
// so, anytime HMR reloads this file, we want to double check we're in the right place
const getProjectRoot = () => {
  let cd = __dirname
  while (cd !== '/') {
    if (fs.existsSync(path.join(cd, 'yarn.lock'))) return cd
    cd = path.join(cd, '..')
  }
  return cd
}

const PROJECT_ROOT = getProjectRoot()
const staticPaths = {
  [path.join(PROJECT_ROOT, 'build')]: true,
  [path.join(PROJECT_ROOT, 'dist')]: true,
  [path.join(PROJECT_ROOT, 'static')]: true,
  [path.join(PROJECT_ROOT, 'dev', 'dll')]: !PROD
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
