require('./utils/dotenv')
const path = require('path')
const webpack = require('webpack')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const vendors = require('../../dev/dll/vendors')
const clientTransformRules = require('./utils/clientTransformRules')
const getProjectRoot = require('./utils/getProjectRoot')
const {makeOAuth2Redirect} = require('../../packages/server/utils/makeOAuth2Redirect')

const PROJECT_ROOT = getProjectRoot()
const CLIENT_ROOT = path.join(PROJECT_ROOT, 'packages', 'client')
const STATIC_ROOT = path.join(PROJECT_ROOT, 'static')
const {PORT, SOCKET_PORT} = process.env

const USE_REFRESH = false
module.exports = {
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename]
    }
  },
  stats: 'errors-warnings',
  devServer: {
    allowedHosts: ['localhost', 'host.docker.internal'],
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
      },
      {
        // ignore proxied servers in /dev
        // They can restart independently
        directory: path.join(PROJECT_ROOT, 'dev', 'dll'),
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
        'webhooks',
        'graphql',
        'health',
        'ready',
        'self-hosted',
        'mattermost',
        // important terminating / so saml-redirect doesn't get targeted, too
        'saml/'
      ].map((name) => ({
        context: [`/${name}`],
        target: `http://localhost:${SOCKET_PORT}`
      })),
      {
        context: '/components',
        pathRewrite: {'^/components': ''},
        target: `http://localhost:3002`
      }
    ]
  },
  infrastructureLogging: {level: 'warn'},
  watchOptions: {
    ignored: /node_modules/
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
    assetModuleFilename: '[name][ext][query]-[hash]'
  },
  resolve: {
    alias: {
      '~': CLIENT_ROOT,
      'parabol-client': CLIENT_ROOT,
      static: STATIC_ROOT,
      // this is for radix-ui, we import & transform ESM packages, but they can't find react/jsx-runtime
      'react/jsx-runtime': require.resolve('react/jsx-runtime')
    },
    extensions: ['.js', '.json', '.ts', '.tsx'],
    fallback: {
      assert: false,
      os: false
    },
    unsafeCache: true
  },
  plugins: [
    new webpack.DllReferencePlugin({
      manifest: vendors
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(PROJECT_ROOT, 'devTemplate.html'),
      __ACTION__: JSON.stringify({
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
      })
    }),
    new ReactRefreshWebpackPlugin(),
    new webpack.DefinePlugin({
      __CLIENT__: true,
      __PRODUCTION__: false,
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __SOCKET_PORT__: JSON.stringify(process.env.SOCKET_PORT),
      __HOCUS_POCUS_PORT__: JSON.stringify(process.env.HOCUS_POCUS_PORT)
      // Environment variables go in the __ACTION__ object above, not here
      // This build may be deployed to many different environments
    })
  ],
  module: {
    rules: [
      ...clientTransformRules(PROJECT_ROOT, USE_REFRESH),
      {
        test: /\.js$/,
        include: [path.join(CLIENT_ROOT)],
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              babelrc: false,
              plugins: [
                [
                  'macros',
                  {
                    relay: {
                      artifactDirectory: path.join(CLIENT_ROOT, '__generated__')
                    }
                  }
                ],
                'react-refresh/babel'
              ]
            }
          },
          {
            loader: '@sucrase/webpack-loader',
            options: {
              transforms: ['jsx'],
              jsxRuntime: 'automatic'
            }
          }
        ]
      },
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
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 4096
            }
          }
        ]
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
