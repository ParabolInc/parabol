import './utils/dotenv.js'
import {type Configuration, rspack} from '@rspack/core'
import type {Configuration as DevServerConfiguration} from '@rspack/dev-server'
import ReactRefreshRspackPlugin from '@rspack/plugin-react-refresh'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import type {IncomingMessage} from 'http'
import {createRequire} from 'module'
import path from 'path'
import clientTransformRules from './utils/clientTransformRules.js'
import getProjectRoot from './utils/getProjectRoot.js'

type OAuth2RedirectModule = {makeOAuth2Redirect: () => string}

const require = createRequire(import.meta.url)
// node cannot run the app's TypeScript by itself (its imports have no extensions), so sucrase loads it
require('sucrase/register')
const {
  makeOAuth2Redirect
}: OAuth2RedirectModule = require('../../packages/server/utils/makeOAuth2Redirect')

const PROJECT_ROOT = getProjectRoot()
const CLIENT_ROOT = path.join(PROJECT_ROOT, 'packages', 'client')
const STATIC_ROOT = path.join(PROJECT_ROOT, 'static')
const {PORT, SOCKET_PORT, HOST} = process.env

// When using ngrok, we want localhost to run with http
const isProxiedDev = HOST !== 'localhost'

export const devServer: DevServerConfiguration = {
  allowedHosts: process.env.DEV_WEBHOOK_URL
    ? 'all'
    : ['localhost', 'host.docker.internal', ...(HOST ? [HOST] : [])],
  server: isProxiedDev ? 'http' : 'https',
  client: {
    logging: 'warn'
  },
  static: [
    {
      directory: path.join(PROJECT_ROOT, 'static'),
      publicPath: '/static/'
    },
    {
      directory: path.join(PROJECT_ROOT, 'build'),
      publicPath: '/static/'
    }
  ],
  devMiddleware: {
    publicPath: '/',
    index: 'index.html'
  },
  hot: true,
  historyApiFallback: true,
  port: PORT,
  proxy: [
    ...[
      'jira-attachments',
      'stripe',
      'gdrive',
      'webhooks',
      'health',
      'ready',
      'self-hosted',
      'mattermost',
      'assets',
      // important terminating / so saml-redirect doesn't get targeted, too
      'saml/',
      'scim',
      'oauth',
      'zoom'
    ].map((name) => ({
      context: [`/${name}`],
      target: `http://localhost:${SOCKET_PORT}`
    })),
    {
      context: '/components',
      pathRewrite: {'^/components': ''},
      target: `http://localhost:3002`
    },
    {
      context: (pathname: string, req: IncomingMessage) =>
        pathname === '/graphql'
          ? req.method === 'POST'
          : pathname.startsWith('/graphql/') && pathname.length > '/graphql/'.length,
      target: `http://localhost:${SOCKET_PORT}`
    },
    {
      context: (pathname: string) => pathname === '/' || pathname === '/yjs',
      target: `ws://localhost:${SOCKET_PORT}`,
      ws: true,
      logLevel: 'silent'
    }
  ]
}

const devClientConfig: Configuration = {
  stats: 'errors-warnings',
  ignoreWarnings: [
    // framer-motion intentionally uses string concatenation for @emotion/is-prop-valid to
    // avoid static analysis by bundlers; it works fine at runtime
    {module: /framer-motion.*filter-props/},
    // monaco falls back to an AMD require when it is not loaded as ESM, which never happens here
    {module: /monaco-editor.*editorSimpleWorker/}
  ],
  infrastructureLogging: {level: 'warn'},
  watchOptions: {
    ignored: ['**/node_modules/**', path.join(PROJECT_ROOT, 'packages/integration-tests/**/*')]
    // aggregateTimeout: 200,
  },
  devtool: 'eval-source-map',
  mode: 'development',
  entry: {
    app: [path.join(CLIENT_ROOT, 'client.tsx')]
  },
  optimization: {
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false,
    runtimeChunk: true
  },
  output: {
    path: path.join(PROJECT_ROOT, 'build'),
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
    publicPath: '/',
    assetModuleFilename: '[name]-[hash][query][ext]'
  },
  resolve: {
    alias: {
      '~': CLIENT_ROOT,
      'parabol-client': CLIENT_ROOT,
      static: STATIC_ROOT,
      // this is for radix-ui, we import & transform ESM packages, but they can't find react/jsx-runtime
      'react/jsx-runtime': require.resolve('react/jsx-runtime')
    },
    extensions: ['.js', '.cjs', '.json', '.ts', '.tsx'],
    fallback: {
      assert: false,
      os: false
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(PROJECT_ROOT, 'devTemplate.html'),
      __ACTION__: JSON.stringify({
        datadogClientToken: process.env.DD_CLIENTTOKEN,
        datadogService: process.env.DD_SERVICE,
        google: process.env.GOOGLE_OAUTH_CLIENT_ID,
        googleAnalytics: process.env.GA_TRACKING_ID,
        mattermostWebhookIntegrationDisabled:
          process.env.MATTERMOST_WEBHOOK_INTEGRATION_DISABLED === 'true',
        msTeamsWebhookIntegrationDisabled:
          process.env.MSTEAMS_WEBHOOK_INTEGRATION_DISABLED === 'true',
        slack: process.env.SLACK_CLIENT_ID,
        stripe: process.env.STRIPE_PUBLISHABLE_KEY,
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
          process.env.GIF_PROVIDER !== 'klipy'
            ? process.env.GIF_PROVIDER
            : process.env.GIF_SECRET
              ? 'klipy'
              : '',
        GOOGLE_ERROR_FORM_URL: process.env.GOOGLE_ERROR_FORM_URL,
        IS_SINGLE_ORG: process.env.IS_SINGLE_ORG === 'true' && process.env.IS_ENTERPRISE === 'true'
      })
    }),
    new ReactRefreshRspackPlugin(),
    new rspack.DefinePlugin({
      __CLIENT__: true,
      __PRODUCTION__: false,
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
      // Environment variables go in the __ACTION__ object above, not here
      // This build may be deployed to many different environments
    })
  ],
  module: {
    rules: [
      ...clientTransformRules(PROJECT_ROOT),
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 4096
          }
        }
      },
      {
        test: /\.(eot|ttf|wav|mp3|woff|woff2|otf)$/,
        type: 'asset/resource'
      },
      // https://github.com/graphql/graphiql/issues/1055#issuecomment-561353578
      {
        test: /\/__tests__\//i,
        use: ['ignore-loader']
      }
    ]
  }
}

export default devClientConfig
