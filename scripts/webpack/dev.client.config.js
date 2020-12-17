const path = require('path')
const webpack = require('webpack')
const vendors = require('../../dev/dll/vendors')
const transformRules = require('./utils/transformRules')
const getProjectRoot = require('./utils/getProjectRoot')

const PROJECT_ROOT = getProjectRoot()
const CLIENT_ROOT = path.join(PROJECT_ROOT, 'packages', 'client')
const SERVER_ROOT = path.join(PROJECT_ROOT, 'packages', 'server')
const STATIC_ROOT = path.join(PROJECT_ROOT, 'static')

module.exports = {
  infrastructureLogging: {level: 'warn'},
  devtool: 'eval-source-map',
  mode: 'development',
  entry: {
    app: ['webpack-hot-client/client?123', path.join(CLIENT_ROOT, 'client.tsx')]
  },
  output: {
    path: path.join(PROJECT_ROOT, 'build'),
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
    publicPath: '/static/'
  },
  resolve: {
    alias: {
      '~': CLIENT_ROOT,
      'parabol-server': SERVER_ROOT,
      'parabol-client': CLIENT_ROOT,
      static: STATIC_ROOT
    },
    extensions: ['.js', '.json', '.ts', '.tsx'],
    fallback: {
      os: false
    },
    unsafeCache: true,
    modules: [
      path.resolve(CLIENT_ROOT, '../node_modules'),
      path.resolve(SERVER_ROOT, '../node_modules'),
      'node_modules'
    ]
  },
  resolveLoader: {
    modules: [
      path.resolve(CLIENT_ROOT, '../node_modules'),
      path.resolve(SERVER_ROOT, '../node_modules'),
      'node_modules'
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      __CLIENT__: true,
      __PRODUCTION__: false,
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      'process.env.NODE_ENV': JSON.stringify('development'),
      'process.env.DEBUG': JSON.stringify(process.env.DEBUG),
      'process.env.PROTOO_LISTEN_PORT': JSON.stringify(process.env.PROTOO_LISTEN_PORT || 4444),
      __STATIC_IMAGES__: JSON.stringify(`/static/images`)
    }),
    new webpack.DllReferencePlugin({
      manifest: vendors
    })
  ],
  module: {
    rules: [
      ...transformRules(PROJECT_ROOT),
      {
        test: /\.js$/,
        include: [path.join(SERVER_ROOT), path.join(CLIENT_ROOT)],
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
                ]
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
        use: ['style-loader', 'css-loader']
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
