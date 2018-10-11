import makeSegmentSnippet from '@segment/snippet'
import dehydrate from 'server/utils/dehydrate'
import getWebpackPublicPath from 'server/utils/getWebpackPublicPath'
import fs from 'fs'
import path from 'path'

const webpackPublicPath = getWebpackPublicPath()

const clientIds = {
  auth0: process.env.AUTH0_CLIENT_ID,
  auth0Domain: process.env.AUTH0_DOMAIN,
  cdn: webpackPublicPath,
  github: process.env.GITHUB_CLIENT_ID,
  sentry: process.env.SENTRY_DSN_PUBLIC,
  slack: process.env.SLACK_CLIENT_ID,
  stripe: process.env.STRIPE_PUBLISHABLE_KEY
}

const segKey = process.env.SEGMENT_WRITE_KEY
const segmentSnippet =
  segKey &&
  makeSegmentSnippet.min({
    host: 'cdn.segment.com',
    apiKey: segKey
  })
const prod = process.env.NODE_ENV
const fontAwesomeUrl = prod
  ? 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css'
  : '/static/css/font-awesome.css'

const htmlFile = prod ? '../../build/index.html' : './template.html'
const html = fs.readFileSync(path.join(__dirname, htmlFile), 'utf8')
const extraHead = `
 <link rel="stylesheet" type="text/css" href=${fontAwesomeUrl} />
 <script>${dehydrate('__ACTION__', clientIds)}</script>
 `
const devBody = prod ? '' : '<script src="/static/app.js"></script>'
// : '<script src="/static/vendors.dll.js"></script><script src="/static/app.js"></script>'
const extraBody = `<script>${segmentSnippet}</script>${devBody}`

const finalHTML = html
  .replace('</head>', `${extraHead}</head>`)
  .replace('</body>', `${extraBody}</body>`)

export default function createSSR (req, res) {
  res.send(finalHTML)
}
