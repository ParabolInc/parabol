import fs from 'fs'
import {minify} from 'html-minifier-terser'
import path from 'path'
import logo192 from '../../static/images/brand/mark-cropped-192.png'
import logo512 from '../../static/images/brand/mark-cropped-512.png'
import getProjectRoot from '../webpack/utils/getProjectRoot'

const PROJECT_ROOT = getProjectRoot()
const clientDir = path.join(PROJECT_ROOT, 'build')
const serverDir = path.join(PROJECT_ROOT, 'dist')

const getCDNURL = () => {
  const {CDN_BASE_URL} = process.env
  return CDN_BASE_URL ? `${CDN_BASE_URL}/build` : '/static'
}

const rewriteServiceWorker = () => {
  const skeleton = fs.readFileSync(path.join(clientDir, 'swSkeleton.js'), 'utf-8')
  const deploySpecificServiceWorker = skeleton.replaceAll('__PUBLIC_PATH__', getCDNURL())
  fs.writeFileSync(path.join(clientDir, 'sw.js'), deploySpecificServiceWorker)
}

const writeManifest = () => {
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
  const manifestPath = path.join(clientDir, 'manifest.json')
  fs.writeFileSync(manifestPath, JSON.stringify(manifest))
  // move the referenced icons into the client build
  fs.copyFileSync(path.join(serverDir, logo192), path.join(clientDir, logo192))
  fs.copyFileSync(path.join(serverDir, logo512), path.join(clientDir, logo512))
}

const rewriteIndexHTML = () => {
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
    publicPath: getCDNURL() + '/',
    oauth2Redirect: process.env.OAUTH2_REDIRECT,
    prblIn: process.env.INVITATION_SHORTLINK,
    AUTH_INTERNAL_ENABLED: process.env.AUTH_INTERNAL_DISABLED !== 'true',
    AUTH_GOOGLE_ENABLED: process.env.AUTH_GOOGLE_DISABLED !== 'true',
    AUTH_SSO_ENABLED: process.env.AUTH_SSO_DISABLED !== 'true',
    AMPLITUDE_WRITE_KEY: process.env.AMPLITUDE_WRITE_KEY
  }

  const skeleton = fs.readFileSync(path.join(clientDir, 'skeleton.html'), 'utf8')
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
  fs.writeFileSync(path.join(clientDir, 'index.html'), minifiedHTML)
}

export const applyEnvVarsToClientAssets = () => {
  // When web.js starts, serveStatic generates a whitelist of all valid built assets
  // so users cannot trigger a disk read by requesting an asset that may not exist (0days often involve disk reads)
  // That means this script must run synchronusly and complete before web.js starts
  rewriteServiceWorker()
  rewriteIndexHTML()
  writeManifest()
}

if (require.main === module) applyEnvVarsToClientAssets()
