import fs from 'fs'
import path from 'path'
import {HttpResponse} from 'uWebSockets.js'
import pipeStreamOverResponse from '../pipeStreamOverResponse'
import StaticServer from './StaticServer'

// __dirname should be /dev, but during HMR it becomes its true path
// so, anytime HMR reloads this file, we want to double check we're in the right place
const getProjectRoot = () => {
  let cd = __dirname
  while (cd !== '/') {
    if (fs.existsSync(path.join(cd, 'pnpm-lock.yaml'))) return cd
    cd = path.join(cd, '..')
  }
  return cd
}

const PROJECT_ROOT = getProjectRoot()
const staticPaths = {
  [path.join(PROJECT_ROOT, 'build')]: true,
  // publish server assets at /static
  [path.join(PROJECT_ROOT, 'dist')]: __PRODUCTION__,
  [path.join(PROJECT_ROOT, 'dev')]: !__PRODUCTION__
}
const staticServer = new StaticServer({staticPaths})

const serveStatic = (res: HttpResponse, fileName: string, sendCompressed?: boolean) => {
  const meta = staticServer.getMeta(fileName)
  if (!meta) return false
  const {size, pathname, brotliFile, file, type} = meta
  if (file) {
    res.writeHeader('content-type', type)
    if (__PRODUCTION__ && sendCompressed && brotliFile) {
      res.writeHeader('content-encoding', 'br').end(brotliFile)
    } else {
      res.end(file)
    }
    return true
  }
  res.writeHeader('content-type', type)
  const readStream = fs.createReadStream(pathname)
  pipeStreamOverResponse(res, readStream, size)
  return true
}

export default serveStatic
