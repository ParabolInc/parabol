require('./dotenv')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const getWebpackPublicPath = require('./getWebpackPublicPath')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const S3Plugin = require('webpack-s3-plugin')
const getS3BasePath = require('./getS3BasePath')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const { InjectManifest } = require('wrkbx')
const CopyPlugin = require('copy-webpack-plugin')
const transformRules = require('./transformRules')

const PROJECT_ROOT = path.join(__dirname, '..', '..')
const CLIENT_ROOT = path.join(PROJECT_ROOT, 'packages', 'client', 'src')
const SERVER_ROOT = path.join(PROJECT_ROOT, 'packages', 'server', 'src')
const GQL_ROOT = path.join(PROJECT_ROOT, 'packages', 'gql-executor', 'src')
const buildPath = path.join(PROJECT_ROOT, 'build')
const publicPath = getWebpackPublicPath()

// babel-plugin-relay requires a prod BABEL_ENV to remove hash checking logic. Probably a bug in the package.
process.env.BABEL_ENV = 'production'
module.exports = {
  stats: {
    assets: false
  },
  mode: 'production',
  entry: {
    app: [path.join(CLIENT_ROOT, 'client.tsx')]
  },
  output: {
    path: buildPath,
    publicPath,
    filename: '[name]_[contenthash].js',
    chunkFilename: '[name]_[contenthash].js',
    crossOriginLoading: 'anonymous'
  },
  resolve: {
    alias: {
      '~': CLIENT_ROOT,
      'parabol-server/lib': SERVER_ROOT,
      'parabol-client/lib': CLIENT_ROOT
    },
    extensions: ['.js', '.json', '.ts', '.tsx', '.graphql'],
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
  optimization: {
    minimize: Boolean(process.env.WEBPACK_DEPLOY || process.env.WEBPACK_STATS),
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: process.env.WEBPACK_DEPLOY ? 2 : true,
        sourceMap: true, // Must be set to true if using source-maps in production
        terserOptions: {
          output: {
            comments: false,
            ecma: 6
          },
          compress: {
            ecma: 6
          }
          // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
        }
      })
    ],
    splitChunks: {
      chunks: 'all',
      // OK to be above 6 because we serve these via http2
      maxAsyncRequests: 20,
      maxInitialRequests: 20,
      minSize: 4096
    }
  },
  plugins: [
    new CopyPlugin([
      {
        from: path.join(PROJECT_ROOT, 'static', 'manifest.json'),
        to: buildPath
      }
    ]),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(PROJECT_ROOT, 'template.html'),
      title: 'Free Online Retrospectives | Parabol'
    }),
    new ScriptExtHtmlWebpackPlugin({
      custom: {
        test: /\.js$/,
        attribute: 'onerror',
        value: 'fallback(this)'
      }
    }),
    new ScriptExtHtmlWebpackPlugin({
      custom: {
        test: /\.js$/,
        attribute: 'crossorigin',
        value: ''
      }
    }),
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin({
      __CLIENT__: true,
      __PRODUCTION__: true,
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      'process.env.NODE_ENV': JSON.stringify('production'),
      __STATIC_IMAGES__: JSON.stringify(`https://${process.env.AWS_S3_BUCKET}/static`)
    }),
    new webpack.SourceMapDevToolPlugin({
      filename: '[name]_[hash].js.map',
      append: `\n//# sourceMappingURL=${publicPath}[url]`
    }),
    new InjectManifest({
      swSrc: 'sw.js',
      entry: path.join(PROJECT_ROOT, 'packages', 'client', 'src', 'serviceWorker', 'sw.ts'),
      swDest: 'sw.js',
      importWorkboxFrom: 'disabled',
      exclude: [/GraphqlContainer/, /\.map$/, /^manifest.*\.js$/, /index.html$/]
    }),
    process.env.WEBPACK_DEPLOY &&
    new S3Plugin({
      s3Options: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION
      },
      s3UploadOptions: {
        Bucket: process.env.AWS_S3_BUCKET
      },
      basePath: getS3BasePath(),
      directory: buildPath
    }),
    process.env.WEBPACK_STATS && new BundleAnalyzerPlugin({ generateStatsFile: true })
  ].filter(Boolean),
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
      { test: /\.flow$/, loader: 'ignore-loader' },
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
      // for graphiql, since graphql uses mjs files to run in the server
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
      },
      {
        test: /\.(eot|ttf|wav|mp3|woff|woff2|otf)$/,
        use: ['file-loader']
      }
    ]
  }
}
