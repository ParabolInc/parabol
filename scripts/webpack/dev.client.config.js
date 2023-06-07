require('./utils/dotenv')
const path = require('path')
const webpack = require('webpack')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const vendors = require('../../dev/dll/vendors')
const clientTransformRules = require('./utils/clientTransformRules')
const getProjectRoot = require('./utils/getProjectRoot')

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
      'sse',
      'sse-ping',
      'jira-attachments',
      'stripe',
      'webhooks',
      'graphql',
      'intranet-graphql',
      'self-hosted',
      // important terminating / so saml-redirect doesn't get targeted, too
      'saml/'
    ].reduce((obj, name) => {
      obj[`/${name}`] = {
        target: `http://localhost:${SOCKET_PORT}`
      }
      return obj
    }, {})
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
    publicPath: '/'
  },
  resolve: {
    alias: {
      '~': CLIENT_ROOT,
      'parabol-client': CLIENT_ROOT,
      static: STATIC_ROOT
    },
    extensions: ['.js', '.json', '.ts', '.tsx'],
    fallback: {
      assert: false,
      os: false
    },
    unsafeCache: true,
    modules: [path.resolve(CLIENT_ROOT, '../node_modules'), 'node_modules'],
    symlinks: false
  },
  resolveLoader: {
    modules: [path.resolve(CLIENT_ROOT, '../node_modules'), 'node_modules']
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
        segment: process.env.SEGMENT_WRITE_KEY,
        sentry: process.env.SENTRY_DSN,
        slack: process.env.SLACK_CLIENT_ID,
        stripe: process.env.STRIPE_PUBLISHABLE_KEY,
        oauth2Redirect: process.env.OAUTH2_REDIRECT,
        prblIn: process.env.INVITATION_SHORTLINK,
        AUTH_INTERNAL_ENABLED: process.env.AUTH_INTERNAL_DISABLED !== 'true',
        AUTH_GOOGLE_ENABLED: process.env.AUTH_GOOGLE_DISABLED !== 'true',
        AUTH_SSO_ENABLED: process.env.AUTH_SSO_DISABLED !== 'true'
      })
    }),
    new ReactRefreshWebpackPlugin(),
    new webpack.DefinePlugin({
      __CLIENT__: true,
      __PRODUCTION__: false,
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      'process.env.DEBUG': JSON.stringify(process.env.DEBUG),
      __SOCKET_PORT__: JSON.stringify(process.env.SOCKET_PORT)
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
              transforms: ['jsx']
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
        use: ['file-loader']
      },
      // https://github.com/graphql/graphiql/issues/1055#issuecomment-561353578
      {
        test: /\/__tests__\//i,
        use: ['ignore-loader']
      }
    ]
  }
}
