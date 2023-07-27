import fs from 'fs'
import {minify} from 'html-minifier-terser'
import path from 'path'
import logo192 from '../../static/images/brand/mark-cropped-192.png'
import logo512 from '../../static/images/brand/mark-cropped-512.png'

const localClientAssetsDir = path.join(__PROJECT_ROOT__, 'build')
const serverAssetsDir = path.join(__PROJECT_ROOT__, 'dist')

const getCDNURL = () => {
  const {CDN_BASE_URL} = process.env
  return CDN_BASE_URL ? `${CDN_BASE_URL}/build` : '/static'
}

const rewriteServiceWorker = async () => {
  const swPath = path.join(localClientAssetsDir, 'sw.js')
  const serviceWorkerStr = await fs.promises.readFile(swPath, 'utf-8')
  const deploySpecificServiceWorker = serviceWorkerStr.replaceAll('__PUBLIC_PATH__', getCDNURL())
  await fs.promises.writeFile(swPath, deploySpecificServiceWorker)
}

const writeManifest = async () => {
  // If src is relative, then it will be relative to the manifest location, so manifest.json must be at root /
  const cdn = getCDNURL()
  const manifest = {
    short_name: 'Parabol',
    name: 'Parabol',
    icons: [
      {
        src: `${cdn}/${logo192}`,
        type: 'image/png',
        sizes: '192x192'
      },
      {
        src: `${cdn}/${logo512}`,
        type: 'image/png',
        sizes: '512x512'
      }
    ],
    start_url: '/',
    background_color: '#F1F0FA',
    display: 'standalone',
    scope: '/',
    theme_color: '#493272'
  }
  const manifestPath = path.join(localClientAssetsDir, 'manifest.json')

  await Promise.all([
    fs.promises.writeFile(manifestPath, JSON.stringify(manifest)),
    // move the references icons into the client build
    [logo192, logo512].map((name) => {
      return fs.promises.copyFile(
        path.join(serverAssetsDir, name),
        path.join(localClientAssetsDir, name)
      )
    })
  ])
}

const rewriteIndexHTML = async () => {
  const clientKeys = {
    atlassian: process.env.ATLASSIAN_CLIENT_ID,
    datadogClientToken: process.env.DD_CLIENTTOKEN,
    datadogApplicationId: process.env.DD_APPLICATIONID,
    datadogService: process.env.DD_SERVICE,
    github: process.env.GITHUB_CLIENT_ID,
    google: process.env.GOOGLE_OAUTH_CLIENT_ID,
    googleAnalytics: process.env.GA_TRACKING_ID,
    segment: process.env.SEGMENT_WRITE_KEY,
    sentry: process.env.SENTRY_DSN,
    slack: process.env.SLACK_CLIENT_ID,
    stripe: process.env.STRIPE_PUBLISHABLE_KEY,
    publicPath: process.env.CDN_BASE_URL || '/static',
    oauth2Redirect: process.env.OAUTH2_REDIRECT,
    prblIn: process.env.INVITATION_SHORTLINK,
    AUTH_INTERNAL_ENABLED: process.env.AUTH_INTERNAL_DISABLED !== 'true',
    AUTH_GOOGLE_ENABLED: process.env.AUTH_GOOGLE_DISABLED !== 'true',
    AUTH_SSO_ENABLED: process.env.AUTH_SSO_DISABLED !== 'true'
  }

  const skeleton = await fs.promises.readFile(
    path.join(localClientAssetsDir, 'skeleton.html'),
    'utf8'
  )

  // Hide staging & PPMIs from search engines
  const noindex =
    process.env.HOST === 'action.parabol.co' ? '' : `<meta name="robots" content="noindex"/>`
  const keys = `<script>window.__ACTION__=${JSON.stringify(clientKeys)}</script>`
  const rawHTML = skeleton
    .replace('<head>', `<head>${noindex}${keys}`)
    .replaceAll('__PUBLIC_PATH__', getCDNURL())
  const minifiedHTML = minify(rawHTML, {
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    minifyJS: true,
    removeScriptTypeAttributes: true,
    removeComments: true
  })
  await fs.promises.writeFile(path.join(localClientAssetsDir, 'index.html'), minifiedHTML)
}

export const applyEnvVarsToClientAssets = async () => {
  return Promise.all([rewriteServiceWorker(), rewriteIndexHTML(), writeManifest()])
}
