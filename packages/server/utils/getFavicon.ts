import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import isFresh from './isFresh'
import {HttpResponse, HttpRequest} from 'uWebSockets.js'
import ms from 'ms'

const PROJECT_ROOT = path.join(__dirname, '..', '..', '..')

let buffer
let hash
const readFavicon = () => {
  if (!buffer) {
    buffer = fs.readFileSync(path.join(PROJECT_ROOT, 'static', 'favicon.ico'))
    hash = crypto
      .createHash('md5')
      .update(buffer)
      .digest('base64')
  }
  return {buffer, hash}
}

const getFavicon = (res: HttpResponse, req: HttpRequest) => {
  if (isFresh(res, req)) {
    res.writeStatus('304 Not Modified').end()
    return
  }
  const {buffer, hash} = readFavicon()
  res
    .writeHeader('content-length', String(buffer.byteLength))
    .writeHeader('content-type', 'image/x-icon')
    .writeHeader('cache-control', `public, max-age=${ms('1y') / 1000}`)
    .writeHeader('etag', hash)
    .end(buffer)
}
export default getFavicon
