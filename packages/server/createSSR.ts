import fs from 'fs'
import path from 'path'
import {HttpResponse, HttpRequest} from 'uWebSockets.js'
import dehydrate from './utils/dehydrate'
import getWebpackPublicPath from './utils/getWebpackPublicPath'
import {brotliCompressSync} from 'zlib'
import PROD from './PROD'
import {minify} from 'html-minifier-terser'
import acceptsBrotli from './acceptsBrotli'

let rawHTML

export const getClientKeys = () => {
  const webpackPublicPath = getWebpackPublicPath()

  return {
    atlassian: process.env.ATLASSIAN_CLIENT_ID,
    cdn: webpackPublicPath,
    github: process.env.GITHUB_CLIENT_ID,
    google: process.env.GOOGLE_OAUTH_CLIENT_ID,
    segment: process.env.SEGMENT_WRITE_KEY,
    sentry: process.env.SENTRY_DSN,
    slack: process.env.SLACK_CLIENT_ID,
    stripe: process.env.STRIPE_PUBLISHABLE_KEY
  }
}
const getRaw = () => {
  if (!rawHTML) {
    const clientIds = getClientKeys()
    const htmlFile = PROD ? '../../build/index.html' : './template.html'
    const html = fs.readFileSync(path.join(__dirname, htmlFile), 'utf8')
    const extraHead = `<script>${dehydrate('__ACTION__', clientIds)}</script>`
    const devBody = PROD
      ? ''
      : '<script src="/static/vendors.dll.js"></script><script src="/static/app.js"></script>'

    rawHTML = html.replace('<head>', `<head>${extraHead}`).replace('</body>', `${devBody}</body>`)
  }
  return minify(rawHTML, {
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    minifyJS: true,
    removeScriptTypeAttributes: true,
    removeComments: true
  })
}

let brotliHTML: Buffer
const getBrotli = () => {
  if (!brotliHTML) {
    brotliHTML = brotliCompressSync(getRaw())
  }
  return brotliHTML
}

const createSSR = (res: HttpResponse, req: HttpRequest) => {
  if (req.getMethod() !== 'get') {
    res.end()
    return
  }
  res.writeHeader('cotent-type', 'text/html; charset=utf-8')
  // no need for eTag since file is < 1 MTU
  if (acceptsBrotli(req)) {
    res.writeHeader('content-encoding', 'br').end(getBrotli())
  } else {
    res.end(getRaw())
  }
}

export default createSSR
