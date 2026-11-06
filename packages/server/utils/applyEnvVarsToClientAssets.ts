import fs from 'fs'
import {minify} from 'html-minifier-terser'
import path from 'path'
import getProjectRoot from '../../../scripts/webpack/utils/getProjectRoot'
import logo192 from '../../../static/images/brand/mark-cropped-192.png'
import logo512 from '../../../static/images/brand/mark-cropped-512.png'
import socialCard from '../../../static/images/brand/social-card.jpg'
import appOrigin from '../appOrigin'
import {makeOAuth2Redirect} from './makeOAuth2Redirect'

const PROJECT_ROOT = getProjectRoot()
const clientDir = path.join(PROJECT_ROOT, 'build')

// the build's templates for the files below, which are never sent themselves
export const CLIENT_ASSET_SKELETONS = new Set([
  'swSkeleton.js',
  'skeleton.html',
  'mattermost-plugin_envSkeleton.js'
])

const rewriteServiceWorker = () => {
  const skeleton = fs.readFileSync(path.join(clientDir, 'swSkeleton.js'), 'utf-8')
  return skeleton.replaceAll('__PUBLIC_PATH__', __webpack_public_path__)
}

const makeManifest = () => {
  // If src is relative, then it will be relative to the manifest location, so manifest.json must be at root /
  const manifest = {
    short_name: 'Parabol',
    name: 'Parabol',
    description:
      'Open-source agile meetings and team health checks: retrospectives, Sprint Poker, standups, and anonymous engagement surveys.',
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
  return JSON.stringify(manifest)
}

const rewriteIndexHTML = () => {
  const clientKeys = {
    google: process.env.GOOGLE_OAUTH_CLIENT_ID,
    googleAnalytics: process.env.GA_TRACKING_ID,
    mattermostWebhookIntegrationDisabled:
      process.env.MATTERMOST_WEBHOOK_INTEGRATION_DISABLED === 'true',
    msTeamsWebhookIntegrationDisabled: process.env.MSTEAMS_WEBHOOK_INTEGRATION_DISABLED === 'true',
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
    microsoftTenantId: process.env.MICROSOFT_TENANT_ID,
    microsoft: process.env.MICROSOFT_CLIENT_ID,
    GLOBAL_BANNER_ENABLED: process.env.GLOBAL_BANNER_ENABLED === 'true',
    GLOBAL_BANNER_TEXT: process.env.GLOBAL_BANNER_TEXT,
    GLOBAL_BANNER_BG_COLOR: process.env.GLOBAL_BANNER_BG_COLOR,
    GLOBAL_BANNER_COLOR: process.env.GLOBAL_BANNER_COLOR,
    GIF_PROVIDER:
      process.env.GIF_PROVIDER !== 'klipy'
        ? process.env.GIF_PROVIDER
        : process.env.GIF_SECRET
          ? 'klipy'
          : '',
    IS_SINGLE_ORG: process.env.IS_SINGLE_ORG === 'true' && process.env.IS_ENTERPRISE === 'true'
  }

  const skeleton = fs.readFileSync(path.join(clientDir, 'skeleton.html'), 'utf8')
  // Hide staging & PPMIs from search engines
  const noindex =
    process.env.HOST === 'action.parabol.co' ? '' : `<meta name="robots" content="noindex"/>`
  const keys = `<script>window.__ACTION__=${JSON.stringify(clientKeys)}</script>`
  // unfurlers need an absolute URL, but a PPMI with PROXY_CDN has a relative public path
  const socialCardURL = new URL(socialCard, appOrigin).href
  const socialImage = [
    `<meta property="og:image" content="${socialCardURL}"/>`,
    '<meta property="og:image:width" content="1200"/>',
    '<meta property="og:image:height" content="630"/>',
    '<meta property="og:image:alt" content="Parabol retrospective, Sprint Poker and check-in meetings"/>'
  ].join('')
  const rawHTML = skeleton
    .replace('<head>', `<head>${noindex}${keys}`)
    .replace('</head>', `${socialImage}</head>`)
    .replaceAll('__PUBLIC_PATH__', __webpack_public_path__.replace(/\/$/, ''))
  // html-minifier-terser 5 returns a string. Its types are for 7, which returns a Promise
  return minify(rawHTML, {
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    minifyJS: true,
    removeScriptTypeAttributes: true,
    removeComments: true
  }) as unknown as string
}

const rewriteMattermostEnv = () => {
  const config = {
    __PROTO__: JSON.stringify(process.env.PROTO),
    __HOST__: JSON.stringify(process.env.HOST),
    __PORT__: JSON.stringify(process.env.PORT)
  }

  const skeleton = fs.readFileSync(path.join(clientDir, 'mattermost-plugin_envSkeleton.js'), 'utf8')

  return Object.entries(config).reduce((acc, [key, value]) => {
    return acc.replace(key, value)
  }, skeleton)
}

const makeClientAssets = () => ({
  'sw.js': rewriteServiceWorker(),
  'index.html': rewriteIndexHTML(),
  'mattermost-plugin_env.js': rewriteMattermostEnv(),
  'manifest.json': makeManifest()
})

let clientAssets: ReturnType<typeof makeClientAssets> | undefined

// These client files depend on the env vars, so each process makes them from the build's skeletons.
// They are held in memory, not written to /build, so the root filesystem can be read-only
export const applyEnvVarsToClientAssets = () => {
  clientAssets ??= makeClientAssets()
  return clientAssets
}
