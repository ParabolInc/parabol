import makeSegmentSnippet from '@segment/snippet'
import dehydrate from './utils/dehydrate'
import getWebpackPublicPath from './utils/getWebpackPublicPath'
import fs from 'fs'
import path from 'path'
import {RequestHandler} from 'express'

let finalHTML

export const getClientKeys = () => {
  const webpackPublicPath = getWebpackPublicPath()

  return {
    atlassian: process.env.ATLASSIAN_CLIENT_ID,
    auth0: process.env.AUTH0_CLIENT_ID,
    auth0Domain: process.env.AUTH0_DOMAIN,
    cdn: webpackPublicPath,
    github: process.env.GITHUB_CLIENT_ID,
    sentry: process.env.SENTRY_DSN,
    slack: process.env.SLACK_CLIENT_ID,
    stripe: process.env.STRIPE_PUBLISHABLE_KEY
  }
}
const getHTML = () => {
  if (!finalHTML) {
    const clientIds = getClientKeys()
    const segKey = process.env.SEGMENT_WRITE_KEY
    const segmentSnippet =
      segKey &&
      makeSegmentSnippet.min({
        host: 'cdn.segment.com',
        apiKey: segKey
      })
    const prod = process.env.NODE_ENV

    const htmlFile = prod ? '../../build/index.html' : './template.html'
    const html = fs.readFileSync(path.join(__dirname, htmlFile), 'utf8')
    const extraHead = `
 <link rel="stylesheet" type="text/css" href='/static/css/font-awesome.css' />
 <script>${dehydrate('__ACTION__', clientIds)}</script>
 `
    const devBody = prod
      ? ''
      : '<script src="/static/vendors.dll.js"></script><script src="/static/app.js"></script>'
    // : '<script src="/static/app.js"></script>'
    const extraBody = `<script>${segmentSnippet}</script>${devBody}`

    finalHTML = html
      .replace('</head>', `${extraHead}</head>`)
      .replace('</body>', `${extraBody}</body>`)
  }
  return finalHTML
}

const createSSR: RequestHandler = (_req, res) => {
  res.send(getHTML())
}

export default createSSR
