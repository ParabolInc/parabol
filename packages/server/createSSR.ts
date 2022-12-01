import fs from 'fs'
import {minify} from 'html-minifier-terser'
import path from 'path'
import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import {brotliCompressSync} from 'zlib'
import acceptsBrotli from './acceptsBrotli'
import PROD from './PROD'
import dehydrate from './utils/dehydrate'

const getClientKeys = () => {
  return {
    atlassian: process.env.ATLASSIAN_CLIENT_ID,
    datadogClientToken: process.env.DD_CLIENTTOKEN,
    datadogApplicationId: process.env.DD_APPLICATIONID,
    datadogService: process.env.DD_SERVICE,
    github: process.env.GITHUB_CLIENT_ID,
    google: process.env.GOOGLE_OAUTH_CLIENT_ID,
    segment: process.env.SEGMENT_WRITE_KEY,
    sentry: process.env.SENTRY_DSN,
    slack: process.env.SLACK_CLIENT_ID,
    stripe: process.env.STRIPE_PUBLISHABLE_KEY,
    oauth2Redirect: process.env.OAUTH2_REDIRECT,
    prblIn: process.env.INVITATION_SHORTLINK,
    AUTH_INTERNAL_ENABLED: process.env.AUTH_INTERNAL_DISABLED !== 'true',
    AUTH_GOOGLE_ENABLED: process.env.AUTH_GOOGLE_DISABLED !== 'true',
    AUTH_SSO_ENABLED: process.env.AUTH_SSO_DISABLED !== 'true'
  }
}

let minifiedHTML: string
let brotliHTML: Buffer
const getRaw = () => {
  if (!minifiedHTML) {
    const clientIds = getClientKeys()
    const PROJECT_ROOT = path.join(__dirname, '../')
    const htmlPath = PROD ? './build/index.html' : './template.html'
    const html = fs.readFileSync(path.join(PROJECT_ROOT, htmlPath), 'utf8')
    // Hide staging & PPMIs from search engines
    const noindex =
      process.env.HOST === 'action.parabol.co' ? '' : `<meta name="robots" content="noindex"/>`
    const extraHead = `${noindex}<script>${dehydrate('__ACTION__', clientIds)}</script>`
    const devBody = PROD
      ? ''
      : '<script src="/static/vendors.dll.js"></script><script src="/static/app.js"></script>'

    const rawHTML = html
      .replace('<head>', `<head>${extraHead}`)
      .replace('</body>', `${devBody}</body>`)
    minifiedHTML = minify(rawHTML, {
      collapseBooleanAttributes: true,
      collapseWhitespace: true,
      minifyJS: true,
      removeScriptTypeAttributes: true,
      removeComments: true
    })
  }
  return minifiedHTML
}

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
  res.writeHeader('content-type', 'text/html; charset=utf-8')
  // no need for eTag since file is < 1 MTU
  if (acceptsBrotli(req)) {
    res.writeHeader('content-encoding', 'br').end(getBrotli())
  } else {
    res.end(getRaw())
  }
}

export default createSSR
