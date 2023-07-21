import fs from 'fs'
import {minify} from 'html-minifier-terser'
import path from 'path'

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
    oauth2Redirect: process.env.OAUTH2_REDIRECT,
    prblIn: process.env.INVITATION_SHORTLINK,
    AUTH_INTERNAL_ENABLED: process.env.AUTH_INTERNAL_DISABLED !== 'true',
    AUTH_GOOGLE_ENABLED: process.env.AUTH_GOOGLE_DISABLED !== 'true',
    AUTH_SSO_ENABLED: process.env.AUTH_SSO_DISABLED !== 'true'
  }
  const localClientAssetsDir = path.join(__PROJECT_ROOT__, 'build')
  const html = await fs.promises.readFile(path.join(localClientAssetsDir, 'skeleton.html'), 'utf8')

  // Hide staging & PPMIs from search engines
  const noindex =
    process.env.HOST === 'action.parabol.co' ? '' : `<meta name="robots" content="noindex"/>`
  const keys = `<script>window.__ACTION__=${JSON.stringify(clientKeys)}</script>`
  const rawHTML = html.replace('<head>', `<head>${noindex}${keys}`)
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
  return Promise.all([rewriteIndexHTML()])
}
