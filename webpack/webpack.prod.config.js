require('../src/server/babelRegister')
const resolve = require('./webpackResolve')
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
const pluginDynamicImport = require('@babel/plugin-syntax-dynamic-import')
const presetEnv = require('@babel/preset-env')
const presetFlow = require('@babel/preset-flow')
const presetReact = require('@babel/preset-react')
const pluginObjectRestSpread = require('@babel/plugin-proposal-object-rest-spread')
const pluginClassProps = require('@babel/plugin-proposal-class-properties')
const pluginRelay = require('babel-plugin-relay')
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

const publicPath = getWebpackPublicPath.default()
const buildPath = path.join(__dirname, '../build')
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
      directory: buildPath
    })
  )
}

if (process.env.WEBPACK_STATS) {
  extraPlugins.push(new BundleAnalyzerPlugin())
}
const babelConfig = {
  loader: 'babel-loader',
  options: {
    cacheDirectory: true,
    babelrc: false,
    plugins: [
      pluginObjectRestSpread,
      pluginClassProps,
      pluginDynamicImport,
      [pluginRelay, {artifactDirectory: './src/__generated__'}]
    ],
    presets: [
      [
        presetEnv,
        {
          targets: {
            browsers: ['> 1%', 'not ie 11']
          },
          useBuiltIns: 'entry'
        }
      ],
      presetFlow,
      presetReact
    ]
  }
}

module.exports = {
  stats: {
    assets: false
  },
  mode: 'production',
  entry: {
    app: [path.join(__dirname, '../src/client/client.js')]
  },
  output: {
    path: buildPath,
    publicPath,
    filename: '[name]_[hash].js',
    chunkFilename: '[name]_[chunkhash].js'
  },
  resolve,
  optimization: {
    minimize: Boolean(process.env.WEBPACK_DEPLOY),
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
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
      chunks: 'all'
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/server/template.html'
    }),
    new ScriptExtHtmlWebpackPlugin({
      custom: {
        test: /\.js$/,
        attribute: 'onerror',
        value: 'fallback(this)'
      }
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
        use: babelConfig
      },
      {test: /\.flow$/, loader: 'ignore-loader'},
      {
        test: /\.tsx?$/,
        include: [
          path.join(__dirname, '../src/__generated__'),
          path.join(__dirname, '../src/client'),
          path.join(__dirname, '../src/universal'),
          path.join(__dirname, '../stories')
        ],
        use: [
          babelConfig,
          {
            loader: 'awesome-typescript-loader',
            options: {
              errorsAsWarnings: true
            }
          }
        ]
      },
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
