import fs from 'fs'
import path from 'path'
import {HttpResponse} from 'uWebSockets.js'
import dehydrate from './utils/dehydrate'
import getWebpackPublicPath from './utils/getWebpackPublicPath'

const prod = process.env.NODE_ENV === 'production'
let finalHTML

export const getClientKeys = () => {
  const webpackPublicPath = getWebpackPublicPath()

  return {
    atlassian: process.env.ATLASSIAN_CLIENT_ID,
    cdn: webpackPublicPath,
    github: process.env.GITHUB_CLIENT_ID,
    googleTagManagerId: process.env.GOOGLE_TAG_MANAGER_CONTAINER_ID,
    google: process.env.GOOGLE_OAUTH_CLIENT_ID,
    segment: process.env.SEGMENT_WRITE_KEY,
    sentry: process.env.SENTRY_DSN,
    slack: process.env.SLACK_CLIENT_ID,
    stripe: process.env.STRIPE_PUBLISHABLE_KEY
  }
}
const getHTML = () => {
  if (!finalHTML) {
    const clientIds = getClientKeys()
    const htmlFile = prod ? '../../build/index.html' : './template.html'
    const html = fs.readFileSync(path.join(__dirname, htmlFile), 'utf8')
    const extraHead = `<script>${dehydrate('__ACTION__', clientIds)}</script>`
    const devBody = prod
      ? ''
      : '<script src="/static/vendors.dll.js"></script><script src="/static/app.js"></script>'

    finalHTML = html.replace('<head>', `<head>${extraHead}`).replace('</body>', `${devBody}</body>`)
  }
  return finalHTML
}

const createSSR = (res: HttpResponse) => {
  res.end(getHTML())
}

export default createSSR
