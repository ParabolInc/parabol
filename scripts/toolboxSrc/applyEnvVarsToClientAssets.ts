import fs from 'fs'
import {minify} from 'html-minifier-terser'
import path from 'path'
import {makeOAuth2Redirect} from '../../packages/server/utils/makeOAuth2Redirect'
import logo192 from '../../static/images/brand/mark-cropped-192.png'
import logo512 from '../../static/images/brand/mark-cropped-512.png'
import getProjectRoot from '../webpack/utils/getProjectRoot'

declare const __webpack_public_path__: string

const PROJECT_ROOT = getProjectRoot()
const clientDir = path.join(PROJECT_ROOT, 'build')

const rewriteServiceWorker = () => {
  const skeleton = fs.readFileSync(path.join(clientDir, 'swSkeleton.js'), 'utf-8')
  const deploySpecificServiceWorker = skeleton.replaceAll(
    '__PUBLIC_PATH__',
    __webpack_public_path__
  )
  fs.writeFileSync(path.join(clientDir, 'sw.js'), deploySpecificServiceWorker)
}

const writeManifest = () => {
  // If src is relative, then it will be relative to the manifest location, so manifest.json must be at root /
  const manifest = {
    short_name: 'Parabol',
    name: 'Parabol',
    icons: [
      {
        src: logo192,
        type: 'image/png',
        sizes: '192x192'
      },
      {
        src: logo512,
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
    mattermostDisabled: process.env.MATTERMOST_DISABLED === 'true',
    mattermostGlobal: !!process.env.MATTERMOST_SECRET,
    msTeamsDisabled: process.env.MSTEAMS_DISABLED === 'true',
    sentry: process.env.SENTRY_DSN,
    slack: process.env.SLACK_CLIENT_ID,
    stripe: process.env.STRIPE_PUBLISHABLE_KEY,
    publicPath: __webpack_public_path__,
    oauth2Redirect: makeOAuth2Redirect(),
    hasOpenAI: !!process.env.OPEN_AI_API_KEY,
    prblIn: process.env.INVITATION_SHORTLINK,
    AUTH_INTERNAL_ENABLED: process.env.AUTH_INTERNAL_DISABLED !== 'true',
    AUTH_GOOGLE_ENABLED: process.env.AUTH_GOOGLE_DISABLED !== 'true',
    AUTH_MICROSOFT_ENABLED: process.env.AUTH_MICROSOFT_DISABLED !== 'true',
    AUTH_SSO_ENABLED: process.env.AUTH_SSO_DISABLED !== 'true',
    AMPLITUDE_WRITE_KEY: process.env.AMPLITUDE_WRITE_KEY,
    microsoftTenantId: process.env.MICROSOFT_TENANT_ID,
    microsoft: process.env.MICROSOFT_CLIENT_ID,
    GLOBAL_BANNER_ENABLED: process.env.GLOBAL_BANNER_ENABLED === 'true',
    GLOBAL_BANNER_TEXT: process.env.GLOBAL_BANNER_TEXT,
    GLOBAL_BANNER_BG_COLOR: process.env.GLOBAL_BANNER_BG_COLOR,
    GLOBAL_BANNER_COLOR: process.env.GLOBAL_BANNER_COLOR,
    GIF_PROVIDER:
      process.env.GIF_PROVIDER !== 'tenor'
        ? process.env.GIF_PROVIDER
        : process.env.TENOR_SECRET
          ? 'tenor'
          : ''
  }

  const skeleton = fs.readFileSync(path.join(clientDir, 'skeleton.html'), 'utf8')
  // Hide staging & PPMIs from search engines
  const noindex =
    process.env.HOST === 'action.parabol.co' ? '' : `<meta name="robots" content="noindex"/>`
  const keys = `<script>window.__ACTION__=${JSON.stringify(clientKeys)}</script>`
  const rawHTML = skeleton
    .replace('<head>', `<head>${noindex}${keys}`)
    .replaceAll('__PUBLIC_PATH__', __webpack_public_path__.replace(/\/$/, ''))
  const minifiedHTML = minify(rawHTML, {
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    minifyJS: true,
    removeScriptTypeAttributes: true,
    removeComments: true
  })
  fs.writeFileSync(path.join(clientDir, 'index.html'), minifiedHTML)
}

const rewriteMattermostEnv = () => {
  const config = {
      '__PROTO__': JSON.stringify(process.env.PROTO),
      '__HOST__': JSON.stringify(process.env.HOST),
      '__PORT__': JSON.stringify(process.env.PORT),
  }

  const skeleton = fs.readFileSync(path.join(clientDir, 'mattermost-plugin_envSkeleton.js'), 'utf8')

  const replaced = Object.entries(config).reduce((acc, [key, value]) => {
    return acc.replace(key, value)
  }, skeleton)
  fs.writeFileSync(path.join(clientDir, 'mattermost-plugin_env.js'), replaced)
}

export const applyEnvVarsToClientAssets = () => {
  // When web.js starts, serveStatic generates a whitelist of all valid built assets
  // so users cannot trigger a disk read by requesting an asset that may not exist (0days often involve disk reads)
  // That means this script must run synchronusly and complete before web.js starts
  rewriteServiceWorker()
  rewriteIndexHTML()
  rewriteMattermostEnv()
  writeManifest()
}

if (require.main === module) applyEnvVarsToClientAssets()
