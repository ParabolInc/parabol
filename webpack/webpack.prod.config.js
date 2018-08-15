require('babel-register')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const npmPackage = require('../package.json')
const getWebpackPublicPath = require('../src/server/utils/getWebpackPublicPath')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const S3Plugin = require('webpack-s3-plugin')
const {getS3BasePath} = require('./utils/getS3BasePath')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const getDotenv = require('../src/universal/utils/dotenv')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const publicPath = getWebpackPublicPath.default()
getDotenv.default()

const extraPlugins = []
if (process.env.WEBPACK_DEPLOY) {
  extraPlugins.push(
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
      directory: path.join(__dirname, '../build')
    })
  )
}

if (process.env.WEBPACK_STATS) {
  extraPlugins.push(new BundleAnalyzerPlugin())
}

module.exports = {
  mode: 'production',
  entry: {
    app: [path.join(__dirname, '../src/client/client.js')]
  },
  output: {
    path: path.join(__dirname, '../build/'),
    publicPath,
    filename: '[name]_[hash].js',
    chunkFilename: '[name]_[chunkhash].js'
  },
  resolve: {
    modules: [path.join(__dirname, '../src'), 'node_modules']
  },
  optimization: {
    minimize: Boolean(process.env.WEBPACK_DEPLOY),
    minimizer: [
      new UglifyJsPlugin({
        exclude: /codemirror/,
        parallel: true
      })
    ],
    splitChunks: {
      chunks: 'all'
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/server/template.html'
    }),
    new CleanWebpackPlugin([path.join(__dirname, '../build/*.*')], {
      root: path.join(__dirname, '..'),
      exclude: []
    }),
    new webpack.DefinePlugin({
      __CLIENT__: true,
      __PRODUCTION__: true,
      __APP_VERSION__: JSON.stringify(npmPackage.version),
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new webpack.SourceMapDevToolPlugin({
      filename: '[name]_[chunkhash].js.map',
      append: `\n//# sourceMappingURL=${publicPath}[url]`
    }),
    ...extraPlugins
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            babelrc: false,
            plugins: [
              'syntax-object-rest-spread',
              'syntax-dynamic-import',
              'transform-class-properties',
              'relay'
            ],
            presets: [
              [
                'env',
                {
                  // debug: true,
                  modules: false,
                  targets: {
                    browsers: ['> 1%', 'not ie 11']
                  },
                  useBuiltIns: true
                }
              ],
              'flow',
              'react'
            ]
          }
        }
      },
      {test: /\.flow$/, loader: 'ignore-loader'},
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192
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
